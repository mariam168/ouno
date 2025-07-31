import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../LanguageContext';
import { X, Plus, Trash2, Image as ImageIcon, UploadCloud, AlertCircle, Edit, ChevronsRight, Loader2, CheckCircle } from 'lucide-react';

const Fieldset = ({ legend, children }) => ( <fieldset className="border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-lg"> <legend className="px-2 text-base font-semibold text-gray-800 dark:text-gray-200">{legend}</legend> <div className="mt-4">{children}</div> </fieldset> );
const Input = ({ label, ...props }) => ( <div> {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{label}</label>} <input {...props} className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" /> </div> );
const Textarea = ({ label, ...props }) => ( <div className={props.className}> {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{label}</label>} <textarea {...props} rows="3" className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" /> </div> );
const Select = ({ label, children, ...props }) => ( <div> {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{label}</label>} <select {...props} className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"> {children} </select> </div> );
const ImagePreview = ({ src, onRemove }) => ( src ? ( <div className="relative group/image"> <img src={src} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-transparent group-hover/image:border-indigo-500 transition-all"/> <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 leading-none hover:bg-red-600 shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity"><X size={14}/></button> </div> ) : ( <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-zinc-700"> <ImageIcon className="text-gray-400 dark:text-zinc-500" size={32}/> </div> ) );
const ImageUploader = ({ id, onChange, t }) => ( <label htmlFor={id} className="flex-1 cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-indigo-500 transition-colors"> <UploadCloud size={24} className="text-gray-400 dark:text-zinc-500 mb-1"/> <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t('forms.uploadImage')}</span> <span className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{t('forms.dragOrClick')}</span> <input id={id} type="file" onChange={onChange} className="hidden"/> </label> );

const EditProductModal = ({ product: productSummary, onClose, onProductUpdated, serverUrl }) => {
    const { t, language } = useLanguage();
    const [product, setProduct] = useState(null); 
    const [attributes, setAttributes] = useState([]);
    const [variations, setVariations] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [clearMainImage, setClearMainImage] = useState(false);
    const [optionImageFiles, setOptionImageFiles] = useState({});
    const [optionImageUrls, setOptionImageUrls] = useState({});
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const getDisplayName = (item) => { if (!item?.name) return ''; return typeof item.name === 'object' ? item.name[language] || item.name.en || '' : item.name; };
    const fetchCategories = useCallback(async () => { try { const res = await axios.get(`${serverUrl}/api/categories`, { headers: { 'x-admin-request': 'true' } }); setCategories(res.data); } catch (error) { console.error("Failed to fetch categories:", error); } }, [serverUrl]);
    
    useEffect(() => {
        const fetchFullProductData = async () => {
            if (!productSummary?._id) return;
            setIsLoadingData(true);
            try {
                const res = await axios.get(`${serverUrl}/api/products/${productSummary._id}`, {
                    headers: { 'x-admin-request': 'true' }
                });
                const fullProduct = res.data;

                setProduct({
                    name_en: fullProduct.name?.en || '',
                    name_ar: fullProduct.name?.ar || '',
                    description_en: fullProduct.description?.en || '',
                    description_ar: fullProduct.description?.ar || '',
                    basePrice: fullProduct.basePrice || '',
                    category: fullProduct.category?._id || fullProduct.category || '',
                    subCategory: fullProduct.subCategory || '',
                });

                setAttributes(fullProduct.attributes || []);
                setVariations(fullProduct.variations || []);
                setMainImageUrl(fullProduct.mainImage ? `${serverUrl}${fullProduct.mainImage}` : '');
                
                const initialImageUrls = {};
                fullProduct.variations?.forEach((v, vIndex) => {
                    v.options?.forEach((o, oIndex) => {
                        if (o.image) {
                            initialImageUrls[`variationImage_${vIndex}_${oIndex}`] = `${serverUrl}${o.image}`;
                        }
                    });
                });
                setOptionImageUrls(initialImageUrls);

                setMainImageFile(null);
                setClearMainImage(false);
                setOptionImageFiles({});
                
            } catch (error) {
                setErrorMessage("Failed to load full product data.");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchCategories();
        fetchFullProductData();
    }, [productSummary, serverUrl, fetchCategories]);

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setProduct(prev => ({ ...prev, category: value, subCategory: '' }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleMainImageSelect = (e) => { const file = e.target.files[0]; if (file) { setMainImageFile(file); setMainImageUrl(URL.createObjectURL(file)); setClearMainImage(false); } };
    const handleRemoveMainImage = () => { setMainImageFile(null); setMainImageUrl(''); setClearMainImage(true); };
    const addAttribute = () => setAttributes(prev => [...prev, { key_en: '', key_ar: '', value_en: '', value_ar: '' }]);
    const removeAttribute = (index) => setAttributes(prev => prev.filter((_, i) => i !== index));
    const handleAttributeChange = (index, field, value) => setAttributes(prev => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));
    const addVariation = () => setVariations(prev => [...prev, { name_en: '', name_ar: '', options: [] }]);
    const removeVariation = (vIndex) => setVariations(prev => prev.filter((_, i) => i !== vIndex));
    const handleVariationNameChange = (vIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, [`name_${lang}`]: value } : v)));
    const addOptionToVariation = (vIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: [...v.options, { name_en: '', name_ar: '', image: null, skus: [] }] } : v)));
    const removeOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.filter((_, j) => j !== oIndex) } : v)));
    const handleOptionNameChange = (vIndex, oIndex, lang, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, [`name_${lang}`]: value } : o)) } : v)));
    
    const handleOptionImageChange = (vIndex, oIndex, e) => {
        const file = e.target.files[0];
        if (file) {
            const key = `variationImage_${vIndex}_${oIndex}`;
            setOptionImageFiles(prev => ({ ...prev, [key]: file }));
            setOptionImageUrls(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const addSkuToOption = (vIndex, oIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: [...o.skus, { name_en: '', name_ar: '', price: product.basePrice, stock: 0, sku: '' }] } : o)) } : v)));
    const removeSku = (vIndex, oIndex, sIndex) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.filter((_, k) => k !== sIndex) } : o)) } : v)));
    const handleSkuChange = (vIndex, oIndex, sIndex, field, value) => setVariations(prev => prev.map((v, i) => (i === vIndex ? { ...v, options: v.options.map((o, j) => (j === oIndex ? { ...o, skus: o.skus.map((s, k) => (k === sIndex ? { ...s, [field]: value } : s)) } : v)) } : v)));
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        const formData = new FormData();
        Object.keys(product).forEach(key => formData.append(key, product[key]));
        if (mainImageFile) formData.append('mainImage', mainImageFile);
        formData.append('clearMainImage', String(clearMainImage));
        formData.append('attributes', JSON.stringify(attributes.filter(attr => attr.key_en && attr.value_en)));

        const finalVariations = variations.map(v => ({
            _id: v._id, name_en: v.name_en, name_ar: v.name_ar,
            options: v.options.map(o => ({
                _id: o._id, name_en: o.name_en, name_ar: o.name_ar, image: o.image,
                skus: o.skus.map(s => ({
                    _id: s._id, name_en: s.name_en, name_ar: s.name_ar, price: s.price, stock: s.stock, sku: s.sku || null
                }))
            }))
        }));
        formData.append('variations', JSON.stringify(finalVariations));
        
        Object.keys(optionImageFiles).forEach(key => { formData.append(key, optionImageFiles[key]); });

        try {
            await axios.put(`${serverUrl}/api/products/${productSummary._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onProductUpdated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "An unknown error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const selectedCategoryData = categories.find(c => c._id === product?.category);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 p-0 rounded-2xl shadow-lg relative w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-zinc-800">
                <header className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3"><Edit className="text-indigo-500" />{t('productAdmin.editProductTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-white transition-colors"><X size={24} /></button>
                </header>
                
                {isLoadingData ? (
                    <div className="flex-grow flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                    </div>
                ) : (
                <form id="edit-product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
                    {errorMessage && ( <div className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"> <AlertCircle size={18} /> <span>{errorMessage}</span> </div> )}
                    
                    <Fieldset legend={t('productAdmin.basicInfo')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <Input label={t('product.nameEn')} name="name_en" value={product.name_en} onChange={handleProductChange} required />
                            <Input label={t('product.nameAr')} name="name_ar" value={product.name_ar} onChange={handleProductChange} dir="rtl" />
                            <Textarea label={t('product.descriptionEn')} name="description_en" value={product.description_en} onChange={handleProductChange} className="md:col-span-2" />
                            <Textarea label={t('product.descriptionAr')} name="description_ar" value={product.description_ar} onChange={handleProductChange} dir="rtl" className="md:col-span-2" />
                            <Input label={t('product.basePrice')} name="basePrice" type="number" value={product.basePrice} onChange={handleProductChange} required />
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">{t('product.mainImage')}</label><div className="flex items-center gap-4"><ImagePreview src={mainImageUrl} onRemove={handleRemoveMainImage} /><ImageUploader id="main-image-upload" onChange={handleMainImageSelect} t={t} /></div></div>
                            <Select label={t('product.category')} name="category" value={product.category} onChange={handleProductChange} required><option value="">{t('forms.select')}</option>{categories.map(c => <option key={c._id} value={c._id}>{getDisplayName(c)}</option>)}</Select>
                            <Select label={t('product.subCategory')} name="subCategory" value={product.subCategory} onChange={handleProductChange} disabled={!selectedCategoryData?.subCategories?.length}><option value="">{t('forms.select')}</option>{selectedCategoryData?.subCategories?.map(sc => (<option key={sc._id} value={sc._id}>{getDisplayName(sc)}</option>))}</Select>
                        </div>
                    </Fieldset>
                    <Fieldset legend={t('productAdmin.fixedAttributes')}> <div className="space-y-3"> {attributes.map((attr, index) => ( <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center"> <Input placeholder={t('product.attrNameEn')} value={attr.key_en} onChange={e => handleAttributeChange(index, 'key_en', e.target.value)} className="lg:col-span-1"/> <Input placeholder={t('product.attrNameAr')} value={attr.key_ar} onChange={e => handleAttributeChange(index, 'key_ar', e.target.value)} dir="rtl" className="lg:col-span-1"/> <Input placeholder={t('product.attrValueEn')} value={attr.value_en} onChange={e => handleAttributeChange(index, 'value_en', e.target.value)} className="lg:col-span-1"/> <Input placeholder={t('product.attrValueAr')} value={attr.value_ar} onChange={e => handleAttributeChange(index, 'value_ar', e.target.value)} dir="rtl" className="lg:col-span-1"/> <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 justify-self-end lg:justify-self-center"><Trash2 size={16}/></button> </div> ))} </div> <button type="button" onClick={addAttribute} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-4"><Plus size={16}/>{t('productAdmin.addAttribute')}</button> </Fieldset>
                    <Fieldset legend={t('productAdmin.productVariations')}> <div className="space-y-4"> {variations.map((v, vIndex) => ( <div key={v._id || vIndex} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-800/50 space-y-4"> <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-zinc-700"> <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('productAdmin.variationGroup')} #{vIndex + 1}</h4> <button type="button" onClick={() => removeVariation(vIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 size={18} /></button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <Input placeholder={t('product.varNameEn')} value={v.name_en} onChange={e => handleVariationNameChange(vIndex, 'en', e.target.value)} /> <Input placeholder={t('product.varNameAr')} value={v.name_ar} onChange={e => handleVariationNameChange(vIndex, 'ar', e.target.value)} dir="rtl"/> </div> <div className="space-y-3 pt-2"> <h5 className="font-medium text-gray-600 dark:text-zinc-400 flex items-center gap-2"><ChevronsRight size={18} className="text-indigo-400"/>{t('productAdmin.optionsFor')} "{v.name_en || '...'}"</h5> {v.options.map((opt, oIndex) => ( <div key={opt._id || oIndex} className="p-4 pl-6 border-l-4 border-indigo-500 rounded-r-lg bg-white dark:bg-zinc-800 space-y-4 shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow"> <Input placeholder={t('product.optionNameEn')} value={opt.name_en} onChange={e => handleOptionNameChange(vIndex, oIndex, 'en', e.target.value)} /> <Input placeholder={t('product.optionNameAr')} value={opt.name_ar} onChange={e => handleOptionNameChange(vIndex, oIndex, 'ar', e.target.value)} dir="rtl"/> </div> <div className="flex items-center gap-2 flex-shrink-0">
                        {optionImageUrls[`variationImage_${vIndex}_${oIndex}`] && <img src={optionImageUrls[`variationImage_${vIndex}_${oIndex}`]} alt="opt" className="w-10 h-10 object-cover rounded"/>}
                        <input type="file" id={`option-img-${vIndex}-${oIndex}`} onChange={e => handleOptionImageChange(vIndex, oIndex, e)} className="hidden"/> <label htmlFor={`option-img-${vIndex}-${oIndex}`} className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('forms.changeImage')}</label> <button type="button" onClick={() => removeOption(vIndex, oIndex)} className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"><Trash2 size={14}/></button> </div> </div> <div className="pl-4 mt-2 space-y-3"> <h6 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">SKUs for "{opt.name_en || 'this option'}"</h6> {opt.skus.map((sku, sIndex) => ( <div key={sku._id || sIndex} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"> <Input placeholder="SKU Name (EN)" value={sku.name_en} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_en', e.target.value)} /> <Input placeholder="اسم SKU (AR)" value={sku.name_ar} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'name_ar', e.target.value)} dir="rtl" /> <Input type="number" placeholder="Price" value={sku.price} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'price', e.target.value)} /> <Input type="number" placeholder="Stock" value={sku.stock} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'stock', e.target.value)} /> <div className="flex items-center"> <Input type="text" placeholder="SKU ID" value={sku.sku} onChange={e => handleSkuChange(vIndex, oIndex, sIndex, 'sku', e.target.value)} /> <button type="button" onClick={() => removeSku(vIndex, oIndex, sIndex)} className="text-red-400 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 ml-2"><Trash2 size={14}/></button> </div> </div> ))} <button type="button" onClick={() => addSkuToOption(vIndex, oIndex)} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold"><Plus size={14}/>Add SKU</button> </div> </div> ))} <button type="button" onClick={() => addOptionToVariation(vIndex)} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300"><Plus size={16}/>{t('productAdmin.addOption')}</button> </div> </div> ))} </div> <button type="button" onClick={addVariation} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-4 hover:text-indigo-800 dark:hover:text-indigo-300"><Plus size={18}/>{t('productAdmin.addVariationGroup')}</button> </Fieldset>
                </form>
                )}
                <footer className="flex-shrink-0 flex justify-end gap-3 p-4 mt-auto border-t border-gray-200 dark:border-zinc-800">
                    <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50">{t('actions.cancel')}</button>
                    <button type="submit" form="edit-product-form" disabled={isSubmitting || isLoadingData} className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60">{isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}<span>{isSubmitting ? t('actions.saving') : t('actions.saveChanges')}</span></button>
                </footer>
            </div>
        </div>
    );
};

export default EditProductModal;