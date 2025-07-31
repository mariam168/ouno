import React from 'react';
import { Home, Package, Folder, ShoppingCart, Megaphone, Tag, LogOut, Settings, UserCircle } from 'lucide-react';
import { useLanguage } from "../LanguageContext";
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../Assets/logo.png';
const DashboardLayout = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    { to: "/admin/dashboard", icon: Home, label: t('adminDashboardPage.dashboardTitle') },
    { to: "/admin/products", icon: Package, label: t('adminDashboardPage.productManagement') },
    { to: "/admin/categories", icon: Folder, label: t('adminDashboardPage.categoryManagement') },
    { to: "/admin/orders", icon: ShoppingCart, label: t('adminDashboardPage.orderManagement') },
    { to: "/admin/advertisements", icon: Megaphone, label: t('adminDashboardPage.advertisementManagement') },
    { to: "/admin/discounts", icon: Tag, label: t('adminDashboardPage.discountManagement') },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-200">
      <aside className="w-16 md:w-64 bg-white dark:bg-zinc-900 flex-shrink-0 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        <div className="h-20 flex items-center justify-center px-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hidden md:block">
           <img src={Logo} alt="Logo" className="w-20 h-20" />
          </Link>
          <Link to="/" className="md:hidden text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            T
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map(item => {
                const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));
                return (
                  <li key={item.to} className="px-2">
                    <Link 
                      to={item.to} 
                      title={item.label}
                      className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 group relative ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold' 
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <item.icon 
                        size={22} 
                        className={`flex-shrink-0 transition-colors ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-zinc-500 group-hover:text-gray-800 dark:group-hover:text-zinc-300'
                        }`} 
                      />
                      <span className="hidden md:inline ml-4 text-sm">{item.label}</span>
                    </Link>
                  </li>
                )
            })}
          </ul>
        </nav>

        <div className="p-2 mt-auto border-t border-gray-200 dark:border-zinc-800 space-y-2">
            <div className="px-2">
                 <div className="flex items-center p-3 rounded-lg">
                    <UserCircle size={28} className="text-gray-500 dark:text-zinc-500 flex-shrink-0" />
                    <div className="hidden md:inline ml-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{currentUser?.role}</p>
                    </div>
                </div>
            </div>
             <div className="px-2">
                <Link 
                  to="/logout"
                  title={t('topBar.logout')}
                  className="flex items-center py-3 px-4 text-gray-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-colors group"
                >
                    <LogOut size={22} className="text-gray-500 dark:text-zinc-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors flex-shrink-0" />
                    <span className="hidden md:inline ml-4 text-sm">{t('topBar.logout')}</span>
                </Link>
            </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;