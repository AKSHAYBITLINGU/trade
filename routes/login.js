const express = require('express');
const router = express.Router();

// Login route
router.get('/', (req, res) => {
  res.render('login'); // Render the login form
});

module.exports = router;
