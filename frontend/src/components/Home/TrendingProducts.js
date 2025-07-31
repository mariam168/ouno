import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "../ProductCard";
import { useLanguage } from "../LanguageContext";
import { Loader2, TrendingUp, AlertCircle, Info } from "lucide-react";
import axios from 'axios';
const TrendingProducts = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const fetchTrendingData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const productsPromise = axios.get(`${API_BASE_URL}/api/products`, {
                headers: { 'Accept-Language': language }
            });
            const advertisementsPromise = axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`, {
                headers: { 'Accept-Language': language }
            });

            const [productsRes, advertisementsRes] = await Promise.all([
                productsPromise,
                advertisementsPromise
            ]);

            const allProducts = productsRes.data;
            const allAdvertisements = advertisementsRes.data;

            let enrichedProducts = allProducts.map(product => {
                const associatedAd = allAdvertisements.find(ad => (ad.productRef?._id || ad.productRef) === product._id);
                return {
                    ...product,
                    advertisement: associatedAd || null
                };
            });

            enrichedProducts.sort((a, b) => {
                const isAAdvertised = !!a.advertisement;
                const isBAdvertised = !!b.advertisement;

                if (isAAdvertised && !isBAdvertised) return -1;
                if (!isAAdvertised && isBAdvertised) return 1;
                
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setProducts(enrichedProducts.slice(0, 8));
        } catch (err) {
            console.error("Error fetching trending products:", err);
            setError(t('trendingProducts.fetchError') || 'Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    }, [t, API_BASE_URL, language]);
    useEffect(() => {
        fetchTrendingData();
    }, [fetchTrendingData]); 

    const ProductCardSkeleton = () => (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-zinc-800 animate-pulse">
            <div className="w-full h-48 bg-gray-200 dark:bg-zinc-800 rounded-lg mb-4"></div>
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-md mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
    );

    if (loading) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-10 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-lg mx-auto mb-4 animate-pulse"></div>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-lg mx-auto mb-12 animate-pulse"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-zinc-950">
                 <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-red-700 dark:text-red-400 p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/30 flex flex-col items-center gap-4">
                        <AlertCircle size={40} />
                        <p className="font-semibold text-xl">{t('general.error')}</p>
                        <p className="text-base">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center p-10 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <Info size={48} className="mx-auto mb-4 text-primary" />
                        <p className="font-semibold text-xl text-gray-800 dark:text-white">{t('trendingProducts.noProductsFound')}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-3 mb-2">
                         <TrendingUp className="text-primary-light" size={32} />
                         <h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark dark:text-white">
                            {t('trendingProducts.title')}
                        </h2>
                    </div>
                    <p className="mt-3 text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        {t('trendingProducts.subtitle')}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product) => (
                        <ProductCard 
                            key={product._id} 
                            product={product} 
                            advertisement={product.advertisement}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;