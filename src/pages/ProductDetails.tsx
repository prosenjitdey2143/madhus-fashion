import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useToast } from "../context/ToastContext"
import { cn } from "../utils/utils"
import { SEO } from "../components/SEO"
import { analyticsService } from "../services/analytics/analyticsService"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useParams } from "react-router-dom"
import { useProduct } from "../hooks/useProducts"
import { ImageMagnifier } from "../ui/ImageMagnifier"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import { RecentlyViewed } from "../components/products/RecentlyViewed"
import { ResponsiveImage } from "../ui/ResponsiveImage"

export function ProductDetails() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(id)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { addItem, setCartOpen } = useCart()
  const { toast } = useToast()
  const { addRecentlyViewed } = useRecentlyViewed()

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  // Size Guide Modal state
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  // Image Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Mobile Sticky Cart State
  const [showMobileStickyCart, setShowMobileStickyCart] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky cart after scrolling past the first screen height
      if (window.scrollY > window.innerHeight * 0.7) {
        setShowMobileStickyCart(true)
      } else {
        setShowMobileStickyCart(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const handlePrevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  useEffect(() => {
    if (product && !loading && !error) {
      analyticsService.productView(product);

      addRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.images[0],
        badge: product.stock === 0 ? "OUT OF STOCK" : product.discount ? "SALE" : product.newArrival ? "NEW" : product.bestSeller ? "BESTSELLER" : undefined
      });
    }
  }, [product, loading, error, addRecentlyViewed]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast("Please select a size before adding to bag", "error")
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      size: selectedSize,
      quantity: 1,
      weight: product.weight || 0.5, // Fallback to 0.5kg if weight is not set
      imageUrl: product.images[0]
    })

    toast(`${product.name} added to your bag`, "success")
    setCartOpen(true)
  }

  // Generate Structured Data (JSON-LD) for Google
  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images[0],
    "description": product.description || `Buy ${product.name}.`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Madhus Fashion"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  } : undefined

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-32 max-w-7xl min-h-screen pt-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 flex flex-col gap-4">
             <div className="aspect-[3/4] w-full bg-brand-pale animate-pulse"></div>
          </div>
          <div className="lg:col-span-5 flex flex-col space-y-6 pt-8">
             <div className="w-3/4 h-12 bg-brand-pale animate-pulse" />
             <div className="w-1/4 h-6 bg-brand-pale animate-pulse" />
             <div className="w-full h-32 bg-brand-pale animate-pulse mt-8" />
             <div className="w-full h-12 bg-brand-pale animate-pulse mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-brand-text mb-4">Product Not Found</h2>
          <p className="text-[13px] text-brand-text/60 font-light mb-8">We couldn't find the piece you're looking for.</p>
          <button 
            className="text-[11px] uppercase tracking-[0.2em] border-b border-brand-text pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors"
            onClick={() => window.history.back()}
          >
            Return to Collection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-primary pt-[40px] pb-24 lg:pb-0">
      <SEO 
        title={product.name}
        description={product.description || `Shop ${product.name}.`}
        image={product.images[0]}
        url={window.location.href}
        schema={productSchema}
      />

      {/* Sticky Mobile Add to Bag Bar */}
      <AnimatePresence>
        {showMobileStickyCart && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-brand-text/10 p-4 z-50 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-brand-text truncate uppercase tracking-widest">{product.name}</span>
              <span className="text-xs text-brand-text/60 mt-0.5">₹{product.price.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-brand-text text-brand-primary text-[10px] uppercase tracking-widest px-8 py-3.5 hover:bg-brand-text/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 font-bold"
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto lg:px-8 pt-0 pb-0 lg:pt-0 lg:pb-12 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 xl:gap-12">
          
          {/* Mobile Image Carousel */}
          <div className="lg:hidden w-full relative mb-8">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-[75vh]">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-full shrink-0 snap-center h-full relative">
                  <ResponsiveImage src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
              {product.images.map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-md" />
              ))}
            </div>
          </div>

          {/* Desktop Image Viewer */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col items-center gap-4 h-[calc(100vh-60px)]">
            <div className="h-[calc(100%-80px)] aspect-[3/4] bg-brand-pale shrink-0 w-auto">
              <ImageMagnifier 
                src={product.images[currentImageIndex]} 
                alt={`${product.name} View ${currentImageIndex + 1}`} 
                zoomLevel={2.5}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide h-[84px] shrink-0 w-full justify-center">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "h-full aspect-[3/4] shrink-0 bg-brand-pale overflow-hidden border transition-all duration-300",
                      currentImageIndex === idx 
                        ? "border-brand-text opacity-100" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <ResponsiveImage src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info (Sticky) */}
          <div className="lg:col-span-7 xl:col-span-7 relative px-4 lg:px-0 mt-8 lg:mt-0">
            <div className="sticky top-[104px] flex flex-col pb-12">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                 {product.stock === 0 && <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-1 bg-brand-text text-brand-primary font-medium">Out of Stock</span>}
                 {product.newArrival && <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-1 bg-brand-primary border border-brand-text/10 text-brand-text font-medium">New Season</span>}
                 {product.discount && <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-1 text-error bg-error/5 font-medium">Sale</span>}
              </div>

              {/* Title & Price */}
              <div className="mb-6">
                <h1 className="text-3xl lg:text-4xl font-serif text-brand-text mb-2 leading-[1.1] tracking-tighter">{product.name}</h1>
                <div className="flex items-end gap-3 mt-4">
                  <span className="text-lg font-medium text-brand-text">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-brand-text/40 line-through mb-0.5">₹{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-[11px] text-brand-text/70 font-light leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Warning */}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="mb-6 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-error font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                  Limited Availability — {product.stock} Remaining
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3 text-[9px] uppercase tracking-[0.2em]">
                  <span className="text-brand-text font-bold">Select Size</span>
                  <button 
                    onClick={() => setShowSizeGuide(true)} 
                    className="text-brand-text/50 hover:text-brand-text transition-colors underline underline-offset-4"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const isAvailable = product.sizes.includes(size);
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button 
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={cn(
                          "h-10 border flex items-center justify-center text-[10px] uppercase tracking-wider transition-all duration-300 font-medium relative",
                          !isAvailable 
                            ? "border-brand-text/5 text-brand-text/30 cursor-not-allowed bg-brand-text/5"
                            : isSelected 
                              ? "border-brand-text bg-brand-text text-brand-primary shadow-sm" 
                              : "border-brand-text/15 hover:border-brand-text/40 text-brand-text bg-transparent"
                        )}
                      >
                        {size}
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <div className="w-[150%] h-[1px] bg-brand-text/20 rotate-12" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-brand-text text-brand-primary text-[10px] font-bold uppercase tracking-[0.2em] py-4 hover:bg-brand-text/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>

              {/* Accordions */}
              <div className="border-t border-brand-text/10 pt-1 space-y-0">
                
                {/* Shipping Accordion */}
                <div className="border-b border-brand-text/10">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                    className="w-full py-4 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-brand-text hover:text-brand-accent transition-colors"
                  >
                    <span>Delivery & Returns</span>
                    <span className="text-base font-light">{openAccordion === "shipping" ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "shipping" && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 text-[11px] text-brand-text/70 font-light leading-relaxed space-y-3">
                          <p>Free express shipping on all orders over ₹10000. Delivered securely in our signature branded packaging.</p>
                          <p>Enjoy a complimentary 14-day return or exchange window from the date of delivery.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-primary/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-primary border border-brand-text/10 p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 text-brand-text/50 hover:text-brand-text text-2xl font-light leading-none"
              >
                &times;
              </button>
              <h2 className="text-2xl font-serif text-brand-text mb-6">Size Guide</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] uppercase tracking-widest">
                  <thead>
                    <tr className="border-b border-brand-text/20">
                      <th className="py-3 font-bold text-brand-text">Size</th>
                      <th className="py-3 font-bold text-brand-text">Bust (in)</th>
                      <th className="py-3 font-bold text-brand-text">Waist (in)</th>
                      <th className="py-3 font-bold text-brand-text">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-brand-text/70">
                    <tr className="border-b border-brand-text/10">
                      <td className="py-3 font-bold text-brand-text">XS</td>
                      <td className="py-3">32</td>
                      <td className="py-3">26</td>
                      <td className="py-3">36</td>
                    </tr>
                    <tr className="border-b border-brand-text/10">
                      <td className="py-3 font-bold text-brand-text">S</td>
                      <td className="py-3">34</td>
                      <td className="py-3">28</td>
                      <td className="py-3">38</td>
                    </tr>
                    <tr className="border-b border-brand-text/10">
                      <td className="py-3 font-bold text-brand-text">M</td>
                      <td className="py-3">36</td>
                      <td className="py-3">30</td>
                      <td className="py-3">40</td>
                    </tr>
                    <tr className="border-b border-brand-text/10">
                      <td className="py-3 font-bold text-brand-text">L</td>
                      <td className="py-3">38</td>
                      <td className="py-3">32</td>
                      <td className="py-3">42</td>
                    </tr>
                    <tr className="border-b border-brand-text/10">
                      <td className="py-3 font-bold text-brand-text">XL</td>
                      <td className="py-3">40</td>
                      <td className="py-3">34</td>
                      <td className="py-3">44</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-brand-text">XXL</td>
                      <td className="py-3">42</td>
                      <td className="py-3">36</td>
                      <td className="py-3">46</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-brand-text/50 mt-8 font-light leading-relaxed">
                * Indian standard sizing. Measurements are in inches. If you are between sizes, we recommend sizing up for a more comfortable fit.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {product && <RecentlyViewed currentProductId={product.id} />}
    </div>
  )
}
