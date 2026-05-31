import { useEffect } from "react"
import { X, ShoppingBag, Trash2, Heart } from "lucide-react"
import { useWishlist } from "../../context/WishlistContext"
import { useProducts } from "../../hooks/useProducts"
import { Link } from "react-router-dom"
import { Button } from "../../ui/Button"
import { cn } from "../../utils/utils"
import { motion, AnimatePresence } from "framer-motion"

export function WishlistSidebar() {
  const { isWishlistOpen, setWishlistOpen, wishlistIds, removeFromWishlist } = useWishlist()
  const { products } = useProducts()

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isWishlistOpen])

  // Get full product objects for the saved IDs
  const savedProducts = products.filter(p => wishlistIds.includes(p.id))

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
            onClick={() => setWishlistOpen(false)}
          />

          {/* Sidebar Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col"
          >
            {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-charcoal/10 shrink-0">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-brand-text fill-brand-text" />
            <h2 className="text-xl font-serif text-brand-text">Your Wishlist</h2>
          </div>
          <button 
            onClick={() => setWishlistOpen(false)}
            className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-brand-text/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FDFBF9]">
          {savedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-brand-text/40" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-serif text-brand-text">Your wishlist is empty</p>
                <p className="text-sm text-brand-text/60 max-w-[250px]">
                  Save your favorite items here to review and purchase them later.
                </p>
              </div>
              <Button onClick={() => setWishlistOpen(false)} className="mt-8 uppercase tracking-wider text-xs">
                Explore Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {savedProducts.map((product) => (
                <div key={product.id} className="flex gap-4 bg-white p-3 border border-charcoal/5 shadow-sm relative group">
                  <Link 
                    to={`/products/${product.id}`} 
                    onClick={() => setWishlistOpen(false)}
                    className="w-24 aspect-[3/4] shrink-0 bg-secondary/10 overflow-hidden"
                  >
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                  </Link>
                  
                  <div className="flex-1 py-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-brand-text/40 font-semibold mb-1 block">
                          {product.category}
                        </span>
                        <Link 
                          to={`/products/${product.id}`} 
                          onClick={() => setWishlistOpen(false)}
                          className="text-sm font-medium text-brand-text hover:text-brand-accent transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                      
                      <button 
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-1.5 text-brand-text/30 hover:text-red-500 transition-colors bg-white rounded-full hover:bg-red-50"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="font-medium text-brand-text">
                        {product.discount && product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-brand-accent text-sm">₹{product.price.toLocaleString()}</span>
                            <span className="text-[10px] text-brand-text/40 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-sm">₹{product.price.toLocaleString()}</span>
                        )}
                      </div>
                      
                      <Link 
                        to={`/products/${product.id}`}
                        onClick={() => setWishlistOpen(false)} 
                        className="text-[10px] uppercase tracking-widest font-semibold bg-brand-text text-white px-4 py-2 hover:bg-brand-accent transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-6 border-t border-charcoal/10 bg-white shrink-0">
            <p className="text-[10px] text-center text-brand-text/50 uppercase tracking-widest leading-relaxed">
              Items saved locally on this device.
            </p>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}
