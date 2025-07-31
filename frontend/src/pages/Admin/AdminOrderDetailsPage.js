import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle, Truck, User, Package, Calendar, ChevronLeft, Info, ReceiptText, Phone } from 'lucide-react';
import { useToast } from '../../components/ToastNotification';

const AdminOrderDetailsPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const { showToast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    
    const fetchOrderDetails = useCallback(async () => { 
        setLoading(true); 
        setError(null); 
        try { 
            const config = { headers: { Authorization: `Bearer ${token}` } }; 
            const response = await axios.get(`${API_BASE_URL}/api/orders/${id}`, config); 
            setOrder(response.data); 
        } catch (err) { 
            const errorMessage = t('adminOrdersPage.errorFetchingOrderDetails'); 
            setError(errorMessage); 
            showToast(errorMessage, 'error'); 
        } finally { 
            setLoading(false); 
        } 
    }, [id, token, API_BASE_URL, t, showToast]);
    
    useEffect(() => { 
        if (loadingAuth) return; 
        if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') { 
            navigate('/'); 
            showToast(t('general.accessDenied'), 'error'); 
            return; 
        } 
        if (token && API_BASE_URL && id) { 
            fetchOrderDetails(); 
        } 
    }, [id, isAuthenticated, currentUser, token, API_BASE_URL, navigate, t, loadingAuth, fetchOrderDetails, showToast]);
    
    const handleUpdateStatus = async (type) => { 
        setUpdatingStatus(true); 
        try { 
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }; 
            let response; 
            let successMessage = ''; 
            if (type === 'pay') { 
                const paymentResult = { id: `mock_id_${Date.now()}`, status: 'COMPLETED', update_time: new Date().toISOString(), email_address: order.user?.email }; 
                response = await axios.put(`${API_BASE_URL}/api/orders/${id}/pay`, paymentResult, config); 
                successMessage = t('adminOrdersPage.paidSuccess'); 
            } else if (type === 'deliver') { 
                response = await axios.put(`${API_BASE_URL}/api/orders/${id}/deliver`, {}, config); 
                successMessage = t('adminOrdersPage.deliveredSuccess'); 
            } 
            setOrder(response.data); 
            showToast(successMessage, 'success'); 
        } catch (err) { 
            const errorMessageString = err.response?.data?.message || t('general.errorOccurred'); 
            setError(errorMessageString); 
            showToast(errorMessageString, 'error'); 
        } finally { 
            setUpdatingStatus(false); 
        } 
    };
    
    const formatPrice = (price) => { 
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: t('general.currencyCode') }).format(Number(price || 0)); 
    };
    
    const formatDateTime = (dateString) => { 
        if (!dateString) return 'N/A'; 
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options); 
    };
    
    const getDisplayName = useCallback((nameObject) => {
        if (!nameObject) return '';
        return language === 'ar' ? nameObject.ar : nameObject.en;
    }, [language]);


    if (loading || loadingAuth) { return ( <div className="flex min-h-[80vh] w-full items-center justify-center"> <Loader2 size={48} className="animate-spin text-primary" /> </div> ); }
    if (error && !order) { return ( <div className="flex min-h-[80vh] w-full items-center justify-center p-4"> <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800"> <Info size={48} className="mx-auto mb-5 text-red-500" /> <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t('adminOrdersPage.orderNotFound')}</h2> <p className="text-base text-red-600 dark:text-red-400">{error}</p> <Link to="/admin/orders" className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-light"> <ChevronLeft size={16} />{t('general.backToOrders')} </Link> </div> </div> ); }
    if (!order) return null;

    const DetailCard = ({ title, icon, children, className = '' }) => ( <div className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 ${className}`}> <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-3"> {React.cloneElement(icon, { className: "text-primary", size: 22 })} {title} </h2> <div className="space-y-4">{children}</div> </div> );
    const StatusBadge = ({ isTrue, trueText, falseText, icon: Icon }) => ( <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${isTrue ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}> {isTrue ? <CheckCircle size={16} /> : <Icon size={16} />} <span>{isTrue ? trueText : falseText}</span> </div> );
    
    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <ReceiptText size={30} />{t('adminOrdersPage.orderDetails')}
                    </h1>
                    <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-500">#{order._id}</p>
                </div>
                <Link to="/admin/orders" className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700">
                    <ChevronLeft size={16} />{t('general.backToOrders')}
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-8">
                    <DetailCard title={t('adminOrdersPage.orderItems')} icon={<Package />}>
                        {order.orderItems.map((item, index) => (
                            <div key={`${item.product}-${index}`} className="flex items-start border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-b-0 last:pb-0">
                                <img src={item.image ? `${API_BASE_URL}${item.image}` : `https://via.placeholder.com/80?text=N/A`} alt={getDisplayName(item.name)} className="w-16 h-16 object-cover rounded-lg mr-4 border border-zinc-200 dark:border-zinc-700" />
                                <div className="flex-1">
                                    <Link to={`/shop/${item.product}`} className="font-semibold text-zinc-800 dark:text-white hover:text-primary dark:hover:text-primary-light">{getDisplayName(item.name)}</Link>
                                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                        {item.dynamicVariantDetails && item.dynamicVariantDetails.length > 0 ? (
                                            item.dynamicVariantDetails.map((detail, idx) => (
                                                <span key={idx} className="after:content-['|'] after:mx-1 last:after:content-['']">
                                                    <strong>{getDisplayName(detail.variationName)}:</strong> {getDisplayName(detail.optionName)}
                                                </span>
                                            ))
                                        ) : (
                                            item.variantDetailsText && <span>{item.variantDetailsText}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                                </div>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-white">{formatPrice(item.quantity * item.price)}</p>
                            </div>
                        ))}
                    </DetailCard>
                    <DetailCard title={t('adminOrdersPage.customerInfo')} icon={<User />}>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-white">{order.user?.name || t('general.notAvailable')}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{order.user?.email || t('general.notAvailable')}</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                           <Phone size={14} />
                           <span>{order.shippingAddress.phone || t('general.notAvailable')}</span>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-300 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                            <strong className="block text-zinc-800 dark:text-white mb-1">{t('adminOrdersPage.shippingAddress')}</strong>
                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </div>
                    </DetailCard>
                </div>

                <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-24">
                    <DetailCard title={t('adminOrdersPage.orderStatus')} icon={<Truck />}>
                        <StatusBadge isTrue={order.isPaid} trueText={t('adminOrdersPage.paid')} falseText={t('adminOrdersPage.notPaid')} icon={XCircle} />
                        {!order.isPaid && (
                             <button onClick={() => handleUpdateStatus('pay')} disabled={updatingStatus} className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-light disabled:opacity-60">
                                {updatingStatus ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                {t('adminOrdersPage.markAsPaid')}
                            </button>
                        )}
                        <StatusBadge isTrue={order.isDelivered} trueText={t('adminOrdersPage.delivered')} falseText={t('adminOrdersPage.notDelivered')} icon={Truck} />
                        {!order.isDelivered && (
                            <button onClick={() => handleUpdateStatus('deliver')} disabled={updatingStatus} className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary dark:bg-white dark:text-black dark:hover:bg-primary-light disabled:opacity-60">
                                {updatingStatus ? <Loader2 className="animate-spin" size={16} /> : <Truck size={16} />}
                                {t('adminOrdersPage.markAsDelivered')}
                            </button>
                        )}
                    </DetailCard>

                    <DetailCard title={t('adminOrdersPage.orderSummary')} icon={<ReceiptText />}>
                        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                            <div className="flex justify-between"><span>{t('adminOrdersPage.itemsPrice')}</span><span className="font-medium text-zinc-800 dark:text-white">{formatPrice(order.itemsPrice)}</span></div>
                            <div className="flex justify-between"><span>{t('adminOrdersPage.shippingPrice')}</span><span className="font-medium text-zinc-800 dark:text-white">{formatPrice(order.shippingPrice)}</span></div>
                            <div className="flex justify-between"><span>{t('adminOrdersPage.taxPrice')}</span><span className="font-medium text-zinc-800 dark:text-white">{formatPrice(order.taxPrice)}</span></div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold border-t pt-3 mt-3 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                            <span>{t('adminOrdersPage.totalPrice')}</span>
                            <span className='text-primary'>{formatPrice(order.totalPrice)}</span>
                        </div>
                    </DetailCard>

                    <DetailCard title={t('adminOrdersPage.importantDates')} icon={<Calendar />}>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300"><strong>{t('adminOrdersPage.orderedAt')}:</strong> {formatDateTime(order.createdAt)}</p>
                        {order.paidAt && <p className="text-sm text-zinc-600 dark:text-zinc-300"><strong>{t('adminOrdersPage.paidAt')}:</strong> {formatDateTime(order.paidAt)}</p>}
                        {order.deliveredAt && <p className="text-sm text-zinc-600 dark:text-zinc-300"><strong>{t('adminOrdersPage.deliveredAt')}:</strong> {formatDateTime(order.deliveredAt)}</p>}
                    </DetailCard>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsPage;