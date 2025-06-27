const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided for:', req.method, req.url);
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Authenticated User:', req.user, 'for:', req.method, req.url);
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message, 'for:', req.method, req.url);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;