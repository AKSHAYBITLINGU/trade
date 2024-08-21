const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const SubCategory = require("../models/subcategories");
const Product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    const subcategories = await SubCategory.find();

    if (!Array.isArray(subcategories)) {
      return res.status(500).send("Invalid data format in categories"); // Error handling
    }

    res.render("subcategory", {
      subcategories,
      isLoggedIn: res.locals.isLoggedIn,
    });
  } catch (err) {
    console.error("Error fetching categories from MongoDB:", err);
    return res.status(500).send("Internal Server Error"); // Internal server error handling
  }
});

module.exports = router;
