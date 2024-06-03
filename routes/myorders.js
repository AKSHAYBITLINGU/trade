const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Assuming User schema is defined in models/User.js
const checkAuth = require('../middlewares/checkAuth'); // Middleware for authentication
router.use(checkAuth);

// Route to fetch the current user's orders
router.get('/', checkAuth, async (req, res) => {
  try {
    // Get the logged-in user's ID from the request (assuming auth middleware sets it)
    const userId = req.user.userId; // Get the user's ID from the decoded token
    const user = await User.findById(userId); // Use findById with the correct value
    
    if (!user) {
      return res.status(404).send('User not found'); // Handle user not found case
    }

    // Send the 'myorders' data to the frontend
    res.render('myorders', { orders: user.myorders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
