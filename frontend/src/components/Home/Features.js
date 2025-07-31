import React from 'react';
import { Truck, MessageCircleQuestion, CreditCard, RotateCcw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const FeatureItem = ({ icon: Icon, title, desc }) => (
    <div className="flex flex-col items-center text-center p-6 sm:p-0 md:flex-row md:text-left md:items-start md:gap-5">
        <div className="flex-shrink-0 mb-4 md:mb-0 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                {desc}
            </p>
        </div>
    </div>
);

const Features = () => {
    const { t } = useLanguage();
    const features = [
        {
            icon: Truck,
            title: t('features.freeShipping'),
            desc: t('features.freeShippingDesc'),
        },
        {
            icon: MessageCircleQuestion,
            title: t('features.support247'),
            desc: t('features.support247Desc'),
        },
        {
            icon: CreditCard,
            title: t('features.onlinePayment'),
            desc: t('features.onlinePaymentDesc'),
        },
        {
            icon: RotateCcw,
            title: t('features.easyReturn'),
            desc: t('features.easyReturnDesc'),
        },
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 border-y border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className={`relative ${index < features.length - 1 ? 'lg:border-r lg:border-gray-200 lg:dark:border-zinc-800' : ''}`}
                        >
                            <div className="lg:px-8">
                                <FeatureItem {...feature} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;