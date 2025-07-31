import { useLanguage } from "../components/LanguageContext";
import about from '../Assets/about2.jpg'; 

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        <section className="w-full min-h-screen bg-gray-100 dark:bg-black py-6 sm:py-14 px-4 sm:px-6 lg:px-4">
            <div className="container mx-auto max-w-screen-xl">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative h-80 md:h-auto">
                             <img
                                src={about}
                                alt={t('aboutUsPage.imageAlt')}
                                className="absolute inset-0 w-full h-full object-cover object-center" 
                            />
                        </div>
                        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {t('aboutUsPage.title')}
                            </h2>
                            <p className="mt-6 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.commitment')}
                            </p>
                            <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.belief')}
                            </p>
                            <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {t('aboutUsPage.explore')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;