import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext";
import { Package } from 'lucide-react';

function AdminProductsPage() {
    const { t } = useLanguage();

    return (
        <>
            <header className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Package size={30} className="text-indigo-500" />
                    {t('adminProductsPage.title')}
                </h1>
            </header>

            <ProductList />
        </>
    );
}

export default AdminProductsPage;