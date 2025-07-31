import React from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/ToastNotification';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, AlertCircle, ShoppingCart, Truck, CreditCard, User, PackageCheck,
    ArrowLeft, Printer, Tag, Hash, Calendar, ShieldCheck
} from 'lucide-react';

const MotionDiv = ({ children, delay = 0, className = "" }) => (
    <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

const DetailBlock = ({ icon: Icon, title, children, padding = "p-6" }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-md font-bold text-zinc-900 dark:text-white">{title}</h3>
        </div>
        <div className={`text-sm text-zinc-600 dark:text-zinc-300 ${padding}`}>
            {children}
        </div>
    </div>
);

const OrderItemCard = ({ item, language, serverUrl, formatPrice }) => {
    const getDisplayName = (nameObj) => language === 'ar' ? nameObj.ar : nameObj.en;
    
    return (
        <div className="flex items-center gap-4 p-4">
            <img
                src={item.image ? `${serverUrl}${item.image}` : 'https://via.placeholder.com/200'}
                alt={getDisplayName(item.name)}
                className="w-16 h-16 rounded-md object-cover bg-zinc-100 dark:bg-zinc-800 flex-shrink-0"
            />
            <div className="flex-grow">
                <Link to={`/shop/${item.product}`} className="font-bold text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors">
                    {getDisplayName(item.name)}
                </Link>
                {item.variantDetailsText &&
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.variantDetailsText}</p>
                }
            </div>
            <div className='text-right'>
                <p className="font-bold text-sm text-zinc-800 dark:text-white">
                    {formatPrice(item.quantity * item.price)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {item.quantity} x {formatPrice(item.price)}
                </p>
            </div>
        </div>
    );
};

const OrderActionButton = ({ onPrint, t }) => (
    <div>
        <button 
            onClick={onPrint} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all transform hover:-translate-y-0.5"
        >
            <Printer size={16} /> {t('orderDetails.printInvoice')}
        </button>
    </div>
);


const OrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const { token, API_BASE_URL } = useAuth();
    const SERVER_ROOT_URL = API_BASE_URL.replace('/api', '');
    const { t, language, isRTL } = useLanguage();
    const { showToast } = useToast();

    const [order, setOrder] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const formatPrice = React.useCallback((price) => {
        if (price === undefined || price === null) return t('general.priceNotAvailable', 'N/A');
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(Number(price));
    }, [language, t]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', options);
    };

    React.useEffect(() => {
        const fetchOrder = async () => {
            if (!token) { setLoading(false); return; }
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
                setOrder(data);
            } catch (err) {
                showToast(err.response?.data?.message || t('orderDetails.fetchError'), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token, API_BASE_URL, showToast, t]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>;
    if (!order) return <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black"><AlertCircle className="w-16 h-16 text-red-500" /></div>;

    const { shippingAddress, paymentMethod, orderItems, totalPrice, itemsPrice, discount, isPaid, isDelivered, user: orderUser, createdAt } = order;

    const StatusInfo = () => (
        <div className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-3 ${
            isDelivered ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : isPaid ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        }`}>
            <PackageCheck size={20} />
            <span>{isDelivered ? t('orderDetails.statusDelivered') : isPaid ? t('orderDetails.statusShipped') : t('orderDetails.statusPlaced')}</span>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="min-h-screen bg-zinc-50 dark:bg-black">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <header>
                        <MotionDiv delay={0.1}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <Link to="/profile" className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary-light transition-colors">
                                    <ArrowLeft style={{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }} size={18} />
                                    <span>{t('orderDetails.backToOrders')}</span>
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    <Calendar size={16} />
                                    <span>{t('orderDetails.orderedOn', { date: formatDateTime(createdAt) })}</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('orderDetails.title')}</h1>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-mono mt-1 flex items-center gap-2 text-sm"><Hash size={14}/>{order._id}</p>
                                    </div>
                                    <StatusInfo />
                                </div>
                            </div>
                        </MotionDiv>
                    </header>
                    
                    <main className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <MotionDiv delay={0.2}>
                                    <DetailBlock icon={ShoppingCart} title={`${t('orderDetails.orderItems')} (${orderItems.length})`} padding="p-0">
                                        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {orderItems.map((item, index) => (
                                                <OrderItemCard key={index} item={item} language={language} serverUrl={SERVER_ROOT_URL} formatPrice={formatPrice} />
                                            ))}
                                        </div>
                                    </DetailBlock>
                                </MotionDiv>
                            </div>

                            <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 self-start">
                                <MotionDiv delay={0.3}>
                                    <DetailBlock icon={CreditCard} title={t('orderDetails.paymentDetails')}>
                                        <div className="p-5 space-y-3">
                                            <div className="flex justify-between">
                                                <span>{t('general.subtotal')}</span>
                                                <span className='font-medium text-zinc-800 dark:text-zinc-100'>{formatPrice(itemsPrice)}</span>
                                            </div>
                                            {discount && discount.amount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span className='flex items-center gap-1.5'><Tag size={14}/>{t('checkoutPage.discount')} ({discount.code})</span>
                                                    <span>-{formatPrice(discount.amount)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-dashed border-zinc-300 dark:border-zinc-600 my-2"></div>
                                            <div className="flex justify-between items-center text-lg font-bold text-zinc-900 dark:text-white">
                                                <span>{t('orderDetails.total')}:</span>
                                                <span className="text-2xl text-primary">{formatPrice(totalPrice)}</span>
                                            </div>
                                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
                                                <p><strong className="font-semibold text-zinc-800 dark:text-zinc-100">{t('orderDetails.paymentMethod')}:</strong> {paymentMethod}</p>
                                            </div>
                                        </div>
                                    </DetailBlock>
                                </MotionDiv>
                                
                                <MotionDiv delay={0.4}>
                                    <DetailBlock icon={Truck} title={t('orderDetails.shippingAddress')}>
                                        <div className="p-5">
                                            <p className="font-semibold text-zinc-800 dark:text-white">{orderUser.name}</p>
                                            <address className="not-italic space-y-1 mt-2">
                                                <p>{shippingAddress.address}</p>
                                                <p>{shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                                            </address>
                                        </div>
                                    </DetailBlock>
                                </MotionDiv>
                                
                                <MotionDiv delay={0.5}>
                                    <OrderActionButton 
                                        onPrint={() => window.print()} 
                                        t={t}
                                    />
                                </MotionDiv>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsPage;