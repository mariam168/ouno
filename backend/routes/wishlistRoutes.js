const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Product = require('../models/Product'); 
const Advertisement = require('../models/Advertisement');
const populateWishlistItems = async (wishlist) => {
    if (!wishlist || wishlist.length === 0) {
        return [];
    }
    const populatedProducts = await Product.find({
        '_id': { $in: wishlist }
    }).populate('category', 'name').lean();
    const productIds = populatedProducts.map(p => p._id);
    const ads = await Advertisement.find({
        productRef: { $in: productIds },
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    }).lean();
    const adsMap = new Map(ads.map(ad => [ad.productRef.toString(), ad]));
    return populatedProducts.map(product => ({
        ...product,
        advertisement: adsMap.get(product._id.toString()) || null
    }));
};
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const fullyPopulatedWishlist = await populateWishlistItems(user.wishlist);
    
    res.json(fullyPopulatedWishlist);
  } catch (error) {
    next(error);
  }
});
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { wishlist: productId } 
    });
    const updatedUser = await User.findById(req.user.id).select('wishlist').lean();
    const fullyPopulatedWishlist = await populateWishlistItems(updatedUser.wishlist);

    res.status(200).json({ 
        message: 'Product added to wishlist successfully.', 
        wishlist: fullyPopulatedWishlist 
    });

  } catch (error) {
    next(error); 
  }
});
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { wishlist: productId }
    });
    const updatedUser = await User.findById(req.user.id).select('wishlist').lean();
    const fullyPopulatedWishlist = await populateWishlistItems(updatedUser.wishlist);

    res.status(200).json({ 
        message: 'Product removed from wishlist successfully.', 
        wishlist: fullyPopulatedWishlist
    });

  } catch (error) {
    next(error); 
  }
});

module.exports = router;