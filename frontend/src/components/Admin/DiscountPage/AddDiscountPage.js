import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';
import { Loader2, CheckCircle, XCircle, Plus } from 'lucide-react';

const AddDiscountPage = ({ onDiscountAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t } = useLanguage();
    const [discount, setDiscount] = useState({
        code: "", percentage: "", fixedAmount: "",
        minOrderAmount: "", maxDiscountAmount: "",
        startDate: "", endDate: "", isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [submitMessageType, setSubmitMessageType] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newDiscount = { ...discount, [name]: type === 'checkbox' ? checked : value };
        if (name === 'percentage' && value) {
            newDiscount.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscount.percentage = '';
        }
        setDiscount(newDiscount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");
        setSubmitMessageType("");

        if (!discount.code.trim()) {
            setSubmitMessage(t('discountAdmin.codeRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (!discount.percentage && !discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (discount.percentage && discount.fixedAmount) {
            setSubmitMessage(t('discountAdmin.amountExclusive'));
            setSubmitMessageType('error');
            return;
        }
        if (!discount.startDate || !discount.endDate) {
            setSubmitMessage(t('discountAdmin.datesRequired'));
            setSubmitMessageType('error');
            return;
        }
        if (new Date(discount.startDate) > new Date(discount.endDate)) {
            setSubmitMessage(t('discountAdmin.endDateError'));
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...discount };
            payload.percentage = payload.percentage === "" ? undefined : parseFloat(payload.percentage);
            payload.fixedAmount = payload.fixedAmount === "" ? undefined : parseFloat(payload.fixedAmount);
            payload.minOrderAmount = payload.minOrderAmount === "" ? undefined : parseFloat(payload.minOrderAmount);
            payload.maxDiscountAmount = payload.maxDiscountAmount === "" ? undefined : parseFloat(payload.maxDiscountAmount);

            await axios.post(`${serverUrl}/api/discounts`, payload);
            setSubmitMessage(t('discountAdmin.addSuccess'));
            setSubmitMessageType('success');
            
            setDiscount({
                code: "", percentage: "", fixedAmount: "", minOrderAmount: "",
                maxDiscountAmount: "", startDate: "", endDate: "", isActive: true,
            });
            if (onDiscountAdded) onDiscountAdded();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setSubmitMessage(`${t('discountAdmin.addError')} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5";
    const checkboxLabelClasses = "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300 cursor-pointer";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {submitMessage && (
                <div className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                    submitMessageType === 'success' 
                    ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" 
                    : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                }`}>
                    {submitMessageType === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span>{submitMessage}</span>
                </div>
            )}
            
            <div>
                <label htmlFor="code" className={labelClasses}>{t('discountAdmin.codeLabel')}</label>
                <input type="text" id="code" name="code" value={discount.code} onChange={handleChange} className={inputClasses} placeholder={t('discountAdmin.codePlaceholder')} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <div>
                    <label htmlFor="percentage" className={labelClasses}>{t('discountAdmin.percentageLabel')}</label>
                    <input type="number" id="percentage" name="percentage" value={discount.percentage} onChange={handleChange} className={inputClasses} min="0" max="100" step="0.01" disabled={!!discount.fixedAmount} placeholder="e.g., 20" />
                </div>
                 <div className="relative">
                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 px-2">{t('general.or').toUpperCase()}</p>
                    <hr className="border-gray-200 dark:border-zinc-700" />
                 </div>
                 <div>
                    <label htmlFor="fixedAmount" className={labelClasses}>{t('discountAdmin.fixedAmountLabel')}</label>
                    <input type="number" id="fixedAmount" name="fixedAmount" value={discount.fixedAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" disabled={!!discount.percentage} placeholder={t('discountAdmin.fixedAmountPlaceholder')} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="minOrderAmount" className={labelClasses}>{t('discountAdmin.minOrderAmountLabel')}</label>
                    <input type="number" id="minOrderAmount" name="minOrderAmount" value={discount.minOrderAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.minOrderAmountPlaceholder')} />
                </div>
                <div>
                    <label htmlFor="maxDiscountAmount" className={labelClasses}>{t('discountAdmin.maxDiscountAmountLabel')}</label>
                    <input type="number" id="maxDiscountAmount" name="maxDiscountAmount" value={discount.maxDiscountAmount} onChange={handleChange} className={inputClasses} min="0" step="0.01" placeholder={t('discountAdmin.maxDiscountAmountPlaceholder')} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className={labelClasses}>{t('discountAdmin.startDateLabel')}</label>
                    <input type="date" id="startDate" name="startDate" value={discount.startDate} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="endDate" className={labelClasses}>{t('discountAdmin.endDateLabel')}</label>
                    <input type="date" id="endDate" name="endDate" value={discount.endDate} onChange={handleChange} className={inputClasses} required />
                </div>
            </div>

            <div>
                <label className={checkboxLabelClasses}>
                    <input type="checkbox" id="isActive" name="isActive" checked={discount.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span>{t('discountAdmin.isActive')}</span>
                </label>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    <span>{isSubmitting ? t('discountAdmin.submittingButton') : t('discountAdmin.addButton')}</span>
                </button>
            </div>
        </form>
    );
};

export default AddDiscountPage;