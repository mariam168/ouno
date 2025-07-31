import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../../components/LanguageContext';
import { Loader2, DollarSign, ShoppingCart, Package, Users, Info, LineChart, BarChart3, PieChart as PieIcon, ListOrdered, LayoutDashboard } from 'lucide-react';

const CHART_COLORS = {
    revenue: '#4F46E5',
    orders: '#10B981',
    products: '#F59E0B',
};

const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9', '#F97316'];

const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800">
                <p className="label text-sm font-semibold text-gray-800 dark:text-white mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.stroke || pld.fill }} className="intro text-xs font-medium">
                        {`${pld.name}: `}
                        <span className="font-bold">{pld.dataKey === 'revenue' ? `${currencySymbol || '$'}${pld.value.toFixed(2)}` : pld.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const StatCard = ({ icon, title, value, color }) => {
    const iconColors = {
        indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10',
        violet: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10',
    };
    return (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex items-center gap-5">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${iconColors[color]}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
};

const ChartContainer = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-3">
            {React.cloneElement(icon, { className: "text-gray-400 dark:text-zinc-500", size: 22 })}
            <span>{title}</span>
        </h3>
        {children}
    </div>
);

const AdminDashboardPage = () => {
    const { t, language } = useLanguage();
    const { API_BASE_URL } = useAuth();
    const [summaryStats, setSummaryStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productSalesData, setProductSalesData] = useState([]);
    const [categoryDistributionData, setCategoryDistributionData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const axiosConfig = { headers: { 'accept-language': language } };
        try {
            const [statsRes, salesRes, productSalesRes, categoryRes, orderStatusRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dashboard/summary-stats`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/sales-over-time`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/product-sales`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/category-distribution`, axiosConfig),
                axios.get(`${API_BASE_URL}/api/dashboard/order-status-distribution`, axiosConfig),
            ]);
            setSummaryStats(statsRes.data);
            setSalesData(salesRes.data);
            setProductSalesData(productSalesRes.data);
            setCategoryDistributionData(categoryRes.data);
            setOrderStatusData(orderStatusRes.data);
        } catch (err) {
            setError(t('adminDashboardPage.errorFetchingData') + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, t, language]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    const translateKey = useCallback((key, prefix) => t(`${prefix}.${key}`) || key, [t]);

    if (loading) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                    <Info size={48} className="mx-auto mb-5 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('general.error')}</h2>
                    <p className="text-base text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchDashboardData} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        {t('general.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <LayoutDashboard size={30} />
                    {t('adminDashboardPage.dashboardTitle')}
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 mt-1">{t('adminDashboardPage.welcomeMessage')}</p>
            </header>

            {summaryStats && (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<DollarSign />} title={t('adminDashboardPage.totalRevenue')} value={`${t('general.currencySymbol')} ${summaryStats.totalRevenue?.toFixed(2)}`} color="emerald" />
                    <StatCard icon={<ShoppingCart />} title={t('adminDashboardPage.totalOrders')} value={summaryStats.totalOrders} color="indigo" />
                    <StatCard icon={<Package />} title={t('adminDashboardPage.totalProducts')} value={summaryStats.totalProducts} color="amber" />
                    <StatCard icon={<Users />} title={t('adminDashboardPage.totalUsers')} value={summaryStats.totalUsers} color="violet" />
                </section>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <ChartContainer title={t('adminDashboardPage.salesOverviewChartTitle')} icon={<LineChart />}>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={salesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.25}/><stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
                                <Area type="monotone" dataKey="revenue" name={t('adminDashboardPage.revenueLabel')} stroke={CHART_COLORS.revenue} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5 }} />
                                <Area type="monotone" dataKey="orders" name={t('adminDashboardPage.orderCountLabel')} stroke={CHART_COLORS.orders} strokeWidth={2} fillOpacity={0} dot={false} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div>
                     <ChartContainer title={t('adminDashboardPage.ordersByStatusTitle')} icon={<ListOrdered />}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={orderStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={3} labelLine={false} label={({ name, percent }) => `${translateKey(name, 'adminDashboardPage.orderStatuses')} ${(percent * 100).toFixed(0)}%`}>
                                    {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, translateKey(name, 'adminDashboardPage.orderStatuses')]} />
                                <Legend iconType="circle" formatter={(value) => translateKey(value, 'adminDashboardPage.orderStatuses')} wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </section>
            
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                 <div className="xl:col-span-2">
                    <ChartContainer title={t('adminDashboardPage.topSellingProductsTitle')} icon={<BarChart3 />}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={productSalesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip currencySymbol={t('general.currencySymbol')} />} />
                                <Bar dataKey="quantitySold" name={t('adminDashboardPage.quantitySoldLabel')} fill={CHART_COLORS.products} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div>
                     <ChartContainer title={t('adminDashboardPage.categoryDistributionChartTitle')} icon={<PieIcon />}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={categoryDistributionData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
                                <XAxis type="number" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false}/>
                                <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} strokeOpacity={0.1} axisLine={false} tickLine={false}/>
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name={t('adminDashboardPage.productCountLabel')} fill={CHART_COLORS.revenue} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;