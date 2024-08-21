const express = require("express");
const router = express.Router();
const Category = require("../models/categories");
const SubCategory = require("../models/subcategories");
const Product = require("../models/product");
const TrainingVideo = require("../models/trainingvideo");

router.get("/", async (req, res) => {
  const categories = await Category.getAllCategoryNames();
  const subcategories = await SubCategory.getAllSubCategoryNames();
  res.render("upload", { categories, subcategories });
});

router.post("/document", async (req, res) => {
  const { option } = req.body;
  console.log(option);
  try {
    if (option === "category") {
      const { categoryName, categoryImageName } = req.body;
      const category = await Category.create({
        name: categoryName,
        image: categoryImageName,
        subcategories: [],
      });
      await category.save();
      res.send("Category uploaded successfully");
    } else if (option === "trainingVideo") {
      const { videoId, videoTitle, videoCategory, videoDescription, videoUrl } =
        req.body;

      try {
        const category = await Category.findOne({ name: videoCategory });

        if (!category) {
          return res.status(400).send("Category not found");
        }
        const trainingVideo = await TrainingVideo.create({
          id: videoId,
          title: videoTitle,
          category: videoCategory,
          description: videoDescription,
          url: videoUrl,
        });
        await trainingVideo.save();

        res.send("Training video uploaded successfully");
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send("An error occurred while uploading the training video");
      }
    } else if (option === "subcategory") {
      const subdata = {
        subcategoryName: req.body.subcategoryName,
        subcategoryImageName: req.body.subcategoryImageName,
        categoryName: req.body.category,
      };
      const category = await Category.findOne({ name: subdata.categoryName });
      const categoryId = category._id;
      const newsubcategory = await SubCategory.create({
        name: subdata.subcategoryName,
        image: subdata.subcategoryImageName,
        category: categoryId,
        products: [],
      });
      await newsubcategory.save();
      newsubId = newsubcategory._id;
      category.subcategories.push(newsubId);
      await category.save();
      res.send("SubCategory uploaded successfully");
    } else if (option === "product") {
      const prodata = {
        id: req.body.productId,
        name: req.body.productName,
        price: req.body.price,
        quantity: req.body.quantity,
        image: req.body.productImageName,
        subcategory: req.body.subcategory,
      };
      const subcategory = await SubCategory.findOne({
        name: prodata.subcategory,
      });
      const subcategoryId = subcategory._id;
      const newproduct = await Product.create({
        id: prodata.id,
        name: prodata.name,
        price: prodata.price,
        quantity: prodata.quantity,
        image: prodata.image,
        subcategory: subcategoryId,
      });
      await newproduct.save();
      newproId = newproduct._id;
      subcategory.products.push(newproId);
      await subcategory.save();
      res.send("Product uploaded successfully");
    } else {
      res.status(400).send("Invalid option");
    }
  } catch (error) {
    console.error("Error uploading:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
