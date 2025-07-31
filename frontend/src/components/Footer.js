import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
// icon for tiktok
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../Assets/logo.png';

const Footer = () => {
    const { t, language, isRTL } = useLanguage();

    const quickLinks = [
        { path: "/about", label: t('footer.aboutUs') },
        { path: "/contact", label: t('footer.contactUs') },
        { path: "/shop", label: t('footer.allProducts') },
    ];

    const socialLinks = [
        { href: "https://www.facebook.com/share/19bDfeB3Rk/", icon: Facebook, label: "Facebook" },
        { href: "https://www.instagram.com/ouno_6?igsh=NThwMG40aGJtd2Fj", icon: Instagram, label: "Instagram" },
    ];

    return (
        <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 py-16 md:grid-cols-2 lg:grid-cols-4">
                    
                    <div className="md:col-span-2 lg:col-span-1">
                        <Link to="/" className="inline-block mb-6">
                            <img src={Logo} alt="OUNO Logo" className="h-20 w-30" />
                        </Link>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">
                            {t('footer.description')}
                        </p>
                    </div>

                    <div>
                        <p className="text-base font-bold text-zinc-900 dark:text-white">{t('footer.quickLinks')}</p>
                        <ul className="mt-6 space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-sm text-zinc-600 transition hover:text-primary dark:text-zinc-300 dark:hover:text-primary-light">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div>
                        <p className="text-base font-bold text-zinc-900 dark:text-white">{t('footer.contactInfo')}</p>
                        <ul className="mt-6 space-y-4 text-sm">
                           <li className="flex items-start gap-3">
                                <MapPin size={18} className="mt-1 flex-shrink-0 text-primary"/>
                                <span className="text-zinc-600 dark:text-zinc-300">{t('footer.address')}</span>
                           </li>
                           <li className="flex items-start gap-3">
                                <Phone size={18} className="mt-1 flex-shrink-0 text-primary"/>
                                <a href={`tel:${t('footer.phone')}`} className="text-zinc-600 transition hover:text-primary dark:text-zinc-300 dark:hover:text-primary-light">{t('footer.phone')}</a>
                           </li>
                           <li className="flex items-start gap-3">
                                <Mail size={18} className="mt-1 flex-shrink-0 text-primary"/>
                                <a href={`mailto:${t('footer.email')}`} className="text-zinc-600 transition hover:text-primary dark:text-zinc-300 dark:hover:text-primary-light">{t('footer.email')}</a>
                           </li>
                        </ul>
                    </div>

                     <div className="md:col-span-2 lg:col-span-1">
                        <p className="text-base font-bold text-zinc-900 dark:text-white">{t('footer.followUs')}</p>
                         <ul className="flex items-center gap-4 mt-6">
                            {socialLinks.map(link => (
                                 <li key={link.label}>
                                    <a 
                                        href={link.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        aria-label={link.label}
                                        className="block p-2 rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-primary hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-primary"
                                    >
                                       <link.icon size={20} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                <div className="flex flex-col items-center justify-center border-t border-zinc-200 py-6 sm:flex-row dark:border-zinc-800">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                        © {new Date().getFullYear()} {t('footer.copyright', { siteName: t('mainHeader.siteName') })}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;