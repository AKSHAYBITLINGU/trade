const express = require('express');
const router = express.Router();

// Login route
router.get('/', (req, res) => {
  res.render('signup'); // Render the login form
});

module.exports = router;
