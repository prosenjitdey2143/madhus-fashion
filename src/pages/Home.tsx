import { SEO } from "../components/SEO"
import { HeroSection } from "../components/home/HeroSection"
import { ShopByCategory } from "../components/home/ShopByCategory"
import { TrendingNow } from "../components/home/TrendingNow"
import { NewArrivals } from "../components/home/NewArrivals"
import { BestSellers } from "../components/home/BestSellers"
import { CollectionsSection } from "../components/home/CollectionsSection"
import { FeaturedShop } from "../components/home/FeaturedShop"
import { OffersSection } from "../components/home/OffersSection"
import { TrustSection } from "../components/home/TrustSection"
import { VideoGallery } from "../components/home/VideoGallery"
import { SocialProof } from "../components/home/SocialProof"
import { RecentlyViewed } from "../components/products/RecentlyViewed"

export function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-primary">
      <SEO 
        title="Luxury Women's Fashion"
        description="Discover Madhus Fashion House's latest collection. Elevate your style with our elegant, modern, and high-quality luxury pieces."
      />
      
      <main>
        <HeroSection />
        <TrustSection />
        <OffersSection />
        <ShopByCategory />
        <RecentlyViewed />
        <BestSellers />
        <CollectionsSection />
        <NewArrivals />
        <TrendingNow />
        <FeaturedShop />
        <SocialProof />
        <VideoGallery />
      </main>
    </div>
  )
}
