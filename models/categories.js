const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }]
});

categorySchema.statics.getAllCategoryNames = async function() {
    return await this.distinct('name');
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
