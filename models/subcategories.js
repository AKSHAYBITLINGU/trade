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

const SubCategory = mongoose.model('SubCategory', subcategorySchema);

module.exports = SubCategory;
