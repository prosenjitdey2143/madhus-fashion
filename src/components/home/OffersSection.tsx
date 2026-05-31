import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useProducts } from "../../hooks/useProducts"
import { ProductCard } from "../../ui/ProductCard"
import { offerService } from "../../services/firebase/offerService"
import type { Offer } from "../../types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

export function OffersSection() {
  const { products, loading: productsLoading } = useProducts()
  const sliderRef = useRef<HTMLDivElement>(null)

  const [activeOffer, setActiveOffer] = useState<Offer | null>(null)
  const [offerLoading, setOfferLoading] = useState(true)

  // Fetch the top-priority active offer
  useEffect(() => {
    async function loadOffer() {
      try {
        const offers = await offerService.getActiveOffers()
        setActiveOffer(offers[0] || null)
      } catch (err) {
        console.error("Failed to load active offer", err)
      } finally {
        setOfferLoading(false)
      }
    }
    loadOffer()
  }, [])

  const loading = productsLoading || offerLoading

  // Determine which products to show
  let offerProducts = (() => {
    if (!products || products.length === 0) return []

    // 1. Campaign has hand-picked products → show exactly those
    if (activeOffer?.productIds && activeOffer.productIds.length > 0) {
      const pinned = activeOffer.productIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean) as typeof products
      if (pinned.length > 0) return pinned
    }

    // 2. Products with a real discount (originalPrice > price)
    const discounted = products.filter(p => p.originalPrice && p.originalPrice > p.price)
    if (discounted.length > 0) return discounted.slice(0, 4)

    // 3. Fallback: just show the first 4 real products from the database
    return products.slice(0, 4)
  })()

  const isSlider = offerProducts.length > 4

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-card]')?.clientWidth || 300
      sliderRef.current.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
    }
  }

  // Campaign header info
  const sectionTitle = activeOffer?.title || "Exclusive Offers"
  const sectionSubtitle = activeOffer?.subtitle || "Limited Promotions"
  const ctaLink = activeOffer?.ctaLink || "/products?category=offers"
  const discountBadge = activeOffer?.discount

  return (
    <section className="py-12 md:py-16 bg-[#FCFAF7]">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-semibold">
                {sectionSubtitle}
              </span>
              {discountBadge && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-accent text-white uppercase tracking-wider">
                  Up to {discountBadge}% off
                </span>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-brand-text leading-tight">
              {sectionTitle}
            </h2>
          </div>

          <div className="mt-8 md:mt-0 pb-2 flex items-center gap-6">
            {isSlider && !loading && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 border border-brand-text/20 rounded-full hover:bg-brand-text hover:text-white transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 border border-brand-text/20 rounded-full hover:bg-brand-text hover:text-white transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <Link
              to={ctaLink}
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-brand-text hover:text-brand-text/70 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-text/20 after:origin-right hover:after:origin-left hover:after:scale-x-0 after:transition-transform after:duration-500"
            >
              Shop All Offers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Campaign banner (if offer has description) */}
        {!loading && activeOffer?.description && (
          <motion.div
            className="mb-10 px-6 py-4 rounded-xl flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, rgba(201,168,106,0.1), rgba(231,198,209,0.15))", border: "1px solid rgba(201,168,106,0.2)" }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-brand-accent text-xl">✦</span>
            <p className="text-sm text-brand-text/70 italic">{activeOffer.description}</p>
            {activeOffer.endDate && (
              <span className="ml-auto text-xs text-brand-text/40 whitespace-nowrap">
                Ends {new Date(activeOffer.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </motion.div>
        )}

        {/* Product grid / slider */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary/20 rounded-md aspect-[3/4] mb-4 w-full" />
                <div className="h-4 bg-secondary/20 rounded w-2/3 mb-2" />
                <div className="h-4 bg-secondary/20 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            ref={sliderRef}
            className={`flex ${
              isSlider
                ? "overflow-x-auto scrollbar-hide snap-x relative -mx-4 px-4 md:mx-0 md:px-0"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            } gap-8 pb-8`}
            style={isSlider ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {offerProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                data-card
                className={isSlider ? "w-[280px] sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] flex-shrink-0 snap-start" : "w-full"}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  imageUrl={product.images?.[0]}
                  badge="SALE"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
