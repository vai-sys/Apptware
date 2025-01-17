const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authenticate = async (req, res, next) => {
  try {
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
 
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.profileStatus === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

  
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
};


const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const hasAllowedRole = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasAllowedRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

// KYC verification middleware
const requireKYC = (req, res, next) => {
  if (!req.user.kycVerified) {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required to access this resource'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireKYC
};