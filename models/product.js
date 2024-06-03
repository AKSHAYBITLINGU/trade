const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  deal: {
    isDeal: { type: Boolean, default: false },
    dealDescription: { type: String, default: "" },
  },
});

productSchema.statics.getAllProductNames = async function () {
  return await this.distinct("name");
};
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
