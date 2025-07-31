import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { User, Mail, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';

const RegisterPage = () => {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password2: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showActivationModal, setShowActivationModal] = useState(false);

    const { API_BASE_URL } = useAuth();
    const { name, email, password, password2 } = formData;

    const onChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, []);

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');
        setShowActivationModal(false);

        if (password !== password2) {
            setError(t('auth.passwordMismatch'));
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
            setSuccessMessage(t('auth.registerSuccessEmailSent') || res.data.message);
            setFormData({ name: '', email: '', password: '', password2: '' });
            setShowActivationModal(true);
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            const apiMessage = err.response?.data?.message;
            if (apiErrors && Array.isArray(apiErrors)) {
                setError(apiErrors.map(er => er.msg).join(', '));
            } else if (apiMessage) {
                setError(apiMessage);
            } else {
                setError(t('auth.registerError'));
            }
        } finally {
            setLoading(false);
        }
    }, [name, email, password, password2, API_BASE_URL, t]);
    
    const MessageCard = ({ text, type }) => (
        <div className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
            type === 'success' 
            ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" 
            : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
        }`}>
            {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span>{text}</span>
        </div>
    );

    if (showActivationModal) {
        return (
            <section className="flex min-h-[100vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
                 <div className="w-full max-w-lg text-center bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('auth.registrationCompleteTitle')}
                    </h1>
                    <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                        {successMessage}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-[100vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="w-full max-w-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <header className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t('auth.registerTitle')}
                        </h1>
                         <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                            {t('auth.registerSubtitle')}
                        </p>
                    </header>
                    
                    {error && <MessageCard type="error" text={error} />}

                    <form onSubmit={onSubmit} className="space-y-6 mt-6">
                         <div className="relative">
                            <User size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="text" name="name" value={name} onChange={onChange} placeholder={t('auth.nameLabel')} required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} />
                        </div>
                        <div className="relative">
                            <Mail size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="email" name="email" value={email} onChange={onChange} placeholder={t('auth.emailLabel')} required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} />
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="password" name="password" value={password} onChange={onChange} placeholder={t('auth.passwordLabel')} minLength="6" required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} />
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="password" name="password2" value={password2} onChange={onChange} placeholder={t('auth.confirmPasswordLabel')} minLength="6" required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} />
                        </div>

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            <span>{t('auth.registerButton')}</span>
                        </button>
                    </form>
                </div>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">
                    {t('auth.loginPrompt')}{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                        {t('auth.loginLink')}
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default RegisterPage;