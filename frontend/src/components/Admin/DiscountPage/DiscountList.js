import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Loader2, Info, X } from 'lucide-react';
import EditDiscountModal from './EditDiscountModal';
import AddDiscountPage from './AddDiscountPage';
import { useLanguage } from '../../LanguageContext';

const DiscountList = () => {
    const { t, language } = useLanguage();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const SERVER_URL = 'http://localhost:5000';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
    };

    const fetchDiscounts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/discounts`);
            setDiscounts(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch discounts:", err);
            setError(t('general.errorFetchingData'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleDelete = async (discountId, discountCode) => {
        if (window.confirm(t('discountAdmin.confirmDelete', { discountCode }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/discounts/${discountId}`);
                setDiscounts(prev => prev.filter(d => d._id !== discountId));
                alert(t('discountAdmin.deleteSuccess'));
            } catch (err) {
                console.error("Error deleting discount:", err);
                alert(`${t('discountAdmin.errorDeletingDiscount')} ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleActionSuccess = () => {
        fetchDiscounts();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingDiscount(null);
    };

    if (loading) {
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.error')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchDiscounts} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('discountAdmin.discountListTitle')}
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500"
                >
                    <Plus size={16} />
                    {t('discountAdmin.addDiscountButton')}
                </button>
            </header>

            {discounts.length === 0 ? (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('discountAdmin.noDiscounts')}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        {t('discountAdmin.addFirstDiscount')}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('discountAdmin.codeTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('discountAdmin.typeTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('discountAdmin.valueTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('discountAdmin.minOrderTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('discountAdmin.usageLimitTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('discountAdmin.validityTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('discountAdmin.activeTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('discountAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {discounts.map(d => (
                                <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">{d.code}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">{d.percentage ? t('discountAdmin.percentageType') : t('discountAdmin.fixedAmountType')}</td>
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800 dark:text-white">{d.percentage ? `${d.percentage}%` : `${d.fixedAmount?.toFixed(2)} ${t('shopPage.currencySymbol', { ns: 'common' })}`}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400">{d.minOrderAmount ? `${d.minOrderAmount.toFixed(2)} ${t('shopPage.currencySymbol', { ns: 'common' })}` : 'N/A'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 text-center">{d.usageLimit ? `${d.usageCount || 0} / ${d.usageLimit}` : t('discountAdmin.noLimit')}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 text-xs">{formatDate(d.startDate)} - {formatDate(d.endDate)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                                            {d.isActive ? t('general.active') : t('general.inactive')}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="inline-flex items-center rounded-md -space-x-px bg-gray-100 dark:bg-zinc-800 text-xs">
                                            <button onClick={() => { setEditingDiscount(d); setShowEditModal(true); }} className="inline-block rounded-l-md p-2 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 focus:relative">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(d._id, d.code)} className="inline-block rounded-r-md p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 focus:relative">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showEditModal && editingDiscount && (
                <EditDiscountModal discount={editingDiscount} onClose={() => setShowEditModal(false)} onDiscountUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('discountAdmin.addDiscountTitle')}</h3>
                        <AddDiscountPage onDiscountAdded={handleActionSuccess} serverUrl={SERVER_URL} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountList;