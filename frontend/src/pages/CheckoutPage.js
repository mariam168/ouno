import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { ShoppingCart, Loader2, CheckCircle, Package, CreditCard, MapPin, ImageOff, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastNotification';

const CheckoutPage = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { cartItems, loadingCart, clearCart, cartTotal } = useCart();
    const { isAuthenticated, token, API_BASE_URL = 'http://localhost:5000' } = useAuth();

    const [shippingAddress, setShippingAddress] = useState({
        address: '123 Main St', city: 'Cairo', postalCode: '11511', country: 'Egypt', phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable', 'N/A');
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(Number(price));
    }, [language, t]);
    
    const subtotal = cartTotal;
    const discountAmount = appliedDiscount?.amount || 0;
    const finalTotal = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            showToast(t('checkoutPage.enterDiscountCodePlaceholder'), 'warning');
            return;
        }
        setApplyingDiscount(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/discounts/validate`, 
                { code: discountCode, totalAmount: subtotal }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAppliedDiscount({ code: data.code, amount: data.discountAmount });
            showToast(t('checkoutPage.discountAppliedSuccessfully'), 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('checkoutPage.invalidOrExpiredDiscount');
            showToast(errorMessage, 'error');
        } finally {
            setApplyingDiscount(false);
        }
    };

    const handlePlaceOrder = useCallback(async () => {
        if (!shippingAddress.phone.trim()) {
            showToast(t('checkoutPage.phoneRequired'), 'warning');
            return;
        }
        setPlacingOrder(true);
        if (!isAuthenticated) { showToast(t('checkoutPage.pleaseLoginToCheckout'), 'info'); navigate('/login'); setPlacingOrder(false); return; }
        if (!cartItems || cartItems.length === 0) { showToast(t('cartPage.cartEmptyCheckout'), 'warning'); setPlacingOrder(false); return; }

        const orderData = { 
            shippingAddress, 
            paymentMethod, 
            discount: appliedDiscount
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            setCreatedOrder(data);
            setOrderSuccess(true);
            await clearCart();
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('checkoutPage.orderPlacementError');
            showToast(errorMessage, 'error');
        } finally {
            setPlacingOrder(false);
        }
    }, [isAuthenticated, cartItems, shippingAddress, paymentMethod, appliedDiscount, navigate, t, showToast, token, API_BASE_URL, clearCart]);

    useEffect(() => {
        if (!loadingCart && cartItems.length === 0 && !orderSuccess) {
            showToast(t('cartPage.cartEmpty'), 'info');
            navigate('/shop');
        }
    }, [loadingCart, cartItems, orderSuccess, navigate, t, showToast]);

    if (loadingCart) return <div className="flex min-h-[80vh] w-full items-center justify-center bg-white dark:bg-black"><Loader2 size={48} className="animate-spin text-primary" /></div>;
    
    if (orderSuccess && createdOrder) {
        return (
            <section className="flex min-h-[80vh] flex-col items-center justify-center bg-zinc-100 dark:bg-black p-4">
                <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('checkoutPage.orderPlacedSuccessTitle')}</h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t('checkoutPage.orderPlacedSuccessMessage')}</p>
                    <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                        <span>{t('adminOrdersPage.orderID')}: </span>
                        <span className="font-mono">{createdOrder?._id}</span>
                    </div>
                    <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-dark">
                        {t('cartPage.continueShopping')}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        );
    }
    
    return (
        <section className="w-full bg-zinc-50 dark:bg-black py-12 sm:py-16">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">{t('checkoutPage.checkoutTitle')}</h1>
                </header>
                
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <form className="space-y-8">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><MapPin size={20} className="text-primary" />{t('checkoutPage.shippingAddress')}</h2>
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <input type="text" placeholder={t('checkoutPage.enterAddressPlaceholder')} value={shippingAddress.address} onChange={(e) => setShippingAddress(prev => ({...prev, address: e.target.value}))} className="w-full sm:col-span-2 rounded-lg border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                                    <input type="text" placeholder={t('checkoutPage.enterCityPlaceholder')} value={shippingAddress.city} onChange={(e) => setShippingAddress(prev => ({...prev, city: e.target.value}))} className="w-full rounded-lg border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                                    <input type="text" placeholder={t('checkoutPage.enterPostalCodePlaceholder')} value={shippingAddress.postalCode} onChange={(e) => setShippingAddress(prev => ({...prev, postalCode: e.target.value}))} className="w-full rounded-lg border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                                    <input type="tel" placeholder={t('checkoutPage.phonePlaceholder')} value={shippingAddress.phone} onChange={(e) => setShippingAddress(prev => ({...prev, phone: e.target.value}))} required className="w-full sm:col-span-2 rounded-lg border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><CreditCard size={20} className="text-primary" />{t('checkoutPage.paymentMethod')}</h2>
                                <div className="mt-4">
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full cursor-pointer rounded-lg border-zinc-200 bg-zinc-50 p-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                        <option value="Cash on Delivery">{t('checkoutPage.cashOnDelivery')}</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="lg:sticky lg:top-24 self-start rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Package size={20} className="text-primary" />{t('checkoutPage.orderSummary')}</h2>
                        <div className="mt-4 space-y-4">
                            <div className="max-h-60 space-y-4 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.uniqueId || `${item.product}-${item.selectedVariant}`} className="flex items-center gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                            {item.image ? <img src={`${API_BASE_URL}${item.image}`} alt={item.name.en} className="h-full w-full object-cover"/> : <ImageOff className="h-full w-full text-zinc-400 p-4"/>}
                                        </div>
                                        <div className="flex-1"><p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">{language === 'ar' ? item.name.ar : item.name.en}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{t('general.quantity')}: {item.quantity}</p></div>
                                        <p className="flex-shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5"><Tag size={16}/>{t('checkoutPage.discountCode')}</h3>
                                <div className="flex gap-2">
                                    <input type="text" placeholder={t('checkoutPage.enterDiscountCodePlaceholder')} value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} className="w-full rounded-lg border-zinc-200 bg-zinc-50 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" disabled={!!appliedDiscount} />
                                    <button onClick={appliedDiscount ? () => {setAppliedDiscount(null); setDiscountCode('');} : handleApplyDiscount} disabled={applyingDiscount} className={`rounded-lg px-5 text-sm font-semibold text-white transition-colors w-28 flex items-center justify-center ${appliedDiscount ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600'}`}>
                                        {applyingDiscount ? <Loader2 size={16} className="animate-spin" /> : (appliedDiscount ? t('checkoutPage.remove') : t('checkoutPage.apply'))}
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800 space-y-2">
                                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300"><span>{t('general.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                                {appliedDiscount && <div className="flex justify-between text-sm text-green-600"><span>{t('checkoutPage.discount')} ({appliedDiscount.code})</span><span>-{formatPrice(discountAmount)}</span></div>}
                                <div className="flex items-center justify-between text-base font-bold text-zinc-900 dark:text-white"><span>{t('general.total')}</span><span>{formatPrice(finalTotal)}</span></div>
                            </div>
                            <button onClick={handlePlaceOrder} disabled={placingOrder} className="mt-4 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary-dark disabled:opacity-70 flex items-center justify-center gap-2">
                                {placingOrder ? <Loader2 className="animate-spin" /> : <ShoppingCart size={18} />}
                                {placingOrder ? t('checkoutPage.placingOrder') : t('checkoutPage.placeOrder')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;