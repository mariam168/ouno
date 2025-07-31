import React, { useCallback, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../components/LanguageContext';
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ImageOff, ArrowRight } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastNotification';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    const { t, language } = useLanguage(); 
    const navigate = useNavigate();
    const { showToast } = useToast(); 
    const { cartItems, loadingCart, updateCartItemQuantity, removeFromCart, cartTotal } = useCart();
    const { API_BASE_URL } = useAuth();

    const validCartItems = useMemo(() => cartItems.filter(item => item.product), [cartItems]);

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable', 'N/A');
        const currencyCode = 'EGP'; 
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: currencyCode }).format(Number(price));
    }, [language, t]);

    const handleQuantityChange = (item, newQuantity) => {
        const numQuantity = Number(newQuantity);
        if (isNaN(numQuantity) || numQuantity < 1) return;
        
        const stock = item.stock; 
        if (stock !== undefined && numQuantity > stock) {
            showToast(t('cartPage.notEnoughStockForUpdate', { quantity: stock }), 'warning');
            updateCartItemQuantity(item.product._id, stock, item.selectedVariant);
            return;
        }
        updateCartItemQuantity(item.product._id, numQuantity, item.selectedVariant);
    }; 
    
    const handleRemoveItem = (item) => {
        removeFromCart(item.product._id, item.selectedVariant);
    };

    const handleProceedToCheckout = () => navigate('/checkout');

    if (loadingCart && validCartItems.length === 0) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center bg-white dark:bg-black">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!validCartItems || validCartItems.length === 0) {
        return (
            <div className="flex min-h-[90vh] flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10 mb-6">
                        <ShoppingCart className="h-8 w-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('cartPage.cartEmpty')}</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{t('cartPage.cartEmptyDesc')}</p>
                    <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white">
                        {t('cartPage.continueShopping')}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-gray-100 min-h-screen dark:bg-black py-12 sm:py-16">
            <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                     <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                         {t('cartPage.shoppingCart')}
                     </h1>
                </header>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {validCartItems.map(item => (
                                <div key={`${item.product._id}-${item.selectedVariant || 'default'}`} className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <Link to={`/shop/${item.product._id}`} className="flex-shrink-0">
                                        <div className="h-28 w-28 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                                            {item.image ? <img src={`${API_BASE_URL}${item.image}`} alt={item.name.en} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center"><ImageOff className="text-gray-400"/></div>}
                                        </div>
                                    </Link>
                                    <div className="flex flex-1 flex-col justify-between self-stretch">
                                        <div>
                                            <Link to={`/shop/${item.product._id}`} className="text-base font-bold text-gray-800 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2">{language === 'ar' ? item.name.ar : item.name.en}</Link>
                                            {item.variantDetailsText && <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{item.variantDetailsText}</p>}
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white sm:mt-0">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                    <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:justify-between">
                                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700">
                                            <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-l-md disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={16}/></button>
                                            <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item, e.target.value)} className="w-12 border-x border-gray-200 bg-transparent text-center text-sm font-bold text-gray-800 dark:border-zinc-700 dark:text-white" />
                                            <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-r-md disabled:opacity-50" disabled={item.stock !== undefined && item.quantity >= item.stock}><Plus size={16}/></button>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item)} className="p-2 text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('cartPage.orderSummary')}</h2>
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-300"><p>{t('cartPage.subtotal')}</p><p>{formatPrice(cartTotal)}</p></div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-300"><p>{t('cartPage.shipping')}</p><p className="font-medium text-green-600">{t('cartPage.freeShipping')}</p></div>
                                <div className="border-t border-gray-200 pt-4 dark:border-zinc-800">
                                    <div className="flex items-center justify-between text-base font-bold text-gray-900 dark:text-white"><p>{t('cartPage.cartTotal')}</p><p>{formatPrice(cartTotal)}</p></div>
                                </div>
                                <button onClick={handleProceedToCheckout} className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white flex items-center justify-center gap-2">
                                    <span>{t('cartPage.proceedToCheckout')}</span><ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CartPage;