const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Advertisement = require('../models/Advertisement');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage }).any();

const deleteFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file: ${fullPath}`, err);
        });
    }
};

const translateDoc = (doc, lang, fields) => {
    if (!doc || !lang || !fields) return doc;
    const translated = JSON.parse(JSON.stringify(doc));
    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined) return;
            current = current[key];
        }
        if (current) current[keys[keys.length - 1]] = value;
    };
    fields.forEach(fieldPath => {
        const keys = fieldPath.split('.');
        let currentVal = doc;
        for (const key of keys) {
            if (currentVal === null || typeof currentVal === 'undefined') {
                currentVal = undefined;
                break;
            }
            currentVal = currentVal[key];
        }
        if (typeof currentVal === 'object' && currentVal !== null && (currentVal.en || currentVal.ar)) {
            setNestedValue(translated, fieldPath, currentVal[lang] || currentVal.en);
        }
    });
    if (translated.category?.subCategories && Array.isArray(translated.category.subCategories)) {
        translated.category.subCategories = translated.category.subCategories.map(sc => 
            translateDoc(sc, lang, ['name'])
        );
    }
    return translated;
};

router.get('/admin-list', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const lang = req.language;
        const now = new Date();
        const allProducts = await Product.find({}).populate('category').sort({ createdAt: -1 }).lean();
        const validAds = await Advertisement.find({
            isActive: true,
            productRef: { $ne: null },
            $and: [{ $or: [{ startDate: null }, { startDate: { $lte: now } }] }, { $or: [{ endDate: null }, { endDate: { $gte: now } }] }]
        }).lean();
        const adsMap = new Map();
        for (const ad of validAds) { adsMap.set(ad.productRef.toString(), ad); }
        const finalProducts = allProducts.map(product => {
            let productWithAd = { ...product };
            if (adsMap.has(product._id.toString())) { productWithAd.advertisement = adsMap.get(product._id.toString()); }
            return translateDoc(productWithAd, lang, ['name', 'description', 'category.name', 'advertisement.title', 'advertisement.description']);
        });
        res.json(finalProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const lang = req.language;
        const isAdminRequest = req.headers['x-admin-request'] === 'true';
        const now = new Date();

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found (Invalid ID).' });
        }

        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('reviews.user', 'name')
            .lean();

        if (!product) return res.status(404).json({ message: 'Product not found.' });
        if (isAdminRequest) {
            return res.json(product);
        }
        const activeAd = await Advertisement.findOne({
            isActive: true,
            productRef: product._id,
            $and: [{ $or: [{ startDate: null }, { startDate: { $lte: now } }] }, { $or: [{ endDate: null }, { endDate: { $gte: now } }] }]
        }).lean();

        let finalProduct = { ...product };
        if (activeAd) { finalProduct.advertisement = activeAd; }

        const translatedProduct = translateDoc(finalProduct, lang, ['name', 'description', 'category.name', 'advertisement.title', 'advertisement.description']);
        res.json(translatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching product.' });
    }
});


router.post('/', protect, admin, upload, async (req, res) => {
    try {
        const { name_en, name_ar, description_en, description_ar, basePrice, category, subCategory, attributes, variations } = req.body;
        const newProductData = {
            name: { en: name_en, ar: name_ar },
            description: { en: description_en || '', ar: description_ar || '' },
            basePrice,
            category,
            subCategory: subCategory || null,
            attributes: attributes ? JSON.parse(attributes) : [],
            variations: variations ? JSON.parse(variations) : [],
        };
        const mainImage = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImage) newProductData.mainImage = `/uploads/products/${mainImage.filename}`;
        if (newProductData.variations) {
            newProductData.variations.forEach((v, vIndex) => {
                if (v.options) v.options.forEach((o, oIndex) => {
                    const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                    if (imageFile) o.image = `/uploads/products/${imageFile.filename}`;
                    delete o.imagePlaceholder;
                });
            });
        }
        const product = new Product(newProductData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        res.status(400).json({ message: 'Error creating product.', error: error.message });
    }
});

router.put('/:id', protect, admin, upload, async (req, res) => {
    try {
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) return res.status(404).json({ message: 'Product not found.' });

        const { name_en, name_ar, description_en, description_ar, basePrice, category, subCategory, attributes, variations, clearMainImage } = req.body;
        productToUpdate.name = { en: name_en, ar: name_ar };
        productToUpdate.description = { en: description_en || '', ar: description_ar || '' };
        productToUpdate.basePrice = basePrice;
        productToUpdate.category = category;
        productToUpdate.subCategory = subCategory || null;
        productToUpdate.attributes = attributes ? JSON.parse(attributes) : [];

        const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = `/uploads/products/${mainImageFile.filename}`;
        } else if (clearMainImage === 'true') {
            deleteFile(productToUpdate.mainImage);
            productToUpdate.mainImage = null;
        }
        
        const incomingVariations = variations ? JSON.parse(variations) : [];
        const oldVariationOptionsImages = new Map();
        productToUpdate.variations.forEach(v => v.options.forEach(o => { if (o._id && o.image) oldVariationOptionsImages.set(o._id.toString(), o.image); }));

        const updatedVariations = incomingVariations.map((iVar, vIndex) => {
            const options = iVar.options.map((iOpt, oIndex) => {
                const imageFile = req.files.find(f => f.fieldname === `variationImage_${vIndex}_${oIndex}`);
                let imagePath = iOpt.image;
                if (imageFile) {
                    const newPath = `/uploads/products/${imageFile.filename}`;
                    if (iOpt._id && oldVariationOptionsImages.has(iOpt._id.toString())) {
                        deleteFile(oldVariationOptionsImages.get(iOpt._id.toString()));
                    }
                    imagePath = newPath;
                }
                return { ...iOpt, _id: iOpt._id || new mongoose.Types.ObjectId(), image: imagePath, skus: iOpt.skus.map(s => ({...s, _id: s._id || new mongoose.Types.ObjectId()})) };
            });
            return { ...iVar, _id: iVar._id || new mongoose.Types.ObjectId(), options: options };
        });
        
        const newOptionIds = new Set(updatedVariations.flatMap(v => v.options.map(o => o._id.toString())));
        for (const [optionId, imagePath] of oldVariationOptionsImages.entries()) {
            if (!newOptionIds.has(optionId)) deleteFile(imagePath);
        }

        productToUpdate.variations = updatedVariations;
        productToUpdate.markModified('variations');

        const updatedProduct = await productToUpdate.save();
        res.json(updatedProduct);
    } catch (error) {
        if (req.files) req.files.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
        res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const productToDelete = await Product.findById(req.params.id);
        if (!productToDelete) return res.status(404).json({ message: 'Product not found.' });
        deleteFile(productToDelete.mainImage);
        productToDelete.variations.forEach(v => v.options.forEach(o => { if (o.image) deleteFile(o.image); }));
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
});

router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });
        const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating review.' });
    }
});

module.exports = router;