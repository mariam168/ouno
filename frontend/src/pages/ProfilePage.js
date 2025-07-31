import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastNotification';
import { useLanguage } from '../components/LanguageContext';
import axios from 'axios';
import { User, ShoppingBag, LogOut, Loader2, Save, KeyRound, Eye, EyeOff, Mail, Package, ChevronRight } from 'lucide-react';

const Card = ({ children, className = '', padding = "p-6" }) => (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm ${className}`}>
        {children}
    </div>
);

const InputWithIcon = ({ icon, type = 'text', value, onChange, placeholder, disabled = false, required = false, id }) => (
    <div className="relative">
        <div className={`absolute inset-y-0 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 ${useLanguage().isRTL ? 'right-0 pr-3' : 'left-0 pl-3'}`}>
            {icon}
        </div>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full py-2.5 bg-zinc-100 dark:bg-zinc-800/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-zinc-800 focus:border-primary outline-none transition duration-200 text-zinc-800 dark:text-zinc-200 ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${useLanguage().isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
        />
    </div>
);

const ProfilePage = () => {
    const { t, language, isRTL } = useLanguage();
    const { currentUser, logout, token, API_BASE_URL, login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setLoadingOrders(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            showToast(t('profile.fetchOrdersError'), 'error');
        } finally {
            setLoadingOrders(false);
        }
    }, [API_BASE_URL, token, showToast, t]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        setName(currentUser.name);
        setEmail(currentUser.email);
        
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [currentUser, navigate, activeTab, fetchOrders]);
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            login(data.user, token); 
            showToast(t('profile.updateSuccess'), 'success');
        } catch (error) {
            showToast(error.response?.data?.message || t('profile.updateError'), 'error');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        try {
            await axios.put(`${API_BASE_URL}/api/auth/profile/password`, { currentPassword, newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(t('profile.passwordUpdateSuccess'), 'success');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            showToast(error.response?.data?.message || t('profile.passwordUpdateError'), 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        showToast(t('profile.logoutSuccess'), 'info');
        navigate('/');
    };

    const formatPrice = useCallback((price) => {
        if (price === undefined || price === null) return '';
        return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(Number(price));
    }, [language]);

    if (!currentUser) {
        return <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-black"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }
    
    const navigationItems = [
        { id: 'profile', label: t('profile.profileDetails'), icon: User },
        { id: 'security', label: t('profile.security'), icon: KeyRound },
        { id: 'orders', label: t('profile.myOrders'), icon: ShoppingBag },
    ];
    
    const primaryButtonStyle = "flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed transition duration-200";

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <Card>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('profile.profileInfo')}</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className='space-y-1.5'>
                                    <label htmlFor="name" className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t('profile.name')}</label>
                                    <InputWithIcon id="name" icon={<User size={18} />} value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className='space-y-1.5'>
                                    <label htmlFor="email" className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t('profile.email')}</label>
                                    <InputWithIcon id="email" icon={<Mail size={18} />} value={email} disabled />
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 flex justify-end rounded-b-xl">
                                <button type="submit" disabled={isUpdatingProfile} className={primaryButtonStyle}>
                                    {isUpdatingProfile ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />}
                                    <span>{isUpdatingProfile ? t('profile.saving') : t('profile.saveChanges')}</span>
                                </button>
                            </div>
                        </form>
                    </Card>
                );
            case 'security':
                return (
                    <Card>
                        <form onSubmit={handlePasswordChange}>
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('profile.changePassword')}</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className='space-y-1.5'>
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t('profile.currentPassword')}</label>
                                    <div className="relative">
                                        <InputWithIcon icon={<KeyRound size={18} />} type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={`absolute inset-y-0 flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t('profile.newPassword')}</label>
                                    <div className="relative">
                                        <InputWithIcon icon={<KeyRound size={18} />} type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute inset-y-0 flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 flex justify-end rounded-b-xl">
                                <button type="submit" disabled={isUpdatingPassword} className={primaryButtonStyle}>
                                    {isUpdatingPassword ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={18} />}
                                    <span>{isUpdatingPassword ? t('profile.updating') : t('profile.updatePassword')}</span>
                                </button>
                            </div>
                        </form>
                    </Card>
                );
            case 'orders':
                return (
                    <Card>
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                             <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('profile.myOrders')}</h3>
                        </div>
                        <div className="p-2 sm:p-4">
                            {loadingOrders ? (
                                <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
                            ) : orders.length > 0 ? (
                                <ul className="space-y-4">
                                    {orders.map(order => (
                                        <li key={order._id}>
                                            <Link to={`/order/${order._id}`} className="block p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md hover:border-primary/50 transition-all duration-200">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className='flex-1'>
                                                        <p className="font-bold text-zinc-800 dark:text-white flex items-center gap-2">{t('profile.order')} <span className="text-primary dark:text-primary-light font-mono text-sm">#{order._id.substring(18)}</span></p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                            {new Date(order.createdAt).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-left sm:text-right">
                                                        <p className="text-lg font-bold text-zinc-800 dark:text-white">
                                                            {formatPrice(order.totalPrice)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 flex items-center justify-start sm:justify-center gap-2">
                                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${order.isDelivered ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                            <Package size={14} />
                                                            {order.isDelivered ? t('profile.delivered') : t('profile.processing')}
                                                        </span>
                                                    </div>
                                                    <div className="text-zinc-400 dark:text-zinc-500">
                                                        <ChevronRight size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)' }} />
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-16">
                                    <ShoppingBag className="mx-auto h-12 w-12 text-zinc-400" />
                                    <h3 className="mt-2 text-lg font-medium text-zinc-900 dark:text-white">{t('profile.noOrdersFound')}</h3>
                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('profile.noOrdersYet')}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };
    return (
        <div className="bg-zinc-100 dark:bg-black min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                 <header className="mb-8 text-center lg:text-left">
                    <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{t('profile.pageTitle')}</h1>
                    <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{t('profile.pageSubtitle')}</p>
                </header>

                <div className="lg:hidden mb-6">
                    <div className="border-b border-zinc-200 dark:border-zinc-700">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`shrink-0 flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                                        activeTab === item.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-600'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <aside className="hidden lg:block lg:col-span-3">
                        <Card padding="p-4" className="sticky top-24">
                            <div className="flex items-center gap-4 p-2 mb-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-9 h-9 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-800 dark:text-white truncate">{currentUser.name}</h2>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{currentUser.email}</p>
                                </div>
                            </div>
                            <nav className="space-y-1">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                            activeTab === item.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                                        }`}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="border-t border-zinc-200 dark:border-zinc-700 mt-4 pt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span>{t('profile.logout')}</span>
                                </button>
                            </div>
                        </Card>
                    </aside>
                    <main className="lg:col-span-9" key={activeTab}>
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;