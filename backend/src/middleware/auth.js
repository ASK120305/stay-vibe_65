import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'No user found with this token'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin/manager
export const checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }

      // Allow if user is admin or manager
      if (req.user.role === 'admin' || req.user.role === 'manager') {
        return next();
      }

      // Allow if user owns the resource
      if (resource.user && resource.user.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Server error in ownership check'
      });
    }
  };
};