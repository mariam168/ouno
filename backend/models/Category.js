const mongoose = require('mongoose');
const subCategorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: {
        en: { type: String, required: true, trim: true },
        ar: { type: String, required: true, trim: true }
    },
    description: {
        en: { type: String, trim: true, default: '' },
        ar: { type: String, trim: true, default: '' }
    },
    imageUrl: { type: String }
});

const categorySchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true, trim: true, unique: true },
        ar: { type: String, required: true, trim: true, unique: true }
    },
    description: {
        en: { type: String, trim: true, default: '' },
        ar: { type: String, trim: true, default: '' }
    },
    imageUrl: { type: String },
    subCategories: [subCategorySchema]
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
