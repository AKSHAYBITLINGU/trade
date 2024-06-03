const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET_KEY;

function checkAuth(req, res, next) {
  const token = req.cookies.jwtToken;// Assuming you're using cookies
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey); // Verify the JWT token
      req.user = decoded;
      res.locals.isLoggedIn = true; // Set flag for EJS templates
    } catch (err) {
      res.locals.isLoggedIn = false; // Token is invalid
    }
  } else {
    res.locals.isLoggedIn = false;
  }
  next(); // Continue to the next middleware
}

module.exports = checkAuth;