import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../components/LanguageContext';
import { Loader2, Info, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AllOffersPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL } = useAuth();

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/advertisements?isActive=true`, {
                headers: { 'Accept-Language': language }
            });
            const offersWithProducts = response.data
                .filter(offer => offer.productRef && offer.productRef._id)
                .sort((a, b) => (a.order || 999) - (b.order || 999) || new Date(b.createdAt) - new Date(a.createdAt));
            
            setOffers(offersWithProducts);
        } catch (err) {
            console.error("Error fetching all offers:", err.response?.data?.message || err.message);
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t, language]);

    useEffect(() => {
        fetchAllOffers();
    }, [fetchAllOffers]);

    if (loading) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-gray-100 dark:bg-black">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.error')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        );
    }
    
    return (
        <section className="w-full bg-gray-100 dark:bg-black py-16 sm:py-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                        {t('allOffersPage.title')}
                    </h1>
                </header>

                {offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10 mb-6">
                            <ShoppingBag className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('allOffersPage.noOffersTitle')}
                        </h2>
                        <p className="text-base text-gray-600 dark:text-zinc-400 mb-8 max-w-md text-center">
                            {t('allOffersPage.noOffers')}
                        </p>
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white"
                        >
                            {t('cartPage.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {offers.map(offer => (
                            <ProductCard
                                key={offer._id}
                                product={{
                                    ...offer.productRef,
                                    advertisement: offer
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllOffersPage;