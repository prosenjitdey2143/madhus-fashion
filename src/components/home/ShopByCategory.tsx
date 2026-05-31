import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { categoryService } from "../../services/firebase/categoryService"

export function ShopByCategory() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        setCategories(activeCategories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const displayCategories = categories;

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  return (
    <section className="py-12 md:py-16 bg-[#faf9f8] relative">
      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-charcoal">Shop by Category</h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2 mr-4">
              <button onClick={() => scroll('left')} className="p-2 border border-charcoal/20 rounded-full hover:bg-charcoal hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} className="p-2 border border-charcoal/20 rounded-full hover:bg-charcoal hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Link to="/products" className="text-sm font-medium text-charcoal flex items-center gap-2 hover:text-charcoal/70 transition-colors group">
              Browse all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Circular Categories Grid/Scroll */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-8 gap-6 md:gap-8 scrollbar-hide snap-x relative min-h-[200px] -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-charcoal/30 animate-spin" />
            </div>
          ) : displayCategories.map((category, idx) => (
            <motion.div 
              key={category.id || category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group flex flex-col items-center flex-shrink-0 w-[140px] md:w-[180px] snap-start"
            >
              <Link to={category.link} className="block w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-6 bg-secondary/10 shadow-sm group-hover:shadow-md transition-all duration-300">
                <motion.img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </Link>
              
              <Link to={category.link} className="text-center">
                <h3 className="text-base font-semibold text-charcoal group-hover:text-charcoal/70 transition-colors mb-1">
                  {category.title}
                </h3>
                <p className="text-xs text-charcoal/50">
                  {category.items}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
