const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('about'); // Render the login form
});

module.exports = router;
