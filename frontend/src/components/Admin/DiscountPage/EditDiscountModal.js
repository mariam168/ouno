import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';

const EditDiscountModal = ({ discount, onClose, onDiscountUpdated, serverUrl }) => {
    const { t } = useLanguage();
    const [editedDiscount, setEditedDiscount] = useState({
        code: '', percentage: '', fixedAmount: '',
        minOrderAmount: '', maxDiscountAmount: '',
        startDate: '', endDate: '', isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitMessageType, setSubmitMessageType] = useState('');

    useEffect(() => {
        if (discount) {
            setEditedDiscount({
                code: discount.code || '',
                percentage: discount.percentage ?? '',
                fixedAmount: discount.fixedAmount ?? '',
                minOrderAmount: discount.minOrderAmount ?? '',
                maxDiscountAmount: discount.maxDiscountAmount ?? '',
                startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
                endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
                isActive: discount.isActive,
            });
            setSubmitMessage('');
            setSubmitMessageType('');
        }
    }, [discount]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newDiscount = { ...editedDiscount, [name]: type === 'checkbox' ? checked : value };
        if (name === 'percentage' && value) {
            newDiscount.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscount.percentage = '';
        }
        setEditedDiscount(newDiscount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        setSubmitMessageType('');

        if (!editedDiscount.code.trim()) {
            setSubmitMessage(t('discountAdmin.codeRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (!editedDiscount.percentage && !editedDiscount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (editedDiscount.percentage && editedDiscount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountExclusive'));
            setSubmitMessageType('error');
            return;
        }
        if (!editedDiscount.startDate || !editedDiscount.endDate) {
            setSubmitMessage(t('discountAdmin.datesRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (new Date(editedDiscount.startDate) > new Date(editedDiscount.endDate)) {
            setSubmitMessage(t('discountAdmin.endDateError'));
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...editedDiscount };
            payload.percentage = payload.percentage === "" ? undefined : parseFloat(payload.percentage);
            payload.fixedAmount = payload.fixedAmount === "" ? undefined : parseFloat(payload.fixedAmount);
            payload.minOrderAmount = payload.minOrderAmount === "" ? undefined : parseFloat(payload.minOrderAmount);
            payload.maxDiscountAmount = payload.maxDiscountAmount === "" ? undefined : parseFloat(payload.maxDiscountAmount);

            await axios.put(`${serverUrl}/api/discounts/${discount._id}`, payload);
            setSubmitMessage(t('discountAdmin.updateSuccess'));
            setSubmitMessageType('success');
            setTimeout(() => {
                onDiscountUpdated();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Error updating discount:", err.response?.data);
            const errorMessage = err.response?.data?.message || err.message;
            setSubmitMessage(`${t('discountAdmin.updateError')} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!discount) return null;

    const inputClasses = "w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5";
    const checkboxLabelClasses = "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300 cursor-pointer";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {t('discountAdmin.editDiscountTitle')}
                </h2>

                {submitMessage && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 text-sm font-medium ${
                        submitMessageType === 'success' 
                        ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" 
                        : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}>
                        {submitMessageType === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        <span>{submitMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="edit-code" className={labelClasses}>{t('discountAdmin.codeLabel')}</label>
                        <input type="text" id="edit-code" name="code" value={editedDiscount.code} onChange={handleChange} className={inputClasses} placeholder={t('discountAdmin.codePlaceholder')} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <label htmlFor="edit-percentage" className={labelClasses}>{t('discountAdmin.percentageLabel')}</label>
                            <input type="number" id="edit-percentage" name="percentage" value={editedDiscount.percentage} onChange={handleChange} className={inputClasses} min="0" max="100" step="0.01" disabled={!!editedDiscount.fixedAmount} placeholder="e.g., 20" />
                        </div>
                        <div className="relative">
                            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 px-2">{t('general.or').toUpperCase()}</p>
                            <hr className="border-gray-200 dark:border-zinc-700" />
                        </div>
                        <div>
                            <label htmlFor="edit-fixedAmount" className={labelClasses}>{t('discountAdmin.fixedAmountLabel')}</label>
                            <input type="number" id="edit-fixedAmount" name="fixedAmount" value={editedDiscount.fixedAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" disabled={!!editedDiscount.percentage} placeholder={t('discountAdmin.fixedAmountPlaceholder')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-minOrderAmount" className={labelClasses}>{t('discountAdmin.minOrderAmountLabel')}</label>
                            <input type="number" id="edit-minOrderAmount" name="minOrderAmount" value={editedDiscount.minOrderAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.minOrderAmountPlaceholder')} />
                        </div>
                        <div>
                            <label htmlFor="edit-maxDiscountAmount" className={labelClasses}>{t('discountAdmin.maxDiscountAmountLabel')}</label>
                            <input type="number" id="edit-maxDiscountAmount" name="maxDiscountAmount" value={editedDiscount.maxDiscountAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.maxDiscountAmountPlaceholder')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-startDate" className={labelClasses}>{t('discountAdmin.startDateLabel')}</label>
                            <input type="date" id="edit-startDate" name="startDate" value={editedDiscount.startDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="edit-endDate" className={labelClasses}>{t('discountAdmin.endDateLabel')}</label>
                            <input type="date" id="edit-endDate" name="endDate" value={editedDiscount.endDate} onChange={handleChange} className={inputClasses} required />
                        </div>
                    </div>

                    <div>
                        <label className={checkboxLabelClasses}>
                            <input type="checkbox" id="edit-isActive" name="isActive" checked={editedDiscount.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span>{t('discountAdmin.isActive')}</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50">
                            {t('general.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            <span>{isSubmitting ? t('discountAdmin.updatingButton') : t('discountAdmin.updateButton')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiscountModal;