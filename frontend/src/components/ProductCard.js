import React from "react";
import { Heart, Award, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./ToastNotification";

const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < Math.round(rating) ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}
                fill="currentColor"
            />
        ))}
    </div>
);

const ProductCard = ({ product }) => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useWishlist();
    const { showToast } = useToast();
    const { isAuthenticated, API_BASE_URL } = useAuth();

    if (!product || !product.name) {
        console.error("[ProductCard] Error: Received invalid product data", product);
        return null;
    }
    const adData = product.advertisement;

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return; 
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };

    const handleToggleFavorite = (e) => {
        e.stopPropagation(); 
        if (!isAuthenticated) {
            showToast(t('wishlist.loginRequired'), 'info');
            navigate('/login');
            return;
        }
        if (product?._id) {
            toggleFavorite(product);
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation(); 
        if (product?._id) {
            navigate(`/shop/${product._id}`);
        }
    };
    const productName = product.name;
    const productCategoryName = product.category?.name;

    const productIsFavorite = product._id ? isFavorite(product._id) : false;
    const imageUrl = product.mainImage ? `${API_BASE_URL}${product.mainImage}` : 'https://via.placeholder.com/400?text=No+Image';
    const isAdvertised = !!adData && adData.discountPercentage > 0;
    const discountPercentage = isAdvertised ? adData.discountPercentage : 0;

    let displayPrice = product.basePrice;
    let originalPrice = null;
    if (isAdvertised && product.basePrice != null) {
        originalPrice = product.basePrice;
        displayPrice = originalPrice * (1 - (discountPercentage / 100));
    }

    const formatPrice = (price) => {
        if (price == null) return t('general.notApplicable');
        const currencyCode = 'EGP'; 
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(price));
        } catch (error) {
            console.error("Error formatting price:", price, error);
            return `${price} ${currencyCode}`;
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-in-out dark:bg-zinc-900 
            ${isAdvertised
                ? 'border-primary-light bg-gradient-to-br from-primary-light/10 to-primary/5 shadow-lg shadow-primary/20 hover:!border-primary hover:shadow-primary/30 dark:border-primary dark:from-primary-dark/20 dark:to-primary/10'
                : 'border-zinc-200 bg-white hover:!border-primary hover:shadow-2xl hover:shadow-primary/10 dark:border-zinc-800 dark:hover:!border-primary-light'
            }`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="relative overflow-hidden">
                <div className="bg-zinc-100 dark:bg-zinc-800 aspect-square flex items-center justify-center p-4">
                    <img
                        src={imageUrl}
                        alt={productName}
                        className="h-full w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                        loading="lazy"
                    />
                </div>
                {isAdvertised && (
                    <div className={`absolute top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md ${language === 'ar' ? 'right-3' : 'left-3'}`}>
                        <Award size={14} />
                        <span>{Math.round(discountPercentage)}% {t('general.off')}</span>
                    </div>
                )}

                <button
                    aria-label={productIsFavorite ? t('productCard.removeFromFavorites') : t('productCard.addToFavorites')}
                    className={`action-button absolute top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-zinc-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-zinc-900/60 dark:text-white dark:hover:bg-zinc-800 ${language === 'ar' ? 'left-3' : 'right-3'}`}
                    onClick={handleToggleFavorite}
                >
                    <Heart size={18} fill={productIsFavorite ? "currentColor" : "none"} className={productIsFavorite ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-300'}/>
                </button>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary dark:text-primary-light">
                        {productCategoryName}
                    </p>

                    <h3
                        className="mb-3 text-lg font-bold text-zinc-900 line-clamp-2 leading-tight dark:text-white"
                        title={productName}
                    >
                        {productName}
                    </h3>

                    {product.numReviews > 0 && (
                        <div className="flex items-center gap-1.5">
                            <StarRating rating={product.averageRating} />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">({product.numReviews})</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            {originalPrice && originalPrice > displayPrice && (
                                <p className="text-sm font-medium text-zinc-400 line-through dark:text-zinc-500">
                                    {formatPrice(originalPrice)}
                                </p>
                            )}
                            <p className={`text-xl font-extrabold ${isAdvertised ? 'text-red-600 dark:text-red-400' : 'text-primary-dark dark:text-primary-light'}`}>
                                {formatPrice(displayPrice)}
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                className="action-button h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 ease-in-out group-hover:scale-110 dark:bg-primary-light dark:text-primary-dark"
                                onClick={handleViewDetails}
                                aria-label={t('productCard.viewDetails')}
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;