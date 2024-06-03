const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Assuming the User model is in ../models/User.js
const checkAuth = require('../middlewares/checkAuth'); // Authentication middleware
router.use(checkAuth);

router.get('/', checkAuth, async (req, res) => {
    try {
      const userId = req.user.userId; // Assuming auth middleware sets the user ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.render('profile', { user }); // Render the profile view with user data
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Internal Server Error');
    }
});

router.get('/edit', checkAuth, async (req, res) => {
    try {
      const userId = req.user.userId; // Get the user ID from the authentication middleware
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.render('editProfile', { user }); // Render the edit profile view
    } catch (error) {
      console.error('Error rendering edit profile:', error);
      res.status(500).send('Internal Server Error');
    }
});

// router.post('/update', checkAuth, async (req, res) => {
//   try {
//     console.log('Request Body:', req.body); // Log request body
//     const userId = req.user.userId;
//     console.log('User ID:', userId); // Log user ID
  
//     const updatedData = {
//       email: req.body.email,
//       address: req.body.address,
//       gender: req.body.gender,
//       profilePic: req.body.profilePic,
//     };

//     console.log('Updated Data:', updatedData); // Log updated data
  
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       updatedData,
//       { new: true, runValidators: true }
//     );
  
//     if (!updatedUser) {
//       return res.status(404).send('User not found');
//     }
  
//     console.log('Updated User:', updatedUser); // Log updated user
  
//     res.redirect('/profile');
//   } catch (error) {
//     console.error('Error updating user profile:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.post('/update', checkAuth, async (req, res) => {
  try {
    const userId = req.user.userId;  
    console.log('Request Body:', req.body);
    // Extract updated data from request body
    const updatedData = {
      email: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
    };

    // Check if a file was uploaded
    if (req.file) {
      // Read uploaded image file
      const imageData = req.file.buffer;

      // Add profile picture data to updated data
      updatedData.profilePic = {
        data: imageData,
        contentType: req.file.mimetype
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true, runValidators: true }
    );
  
    // Check if user was found and updated successfully
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
  
    console.log('Updated User:', updatedUser); // Log updated user
  
    // Redirect user to the profile page
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

  
module.exports = router;
