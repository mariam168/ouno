const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'categories');

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });
const categoryUploadMiddleware = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subCategoryImages', maxCount: 50 }
]);
router.get('/', async (req, res) => {
    try {
        const categoriesFromDB = await Category.find().sort({ 'name.en': 1 });
        res.json(categoriesFromDB);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const categoryFromDB = await Category.findById(req.params.id);
        if (!categoryFromDB) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(categoryFromDB);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
});
router.post('/', categoryUploadMiddleware, async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON } = req.body;
        const subCategoriesData = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        const subCategoryImages = req.files.subCategoryImages || [];
        let imageCounter = 0;

        const subCategories = subCategoriesData.map(sub => {
            if (sub.hasNewImage && subCategoryImages[imageCounter]) {
                sub.imageUrl = `/uploads/categories/${subCategoryImages[imageCounter].filename}`;
                imageCounter++;
            }
            delete sub.hasNewImage;
            return sub;
        });

        const newCategoryData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            subCategories
        };
        if (req.files.mainImage) {
            newCategoryData.imageUrl = `/uploads/categories/${req.files.mainImage[0].filename}`;
        }

        const newCategory = new Category(newCategoryData);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/categories/${req.files.mainImage[0].filename}`);
            if (req.files.subCategoryImages) {
                req.files.subCategoryImages.forEach(f => deleteFile(`/uploads/categories/${f.filename}`));
            }
        }
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
});

router.put('/:id', categoryUploadMiddleware, async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, subCategories: subCategoriesJSON, clearMainImage } = req.body;

        const categoryToUpdate = await Category.findById(req.params.id);
        if (!categoryToUpdate) return res.status(404).json({ message: 'Category not found' });

        const incomingSubCategories = subCategoriesJSON ? JSON.parse(subCategoriesJSON) : [];
        const newSubCategoryImages = req.files.subCategoryImages || [];
        let imageCounter = 0;

        const finalSubCategories = [];

        for (const sub of incomingSubCategories) {
            const existingSub = sub._id ? categoryToUpdate.subCategories.id(sub._id) : null;
            const subData = {
                name: {
                    en: sub.name.en,
                    ar: sub.name.ar
                },
                description: {
                    en: sub.description.en || '',
                    ar: sub.description.ar || ''
                }
            };
            if (sub.hasNewImage && newSubCategoryImages[imageCounter]) {
                if (existingSub && existingSub.imageUrl) {
                    deleteFile(existingSub.imageUrl);
                }
                subData.imageUrl = `/uploads/categories/${newSubCategoryImages[imageCounter].filename}`;
                imageCounter++;
            } else if (existingSub) {
                subData.imageUrl = existingSub.imageUrl;
            }
            if (existingSub) {
                Object.assign(existingSub, subData);
                finalSubCategories.push(existingSub);
            } else {
                finalSubCategories.push(subData);
            }
        }
        const incomingIds = new Set(incomingSubCategories.map(s => s._id).filter(Boolean));
        categoryToUpdate.subCategories.forEach(oldSub => {
            if (!incomingIds.has(oldSub._id.toString())) {
                deleteFile(oldSub.imageUrl);
            }
        });

        categoryToUpdate.name = { en: name_en, ar: name_ar };
        categoryToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        categoryToUpdate.subCategories = finalSubCategories;

        if (req.files.mainImage) {
            deleteFile(categoryToUpdate.imageUrl);
            categoryToUpdate.imageUrl = `/uploads/categories/${req.files.mainImage[0].filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(categoryToUpdate.imageUrl);
            categoryToUpdate.imageUrl = '';
        }

        const updatedCategory = await categoryToUpdate.save();
        res.json(updatedCategory);
    } catch (error) {
        if (req.files) {
            if (req.files.mainImage) deleteFile(`/uploads/categories/${req.files.mainImage[0].filename}`);
            if (req.files.subCategoryImages) {
                req.files.subCategoryImages.forEach(f => deleteFile(`/uploads/categories/${f.filename}`));
            }
        }
        res.status(400).json({ message: 'Error updating category', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const categoryToDelete = await Category.findById(req.params.id);
        if (!categoryToDelete) return res.status(404).json({ message: 'Category not found' });

        const productCount = await Product.countDocuments({ category: categoryToDelete._id });
        if (productCount > 0) {
            return res.status(400).json({ message: `Cannot delete. Category is used by ${productCount} products.` });
        }

        deleteFile(categoryToDelete.imageUrl);
        categoryToDelete.subCategories.forEach(sub => deleteFile(sub.imageUrl));

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});

module.exports = router;
