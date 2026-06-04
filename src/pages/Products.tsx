import { useState, useEffect } from "react"
import { ProductCard } from "../ui/ProductCard"
import { SlidersHorizontal, ArrowLeft } from "lucide-react"
import { SEO } from "../components/SEO"
import { useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useProducts } from "../hooks/useProducts"
import { trendingService } from "../services/firebase/trendingService"
import type { TrendingSettings, TrendingCard } from "../types"
import { ProductCardSkeleton } from "../ui/Skeleton"

export function Products() {
  const { products, loading, error } = useProducts()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get("category")
  const collectionParam = searchParams.get("collection")
  const searchParam = searchParams.get("search")
  const trendingParam = searchParams.get("trending")
  
  const [trendingSettings, setTrendingSettings] = useState<TrendingSettings | null>(null)
  const [loadingTrending, setLoadingTrending] = useState(false)

  // Fetch trending data if trending param exists
  useEffect(() => {
    if (trendingParam) {
      setLoadingTrending(true)
      trendingService.getTrendingSettings().then(data => {
        setTrendingSettings(data)
        setLoadingTrending(false)
      }).catch(() => setLoadingTrending(false))
    }
  }, [trendingParam])

  
  const [subFilter, setSubFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  
  let filteredProducts = products.filter(product => {
    if (searchParam) {
      const term = searchParam.toLowerCase();
      return product.name.toLowerCase().includes(term) || 
             (product.description && product.description.toLowerCase().includes(term)) ||
             product.category.toLowerCase().includes(term);
    }
    
    // Filter by trending card products
    if (trendingParam && trendingSettings) {
      const card = trendingSettings.cards.find((c: TrendingCard) => c.id === trendingParam)
      if (card && card.productIds && card.productIds.length > 0) {
        return card.productIds.includes(product.id)
      }
      return false // If card not found or empty, show nothing
    }
    
    // Filter by lookbook collection tag (from CollectionsSection "Explore Lookbook" links)
    if (collectionParam) {
      return product.collections?.includes(collectionParam) || product.collection === collectionParam;
    }

    if (!categoryParam) return true;
    if (categoryParam === "new") return product.newArrival;
    if (categoryParam === "best-sellers") return product.bestSeller;
    if (categoryParam === "offers") return product.discount && product.discount > 0;
    if (categoryParam === "collections") return product.featured;
    
    const normalize = (str?: string) => (str || "").toLowerCase().replace(/[\s-]/g, '');
    const pCat = normalize(product.category);
    const cParam = normalize(categoryParam);
    
    return pCat === cParam || pCat + 's' === cParam || pCat + 'es' === cParam || pCat === cParam + 's' || pCat === cParam + 'es';
  });

  // Apply Sub-filter
  if (subFilter !== "All") {
    const normalize = (str?: string) => (str || "").toLowerCase().replace(/[\s-]/g, '');
    filteredProducts = filteredProducts.filter(p => {
      const pCat = normalize(p.category);
      const sub = normalize(subFilter);
      return pCat === sub || pCat + 's' === sub || pCat + 'es' === sub || pCat === sub + 's' || pCat === sub + 'es';
    });
  }

  // Apply Sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    // Newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Dynamic header text
  let headerTitle = "The Collection";
  let headerSubtitle = "Curated Selection";
  let headerDesc = "Discover our meticulously curated selection of modern pieces, designed to elevate your everyday elegance.";

  if (searchParam) {
    headerTitle = `Results for "${searchParam}"`;
    headerSubtitle = "Search Results";
    headerDesc = "";
  } else if (trendingParam && trendingSettings) {
    const card = trendingSettings.cards.find((c: TrendingCard) => c.id === trendingParam)
    if (card) {
      headerTitle = card.title
      headerSubtitle = "Trending Now"
      headerDesc = card.description
    }
  } else if (collectionParam) {
    // Map collection keys to human-readable names
    const collectionNames: Record<string, { title: string; desc: string }> = {
      diwali: { title: "The Diwali Edit", desc: "Gleam in opulent hand-woven silk sarees and gold embroidered outfits made for festive nights." },
      durgapuja: { title: "Durga Puja Couture", desc: "Bespoke crimson and classic ivory ensembles tailored for spectacular cultural celebration rituals." },
      holi: { title: "Holika Milan Edit", desc: "Bask in soft pastel muslins and light organzas decorated with floral hues for Holi celebrations." },
      eid: { title: "Eid Luxury Selection", desc: "Exquisite Anarkalis, tailored fusion wear, and premium pastel pieces crafted for celebratory dinners." },
      bhaidudh: { title: "Bhai Dooj Specials", desc: "Elegant, semi-formal traditional wear to celebrate sacred familial bonds and classic customs." },
      winter: { title: "Winter Solstice Edit", desc: "Stay warm in structured cashmere trench coats, fine wool shawls, and premium seasonal layers." },
      party: { title: "Nightfall Party Styles", desc: "Command the room in structured evening blazers, liquid satins, and shimmering party coordinates." },
      office: { title: "Office Elegance", desc: "Sharp contemporary tailoring and sophisticated matching coordinates for effortless workplace styling." },
      picnic: { title: "Sun-Drenched Picnic", desc: "Flowy, relaxed linen dresses and sunhat-ready floral prints crafted for blissful outdoor afternoons." },
    };
    const meta = collectionNames[collectionParam];
    headerTitle = meta ? meta.title : collectionParam.charAt(0).toUpperCase() + collectionParam.slice(1);
    headerSubtitle = "Lookbook Collection";
    headerDesc = meta ? meta.desc : `Explore our curated ${collectionParam} lookbook.`;
  } else if (categoryParam === "new") {
    headerTitle = "New Arrivals";
    headerSubtitle = "Fresh Drops";
    headerDesc = "Explore the latest additions to our collection. Be the first to wear our newest designs.";
  } else if (categoryParam === "best-sellers") {
    headerTitle = "Best Sellers";
    headerSubtitle = "Most Loved";
    headerDesc = "Discover the pieces our customers can't get enough of. Timeless classics and modern favorites.";
  } else if (categoryParam === "offers") {
    headerTitle = "Exclusive Offers";
    headerSubtitle = "Limited Time";
    headerDesc = "Exceptional pieces at extraordinary prices. Shop our curated selection of seasonal offers.";
  } else if (categoryParam === "collections") {
    headerTitle = "Featured Collections";
    headerSubtitle = "Editor's Picks";
    headerDesc = "A thoughtfully curated edit of our most standout pieces, chosen by our style editors.";
  } else if (categoryParam) {
    headerTitle = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
    headerSubtitle = "Category";
    headerDesc = `Explore our exquisite collection of ${categoryParam.toLowerCase()}.`;
  }

  return (
    <div className="min-h-screen pb-32 bg-brand-primary pt-[104px]">
      <SEO 
        title={headerTitle}
        description={headerDesc || "Discover our meticulously curated selection of modern pieces."}
      />
      
      {/* Editorial Header */}
      <div className="pt-6 pb-12 md:pt-10 md:pb-16 px-4 text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[11px] uppercase tracking-[0.4em] text-brand-text/50 mb-6 block font-bold">
            {headerSubtitle}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif text-brand-text mb-8 leading-[1.05] tracking-tighter">
            {headerTitle}
          </h1>
          {headerDesc && (
            <p className="text-base md:text-lg text-brand-text/70 font-light leading-relaxed max-w-xl mx-auto tracking-wide">
              {headerDesc}
            </p>
          )}
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 mt-4 lg:flex lg:gap-16">
        
        {/* Sticky Sidebar (Desktop) */}
        <div className="hidden lg:block w-56 shrink-0 sticky top-32 self-start">
          <div className="space-y-12">
            
            {/* Categories */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 font-bold mb-6">Categories</h3>
              <div className="flex flex-col space-y-4 text-sm font-medium text-brand-text/70">
                {["All", "Dresses", "Gowns", "Outerwear"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSubFilter(cat)}
                    className={`text-left relative w-fit transition-colors duration-300 ${subFilter === cat ? "text-brand-text" : "hover:text-brand-text"}`}
                  >
                    {cat === "All" ? "All Pieces" : cat}
                    {subFilter === cat && (
                      <motion.div layoutId="activeCat" className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-text" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 font-bold mb-6">Sort By</h3>
              <div className="flex flex-col space-y-4 text-sm font-medium text-brand-text/70">
                {["Newest", "Price: Low to High", "Price: High to Low"].map(sortOption => (
                  <button 
                    key={sortOption}
                    onClick={() => setSortBy(sortOption)}
                    className={`text-left relative w-fit transition-colors duration-300 ${sortBy === sortOption ? "text-brand-text" : "hover:text-brand-text"}`}
                  >
                    {sortOption}
                    {sortBy === sortOption && (
                      <motion.div layoutId="activeSort" className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-text" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Toolbar */}
        <div className="lg:hidden flex flex-col sm:flex-row justify-between items-center mb-10 space-y-6 sm:space-y-0 border-t border-b border-brand-text/5 py-5">
          <div className="flex items-center space-x-6 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 text-[11px] uppercase tracking-[0.2em] text-brand-text/50 shrink-0 font-semibold">
              {["All", "Dresses", "Gowns", "Outerwear"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSubFilter(cat)}
                  className={`pb-1 transition-colors ${subFilter === cat ? "text-brand-text border-b border-brand-text" : "hover:text-brand-text"}`}
                >
                  {cat === "All" ? "All Pieces" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-brand-text/60 w-full sm:w-auto shrink-0 justify-between sm:justify-end font-semibold">
            <span>Sort By</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-brand-text text-right appearance-none"
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid / Main Content */}
        <div className="flex-1 w-full min-w-0">
          {error ? (
            <div className="py-24 text-center">
              <p className="text-xl font-serif text-brand-text mb-4">Something went wrong</p>
              <p className="text-[13px] text-brand-text/60">{error}</p>
            </div>
          ) : loading || loadingTrending ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 lg:gap-x-8 gap-y-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            collectionParam ? (
              /* ── Lookbook Coming Soon – Highlighted ── */
              <div className="relative overflow-hidden w-full h-full min-h-[60vh] rounded-xl flex items-center justify-center">
                <div
                  className="absolute inset-0 z-0"
                  style={{ background: "linear-gradient(150deg, #FBF9F8 0%, #F8F5F2 50%, #F5EEF0 100%)" }}
                >
                  {/* Blush radial glow centred behind text */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(231,198,209,0.4) 0%, transparent 65%)" }}
                  />

                  {/* Corner gold brackets */}
                  <div className="absolute top-8 left-8 w-8 h-8 border-t-[1.5px] border-l-[1.5px]" style={{ borderColor: "rgba(201,168,106,0.4)" }} />
                  <div className="absolute top-8 right-8 w-8 h-8 border-t-[1.5px] border-r-[1.5px]" style={{ borderColor: "rgba(201,168,106,0.4)" }} />
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-b-[1.5px] border-l-[1.5px]" style={{ borderColor: "rgba(201,168,106,0.4)" }} />
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-b-[1.5px] border-r-[1.5px]" style={{ borderColor: "rgba(201,168,106,0.4)" }} />
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="relative z-10 flex flex-col items-center w-full text-center px-4">
                  {/* Collection eyebrow */}
                  <motion.span
                    className="block text-[9px] uppercase tracking-[0.55em] mb-6 font-semibold"
                    style={{ color: "#C9A86A" }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {headerTitle}
                  </motion.span>

                  {/* ── BIG "COMING SOON" HERO TEXT ── */}
                  <div className="relative mb-10 flex flex-col items-center select-none">
                    {/* Ghost outline layer behind (watermark) */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <span
                        className="font-serif font-bold leading-none"
                        style={{
                          fontSize: "clamp(2.5rem, 8vw, 6rem)",
                          WebkitTextStroke: "1px rgba(201,168,106,0.18)",
                          color: "transparent",
                          letterSpacing: "-0.02em",
                          transform: "scaleY(1.08)",
                        }}
                      >
                        COMING SOON
                      </span>
                    </motion.div>

                    {/* Solid filled main text with champagne shimmer */}
                    <motion.h2
                      className="font-serif font-bold leading-none relative"
                      style={{
                        fontSize: "clamp(2.5rem, 8vw, 6rem)",
                        letterSpacing: "-0.02em",
                        background: "linear-gradient(135deg, #1F1F1F 0%, #3a3a3a 40%, #1F1F1F 60%, #2a2a2a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      COMING SOON
                    </motion.h2>

                    {/* Champagne underline sweep */}
                    <motion.div
                      className="mt-4 h-[2px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, #C9A86A 30%, #E8D5A3 55%, #C9A86A 75%, transparent 100%)",
                        width: "60%",
                      }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  <motion.p
                    className="text-[13px] text-brand-text/50 max-w-[280px] leading-loose italic"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    Our stylists are curating the finest pieces. Something beautiful is on its way.
                  </motion.p>
                </div>
              </div>
            ) : (
            <div className="py-24 text-center w-full">
              <h2 className="text-3xl font-serif text-brand-text mb-4">
                {searchParam ? "No results found" : "Collection is empty"}
              </h2>
              <p className="text-[13px] text-brand-text/50 max-w-sm mx-auto leading-relaxed">
                {searchParam 
                  ? "We couldn't find any pieces matching your search. Try different keywords." 
                  : "We are currently curating new pieces. Check back later."}
              </p>
            </div>
            )
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-4 lg:gap-x-8 gap-y-16"
            >
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  imageUrl={product.images[0]}
                  badge={product.stock === 0 ? 'OUT OF STOCK' : product.discount ? 'SALE' : product.newArrival ? 'NEW' : product.bestSeller ? 'BESTSELLER' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
