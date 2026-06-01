import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { trendingService } from "../../services/firebase/trendingService"
import type { TrendingSettings, TrendingCard } from "../../types"

// Default structure based on the original layout
const DEFAULT_CARDS: TrendingCard[] = [
  {
    id: "card_1",
    title: "Summer Silhouettes",
    subtitle: "EST. 01 / SELECTION",
    description: "Breathable, flowing designs crafted from finest linens and raw cotton, inspired by sun-kissed European afternoons.",
    mainImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop",
    textureImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    productIds: []
  },
  {
    id: "card_2",
    title: "Evening Elegance",
    subtitle: "EST. 02 / SELECTION",
    description: "Command attention in structured evening wear, liquid satins, and tailored coordinates made for moonlit occasions.",
    mainImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop",
    textureImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
    productIds: []
  }
];

const DEFAULT_SETTINGS: TrendingSettings = {
  sectionTitle: "Trending Now",
  sectionSubtitle: "Seasonal Editorial",
  sectionDescription: "Curated visual stories capturing the essence of the current era. Each piece is a testament to structured luxury and modern ease.",
  cards: DEFAULT_CARDS
};

export function TrendingNow() {
  const [settings, setSettings] = useState<TrendingSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      try {
        const data = await trendingService.getTrendingSettings()
        if (data) {
          // Merge defaults in case some fields are empty
          setSettings({
            sectionTitle: data.sectionTitle || DEFAULT_SETTINGS.sectionTitle,
            sectionSubtitle: data.sectionSubtitle || DEFAULT_SETTINGS.sectionSubtitle,
            sectionDescription: data.sectionDescription || DEFAULT_SETTINGS.sectionDescription,
            cards: [
              data.cards?.[0] || DEFAULT_CARDS[0],
              data.cards?.[1] || DEFAULT_CARDS[1]
            ]
          })
        }
      } catch (err) {
        console.error("Failed to load trending settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const card1 = settings.cards[0]
  const card2 = settings.cards[1]

  return (
    <section className="py-16 md:py-20 bg-brand-primary overflow-hidden relative">
      {/* Huge subtle luxury typography watermark in background */}
      <div className="absolute top-10 right-[-5%] font-serif text-[14vw] select-none pointer-events-none text-brand-text/[0.02] tracking-[0.15em] leading-none uppercase z-0 font-semibold">
        Trends
      </div>
      <div className="absolute bottom-10 left-[-5%] font-serif text-[14vw] select-none pointer-events-none text-brand-text/[0.02] tracking-[0.15em] leading-none uppercase z-0 font-semibold">
        Focus
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-[1400px] relative z-10">
        
        {/* Modern Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 md:mb-32">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.35em] text-brand-accent mb-4 block font-semibold">
              {settings.sectionSubtitle}
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-brand-text leading-tight">
              {settings.sectionTitle}
            </h2>
          </div>
          <div className="mt-6 md:mt-0 max-w-md border-l border-brand-accent/30 pl-6">
            <p className="text-sm text-brand-text/60 font-light leading-relaxed">
              {settings.sectionDescription}
            </p>
          </div>
        </div>

        {/* High-Fashion Collage Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-24 lg:gap-x-16 items-start">
          
          {/* Card 1: Left Column - Taller Collage */}
          <div className="lg:col-span-7 pr-0 lg:pr-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative group cursor-pointer"
            >
              {/* Fallback to dresses category if no products linked, else use trending id */}
              <Link to={card1.productIds && card1.productIds.length > 0 ? `/products?trending=${card1.id}` : "/products?category=dresses"} className="block relative">
                
                {/* Main Image Container */}
                <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-brand-pale shadow-soft group-hover:shadow-float transition-all duration-1000 ease-luxury relative z-10">
                  <div className="absolute inset-0 bg-brand-text/5 group-hover:bg-brand-text/15 transition-colors duration-[1.5s] ease-luxury z-10" />
                  <img 
                    src={card1.mainImage} 
                    alt={card1.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-luxury group-hover:scale-[1.03]"
                  />
                </div>

                {/* Overlapping Close-Up Detail Image */}
                {card1.textureImage && (
                  <motion.div 
                    className="hidden md:block absolute bottom-[10%] right-[-8%] w-[200px] aspect-[3/4] overflow-hidden rounded-sm shadow-float border-4 border-brand-primary z-20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <img 
                      src={card1.textureImage}
                      alt={`${card1.title} Detail`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-luxury group-hover:scale-105"
                    />
                  </motion.div>
                )}

                {/* Overlapping Glassmorphic Text Card */}
                <div className="absolute bottom-[-40px] left-6 right-6 md:left-12 md:right-auto md:w-[450px] backdrop-blur-md bg-white/80 border border-white/50 p-8 shadow-float rounded-sm z-30 transition-all duration-700 ease-luxury group-hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] tracking-[0.3em] font-serif text-brand-accent uppercase font-bold">{card1.subtitle}</span>
                    <span className="text-xs font-serif text-brand-text/40">EDITORIAL</span>
                  </div>
                  <h3 className="text-3xl font-serif text-brand-text mb-3">{card1.title}</h3>
                  <p className="text-xs text-brand-text/60 font-light leading-relaxed mb-6">
                    {card1.description}
                  </p>
                  <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-brand-text font-semibold group-hover:text-brand-accent transition-colors duration-300">
                    <span className="relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-brand-text group-hover:after:bg-brand-accent after:transition-colors">
                      Discover The Collection
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform stroke-[1.5]" />
                  </div>
                </div>

              </Link>
            </motion.div>
          </div>

          {/* Card 2: Right Column - Staggered & Overlapping Collage */}
          <div className="lg:col-span-5 pt-20 lg:pt-48">
            <motion.div 
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative group cursor-pointer"
            >
              <Link to={card2.productIds && card2.productIds.length > 0 ? `/products?trending=${card2.id}` : "/products?category=evening"} className="block relative">
                
                {/* Main Image Container */}
                <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-brand-pale shadow-soft group-hover:shadow-float transition-all duration-1000 ease-luxury relative z-10">
                  <div className="absolute inset-0 bg-brand-text/5 group-hover:bg-brand-text/15 transition-colors duration-[1.5s] ease-luxury z-10" />
                  <img loading="lazy" src={card2.mainImage} 
                    alt={card2.title} 
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-luxury group-hover:scale-[1.03]"
                  />
                </div>

                {/* Overlapping Texture Image (Left-hand top overlap) */}
                {card2.textureImage && (
                  <motion.div 
                    className="hidden md:block absolute top-[-10%] left-[-8%] w-[180px] aspect-[3/4] overflow-hidden rounded-sm shadow-float border-4 border-brand-primary z-20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <img loading="lazy" src={card2.textureImage}
                      alt={`${card2.title} Detail`}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-luxury group-hover:scale-105"
                    />
                  </motion.div>
                )}

                {/* Overlapping Glassmorphic Text Card */}
                <div className="absolute bottom-[-40px] left-6 right-6 md:left-auto md:-right-6 md:w-[420px] backdrop-blur-md bg-white/80 border border-white/50 p-8 shadow-float rounded-sm z-30 transition-all duration-700 ease-luxury group-hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] tracking-[0.3em] font-serif text-brand-accent uppercase font-bold">{card2.subtitle}</span>
                    <span className="text-xs font-serif text-brand-text/40">COLLECTION</span>
                  </div>
                  <h3 className="text-3xl font-serif text-brand-text mb-3">{card2.title}</h3>
                  <p className="text-xs text-brand-text/60 font-light leading-relaxed mb-6">
                    {card2.description}
                  </p>
                  <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-brand-text font-semibold group-hover:text-brand-accent transition-colors duration-300">
                    <span className="relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-brand-text group-hover:after:bg-brand-accent after:transition-colors">
                      Discover The Collection
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform stroke-[1.5]" />
                  </div>
                </div>

              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
