const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // Change to authorization header

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
