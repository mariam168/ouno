import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, Sun, Moon, LogOut, LayoutDashboard, User, Phone } from 'lucide-react';

const TopBarButton = ({ onClick, href, to, children, className = '', tooltip }) => {
    const commonClasses = "relative group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50 hover:text-gray-900 dark:hover:text-white";
    
    const content = (
        <>
            {children}
            {tooltip && (
                <div className="absolute top-full mt-2 -translate-x-1/2 left-1/2 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {tooltip}
                </div>
            )}
        </>
    );

    if (to) {
        return <Link to={to} className={`${commonClasses} ${className}`}>{content}</Link>;
    }
    if (href) {
        return <a href={href} className={`${commonClasses} ${className}`}>{content}</a>;
    }
    
    return <button onClick={onClick} className={`${commonClasses} ${className}`}>{content}</button>;
};

const TopBar = () => {
    const { t, changeLanguage } = useLanguage();
    const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const divider = <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700"></div>;
    const phoneNumber = "+201500553457";

    return (
        <div className="bg-white dark:bg-zinc-900 text-sm font-medium border-b border-gray-200 dark:border-zinc-800 shadow-sm z-50 sticky top-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <div className="flex items-center gap-1.5">
                        <a href={`tel:${phoneNumber}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary-light transition-colors px-2">
                            <Phone size={16} className="text-primary" />
                            <span>{phoneNumber}</span>
                        </a>
                        {divider}
                        <TopBarButton onClick={changeLanguage} tooltip={t('topBar.language')}>
                            <Globe size={16} />
                            <span className="hidden sm:inline">{t('topBar.language')}</span>
                        </TopBarButton>
                        <TopBarButton onClick={() => setIsDark(!isDark)} tooltip={isDark ? t('topBar.lightMode') : t('topBar.darkMode')}>
                            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-primary" />}
                        </TopBarButton>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <>
                                        <TopBarButton to="/admin/dashboard" tooltip={t('topBar.dashboard')}>
                                            <LayoutDashboard size={16} />
                                            <span className="hidden sm:inline">{t('topBar.dashboard')}</span>
                                        </TopBarButton>
                                        {divider}
                                    </>
                                )}
                                <div className="hidden md:flex items-center gap-1.5 px-3 text-gray-500 dark:text-zinc-400">
                                    <User size={16} className="text-primary"/>
                                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{currentUser?.name}</span>
                                </div>
                                {divider}
                                <TopBarButton onClick={handleLogout} className="!text-red-600 dark:!text-red-400 hover:!bg-red-500/10" tooltip={t('topBar.logout')}>
                                    <LogOut size={16} />
                                    <span className="hidden sm:inline">{t('topBar.logout')}</span>
                                </TopBarButton>
                            </>
                        ) : (
                           <div className="flex items-center gap-4">
                               <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                                   {t('auth.login')}
                               </Link>
                               {/* <Link to="/register" className="text-sm font-medium text-white bg-primary hover:bg-primary-dark px-4 py-1.5 rounded-full transition-colors">
                                   {t('auth.register')}
                               </Link> */}
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;