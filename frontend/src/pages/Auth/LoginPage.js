import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../components/LanguageContext';
import { Mail, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';

const LoginPage = () => {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, API_BASE_URL } = useAuth();
    const { email, password } = formData;
    
    const onChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, []);

    const onSubmit = useCallback(async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.response?.data?.msg;
            if (apiMessage) {
                setError(apiMessage);
            } else {
                setError(t('auth.loginError'));
            }
        } finally {
            setLoading(false);
        }
    }, [email, password, login, navigate, API_BASE_URL, t]);

    const MessageCard = ({ text }) => (
        <div className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
            <XCircle size={18} />
            <span>{text}</span>
        </div>
    );

    return (
        <section className="flex min-h-[100vh] w-full items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="w-full max-w-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <header className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t('auth.loginTitle')}
                        </h1>
                        <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                            {t('auth.loginSubtitle')}
                        </p>
                    </header>
                    
                    {error && <MessageCard text={error} />}

                    <form onSubmit={onSubmit} className="space-y-6 mt-6">
                        <div className="relative">
                            <Mail size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder={t('auth.emailLabel')}
                                required
                                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }}
                            />
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder={t('auth.passwordLabel')}
                                required
                                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }}
                            />
                        </div>
                        
                        <div className="text-right">
                            <Link to="/forgotpassword" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            <span>{t('auth.loginButton')}</span>
                        </button>
                    </form>
                </div>
                 <p className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">
                    {t('auth.registerPrompt')}{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                        {t('auth.registerLink')}
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default LoginPage;