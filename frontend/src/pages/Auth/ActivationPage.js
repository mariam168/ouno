import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ActivationPage = () => {
    const { t } = useLanguage();
    const { token } = useParams();
    const { API_BASE_URL } = useAuth();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');

    useEffect(() => {
        const activateAccount = async () => {
            if (!token) {
                setStatus('error');
                setMessage(t('auth.tokenMissing'));
                return;
            }
            if (!API_BASE_URL) {
                setStatus('error');
                setMessage(t('general.apiError')); 
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/activate/${token}`);
                setStatus('success');
                setMessage(t('auth.activationSuccess') || res.data.message);
            } catch (err) {
                setStatus('error');
                const errorMessage = err.response?.data?.message || (t('auth.activationError'));
                setMessage(errorMessage);
                console.error("Account activation error:", err.response ? err.response.data : err.message);
            }
        };
        activateAccount(); 
    }, [token, API_BASE_URL, t]);

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[250px]">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-zinc-300">
                        {t('general.loading')}
                    </p>
                </div>
            );
        }
        if (status === 'success') {
            return (
                <div className="flex flex-col items-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {message}
                    </p>
                    <Link to="/login" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500">
                        {t('auth.loginNow')}
                    </Link>
                </div>
            );
        }
        if (status === 'error') {
            return (
                <div className="flex flex-col items-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 mb-6">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                     <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {message}
                    </p>
                    <Link to="/register" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500">
                        {t('auth.registerLink')}
                    </Link>
                </div>
            );
        }
        return null;
    };

    return (
        <section className="flex min-h-[100vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="w-full max-w-lg text-center bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                    {t('auth.accountActivation')}
                </h1>
                {renderContent()}
            </div>
        </section>
    );
};

export default ActivationPage;