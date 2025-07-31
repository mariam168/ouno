import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { useLanguage } from "../components/LanguageContext";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCcw, Info, ChevronDown, Filter, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const FilterAccordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-zinc-200 py-4 dark:border-zinc-800">
            <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between group">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{title}</p>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-zinc-500'}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`} >
                <div className="overflow-hidden">{children}</div>
            </div>
        </div>
    );
};

const FilterSelect = ({ value, onChange, options }) => (
    <select value={value} onChange={onChange} className="w-full cursor-pointer rounded-lg border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-300 focus:border-primary-light focus:ring-1 focus:ring-primary-light dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500">
        {options.map((opt) => (<option key={opt.value} value={opt.value}> {opt.label} </option>))}
    </select>
);

const ShopPage = () => {
    const { t, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [currentPrice, setCurrentPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const getDisplayName = useCallback((item) => {
        if (!item?.name) return '';
        return item.name;
    }, []);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const productsUrl = `${API_BASE_URL}/api/products`;
            const axiosConfig = { headers: { 'Accept-Language': language } };
            
            const productsPromise = axios.get(productsUrl, axiosConfig);
            const categoriesPromise = axios.get(`${API_BASE_URL}/api/categories`, axiosConfig);

            const [productsRes, categoriesRes] = await Promise.all([productsPromise, categoriesPromise]);

            const productsData = productsRes.data;
            const categoriesData = categoriesRes.data;

            setAllProducts(productsData);
            const allCategories = [{ _id: 'All', name: t('shopPage.allCategories') }, ...categoriesData];
            setCategories(allCategories);

            const categoryNameFromUrl = searchParams.get('category');
            if (categoryNameFromUrl) {
                const targetCategory = categoriesData.find(cat => getDisplayName(cat) === categoryNameFromUrl);
                if (targetCategory) {
                    setSelectedCategory(targetCategory._id);
                }
            }
            
            if (Array.isArray(productsData) && productsData.length > 0) {
                const prices = productsData.map((p) => {
                    if (p.advertisement && p.advertisement.discountPercentage > 0) {
                        return p.basePrice * (1 - p.advertisement.discountPercentage / 100);
                    }
                    return p.basePrice || 0;
                }).filter(price => price > 0);

                const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
                setMaxPrice(calculatedMaxPrice);
                setCurrentPrice(calculatedMaxPrice);
            } else {
                setMaxPrice(1000);
                setCurrentPrice(1000);
            }

        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError(t('shopPage.errorFetchingProducts'));
        } finally {
            setLoading(false);
        }
    }, [t, language, getDisplayName, searchParams]); 

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const displayedProducts = useMemo(() => {
        const searchTerm = searchParams.get('search')?.toLowerCase() || '';
        let processedProducts = allProducts.map((p) => {
            const adData = p.advertisement;
            let displayPrice = p.basePrice;

            if (adData && adData.discountPercentage > 0) {
                displayPrice = p.basePrice * (1 - (adData.discountPercentage / 100));
            }
            return { ...p, displayPrice, localizedProductName: p.name };
        });   
        if (searchTerm) {
            processedProducts = processedProducts.filter(p => 
                p.localizedProductName.toLowerCase().includes(searchTerm)
            );
        }
        return processedProducts
            .filter((p) => selectedCategory === 'All' || p.category?._id === selectedCategory)
            .filter((p) => selectedSubCategory === 'All' || p.subCategory === selectedSubCategory)
            .filter((p) => (p.displayPrice || 0) <= currentPrice)
            .sort((a, b) => {
                if (sortBy === 'price-asc') return (a.displayPrice || 0) - (b.displayPrice || 0);
                if (sortBy === 'price-desc') return (b.displayPrice || 0) - (a.displayPrice || 0);
                if (sortBy === 'name-asc') return a.localizedProductName.localeCompare(b.localizedProductName);
                
                const isAAdvertised = !!a.advertisement;
                const isBAdvertised = !!b.advertisement;
                if (isAAdvertised !== isBAdvertised) return isAAdvertised ? -1 : 1;
                
                return (b.numReviews || 0) - (a.numReviews || 0);
            });
    }, [allProducts, selectedCategory, selectedSubCategory, currentPrice, sortBy, searchParams]);

    const resetFilters = useCallback(() => {
        setSelectedCategory('All');
        setSelectedSubCategory('All');
        
        const prices = allProducts.map((p) => {
            if (p.advertisement && p.advertisement.discountPercentage > 0) {
                return p.basePrice * (1 - p.advertisement.discountPercentage / 100);
            }
            return p.basePrice || 0;
        }).filter(price => price > 0);

        const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
        setMaxPrice(calculatedMaxPrice);
        setCurrentPrice(calculatedMaxPrice);
        
        setSortBy('popularity');
        navigate('/shop');
    }, [allProducts, navigate]);


    const subCategoriesForSelectedCategory = useMemo(() => {
        if (selectedCategory === 'All') return [];
        const category = categories.find(c => c._id === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory, categories]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedSubCategory('All');
    };

    const formatPriceForRange = (price) => {
        const locale = language === 'ar' ? 'ar-EG' : 'en-US';
        try {
            return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', minimumFractionDigits: 0, }).format(Number(price));
        } catch (error) {
            return `${price} EGP`;
        }
    };

    if (loading) {
        return (<div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black"> <Loader2 size={48} className="animate-spin text-primary" /> </div>);
    }

    if (error) {
        return (<div className="flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-black p-4"> <div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4"> <AlertCircle size={40} /> <p className="font-semibold text-xl">{t('general.error')}</p> <p className="text-base">{error}</p> <button onClick={fetchInitialData} className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200"> <RefreshCcw size={16} /> {t('general.retry')} </button> </div> </div>);
    }

    const FilterPanelContent = () => (
        <>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{t('shopPage.filters')}</h2>
                <button onClick={resetFilters} className="text-sm font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors duration-200">
                    {t('shopPage.resetFilters')}
                </button>
            </div>

            <FilterAccordion title={t('shopPage.categories')} defaultOpen={true}>
                <ul className="space-y-2">
                    {categories.map(cat => (
                        <li key={cat._id}>
                            <button onClick={() => handleCategoryChange(cat._id)} className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedCategory === cat._id ? 'bg-primary/10 text-primary font-semibold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                {getDisplayName(cat)}
                            </button>
                        </li>
                    ))}
                </ul>
            </FilterAccordion>

            {subCategoriesForSelectedCategory.length > 0 && (
                <FilterAccordion title={t('shopPage.subCategories')} defaultOpen={true}>
                    <ul className="space-y-2">
                        <li><button onClick={() => setSelectedSubCategory('All')} className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedSubCategory === 'All' ? 'bg-primary/10 text-primary font-semibold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{t('shopPage.allSubCategories')}</button></li>
                        {subCategoriesForSelectedCategory.map(subCat => (
                            <li key={subCat._id}><button onClick={() => setSelectedSubCategory(subCat._id)} className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedSubCategory === subCat._id ? 'bg-primary/10 text-primary font-semibold' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{getDisplayName(subCat)}</button></li>
                        ))}
                    </ul>
                </FilterAccordion>
            )}

            <FilterAccordion title={t('shopPage.priceRange')} defaultOpen={true}>
                <input type="range" min={0} max={maxPrice} value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value))} className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-primary" />
                <div className="mt-2 flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>{formatPriceForRange(0)}</span>
                    <span>{formatPriceForRange(currentPrice)}</span>
                </div>
            </FilterAccordion>
        </>
    );

    return (
        <div className="bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary-light sm:text-6xl md:text-7xl">
                        {t('shopPage.title')}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                        {t('shopPage.subtitle')}
                    </p>
                </header>

                {categories.length > 1 && (
                    <div className="py-6 mb-10 border-t border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-center flex-wrap gap-x-6 gap-y-3">
                            {categories.map((cat) => {
                                const displayName = getDisplayName(cat);
                                const isActive = selectedCategory === cat._id;
                                return (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryChange(cat._id)}
                                        className={`text-sm font-semibold tracking-wide transition-colors duration-200 pb-1 border-b-2 focus:outline-none ${isActive ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary-light'}`}
                                    >
                                        {displayName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <FilterPanelContent />
                        </div>
                    </aside>

                    <main className="lg:col-span-3">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {t('shopPage.showingItems', { count: displayedProducts.length })}
                            </p>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden">
                                    <Filter size={18} /> {t('shopPage.filters')}
                                </button>
                                <div className="w-48">
                                    <FilterSelect
                                        value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                        options={[{ value: 'popularity', label: t('shopPage.popularity') }, { value: 'price-asc', label: t('shopPage.priceLowToHigh') }, { value: 'price-desc', label: t('shopPage.priceHighToLow') }, { value: 'name-asc', label: t('shopPage.nameAZ') }]}
                                    />
                                </div>
                            </div>
                        </div>

                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-2 xl:grid-cols-3">
                                {displayedProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center h-full min-h-[400px] dark:border-zinc-700">
                                <Info size={48} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
                                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">{t('shopPage.noProductsFoundTitle')}</p>
                                <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 max-w-md">{t('shopPage.noProductsFoundSubtitle')}</p>
                                <button onClick={resetFilters} className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"><RefreshCcw size={16} />{t('shopPage.resetFilters')}</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <div className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                <div className={`fixed top-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${language === 'ar' ? (isFilterOpen ? 'right-0' : 'right-[-100%]') : (isFilterOpen ? 'left-0' : 'left-[-100%]')}`} >
                    <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('shopPage.filters')}</h2>
                        <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors duration-200"><X size={24} /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-5">
                        <FilterPanelContent />
                    </div>
                    <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
                        <button onClick={() => setIsFilterOpen(false)} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
                            {t('shopPage.viewResults', { count: displayedProducts.length })}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;