const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check subscription status
const checkSubscription = (req, res, next) => {
  const user = req.user;
  
  if (user.subscription.type === 'free') {
    // Check usage limits for free users
    const now = new Date();
    const lastReset = new Date(user.usage.lastReset);
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    
    // Reset usage monthly
    if (daysSinceReset >= 30) {
      user.usage.messagesSent = 0;
      user.usage.tokensUsed = 0;
      user.usage.lastReset = now;
      user.save();
    }
    
    // Free tier limits: 100 messages per month
    if (user.usage.messagesSent >= 100) {
      return res.status(429).json({ 
        error: 'Monthly message limit reached. Please upgrade to continue.',
        limit: 100,
        used: user.usage.messagesSent
      });
    }
  }
  
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  checkSubscription,
  generateToken
};
