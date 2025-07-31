import HeroSection from '../components/Home/HeroSection';
import TrendingProducts from '../components/Home/TrendingProducts';
import Features from '../components/Home/Features';
import CategoryList from '../components/Home/CategoryList';
export default function Home() {
    return (
        <div>
            <HeroSection />
            <CategoryList />
            <TrendingProducts />
            
            <Features />
        </div>
    );
}