import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';
import { useLanguage } from '../../LanguageContext';
import { Loader2, Info, Edit, Trash2, Plus, Copy, CheckCircle, Image as ImageIcon, Search } from 'lucide-react';

const ProductList = () => {
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${SERVER_URL}/api/products`, {
                headers: { 'Accept-Language': language }
            });
            setProducts(response.data);
            setFilteredProducts(response.data);
            setError(null);
        } catch (err) {
            setError(`${t('general.errorFetchingData')}: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [t, SERVER_URL, language]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = products.filter(item =>
            item.name?.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredProducts(filteredData);
    }, [searchTerm, products]);

    const getCategoryName = (product) => {
        if (!product?.category?.name) return t('productAdmin.uncategorized');
        return product.category.name; 
    };

    const handleDelete = async (productId, productName) => {
        if (window.confirm(t('productAdmin.confirmDelete', { productName: productName || 'this product' }))) {
            try {
                await axios.delete(`${SERVER_URL}/api/products/${productId}`);
                fetchProducts();
                alert(t('productAdmin.deleteSuccess'));
            } catch (err) {
                alert(`${t('productAdmin.deleteError')}: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleActionSuccess = () => {
        fetchProducts();
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingProduct(null);
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
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
                    <button onClick={fetchProducts} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('adminProductsPage.productList')}</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{t('adminProductsPage.manageProductsMessage', { count: filteredProducts.length })}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            placeholder={t('general.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 pl-9 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500"
                    >
                        <Plus size={16} />
                        {t('productAdmin.addProductButton')}
                    </button>
                </div>
            </header>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('productAdmin.noProducts')}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{t('productAdmin.tryDifferentSearch')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left"></th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('productAdmin.nameTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('productAdmin.categoryTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('productAdmin.priceTable')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('productAdmin.actionsTable')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="whitespace-nowrap p-4">
                                        <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                            {product.mainImage ? 
                                                <img src={`${SERVER_URL}${product.mainImage}`} alt={product.name} className="h-full w-full object-cover rounded-md" /> : 
                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                            }
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap p-4">
                                        <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="font-mono text-xs text-gray-500 dark:text-zinc-500">...{product._id.slice(-6)}</span>
                                            <button onClick={() => copyToClipboard(product._id)} className="text-gray-400 hover:text-indigo-500">
                                                {copiedId === product._id ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap p-4 text-gray-600 dark:text-zinc-400">{getCategoryName(product)}</td>
                                    <td className="whitespace-nowrap p-4 font-semibold text-green-600">{product.basePrice?.toFixed(2)} {t('general.currency')}</td>
                                    <td className="whitespace-nowrap p-4 text-center">
                                        <div className="inline-flex items-center rounded-md -space-x-px bg-gray-100 dark:bg-zinc-800 text-xs">
                                            <button onClick={() => handleOpenEditModal(product)} className="inline-block rounded-l-md p-2 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 focus:relative">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product._id, product.name)} className="inline-block rounded-r-md p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 focus:relative">
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
            
            {showEditModal && editingProduct && (
                <EditProductModal product={editingProduct} onClose={() => setShowEditModal(false)} onProductUpdated={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
            
            {showAddModal && (
                <AddProductModal onClose={() => setShowAddModal(false)} onProductAdded={handleActionSuccess} serverUrl={SERVER_URL} />
            )}
        </div>
    );
};

export default ProductList;