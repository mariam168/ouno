import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, Heart, Loader2, Award, Star, Clock, Send, User as UserIcon, Check, Info, ChevronRight, ShieldCheck, Truck, MessageSquareQuote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/ToastNotification';

const colorMap = { 'black': '#111827', 'white': '#FFFFFF', 'red': '#EF4444', 'blue': '#3B82F6', 'green': '#22C55E', 'silver': '#D1D5DB', 'gold': '#FBBF24', 'rose gold': '#F472B6', 'navy blue': '#1E3A8A', 'charcoal gray': '#374151', 'washed black': '#222222', 'cream': '#FFFDD0', 'pine green': '#01796F', 'stone': '#877F7D', 'space gray': '#5f5f5f' };
const StarRating = ({ rating, size = 16, interactive = false, onRate, onHover, hoverRating = 0 }) => ( <div className="flex items-center" onMouseLeave={interactive ? () => onHover(0) : undefined}> {[...Array(5)].map((_, i) => ( <Star key={i} size={size} className={`cursor-${interactive ? 'pointer' : 'default'} transition-colors ${i < (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-zinc-600'}`} onMouseEnter={interactive ? () => onHover(i + 1) : undefined} onClick={interactive ? () => onRate(i + 1) : undefined} fill={i < (hoverRating || rating) ? 'currentColor' : 'none'}/> ))} </div> );
const ReviewForm = ({ productId, onReviewSubmitted }) => { const { t } = useLanguage(); const { token, API_BASE_URL } = useAuth(); const { showToast } = useToast(); const [rating, setRating] = useState(0); const [hoverRating, setHoverRating] = useState(0); const [comment, setComment] = useState(''); const [loading, setLoading] = useState(false); const handleSubmit = async (e) => { e.preventDefault(); if (rating === 0 || comment.trim() === '') { showToast(t('productDetailsPage.reviewForm.validationError'), 'warning'); return; } setLoading(true); try { await axios.post(`${API_BASE_URL}/api/products/${productId}/reviews`, { rating, comment }, { headers: { Authorization: `Bearer ${token}` } }); showToast(t('productDetailsPage.reviewForm.success'), 'success'); setRating(0); setComment(''); onReviewSubmitted(); } catch (error) { const errorMessage = error.response?.data?.message || t('productDetailsPage.reviewForm.error'); showToast(errorMessage, 'error'); } finally { setLoading(false); } }; return ( <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"> <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{t('productDetailsPage.reviewForm.title')}</h3> <form onSubmit={handleSubmit} className="space-y-4"> <div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('productDetailsPage.reviewForm.ratingLabel')}</label><StarRating rating={rating} size={24} interactive onRate={setRating} onHover={setHoverRating} hoverRating={hoverRating} /></div> <div><label htmlFor="comment" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('productDetailsPage.reviewForm.commentLabel')}</label><textarea id="comment" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-sm focus:ring-primary focus:border-primary" placeholder={t('productDetailsPage.reviewForm.commentPlaceholder')}></textarea></div> <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-primary-dark disabled:bg-zinc-400">{loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} {t('productDetailsPage.reviewForm.submit')}</button> </form> </div> ); };
const ProductSkeleton = () => ( <div className="bg-white dark:bg-zinc-950 animate-pulse"> <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"> <div className="h-6 w-1/3 bg-zinc-300 dark:bg-zinc-800 rounded mb-12"></div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"> <div className="flex flex-col-reverse lg:flex-row gap-4"> <div className="flex flex-row lg:flex-col gap-3"> {[...Array(4)].map((_, i) => <div key={i} className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>)} </div> <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div> </div> <div className="space-y-8 flex flex-col"> <div className="h-10 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded"></div> <div className="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div> <div className="h-12 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded"></div> <div className="h-20 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-8"></div> <div className="pt-8 space-y-4 mt-auto"> <div className="h-14 w-full bg-zinc-300 dark:bg-zinc-700 rounded-lg"></div> </div> </div> </div> </div> </div> );

const ProductDetails = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { API_BASE_URL, isAuthenticated, currentUser } = useAuth();
    const { showToast } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainDisplayImage, setMainDisplayImage] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedSku, setSelectedSku] = useState(null);
    const { addToCart, loadingCart } = useCart();
    const { toggleFavorite, isFavorite } = useWishlist();
    const [timeLeft, setTimeLeft] = useState(null);
    const [imageOpacity, setImageOpacity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    const fetchProductDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, { headers: { 'accept-language': language } });
            setProduct(res.data);
            setMainDisplayImage(res.data.mainImage || (res.data.images && res.data.images[0]) || '');
            const descriptionExists = res.data.description && (res.data.description.en || res.data.description.ar);
            setActiveTab(descriptionExists ? 'description' : 'specifications');
        } catch (err) {
            setError(t('productDetailsPage.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [id, API_BASE_URL, t, language]);
    
    useEffect(() => { fetchProductDetails(); }, [fetchProductDetails]);
    useEffect(() => { setSelectedOptions({}); setSelectedSku(null); }, [id]);
    const advertisement = useMemo(() => product?.advertisement, [product]);
    const isOfferProduct = useMemo(() => !!advertisement, [advertisement]);

    useEffect(() => {
        if (!isOfferProduct || !advertisement.endDate) {
            setTimeLeft(null);
            return;
        }
        const intervalId = setInterval(() => {
            const difference = new Date(advertisement.endDate) - new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / 86400000),
                    hours: Math.floor((difference / 3600000) % 24),
                    minutes: Math.floor((difference / 60000) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null);
                clearInterval(intervalId);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [isOfferProduct, advertisement]);

    const handleImageSelect = (imgUrl) => { if (imgUrl !== mainDisplayImage) { setImageOpacity(0); setTimeout(() => { setMainDisplayImage(imgUrl); setImageOpacity(1); }, 200); } }; 
    const handlePrimaryOptionSelect = (variationId, option) => { setSelectedOptions(prev => ({ ...prev, [variationId]: option._id })); setSelectedSku(null); if (option.image) handleImageSelect(option.image); };
    const handleSkuSelect = (sku) => { setSelectedSku(sku); };
    
    const priceInfo = useMemo(() => {
        const basePriceForCalculation = selectedSku?.price ?? product?.basePrice ?? 0;
        
        if (isOfferProduct && advertisement.discountPercentage != null && advertisement.discountPercentage > 0) {
            const discountMultiplier = 1 - (advertisement.discountPercentage / 100);
            const finalPrice = basePriceForCalculation * discountMultiplier;
            return { 
                finalPrice, 
                originalPrice: basePriceForCalculation, 
                discountPercentage: advertisement.discountPercentage 
            };
        }

        return { 
            finalPrice: basePriceForCalculation, 
            originalPrice: null, 
            discountPercentage: 0 
        };
    }, [selectedSku, product, advertisement, isOfferProduct]);

    const formatPrice = useCallback((price) => { if (price == null) return t('general.priceNotAvailable'); const locale = language === 'ar' ? 'ar-EG' : 'en-US'; try { return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' }).format(Number(price)); } catch (error) { return `${price} EGP`; } }, [language, t]);
    const isAddToCartDisabled = useMemo(() => { if (loadingCart) return true; if (product?.variations?.length > 0) { const requiredVariations = product.variations.filter(v => v.options?.length > 0); if (!requiredVariations.every(v => selectedOptions[v._id])) return true; const lastSelectedOption = requiredVariations.length > 0 ? product.variations.flatMap(v => v.options).find(o => o._id === selectedOptions[requiredVariations[requiredVariations.length - 1]._id]) : null; if (lastSelectedOption?.skus?.length > 0 && !selectedSku) return true; } return false; }, [loadingCart, product, selectedOptions, selectedSku]);
    const productIsFavorite = product ? isFavorite(product._id) : false;
    const allImages = useMemo(() => { if (!product) return []; const images = new Map(); if (product.mainImage) images.set(product.mainImage, product.mainImage); (product.images || []).forEach(img => images.set(img, img)); (product.variations || []).forEach(v => (v.options || []).forEach(o => o.image && !images.has(o.image) && images.set(o.image, o.image))); return Array.from(images.values()); }, [product]);
    const userHasReviewed = useMemo(() => !(!product || !currentUser || !Array.isArray(product.reviews)) && product.reviews.some(review => review.user?._id === currentUser._id || review.user === currentUser._id), [product, currentUser]);
    const reviewBreakdown = useMemo(() => { if (!product || !product.reviews || product.reviews.length === 0) { return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }; } return product.reviews.reduce((acc, review) => { acc[review.rating] = (acc[review.rating] || 0) + 1; return acc; }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }); }, [product]);
    const handleAddToCart = useCallback(() => { if (!isAuthenticated) { showToast(t('cart.loginRequired'), 'info'); navigate('/login'); return; } if (isAddToCartDisabled) { showToast(t('productDetailsPage.selectAllOptions'), 'warning'); return; } addToCart(product, quantity, selectedSku?._id); }, [isAuthenticated, product, quantity, selectedSku, addToCart, navigate, t, showToast, isAddToCartDisabled]);

    if (loading) return <ProductSkeleton />;
    if (error) return <div className="flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-black p-4"><div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4"><Info size={32} /><p className="font-semibold text-xl">{error}</p></div></div>;
    if (!product) return null;
    const { averageRating = 0, numReviews = 0, reviews = [], name, category, variations = [], attributes = [], description } = product;
    const productName = name;
    const categoryName = category?.name;
    const subCategoryName = category?.subCategories.find(sc => sc._id === product.subCategory)?.name;

    return (
        <div className="bg-white dark:bg-zinc-950">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav aria-label="Breadcrumb" className="py-6"> <ol className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"> <li><Link to="/" className="hover:text-primary transition-colors">{t('general.home')}</Link></li> <li><ChevronRight size={16} /></li> <li><Link to="/shop" className="hover:text-primary transition-colors">{t('shopPage.title')}</Link></li> {categoryName && <> <li><ChevronRight size={16} /></li> <li><Link to={`/shop?category=${encodeURIComponent(categoryName)}`} className="hover:text-primary transition-colors">{categoryName}</Link></li> </>} {subCategoryName && <> <li><ChevronRight size={16} /></li> <li><span className="font-medium text-zinc-800 dark:text-zinc-200">{subCategoryName}</span></li> </>} </ol> </nav>
                
                {isOfferProduct && ( <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/20"> <div className="flex flex-col md:flex-row justify-between items-center gap-6"> <div className="text-center md:text-left"> <h2 className="text-2xl font-bold flex items-center gap-3 [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)]"><Award size={28} />{advertisement.title || t('productDetailsPage.specialOffer')}</h2> <p className="mt-1 text-blue-100 max-w-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)]">{advertisement.description}</p> </div> {timeLeft && (<div className="text-center shrink-0"><p className="text-xs uppercase font-semibold tracking-wider text-blue-200 flex items-center justify-center gap-2"><Clock size={14}/>{t('productDetailsPage.offerEndsIn')}</p><div className="flex gap-2 sm:gap-3 mt-1 font-mono text-2xl font-bold"><div>{String(timeLeft.days).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.days')}</span></div>:<div>{String(timeLeft.hours).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.hours')}</span></div>:<div>{String(timeLeft.minutes).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.minutes')}</span></div>:<div>{String(timeLeft.seconds).padStart(2, '0')} <span className="text-xs block font-normal opacity-80">{t('general.seconds')}</span></div></div></div>)} </div> </div> )}
                
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pb-24"> <div className="lg:sticky lg:top-24 self-start flex flex-col-reverse md:flex-row gap-4"> <div className="flex flex-row md:flex-col gap-3 justify-center">{allImages.slice(0, 5).map(imgUrl => (<button key={imgUrl} className={`group relative flex-shrink-0 w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 border-2 hover:border-primary-light focus:outline-none ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 focus:ring-2 focus:ring-primary ${mainDisplayImage === imgUrl ? 'border-primary' : 'border-zinc-200 dark:border-zinc-800'}`} onClick={() => handleImageSelect(imgUrl)}><img src={`${API_BASE_URL}${imgUrl}`} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/></button>))}</div> <div className="relative w-full aspect-square bg-white dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-900/5"> 
                    {priceInfo.discountPercentage > 0 && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                            <Award size={14} />
                            <span>{Math.round(priceInfo.discountPercentage)}% {t('general.off')}</span>
                        </div>
                    )}
                    <img src={`${API_BASE_URL}${mainDisplayImage}`} alt={productName} className="w-full h-full object-contain transition-opacity duration-300 p-8" style={{ opacity: imageOpacity }} /> 
                </div> </div> <div className="flex flex-col"> <div className="flex items-center justify-between"> <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-2 cursor-pointer group"> <StarRating rating={averageRating} /> <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors group-hover:text-primary">{numReviews} {t('productDetailsPage.reviews')}</span> </button> <button onClick={() => toggleFavorite(product)} className={`p-2 rounded-full transition-all duration-200 ${productIsFavorite ? 'bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-200' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500'}`}><Heart size={22} fill={productIsFavorite ? 'currentColor' : 'none'}/></button> </div> <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 leading-tight tracking-tight">{productName}</h1> 
                    <div className="mt-4 flex items-baseline gap-4"> 
                        <p className="text-4xl font-bold text-primary-dark dark:text-primary-light">{formatPrice(priceInfo.finalPrice)}</p> 
                        {priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.finalPrice && (
                            <p className="text-xl text-zinc-400 line-through dark:text-zinc-500">{formatPrice(priceInfo.originalPrice)}</p>
                        )} 
                    </div> 
                    {description && <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-prose">{description.substring(0, 150).replace(/<[^>]*>?/gm, '')}{description.length > 150 ? '...' : ''}</p>} <div className="space-y-6 my-8"> {variations.map((variation) => { const variationName = language === 'ar' ? variation.name_ar : variation.name_en; const currentSelectedOption = (variation.options || []).find(opt => opt._id === selectedOptions[variation._id]); return ( <div key={variation._id}> <h3 className="mb-3 text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider">{variationName}: <span className="text-zinc-500 dark:text-zinc-400 font-medium capitalize">{currentSelectedOption ? (language === 'ar' ? currentSelectedOption.name_ar : currentSelectedOption.name_en) : ''}</span></h3> <div className="flex flex-wrap gap-3"> {(variation.options || []).map((option) => { const isSelected = selectedOptions[variation._id] === option._id; return ( <button key={option._id} onClick={() => handlePrimaryOptionSelect(variation._id, option)} className={`group relative flex min-w-[48px] items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-zinc-950 ${isSelected ? 'border-primary bg-primary/10 text-primary-dark dark:text-primary-light shadow-sm' : 'border-zinc-300 bg-white hover:border-primary-light dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-primary'}`}> {variation.name_en?.toLowerCase() === 'color' && colorMap[option.name_en?.toLowerCase()] && (<span style={{ backgroundColor: colorMap[option.name_en?.toLowerCase()] }} className="h-6 w-6 rounded-full border border-black/10 shadow-inner"></span>)} <span>{language === 'ar' ? option.name_ar : option.name_en}</span> </button> ); })} </div> {currentSelectedOption && currentSelectedOption.skus?.length > 0 && ( <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700"> <h4 className="mb-3 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{t('productDetailsPage.selectFinalProduct')}</h4> <div className="flex flex-wrap gap-2"> {currentSelectedOption.skus.map(sku => { const isSkuSelected = selectedSku?._id === sku._id; return ( <button key={sku._id} onClick={() => handleSkuSelect(sku)} className={`relative rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-zinc-950 ${isSkuSelected ? 'border-primary bg-primary text-white' : 'border-zinc-300 bg-white hover:border-primary-light dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-primary'}`}> {language === 'ar' ? sku.name_ar : sku.name_en} </button> ); })} </div> </div> )} </div>); })} </div> <div className="mt-auto pt-8 border-t-2 border-zinc-200 dark:border-zinc-800"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-1.5 justify-between"> <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"><Minus size={16}/></button> <span className="px-4 font-bold text-lg text-zinc-800 dark:text-white bg-transparent">{quantity}</span> <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"><Plus size={16}/></button> </div> <div className="relative group"> <button onClick={handleAddToCart} disabled={isAddToCartDisabled} className="w-full rounded-xl bg-primary p-4 text-base font-semibold text-white transition-all duration-300 hover:bg-primary-dark disabled:bg-zinc-400 disabled:cursor-not-allowed dark:bg-primary dark:hover:bg-primary-dark flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-950 shadow-lg shadow-primary/20 hover:shadow-primary/40"> {loadingCart ? <Loader2 className="animate-spin"/> : <ShoppingCart size={20}/>} {t('productDetailsPage.addToCart')} </button> {isAddToCartDisabled && !loadingCart && <div className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{t('productDetailsPage.selectAllOptions')}</div>} </div> </div> {selectedSku && selectedSku.stock !== undefined && (<p className={`mt-3 text-xs font-semibold text-center sm:text-left ${selectedSku.stock > 5 ? 'text-green-600' : (selectedSku.stock > 0 ? 'text-orange-500' : 'text-red-600')}`}>{selectedSku.stock > 0 ? t('productDetailsPage.inStock', { count: selectedSku.stock }) : t('productDetailsPage.outOfStock')}</p>)} <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm"> <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><ShieldCheck size={18} className="text-primary"/><span>{t('general.secureCheckout')}</span></div> <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><Truck size={18} className="text-primary"/><span>{t('general.fastShipping')}</span></div> <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400"><MessageSquareQuote size={18} className="text-primary"/><span>{t('general.customerSupport')}</span></div> </div> </div> </div> </main>
                <section className="py-16"> <div className="border-b border-zinc-200 dark:border-zinc-800"> <nav className="-mb-px flex gap-6" aria-label="Tabs"> {description && <button onClick={() => setActiveTab('description')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'}`}>{t('productDetailsPage.description')}</button>} {attributes.length > 0 && <button onClick={() => setActiveTab('specifications')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'specifications' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'}`}>{t('productDetailsPage.specifications')}</button>} <button onClick={() => setActiveTab('reviews')} className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'}`}>{t('productDetailsPage.reviews')} ({numReviews})</button> </nav> </div> <div className="mt-8"> {activeTab === 'description' && description && ( <div className="prose prose-zinc max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: description }} /> )} {activeTab === 'specifications' && attributes.length > 0 && ( <dl className="space-y-4 pt-2 max-w-2xl">{attributes.filter(attr => attr.key_en && attr.value_en).map((attr, index) => (<div key={index} className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4"><dt className="font-medium text-zinc-500 dark:text-zinc-400">{language === 'ar' ? attr.key_ar : attr.key_en}</dt><dd className="col-span-2 font-semibold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? attr.value_ar : attr.value_en}</dd></div>))}</dl> )} {activeTab === 'reviews' && ( <div id="reviews-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12"> <div className="lg:col-span-4"><div className="sticky top-24"> <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('productDetailsPage.customerReviews')}</h2> <div className="mt-3 flex items-center gap-2"><StarRating rating={averageRating} size={20} /><p className="text-zinc-700 dark:text-zinc-300"><span className="font-bold">{averageRating.toFixed(1)}</span><span className="text-sm text-zinc-500 dark:text-zinc-400"> / 5</span></p></div> <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('productDetailsPage.basedOnReviews', { count: numReviews })}</p> <div className="mt-6 space-y-2">{Object.entries(reviewBreakdown).reverse().map(([star, count]) => (<div key={star} className="flex items-center gap-2 text-sm"><span className="font-medium text-zinc-600 dark:text-zinc-400 w-12">{star} {t('general.star')}</span><div className="flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${numReviews > 0 ? (count / numReviews) * 100 : 0}%` }}></div></div><span className="w-8 text-right text-zinc-500 dark:text-zinc-500">{count}</span></div>))}</div> </div></div> <div className="lg:col-span-8 space-y-8"> {isAuthenticated ? (userHasReviewed ? <p className="p-4 bg-primary/10 text-primary-dark dark:text-primary-light rounded-lg text-sm">{t('productDetailsPage.reviewForm.alreadyReviewed')}</p> : <ReviewForm productId={product._id} onReviewSubmitted={fetchProductDetails} />) : <p className="p-4 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg text-sm">{t('productDetailsPage.reviewForm.loginToReview')}</p>} {reviews.length > 0 ? (reviews.map((review) => (<div key={review._id} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"><div className="flex gap-4"><div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0"><UserIcon size={20} className="text-zinc-500 dark:text-zinc-400" /></div><div className="flex-1"><div className="flex items-center justify-between"><h4 className="text-sm font-bold text-zinc-800 dark:text-white">{review.name}</h4><p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(review.createdAt).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div className="flex items-center gap-2 mt-1"><StarRating rating={review.rating} /></div><p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{review.comment}</p></div></div></div>))) : (<div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 mt-8"><h3 className="text-lg font-semibold text-zinc-800 dark:text-white">{t('productDetailsPage.reviewForm.noReviewsYet')}</h3><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('productDetailsPage.reviewForm.beTheFirst')}</p></div>)} </div> </div> )} </div> </section>
            </div>
        </div>
    );
};

export default ProductDetails;