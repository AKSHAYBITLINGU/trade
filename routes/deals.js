const express = require("express");
const router = express.Router();
const Product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    const deals = await Product.find({ "deal.isDeal": true });
    res.render("deals", {
      deals,
      isLoggedIn: res.locals.isLoggedIn,
    });
  } catch (error) {
    res.status(500).send("internal Server Error");
  }
});

module.exports = router;
