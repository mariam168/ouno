import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';

const ResetPasswordPage = () => {
    const { t, language } = useLanguage();
    const { token } = useParams();
    const navigate = useNavigate();
    const { API_BASE_URL } = useAuth();
    const [formData, setFormData] = useState({ password: '', password2: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenStatus, setTokenStatus] = useState('loading');
    const { password, password2 } = formData;

    useEffect(() => {
        const validateResetToken = async () => {
            if (!token) {
                setTokenStatus('invalid');
                setError(t('auth.resetLinkMissing'));
                return;
            }
            try {
                await axios.get(`${API_BASE_URL}/api/auth/validate-reset-token/${token}`);
                setTokenStatus('valid');
                setError('');
            } catch (err) {
                setTokenStatus('invalid');
                const apiMessage = err.response?.data?.message || err.response?.data?.msg;
                setError(apiMessage || t('auth.tokenExpiredOrInvalid'));
            }
        };
        if (tokenStatus === 'loading') {
            validateResetToken();
        }
    }, [token, API_BASE_URL, t, tokenStatus]);

    const onChange = useCallback(e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })), []);

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password.length < 6) {
            setError(t('auth.passwordMinLength'));
            setLoading(false);
            return;
        }
        if (password !== password2) {
            setError(t('auth.passwordMismatch'));
            setLoading(false);
            return;
        }
        try {
            const res = await axios.put(`${API_BASE_URL}/api/auth/resetpassword/${token}`, { password });
            setMessage(t('auth.passwordResetSuccess') || res.data.message);
            setFormData({ password: '', password2: '' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.response?.data?.msg;
            setError(apiMessage || t('auth.passwordResetError'));
        } finally {
            setLoading(false);
        }
    }, [password, password2, token, API_BASE_URL, navigate, t]);

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

    const renderContent = () => {
        if (tokenStatus === 'loading') {
            return (
                 <div className="flex flex-col items-center justify-center min-h-[250px]">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-zinc-300">
                        {t('auth.verifyingLink')}
                    </p>
                </div>
            );
        }
        if (tokenStatus === 'invalid') {
            return (
                <div className="flex flex-col items-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 mb-6">
                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{error}</p>
                    <Link to="/forgotpassword" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500">
                        {t('auth.requestNewLink')}
                    </Link>
                </div>
            );
        }
        if (tokenStatus === 'valid') {
            return (
                <>
                    {error && <MessageCard type="error" text={error} />}
                    {message && <MessageCard type="success" text={message} />}
                    <form onSubmit={onSubmit} className="space-y-6 mt-6">
                        <div className="relative">
                            <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="password" name="password" value={password} onChange={onChange} minLength="6" required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} placeholder={t('auth.newPasswordLabel')} />
                        </div>
                        <div className="relative">
                             <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input type="password" name="password2" value={password2} onChange={onChange} minLength="6" required className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }} placeholder={t('auth.confirmNewPasswordLabel')} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            <span>{t('auth.resetPasswordButton')}</span>
                        </button>
                    </form>
                </>
            );
        }
        return null;
    };

    return (
        <section className="flex min-h-[100vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="w-full max-w-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <header className="text-center mb-8">
                         <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t('auth.resetPasswordTitle')}
                        </h1>
                    </header>
                    {renderContent()}
                </div>
            </div>
        </section>
    );
};

export default ResetPasswordPage;