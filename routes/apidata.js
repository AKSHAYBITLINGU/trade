const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const SubCategory = require("../models/subcategories");
const product = require("../models/product");
const Product = require("../models/product");

router.get("/data", async (req, res) => {
  try {
    const categories = await Category.getAllCategoryNames();
    const subcategories = await SubCategory.getAllSubCategoryNames();
    const products = await product.getAllProductNames();

    res.json({ categories, subcategories, products });
  } catch (error) {
    console.error("Error fetching distinct category names:", error);
    res.status(500).send("Error collecting data from MongoDB");
  }
});

router.get("/category/:name", async (req, res) => {
  const subcategoryName = req.params.name;
  try {
    const subcategory = await SubCategory.findOne({
      name: subcategoryName,
    }).populate("category");
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    res.json({ parentCategory: subcategory.category.name });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/subcategory/:name", async (req, res) => {
  const productName = req.params.name;
  try {
    const product = await Product.findOne({
      name: productName,
    }).populate("subcategory");
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }
    res.json({ parentSubCategory: product.subcategory.name });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
