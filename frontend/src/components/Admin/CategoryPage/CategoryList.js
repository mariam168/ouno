import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, Loader2, ListTree, Info } from 'lucide-react';
import CategoryForm from './CategoryForm';
import { useLanguage } from '../../LanguageContext';

const CategoryList = ({ serverUrl }) => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${serverUrl}/api/categories`, {
                headers: { 'x-admin-request': 'true' }
            });
            setCategories(resp.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(t('categoryList.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [serverUrl, t]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const fetchCategoryForEdit = async (categoryId) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get(`${serverUrl}/api/categories/${categoryId}`, {
                headers: { 'x-admin-request': 'true' },
            });
            const category = resp.data;
            const normalizedCategory = {
                ...category,
                name: {
                    en: category.name?.en || category.name || '',
                    ar: category.name?.ar || '',
                },
                description: {
                    en: category.description?.en || category.description || '',
                    ar: category.description?.ar || '',
                },
                subCategories: (category.subCategories || []).map((sub) => ({
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
                })),
            };
            setSelectedCategory(normalizedCategory);
            setIsFormOpen(true);
        } catch (err) {
            console.error('Error fetching category for edit:', err);
            setError(t('categoryList.editFetchError'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        fetchCategoryForEdit(category._id);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm(t('categoryList.confirmDelete'))) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${serverUrl}/api/categories/${categoryId}`, {
                headers: { 'x-admin-request': 'true' }
            });
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err.response?.data?.message || t('categoryList.deleteError'));
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        setSelectedCategory(null);
        fetchCategories();
    };
    
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
                    {t('categoryList.title')}
                </h1>
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500"
                >
                    <Plus size={16} />
                    {t('categoryList.addCategory')}
                </button>
            </header>

            {categories.length === 0 ? (
                <div className="text-center py-16">
                    <Info size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('categoryList.noCategories')}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        {t('categoryList.getStartedByAdding')}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('categoryList.nameEn')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-left">{t('categoryList.nameAr')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('categoryList.subcategories')}</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white text-center">{t('categoryList.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800 dark:text-white">{category.name?.en || 'N/A'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 text-right" dir="rtl">{category.name?.ar || 'N/A'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-zinc-400 text-center">{category.subCategories?.length || 0}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="inline-flex items-center rounded-md -space-x-px bg-gray-100 dark:bg-zinc-800 text-xs">
                                            <button onClick={() => handleEdit(category)} className="inline-block rounded-l-md p-2 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 focus:relative">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(category._id)} className="inline-block rounded-r-md p-2 text-gray-600 hover:bg-gray-200 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-red-400 focus:relative">
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

            {isFormOpen && (
                <CategoryForm
                    categoryToEdit={selectedCategory}
                    onFormSubmit={handleFormSubmit}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setSelectedCategory(null);
                    }}
                    serverUrl={serverUrl}
                />
            )}
        </div>
    );
};

export default CategoryList;