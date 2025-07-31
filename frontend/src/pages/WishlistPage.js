import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from "../components/LanguageContext";
import { HeartCrack, UserCheck, Loader2, Heart, ArrowRight } from 'lucide-react';

const WishlistPage = () => {
    const { wishlistItems, loadingWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const { t, language } = useLanguage();

    const EmptyState = ({ icon: Icon, title, message, buttonText, buttonLink }) => (
        <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white dark:bg-black p-4 text-center">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
                <Link to={buttonLink} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-zinc-900">
                    {buttonText}
                    <ArrowRight size={16} style={{ transform: language === 'ar' ? 'scaleX(-1)' : 'scaleX(1)' }} />
                </Link>
            </div>
        </div>
    );

    if (loadingWishlist) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-white dark:bg-black">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <EmptyState
                icon={UserCheck}
                title={t('wishlistPage.loginRequiredTitle', 'Please Log In')}
                message={t('wishlistPage.pleaseLogin', 'Log in to see your favorite items and build your wishlist.')}
                buttonText={t('auth.login', 'Log In')}
                buttonLink="/login"
            />
        );
    }

    return (
        <div className="bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <header className="text-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                     <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl flex items-center justify-center gap-3">
                        <Heart size={36} className="text-red-500" />
                        {t('wishlistPage.wishlistTitle', 'My Wishlist')}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
                        {t('wishlistPage.wishlistSubtitle', 'Here are the items you saved for later. Don\'t let them get away!')}
                    </p>
                </header>
                
                {wishlistItems.length === 0 ? (
                    <EmptyState
                        icon={HeartCrack}
                        title={t('wishlistPage.emptyWishlistTitle', 'Your Wishlist is Empty')}
                        message={t('wishlistPage.emptyWishlist', "You haven't added any items yet. Start exploring and save what you love!")}
                        buttonText={t('mainHeader.shop', 'Go Shopping')}
                        buttonLink="/shop"
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {wishlistItems.map(product => (
                            <ProductCard 
                                product={product} 
                                advertisement={product.advertisement} 
                                key={product._id} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;