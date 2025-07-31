import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle, ShoppingCart, Eye, Info } from 'lucide-react';
import { useToast } from '../../components/ToastNotification';

const AdminOrdersPage = () => {
    const { t, language } = useLanguage();
    const { currentUser, token, API_BASE_URL, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState(null);
    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/orders`, config);
            setOrders(response.data);
            setError(null);
        } catch (err) {
            setError(t('adminOrdersPage.errorFetchingOrdersToast'));
           showToast(t('adminOrdersPage.errorFetchingOrdersToast'), 'error');
        } finally {
            setLoadingOrders(false);
        }
    }, [token, API_BASE_URL, t, showToast]);

    useEffect(() => {
        if (loadingAuth) return;
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
           showToast(t('general.accessDenied'), 'error');
            return;
        }
        if (token) {
            fetchOrders();
        }
    }, [currentUser, token, navigate, loadingAuth, fetchOrders, showToast, t]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',currency: t('general.currencyCode')
        }).format(Number(price || 0));
    };

    if (loadingAuth || loadingOrders) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.errorOccurred')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchOrders} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShoppingCart size={26} className="text-indigo-500" />
                    {t('adminOrdersPage.allOrders')}
                </h1>
            </header>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('adminOrdersPage.noOrdersFound')}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        {t('adminOrdersPage.checkLater')}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">ID</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('adminOrdersPage.user')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('adminOrdersPage.date')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('adminOrdersPage.total')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('adminOrdersPage.paid')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('adminOrdersPage.delivered')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('adminOrdersPage.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500 dark:text-zinc-500" title={order._id}>
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800 dark:text-white">
                                        {order.user?.name || t('general.notAvailable')}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">
                                        {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-green-600">
                                        {formatPrice(order.totalPrice)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        {order.isPaid ?
                                            <CheckCircle className="text-green-500 inline-block h-5 w-5" /> :
                                            <XCircle className="text-red-500 inline-block h-5 w-5" />
                                        }
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        {order.isDelivered ?
                                            <CheckCircle className="text-green-500 inline-block h-5 w-5" /> :
                                            <XCircle className="text-red-500 inline-block h-5 w-5" />
                                        }
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <Link to={`/admin/orders/${order._id}`} className="inline-block rounded-md p-2 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 focus:relative">
                                            <Eye size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;