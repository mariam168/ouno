import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Copy, Sparkles, Loader2, ShoppingCart, ArrowRight, TrendingUp, CheckCircle2, Calendar, Tag, CircleDollarSign } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";
import axios from 'axios';
import { Link } from 'react-router-dom';

const useCurrencyFormatter = () => {
    const { t, language } = useLanguage();

    return useCallback((amount) => {
        if (amount == null) return t('general.notApplicable');
        const safeCurrencyCode = 'EGP';
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: safeCurrencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(Number(amount));
        } catch (error) {
            console.error("Currency formatting error:", error);
            return `${amount} ${safeCurrencyCode}`;
        }
    }, [language, t]);
};

const DiscountCodeCard = ({ discount, t, isRTL, handleCopyCode, copiedCode }) => {
    const isCopied = copiedCode === discount.code;
    const formatCurrency = useCurrencyFormatter();

    const formatDate = (dateString) => {
        const locale = isRTL ? 'ar-EG' : 'en-GB';
        return new Date(dateString).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {discount.percentage && (
                            <p className="text-3xl font-extrabold text-primary dark:text-primary-light">
                                {discount.percentage}<span className="text-xl">%</span>
                            </p>
                        )}
                        {discount.fixedAmount && (
                            <p className="text-3xl font-extrabold text-primary dark:text-primary-light">
                                {formatCurrency(discount.fixedAmount)}
                            </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            {t('general.discount')}
                        </p>
                    </div>
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-primary dark:bg-zinc-800">
                        <Tag size={24} />
                    </div>
                </div>
                
                <div className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {discount.minOrderAmount > 0 && 
                        <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5"><CircleDollarSign size={14} /> {t('general.minSpendLabel')}</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formatCurrency(discount.minOrderAmount)}</span>
                        </div>
                    }
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {t('general.validUntilLabel')}</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formatDate(discount.endDate)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-auto border-t-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <div 
                    onClick={() => !isCopied && handleCopyCode(discount.code)}
                    className={`group/copy relative flex cursor-pointer items-center justify-center gap-3 rounded-b-2xl px-5 py-4 transition-all duration-300 ${isCopied ? 'bg-green-500' : 'bg-zinc-50 hover:bg-primary/10 dark:bg-zinc-800/50 dark:hover:bg-primary/20'}`}
                >
                    <span className={`font-mono text-lg font-bold tracking-widest ${isCopied ? 'text-white' : 'text-primary dark:text-primary-light'}`}>
                        {discount.code}
                    </span>
                    <div className={`transition-transform duration-300 ${isCopied ? 'scale-100' : 'scale-0'}`}>
                        <CheckCircle2 size={20} className="text-white" />
                    </div>
                     <div className={`absolute transition-transform duration-300 ${isCopied ? 'scale-0' : 'scale-100'}`}>
                        <Copy size={16} className="text-zinc-500 group-hover/copy:text-primary dark:text-zinc-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};
const SideOfferCard = ({ offer, t, serverUrl }) => {
    const formatCurrency = useCurrencyFormatter();
    const priceInfo = useMemo(() => {
        const product = offer.productRef;
        if (!product || product.basePrice == null) {
            return { finalPrice: null, originalPrice: null };
        }

        const originalPrice = product.basePrice;
        let finalPrice = originalPrice;
        if (offer.discountPercentage > 0) {
            finalPrice = originalPrice * (1 - offer.discountPercentage / 100);
        }

        return {
            finalPrice,
            originalPrice: finalPrice < originalPrice ? originalPrice : null
        };
    }, [offer]);

    return (
        <Link to={offer.link || (offer.productRef?._id ? `/shop/${offer.productRef._id}` : '#')} className="block group">
            <div className="h-full flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/50">
                <div className="flex items-center gap-4">
                    <img 
                        src={offer.image ? `${serverUrl}${offer.image}` : (offer.productRef?.mainImage ? `${serverUrl}${offer.productRef.mainImage}` : '')} 
                        alt={offer.title} 
                        className="h-20 w-20 flex-shrink-0 rounded-lg bg-zinc-100 object-contain p-1 transition-transform duration-300 group-hover:scale-105 dark:bg-zinc-800" 
                    />
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-zinc-800 dark:text-white line-clamp-2">{offer.title}</h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{offer.description}</p>
                    </div>
                </div>
                {priceInfo.finalPrice != null && (
                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700 flex-1 flex flex-col justify-end">
                        <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold text-primary dark:text-primary-light">
                                {formatCurrency(priceInfo.finalPrice)}
                            </p>
                            {priceInfo.originalPrice && (
                                <p className="text-sm text-zinc-500 line-through dark:text-zinc-500">
                                    {formatCurrency(priceInfo.originalPrice)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};


const AllOffersCard = ({ t, isRTL }) => (
    <Link to="/all-offers" className="block group">
        <div className="h-full relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40">
             <div className="absolute -bottom-8 -right-8 opacity-20">
                <TrendingUp size={128} strokeWidth={1.5}/>
            </div>
            <div className={`relative z-10 flex flex-col h-full`}>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold">{t('heroSection.allOffersTitle')}</h3>
                    <p className="mt-1 text-sm opacity-80">{t('heroSection.allOffersSubtitle')}</p>
                </div>
                <div className="mt-auto flex items-center justify-end text-sm font-semibold">
                    <span>{t('general.viewAll')}</span>
                    <ArrowRight size={16} className={`ms-1 transition-transform duration-200 group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
            </div>
        </div>
    </Link>
);

const HeroSection = ({ serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();
    const formatCurrencyForDisplay = useCurrencyFormatter();
    const [slidesData, setSlidesData] = useState([]);
    const [sideOffersData, setSideOffersData] = useState([]);
    const [weeklyOfferData, setWeeklyOfferData] = useState(null);
    const [discountsData, setDiscountsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0);
    const [copiedCode, setCopiedCode] = useState(null);
    const isRTL = language === 'ar';

    const fetchHeroData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const axiosConfig = { headers: { 'accept-language': language } };
        try {
            const adsResponse = await axios.get(`${serverUrl}/api/advertisements?isActive=true`, axiosConfig);
            const discountsResponse = await axios.get(`${serverUrl}/api/discounts/active`, axiosConfig);
            
            const allAds = adsResponse.data;
            setSlidesData(allAds.filter(ad => ad.type === 'slide').sort((a, b) => (a.order || 0) - (b.order || 0)));
            setSideOffersData(allAds.filter(ad => ad.type === 'sideOffer').sort((a, b) => (a.order || 0) - (b.order || 0)));
            setWeeklyOfferData(allAds.find(ad => ad.type === 'weeklyOffer'));
            setDiscountsData(discountsResponse.data);
        } catch (err) {
            console.error("Error fetching hero section data:", err);
            setError(t('general.errorFetchingData') || 'Failed to load hero section data.');
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t, language]);

    useEffect(() => {
        fetchHeroData();
    }, [fetchHeroData]);

    const slidesLength = slidesData.length;

    useEffect(() => {
        if (slidesLength > 1) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slidesLength);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [slidesLength]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const combinedProductOffers = useMemo(() => {
        const offers = [...sideOffersData];
        if (weeklyOfferData) {
            offers.push(weeklyOfferData);
        }
        return offers.slice(0, 2);
    }, [sideOffersData, weeklyOfferData]);
    const currentSlidePriceInfo = useMemo(() => {
        const slide = slidesData[current];
        if (!slide?.productRef || slide.productRef.basePrice == null) {
            return { finalPrice: null, originalPrice: null };
        }
        const originalPrice = slide.productRef.basePrice;
        let finalPrice = originalPrice;
        if (slide.discountPercentage > 0) {
            finalPrice = originalPrice * (1 - slide.discountPercentage / 100);
        }
        return { finalPrice, originalPrice: finalPrice < originalPrice ? originalPrice : null };
    }, [slidesData, current]);

    const displayedDiscounts = useMemo(() => {
        return discountsData.slice(0, 2);
    }, [discountsData]);

    const currentSlideContent = slidesData[current];
    const hasContent = currentSlideContent || combinedProductOffers.length > 0 || displayedDiscounts.length > 0;

    if (loading) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center bg-zinc-50 dark:bg-black"><Loader2 size={48} className="animate-spin text-primary" /></section>; }
    if (error) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center rounded-3xl bg-red-100 p-4 text-center text-red-700 dark:bg-red-950/30 dark:text-red-300"><div className="flex items-center gap-3"><Sparkles size={28} /><span className="text-lg font-semibold">{error}</span></div></section>; }
    if (!hasContent) { return <section dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-[450px] w-full items-center justify-center rounded-3xl bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"><div className="flex flex-col items-center gap-4 text-center"><ShoppingCart size={48} className="text-primary" /><p className="text-xl font-semibold">{t('heroSection.noDataAvailable')}</p></div></section>; }

    return (
        <section dir={isRTL ? 'rtl' : 'ltr'} className="w-full bg-zinc-50 py-12 px-4 dark:bg-black sm:py-16">
            <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
                {currentSlideContent && (
                    <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 md:p-12 lg:col-span-2">
                        <div className="relative z-10 flex h-full flex-col items-center gap-8 md:flex-row">
                            <div className={`relative flex-shrink-0 ${isRTL ? 'md:order-1' : 'md:order-2'}`}>
                                <img src={`${serverUrl}${currentSlideContent.image}`} alt={currentSlideContent.title} className="relative z-10 h-40 w-40 object-contain transition-transform duration-500 group-hover:scale-105 sm:h-48 sm:w-48 md:h-64 md:w-64" />
                            </div>
                            <div className={`w-full flex-1 text-center md:text-left ${isRTL ? 'md:order-2 md:text-right' : 'md:order-1'}`}>
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary dark:text-primary-light">{currentSlideContent.productRef?.category?.name || t('heroSection.featuredProduct')}</p>
                                <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
                                    {currentSlideContent.title}
                                </h1>
                                <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:mt-4 sm:text-lg md:mx-0">
                                    {currentSlideContent.description}
                                </p>
                                <div className={`mt-4 flex items-baseline justify-center gap-3 sm:mt-6 ${isRTL ? 'md:justify-end flex-row-reverse' : 'md:justify-start'}`}>
                                    {currentSlidePriceInfo.finalPrice != null && (
                                        <span className="text-3xl font-bold text-primary dark:text-primary-light sm:text-4xl">
                                            {formatCurrencyForDisplay(currentSlidePriceInfo.finalPrice)}
                                        </span>
                                    )}
                                    {currentSlidePriceInfo.originalPrice != null && (
                                        <span className="text-lg text-zinc-500 line-through dark:text-zinc-500 sm:text-xl">
                                            {formatCurrencyForDisplay(currentSlidePriceInfo.originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-6 sm:mt-8">
                                    <Link to={currentSlideContent.productRef?._id ? `/shop/${currentSlideContent.productRef._id}` : (currentSlideContent.link || '#')} className="inline-block">
                                        <button className="group/btn flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-dark active:scale-95 sm:px-8 sm:py-3.5 sm:text-lg">
                                            <span>{t('general.shopNow')}</span>
                                            <ArrowRight size={20} className={`transform transition-transform group-hover/btn:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    </Link>
                                </div>
                             </div>
                        </div>
                        {slidesLength > 1 && (
                            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2 sm:bottom-6">
                                {slidesData.map((_, index) => (
                                    <button key={index} onClick={() => setCurrent(index)} className={`h-2.5 rounded-full transition-all duration-300 ${current === index ? "w-8 bg-primary" : "w-2.5 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"}`}></button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {combinedProductOffers.map((offer) => (
                        <SideOfferCard key={offer._id} offer={offer} t={t} serverUrl={serverUrl} />
                    ))}
                    {displayedDiscounts.map((discount) => (
                        <DiscountCodeCard key={discount._id} discount={discount} t={t} isRTL={isRTL} handleCopyCode={handleCopyCode} copiedCode={copiedCode} />
                    ))}
                    {(combinedProductOffers.length > 0 || slidesData.length > 0) && (
                         <AllOffersCard t={t} isRTL={isRTL} />
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;