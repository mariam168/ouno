import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../../components/LanguageContext';
import { Plus, Edit, Trash2, Loader2, Info, ChevronDown, ChevronRight, Image as ImageIcon, ListTree, Search, XCircle } from 'lucide-react';
import CategoryForm from '../../components/Admin/CategoryPage/CategoryForm';

const AdminCategoriesPage = () => {
    const { t } = useLanguage();
    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${serverUrl}/api/categories`, {
                headers: { 'x-admin-request': 'true' }
            });
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingCategories'));
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenAddForm = () => {
        setCategoryToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = async (category) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${serverUrl}/api/categories/${category._id}`, {
                headers: { 'x-admin-request': 'true' },
            });
            const fetchedCategory = response.data;
            const normalizedCategory = {
                ...fetchedCategory,
                name: {
                    en: fetchedCategory.name?.en || fetchedCategory.name || '',
                    ar: fetchedCategory.name?.ar || '',
                },
                description: {
                    en: fetchedCategory.description?.en || fetchedCategory.description || '',
                    ar: fetchedCategory.description?.ar || '',
                },
                subCategories: (fetchedCategory.subCategories || []).map(sub => ({
                    ...sub,
                    tempId: sub._id || `new_sub_${Date.now() + Math.random()}`,
                    name: {
                        en: sub.name?.en || sub.name || '',
                        ar: sub.name?.ar || '',
                    },
                    description: {
                        en: sub.description?.en || sub.description || '',
                        ar: sub.description?.ar || '',
                    },
                }))
            };
            setCategoryToEdit(normalizedCategory);
            setIsFormOpen(true);
        } catch (err) {
            console.error('Error fetching category details for edit:', err);
            setError(err.response?.data?.message || t('adminCategoryPage.errorFetchingEditDetails'));
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setCategoryToEdit(null);
        fetchCategories();
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setCategoryToEdit(null);
    };

    const handleDelete = async (categoryId, categoryName) => {
        const confirmMessage = t('adminCategoryPage.confirmDelete', { categoryName: categoryName?.en || categoryName || 'this category' });
        if (window.confirm(confirmMessage)) {
            setLoading(true);
            setError(null);
            try {
                await axios.delete(`${serverUrl}/api/categories/${categoryId}`, {
                    headers: { 'x-admin-request': 'true' }
                });
                fetchCategories();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError(err.response?.data?.message || t('adminCategoryPage.errorDeletingCategory'));
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const filteredCategories = categories.filter(category => {
        if (!debouncedSearchTerm) {
            return true;
        }
        const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
        const matchesCategoryNameEn = category.name?.en?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCategoryNameAr = category.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesSubcategory = category.subCategories?.some(sub =>
            sub.name?.en?.toLowerCase().includes(lowerCaseSearchTerm) ||
            sub.name?.ar?.toLowerCase().includes(lowerCaseSearchTerm)
        );
        return matchesCategoryNameEn || matchesCategoryNameAr || matchesSubcategory;
    });

    if (loading && categories.length === 0) {
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
                    <button onClick={fetchCategories} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
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
                    <ListTree size={26} className="text-indigo-500" />
                    {t('adminCategoryPage.manageCategories')}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            placeholder={t('categoryList.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2.5 pl-9 text-sm text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                         {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-white">
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleOpenAddForm}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500"
                    >
                        <Plus size={16} />
                        {t('adminCategoryPage.addCategoryButton')}
                    </button>
                </div>
            </header>

            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => (
                        <div key={cat._id}>
                            <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                {cat.subCategories?.length > 0 ? (
                                    <button onClick={() => toggleExpand(cat._id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                                        {expandedCategories[cat._id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                ) : (
                                    <div className="w-10 h-10"></div>
                                )}

                                <img
                                    src={cat.imageUrl ? `${serverUrl}${cat.imageUrl}` : 'https://via.placeholder.com/150'}
                                    alt={cat.name?.en || 'Category'}
                                    className="h-12 w-12 rounded-lg object-cover mx-4"
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-900 dark:text-white">{cat.name?.en}</p>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400" dir="rtl">{cat.name?.ar}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenEditForm(cat)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(cat._id, cat.name)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {expandedCategories[cat._id] && cat.subCategories?.length > 0 && (
                                <div className="pl-16 pr-4 py-2 bg-gray-50 dark:bg-zinc-800/50">
                                    <ul className="space-y-2 border-l-2 border-gray-200 dark:border-zinc-700 ml-5 pl-5">
                                        {cat.subCategories.map(sub => (
                                            <li key={sub._id} className="flex items-center gap-3 py-1">
                                                <img
                                                    src={sub.imageUrl ? `${serverUrl}${sub.imageUrl}` : 'https://via.placeholder.com/100'}
                                                    alt={sub.name?.en || 'Subcategory'}
                                                    className="h-8 w-8 rounded-md object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sub.name?.en}</p>
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400" dir="rtl">{sub.name?.ar}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <Info size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {debouncedSearchTerm ? t('categoryList.noSearchResults') : t('adminCategoryPage.noCategoriesYet')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                            {debouncedSearchTerm ? t('categoryList.tryDifferentSearch') : t('adminCategoryPage.addFirstCategory')}
                        </p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <CategoryForm
                    categoryToEdit={categoryToEdit}
                    onFormSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    serverUrl={serverUrl}
                />
            )}
        </div>
    );
};

export default AdminCategoriesPage;