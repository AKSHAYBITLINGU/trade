const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

subcategorySchema.statics.getAllSubCategoryNames = async function() {
    return await this.distinct('name');
};

subcategorySchema.statics.getAllProducts = async function(subcategoryId) {
    return await this.findById(subcategoryId).populate('products').exec();
};

const SubCategory = mongoose.model('SubCategory', subcategorySchema);

module.exports = SubCategory;
