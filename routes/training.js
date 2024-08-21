const express = require("express");
const router = express.Router();
const TrainingVideo = require("../models/trainingvideo");
const Category = require("../models/categories");

router.get("/", async (req, res) => {
  try {
    const trainingVideos = await TrainingVideo.find();
    const categories = await Category.find();
    res.render("training", { trainingVideos, categories });
  } catch (err) {
    console.error("Error fetching categories from MongoDB:", err);
    return res.status(500).send("Internal Server Error"); // Internal server error handling
  }
});

router.get("/about", async (req, res) => {
  try {
    res.render("training/about");
  } catch (err) {
    console.error("Error fetching data for the About page:", err);
    return res.status(500).send("Internal Server Error"); // Internal server error handling
  }
});

router.get("/book-session", async (req, res) => {
  try {
    res.render("training/book-session");
  } catch (err) {
    console.error("Error fetching data for the book-session page:", err);
    return res.status(500).send("Internal Server Error"); // Internal server error handling
  }
});

module.exports = router;
