import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useProducts } from "../../hooks/useProducts"
import { ProductCard } from "../../ui/ProductCard"
import { ProductCardSkeleton } from "../../ui/Skeleton"

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

export function NewArrivals() {
  const { products, loading } = useProducts()
  const sliderRef = useRef<HTMLDivElement>(null)
  
  // Get products explicitly marked as "New Arrival", fallback to newest 8
  let newProducts = products?.filter(p => p.newArrival) || [];
  if (newProducts.length === 0) {
    newProducts = products?.slice(0, 8) || [];
  } else {
    newProducts = newProducts.slice(0, 10);
  }

  const isSlider = newProducts.length > 4;

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('[data-card]')?.clientWidth || 300;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  return (
    <section className="py-10 md:py-12 bg-[#FDFBF9]">
      <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-charcoal/60 mb-4 block font-medium">
              Curated Selection
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-charcoal leading-tight">
              Just Landed
            </h2>
          </div>
          
          <div className="mt-8 md:mt-0 pb-2 flex items-center gap-6">
            {isSlider && !loading && (
              <div className="flex gap-2">
                <button 
                  onClick={() => scroll('left')} 
                  className="p-2 border border-charcoal/20 rounded-full hover:bg-charcoal hover:text-white transition-colors"
                  aria-label="Previous Products"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scroll('right')} 
                  className="p-2 border border-charcoal/20 rounded-full hover:bg-charcoal hover:text-white transition-colors"
                  aria-label="Next Products"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            <Link 
              to="/products?category=new" 
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-charcoal hover:text-charcoal/70 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-charcoal/20 after:origin-right hover:after:origin-left hover:after:scale-x-0 after:transition-transform after:duration-500"
            >
              Discover More
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Product Slider / Grid Container */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full">
                <ProductCardSkeleton />
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
            {newProducts.map((product, idx) => (
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
                  badge={idx === 0 ? "NEW" : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
