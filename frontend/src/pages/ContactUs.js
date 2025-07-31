import React, { useState, useCallback } from 'react';
import { useLanguage } from "../components/LanguageContext";
import { User, Mail, Phone, MessageSquare, Send, Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';

const ContactUs = () => {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        name: '', subject: '', email: '', phone: '', message: '',
    });
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmissionMessage(null);
        setIsLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 
        const endpoint = `${apiUrl}/api/contact`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmissionMessage({ type: 'success', text: t('contactUsPage.successMessage') });
                setFormData({ name: '', subject: '', email: '', phone: '', message: '' });
            } else {
                const errorData = await response.json();
                setSubmissionMessage({ type: 'error', text: errorData.message || t('contactUsPage.errorMessage') });
            }
        } catch (error) {
            setSubmissionMessage({ type: 'error', text: t('contactUsPage.networkError') });
        } finally {
            setIsLoading(false);
        }
    }, [formData, t]);
    const InputField = ({ icon: Icon, name, type, placeholder, value, onChange, required = false, isRTL }) => (
        <div className="relative">
            <Icon size={18} className="absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [isRTL ? 'right' : 'left']: '14px' }} />
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                style={{ paddingLeft: isRTL ? '14px' : '40px', paddingRight: isRTL ? '40px' : '14px' }}
            />
        </div>
    );

    return (
        <section className="w-full min-h-screen bg-gray-100 dark:bg-black py-16 sm:py-24">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <header className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            {t('contactUsPage.title')}
                        </h1>
                        <p className="mt-4 text-base text-gray-600 dark:text-zinc-400">
                            {t('contactUsPage.description')}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <InputField icon={User} name="name" type="text" placeholder={t('contactUsPage.yourName')} value={formData.name} onChange={handleChange} required isRTL={language === 'ar'} />
                        <InputField icon={Tag} name="subject" type="text" placeholder={t('contactUsPage.yourSubject')} value={formData.subject} onChange={handleChange} required isRTL={language === 'ar'} />
                        <InputField icon={Mail} name="email" type="email" placeholder={t('contactUsPage.yourEmail')} value={formData.email} onChange={handleChange} required isRTL={language === 'ar'} />
                        <InputField icon={Phone} name="phone" type="tel" placeholder={t('contactUsPage.yourPhone')} value={formData.phone} onChange={handleChange} isRTL={language === 'ar'} />                        
                        <div className="md:col-span-2 relative">
                            <MessageSquare size={18} className="absolute top-4 text-gray-400 dark:text-zinc-500 pointer-events-none" style={{ [language === 'ar' ? 'right' : 'left']: '14px' }} />
                            <textarea
                                name="message"
                                rows="6"
                                placeholder={t('contactUsPage.yourMessage')}
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                style={{ paddingLeft: language === 'ar' ? '14px' : '40px', paddingRight: language === 'ar' ? '40px' : '14px' }}
                            ></textarea>
                        </div>
                        
                        {submissionMessage && (
                            <div className={`md:col-span-2 p-4 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2 ${
                                submissionMessage.type === 'success' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                            }`}>
                                {submissionMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                <span>{submissionMessage.text}</span>
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-center mt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-600 dark:bg-white dark:text-black dark:hover:bg-indigo-500 dark:hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        <span>{t('contactUsPage.submitting')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>{t('contactUsPage.submitMessage')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;