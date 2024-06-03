const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Category = require("../models/categories");
const SubCategory = require("../models/subcategories");
const Product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();

    if (!Array.isArray(categories)) {
      return res.status(500).send("Invalid data format in categories"); // Error handling
    }

    res.render("category", { categories, isLoggedIn: res.locals.isLoggedIn });
  } catch (err) {
    console.error("Error fetching categories from MongoDB:", err);
    return res.status(500).send("Internal Server Error"); // Internal server error handling
  }
});

router.get("/c/:categoryName", async (req, res) => {
  const categoryName = req.params.categoryName;

  try {
    // Find the category by name and populate its subcategories
    const category = await Category.findOne({ name: categoryName }).populate(
      "subcategories"
    );

    if (!category) {
      return res.status(404).send("Category not found"); // If the category doesn't exist
    }

    // Get the subcategories from the populated category
    const subcategories = category.subcategories;

    res.render("subcategory", { categoryName, subcategories }); // Render the view with the subcategories
  } catch (error) {
    console.error("Error fetching subcategories from MongoDB:", error);
    return res.status(500).send("Internal Server Error"); // Server error handling
  }
});

router.get("/c/:categoryName/:subcategoryName", async (req, res) => {
  const { categoryName, subcategoryName } = req.params;

  try {
    // Find the subcategory by name
    const subcategory = await SubCategory.findOne({
      name: subcategoryName,
    }).populate("products");

    if (!subcategory) {
      return res.status(404).send("Subcategory not found"); // If the subcategory doesn't exist
    }

    const products = subcategory.products; // Get the products from the subcategory

    res.render("product", {
      categoryName,
      subcategoryName,
      products,
      isLoggedIn: res.locals.isLoggedIn,
    }); // Render the view with the products
  } catch (error) {
    console.error("Error fetching products from MongoDB:", error);
    return res.status(500).send("Internal Server Error"); // Handle server errors
  }
});

module.exports = router;
