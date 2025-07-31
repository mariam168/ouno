import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Image as ImageIcon, Loader2, CheckCircle, List, XCircle } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

const CategoryForm = ({ categoryToEdit, onFormSubmit, onCancel, serverUrl }) => {
    const { t } = useLanguage();
    const [category, setCategory] = useState({ name: { en: '', ar: '' }, description: { en: '', ar: '' } });
    const [subCategories, setSubCategories] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);
    const [subCategoryFiles, setSubCategoryFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const API_URL = `${serverUrl}/api/categories`;

    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                name: { en: categoryToEdit.name?.en || '', ar: categoryToEdit.name?.ar || '' },
                description: { en: categoryToEdit.description?.en || '', ar: categoryToEdit.description?.ar || '' },
            });
            setSubCategories(categoryToEdit.subCategories?.map((sub) => ({
                ...sub,
                tempId: sub._id || `new_${Date.now() + Math.random()}`,
                preview: sub.imageUrl ? `${serverUrl}${sub.imageUrl}` : '',
            })) || []);
            setMainImagePreview(categoryToEdit.imageUrl ? `${serverUrl}${categoryToEdit.imageUrl}` : '');
        } else {
            resetForm();
        }
    }, [categoryToEdit, serverUrl]);

    const resetForm = () => {
        setCategory({ name: { en: '', ar: '' }, description: { en: '', ar: '' } });
        setSubCategories([]);
        setMainImageFile(null);
        setMainImagePreview('');
        setClearMainImage(false);
        setSubCategoryFiles({});
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        if (!category.name.en.trim() || !category.name.ar.trim()) {
            setMessage({ text: t('categoryForm.validationCategoryNameRequired'), type: 'error' });
            setIsSubmitting(false);
            return;
        }

        for (const sub of subCategories) {
            if (!sub.name.en.trim() || !sub.name.ar.trim()) {
                setMessage({ text: t('categoryForm.validationSubcategoryNameRequired'), type: 'error' });
                setIsSubmitting(false);
                return;
            }
        }

        const formData = new FormData();
        formData.append('name_en', category.name.en);
        formData.append('name_ar', category.name.ar);
        formData.append('description_en', category.description.en);
        formData.append('description_ar', category.description.ar);

        if (categoryToEdit) {
            formData.append('clearMainImage', String(clearMainImage));
        }
        if (mainImageFile) {
            formData.append('mainImage', mainImageFile);
        }

        const subCategoryPayload = subCategories.map((sub) => {
            const subData = {
                name: sub.name,
                description: sub.description,
                imageUrl: sub._id && !subCategoryFiles[sub.tempId] ? sub.imageUrl : undefined,
                hasNewImage: !!subCategoryFiles[sub.tempId]
            };
            if (sub._id) {
                subData._id = sub._id;
            }
            return subData;
        });
        formData.append('subCategories', JSON.stringify(subCategoryPayload));

        Object.keys(subCategoryFiles).forEach((tempId) => {
            formData.append(`subCategoryImages`, subCategoryFiles[tempId], tempId);
        });

        try {
            const url = categoryToEdit ? `${API_URL}/${categoryToEdit._id}` : API_URL;
            const method = categoryToEdit ? 'put' : 'post';
            const headers = { 'Content-Type': 'multipart/form-data', 'x-admin-request': 'true' };
            await axios[method](url, formData, { headers });
            setMessage({ text: t('categoryForm.successMessage', { action: categoryToEdit ? t('categoryForm.updated') : t('categoryForm.created') }), type: 'success' });
            setTimeout(() => onFormSubmit(), 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t('categoryForm.errorMessage');
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMainFieldChange = (e) => {
        const { name, value } = e.target;
        const [field, lang] = name.split('_');
        setCategory((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
            setClearMainImage(false);
        }
    };

    const handleRemoveMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview('');
        setClearMainImage(true);
    };

    const handleAddSubCategory = () => {
        const newSub = {
            tempId: `new_${Date.now() + Math.random()}`,
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            preview: '',
            hasNewImage: false,
        };
        setSubCategories((prev) => [...prev, newSub]);
    };

    const handleSubCategoryChange = (tempId, field, lang, value) => {
        setSubCategories((prev) => prev.map((sub) => sub.tempId === tempId ? { ...sub, [field]: { ...sub[field], [lang]: value } } : sub));
    };

    const handleSubCategoryImageChange = (tempId, file) => {
        if (file) {
            setSubCategoryFiles((prev) => ({ ...prev, [tempId]: file }));
            setSubCategories((prev) => prev.map((sub) => sub.tempId === tempId ? { ...sub, hasNewImage: true, preview: URL.createObjectURL(file) } : sub));
        }
    };

    const handleRemoveSubCategory = (tempId) => {
        setSubCategories((prev) => prev.filter((sub) => sub.tempId !== tempId));
        setSubCategoryFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[tempId];
            return newFiles;
        });
    };

    const inputClasses = "w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5";
    const fileInputClasses = "w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20";
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
                <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {categoryToEdit ? t('categoryForm.editCategoryTitle') : t('categoryForm.addCategoryTitle')}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </header>

                {message.text && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('categoryForm.mainCategoryDetails')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name_en" className={labelClasses}>{t('categoryForm.categoryNameEnLabel')} <span className="text-red-500">*</span></label>
                                <input type="text" id="name_en" name="name_en" value={category.name.en} onChange={handleMainFieldChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="name_ar" className={labelClasses}>{t('categoryForm.categoryNameArLabel')} <span className="text-red-500">*</span></label>
                                <input type="text" id="name_ar" name="name_ar" value={category.name.ar} onChange={handleMainFieldChange} className={`${inputClasses} text-right`} required dir="rtl" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description_en" className={labelClasses}>{t('categoryForm.descriptionEnLabel')}</label>
                                <textarea id="description_en" name="description_en" value={category.description.en} onChange={handleMainFieldChange} rows="2" className={inputClasses}></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description_ar" className={labelClasses}>{t('categoryForm.descriptionArLabel')}</label>
                                <textarea id="description_ar" name="description_ar" value={category.description.ar} onChange={handleMainFieldChange} rows="2" className={`${inputClasses} text-right`} dir="rtl"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>{t('categoryForm.categoryImageLabel')}</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex-shrink-0 h-20 w-20 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                                        {mainImagePreview ? <img src={mainImagePreview} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400 dark:text-zinc-500" />}
                                    </div>
                                    <input type="file" onChange={handleMainImageChange} className={fileInputClasses} accept="image/*" />
                                    {mainImagePreview && (
                                        <button type="button" onClick={handleRemoveMainImage} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><List size={20} className="text-indigo-500" />{t('categoryForm.subCategoriesTitle')}</h4>
                            <button type="button" onClick={handleAddSubCategory} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700">
                                <Plus size={14} /> {t('categoryForm.addSubCategoryButton')}
                            </button>
                        </div>
                        <div className="space-y-4">
                            {subCategories.length === 0 && <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4">{t('categoryForm.noSubcategoriesMessage')}</p>}
                            {subCategories.map((sub, index) => (
                                <div key={sub.tempId} className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-grow space-y-3">
                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase">{t('categoryForm.subCategory')} #{index + 1}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input type="text" placeholder={t('categoryForm.subCategoryNameEnPlaceholder')} value={sub.name?.en || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'name', 'en', e.target.value)} className={inputClasses} required />
                                                <input type="text" placeholder={t('categoryForm.subCategoryNameArPlaceholder')} value={sub.name?.ar || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'name', 'ar', e.target.value)} className={`${inputClasses} text-right`} required dir="rtl" />
                                            </div>
                                            <textarea placeholder={t('categoryForm.subCategoryDescriptionEnPlaceholder')} value={sub.description?.en || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'description', 'en', e.target.value)} className={`${inputClasses} text-xs`} rows="2"></textarea>
                                            <textarea placeholder={t('categoryForm.subCategoryDescriptionArPlaceholder')} value={sub.description?.ar || ''} onChange={(e) => handleSubCategoryChange(sub.tempId, 'description', 'ar', e.target.value)} className={`${inputClasses} text-right text-xs`} rows="2" dir="rtl"></textarea>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                            <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-zinc-700 flex items-center justify-center border border-gray-200 dark:border-zinc-600">
                                                {sub.preview ? <img src={sub.preview} alt="Sub Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
                                            </div>
                                            <label htmlFor={`sub-img-${sub.tempId}`} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer">
                                                {t('categoryForm.changeImage')}
                                                <input type="file" accept="image/*" id={`sub-img-${sub.tempId}`} className="sr-only" onChange={(e) => handleSubCategoryImageChange(sub.tempId, e.target.files[0])} />
                                            </label>
                                            <button type="button" onClick={() => handleRemoveSubCategory(sub.tempId)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50">
                            {t('general.cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            <span>{isSubmitting ? t('general.saving') : (categoryToEdit ? t('general.saveChanges') : t('general.addCategory'))}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;