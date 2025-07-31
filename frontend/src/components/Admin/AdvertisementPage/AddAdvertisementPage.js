import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLanguage } from '../../LanguageContext';
import { Plus, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AddAdvertisementPage = ({ onAdvertisementAdded, serverUrl = 'http://localhost:5000' }) => {
    const { t, language } = useLanguage();

    const [advertisement, setAdvertisement] = useState({
        title_en: "", title_ar: "", description_en: "", description_ar: "",
        link: "", type: "slide", isActive: true, order: 0,
        startDate: "", endDate: "", discountPercentage: "", productRef: "",
    });

    const [products, setProducts] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [submitMessageType, setSubmitMessageType] = useState("");

    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/products/admin-list`);
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products for dropdown:", error);
                setSubmitMessage(t('advertisementAdmin.errorFetchingProducts'));
                setSubmitMessageType('error');
            }
        };
        fetchProducts();
    }, [serverUrl, t]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const filteredProducts = products.filter(product => {
        if (!product || !product.name) return false;
        return product.name.toLowerCase().includes(productSearchTerm.toLowerCase());
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdvertisement((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleProductSearchChange = (e) => {
        setProductSearchTerm(e.target.value);
        setIsProductDropdownOpen(true);
        if (e.target.value === "") {
            setAdvertisement(prev => ({ ...prev, productRef: "" }));
        }
    };

    const handleProductSelect = (product) => {
        if (product) {
            setAdvertisement(prev => ({ ...prev, productRef: product._id }));
            setProductSearchTerm(product.name || "");
        } else {
            setAdvertisement(prev => ({ ...prev, productRef: "" }));
            setProductSearchTerm("");
        }
        setIsProductDropdownOpen(false);
    };

    const handleImageChange = (e) => setImageFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage("");
        setSubmitMessageType("");

        if (!advertisement.title_en.trim() || !advertisement.title_ar.trim()) {
            setSubmitMessage(t('advertisementAdmin.titleRequired'));
            setSubmitMessageType('error');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(advertisement).forEach(key => {
            if (advertisement[key] !== "" && advertisement[key] !== null) {
                formData.append(key, advertisement[key]);
            }
        });
        
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            await axios.post(`${serverUrl}/api/advertisements`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSubmitMessage(t('advertisementAdmin.addSuccess'));
            setSubmitMessageType('success');

            setAdvertisement({
                title_en: "", title_ar: "", description_en: "", description_ar: "",
                link: "", type: "slide", isActive: true, order: 0,
                startDate: "", endDate: "", discountPercentage: "", productRef: ""
            });
            setImageFile(null);
            setProductSearchTerm("");
            if (document.getElementById("advertisement-image")) {
                document.getElementById("advertisement-image").value = '';
            }
            if (onAdvertisementAdded) onAdvertisementAdded();
        } catch (error) {
            console.error("Error adding advertisement:", error.response?.data);
            const errorMessage = error.response?.data?.message || error.message;
            setSubmitMessage(`${t('advertisementAdmin.addError')} ${errorMessage}`);
            setSubmitMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition";
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title_en" className={labelClasses}>{t('advertisementAdmin.titleEn')}</label>
                    <input type="text" id="title_en" name="title_en" value={advertisement.title_en} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.titleEnPlaceholder')} required />
                </div>
                <div>
                    <label htmlFor="title_ar" className={labelClasses}>{t('advertisementAdmin.titleAr')}</label>
                    <input type="text" id="title_ar" name="title_ar" value={advertisement.title_ar} onChange={handleChange} className={`${inputClasses} text-right`} placeholder={t('advertisementAdmin.titleArPlaceholder')} required dir="rtl" />
                </div>
            </div>

            <div>
                <label htmlFor="description_en" className={labelClasses}>{t('advertisementAdmin.descriptionEn')}</label>
                <textarea id="description_en" name="description_en" value={advertisement.description_en} onChange={handleChange} className={inputClasses} rows="3" placeholder={t('advertisementAdmin.descriptionEnPlaceholder')} />
            </div>

            <div>
                <label htmlFor="description_ar" className={labelClasses}>{t('advertisementAdmin.descriptionAr')}</label>
                <textarea id="description_ar" name="description_ar" value={advertisement.description_ar} onChange={handleChange} className={`${inputClasses} text-right`} rows="3" placeholder={t('advertisementAdmin.descriptionArPlaceholder')} dir="rtl" />
            </div>

            <div className="relative" ref={productDropdownRef}>
                <label htmlFor="productRef" className={labelClasses}>{t('advertisementAdmin.linkToProduct')}</label>
                <input
                    type="text"
                    id="productRef"
                    value={productSearchTerm}
                    onChange={handleProductSearchChange}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className={inputClasses}
                    placeholder={t('advertisementAdmin.searchProductPlaceholder')}
                    autoComplete="off"
                />
                {isProductDropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <li className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer" onClick={() => handleProductSelect(null)}>
                            {t('advertisementAdmin.noProductLinked')}
                        </li>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <li key={product._id} className="px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                    <span className="font-semibold">{product.name || 'Unnamed Product'}</span>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500 italic">{t('advertisementAdmin.noProductsFound')}</li>
                        )}
                    </ul>
                )}
            </div>
            
            <div>
                <label htmlFor="discountPercentage" className={labelClasses}>{t('advertisementAdmin.discountPercentageLabel')} (%)</label>
                <input type="number" id="discountPercentage" name="discountPercentage" value={advertisement.discountPercentage} onChange={handleChange} className={inputClasses} min="0" max="100" placeholder="e.g., 10 for 10%" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="link" className={labelClasses}>{t('advertisementAdmin.linkLabel')}</label>
                    <input type="url" id="link" name="link" value={advertisement.link} onChange={handleChange} className={inputClasses} placeholder={t('advertisementAdmin.linkPlaceholder')} />
                </div>
                <div>
                    <label htmlFor="type" className={labelClasses}>{t('advertisementAdmin.typeLabel')}</label>
                    <select id="type" name="type" value={advertisement.type} onChange={handleChange} className={inputClasses}>
                        <option value="slide">{t('advertisementAdmin.typeSlide')}</option>
                        <option value="sideOffer">{t('advertisementAdmin.typeSideOffer')}</option>
                        <option value="weeklyOffer">{t('advertisementAdmin.typeWeeklyOffer')}</option>
                        <option value="other">{t('advertisementAdmin.typeOther')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className={labelClasses}>{t('advertisementAdmin.startDate')}</label>
                    <input type="date" id="startDate" name="startDate" value={advertisement.startDate} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="endDate" className={labelClasses}>{t('advertisementAdmin.endDate')}</label>
                    <input type="date" id="endDate" name="endDate" value={advertisement.endDate} onChange={handleChange} className={inputClasses} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="order" className={labelClasses}>{t('advertisementAdmin.orderLabel')}</label>
                    <input type="number" id="order" name="order" value={advertisement.order} onChange={handleChange} className={inputClasses} min="0" placeholder="0" />
                </div>
                <div className="self-end">
                    <label className={checkboxLabelClasses}>
                        <input type="checkbox" id="isActive" name="isActive" checked={advertisement.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-light" />
                        <span>{t('advertisementAdmin.isActive')}</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label htmlFor="advertisement-image" className={labelClasses}>{t('advertisementAdmin.imageLabel')}</label>
                <input type="file" id="advertisement-image" name="image" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 dark:file:bg-primary-light/10 file:text-primary-dark dark:file:text-primary-light hover:file:bg-primary/20 dark:hover:file:bg-primary-light/20" accept="image/*" />
                {imageFile && ( <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">{t('advertisementAdmin.selectedImage')}: {imageFile.name}</p>)}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? ( <Loader2 className="animate-spin" size={20} /> ) : ( <Plus size={20} /> )}
                    <span>{isSubmitting ? t('advertisementAdmin.submittingButton') : t('advertisementAdmin.addButton')}</span>
                </button>
            </div>
        </form>
    );
};

export default AddAdvertisementPage;