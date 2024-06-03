const express = require("express");
const router = express.Router();
const Category = require("../models/categories");

router.get("/", (req, res) => {
  res.render("upload"); // Render the login form
});

module.exports = router;
