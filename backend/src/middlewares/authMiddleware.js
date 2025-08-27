const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        throw new AppError('User not found', 401);
      }

      next();
    } catch (error) {
      throw new AppError('Not authorized', 401);
    }
  }

  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }
});

// Rate limiting middleware for specific routes
const rateLimiter = (limit, windowMs) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old requests
    requests.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    });

    // Count requests for this IP
    const requestTimes = Array.from(requests.entries())
      .filter(([key, timestamp]) => key === ip && timestamp > windowStart);

    if (requestTimes.length >= limit) {
      throw new AppError('Too many requests', 429);
    }

    requests.set(ip, now);
    next();
  };
};

module.exports = {
  protect,
  rateLimiter
};
