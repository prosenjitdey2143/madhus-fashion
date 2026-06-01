import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useProducts } from "../../hooks/useProducts"
import { ProductCard } from "../../ui/ProductCard"

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
}

export function BestSellers() {
  const { products, loading } = useProducts()
  const sliderRef = useRef<HTMLDivElement>(null)
  
  // Get products explicitly marked as "Best Seller", fallback to top 8 products
  let sellerProducts = products?.filter(p => p.bestSeller) || [];
  if (sellerProducts.length === 0) {
    sellerProducts = products?.slice(2, 10) || [];
  } else {
    sellerProducts = sellerProducts.slice(0, 10);
  }

  const isSlider = sellerProducts.length > 4;

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-card]')?.clientWidth || 300;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  return (
    <section className="py-12 md:py-16 bg-[#FAF8F5]">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-brand-accent mb-4 block font-semibold">
              Most Coveted
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-brand-text leading-tight">
              Best Sellers
            </h2>
          </div>
          
          <div className="mt-8 md:mt-0 pb-2 flex items-center gap-6">
            {isSlider && !loading && (
              <div className="flex gap-2">
                <button 
                  onClick={() => scroll('left')} 
                  className="p-2 border border-brand-text/20 rounded-full hover:bg-brand-text hover:text-white transition-colors"
                  aria-label="Previous Best Sellers"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scroll('right')} 
                  className="p-2 border border-brand-text/20 rounded-full hover:bg-brand-text hover:text-white transition-colors"
                  aria-label="Next Best Sellers"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <Link 
              to="/products?category=best-sellers" 
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-brand-text hover:text-brand-text/70 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-text/20 after:origin-right hover:after:origin-left hover:after:scale-x-0 after:transition-transform after:duration-500"
            >
              Shop The Bestsellers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Product Slider / Grid Container */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary/20 rounded-md aspect-[3/4] mb-4 w-full"></div>
                <div className="h-4 bg-secondary/20 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-secondary/20 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            ref={sliderRef}
            className={`flex ${
              isSlider 
                ? "overflow-x-auto scrollbar-hide snap-x relative" 
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            } gap-8 pb-8`}
            style={isSlider ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {sellerProducts.map((product, idx) => (
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
                  badge="BESTSELLER"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
