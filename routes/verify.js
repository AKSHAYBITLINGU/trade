require("dotenv").config();
const express = require("express");
const router = express.Router();
const client = require("twilio")(process.env.twilioacc, process.env.twiliosid);
const bcrypt = require("bcrypt");
const User = require("../models/user");
var jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

// Send OTP to user's phone
const isValidPhoneNumber = (phone) => {
  const pattern = /^\+?[1-9]\d{1,14}$/; // E.164 standard pattern
  return pattern.test(phone);
};

const sendOTP = async (phone) => {
  if (!isValidPhoneNumber(phone)) {
    throw new Error("Invalid phone number format");
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "+18163990783",
      to: phone,
    });

    console.log(`OTP sent to ${phone}: ${otp}`);
    return otp;
  } catch (err) {
    console.error("Error sending OTP:", err.message, err.code);
    throw new Error("Error sending OTP");
  }
};

// Render the OTP verification page
router.get("/", async (req, res) => {
  try {
    let phone = req.session.phone;
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone number not found in session." });
    }

    phone = "+91" + phone;
    const otp = await sendOTP(phone);
    // Store the OTP in the session
    req.session.otp = otp;

    // Render the OTP verification page
    res.render("verify", { phone });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Verify the OTP and create a new user
router.post("/", async (req, res) => {
  try {
    const phone = req.session.phone;
    const { otp } = req.body;
    // Verify the OTP
    if (otp != req.session.otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Get the user's information from the session
    const { username, password } = req.session;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in MongoDB
    const newUser = new User({
      username,
      phone,
      password: hashedPassword,
      cart: [],
      myorders: [],
    });
    await newUser.save();

    // Create JWT token for the new user
    const token = jwt.sign({ userId: newUser._id }, secretKey, {
      expiresIn: "1h",
    });

    // Set JWT as a cookie
    res.cookie("jwtToken", token, { httpOnly: true, maxAge: 3600000 });

    // Clear the phone number, OTP, username, and password from the session
    req.session.phone = null;
    req.session.otp = null;
    req.session.username = null;
    req.session.password = null;

    // Redirect to the homepage after successful verification
    return res.redirect("/");
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = router;
