const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Check user roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Admin can access anything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      if (resource.uploadedBy.toString() !== req.user._id.toString()) {
        // Check if resource is shared with user
        if (resource.sharedWith && resource.sharedWith.length > 0) {
          const sharedWithUser = resource.sharedWith.find(
            (share) => share.user.toString() === req.user._id.toString()
          );
          if (sharedWithUser) {
            req.userPermission = sharedWithUser.permission;
            return next();
          }
        }

        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership',
      });
    }
  };
};
