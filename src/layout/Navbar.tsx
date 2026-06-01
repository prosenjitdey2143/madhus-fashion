import { Link, useNavigate } from "react-router-dom"
import { Search, ShoppingBag, Menu, X, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "../utils/utils"
import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"
import { useToast } from "../context/ToastContext"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  { name: "Collections", path: "/products?category=collections" },
  { name: "New Arrivals", path: "/products?category=new" },
  { name: "Best Sellers", path: "/products?category=best-sellers" },
  { name: "Offers", path: "/products?category=offers", highlight: true },

]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { totalItems, setCartOpen } = useCart()
  const { wishlistIds, setWishlistOpen } = useWishlist()
  const { toast } = useToast()

  const handleComingSoon = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    toast("This feature is coming soon!", "info");
    setIsMobileMenuOpen(false);
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full",
          isScrolled ? "bg-brand-primary/95 backdrop-blur-md shadow-sm py-0" : "bg-transparent py-2"
        )}
      >
      <div className="container mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-brand-text p-2 -ml-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex flex-col items-center lg:items-start justify-center absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className="text-2xl lg:text-3xl font-serif text-brand-text tracking-tight leading-none">Madhus Fashion</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7 text-[11px] uppercase tracking-[0.15em] text-brand-text/80 font-medium">
          {NAV_LINKS.map(link => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={cn(
                "hover:text-brand-accent transition-colors duration-300",
                link.highlight && "text-brand-accent"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center space-x-5 lg:space-x-6 text-brand-text">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-brand-accent transition-colors duration-300 hidden md:block">
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button onClick={() => setWishlistOpen(true)} className="hover:text-brand-accent transition-colors duration-300 hidden md:flex items-center gap-2 group relative focus:outline-none">
            <Heart className="w-4 h-4 stroke-[1.5]" />
            <>
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-accent text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                  {wishlistIds.length}
                </span>
              )}
            </>
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => setCartOpen(true)}
            className="hover:text-brand-accent transition-colors duration-300 relative focus:outline-none flex items-center gap-2 group"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            <span className="text-[11px] uppercase tracking-widest hidden md:block group-hover:text-brand-accent">Bag</span>
            <>
              {totalItems > 0 && (
                <span 
                  key={totalItems} className="absolute -top-1.5 -right-2 md:right-auto md:left-2.5 bg-brand-accent text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium"
                >
                  {totalItems}
                </span>
              )}
            </>
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-brand-primary z-50 p-8 flex flex-col shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xl font-serif text-brand-text">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-brand-text stroke-[1.5]" />
                </button>
              </div>
              <nav className="flex flex-col space-y-6 text-xs uppercase tracking-[0.2em] text-brand-text/80 font-medium">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "hover:text-brand-accent transition-colors",
                        link.highlight && "text-brand-accent"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="h-px bg-brand-text/10 my-4" />

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + NAV_LINKS.length * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button onClick={() => { setIsMobileMenuOpen(false); setWishlistOpen(true); }} className="flex items-center gap-3 hover:text-brand-accent text-left w-full">
                    <Heart className="w-4 h-4 stroke-[1.5]" /> Wishlist
                    {wishlistIds.length > 0 && (
                      <span className="bg-brand-accent text-white text-[10px] px-2 py-0.5 rounded-full ml-auto">
                        {wishlistIds.length}
                      </span>
                    )}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + (NAV_LINKS.length + 1) * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }} className="flex items-center gap-3 hover:text-brand-accent text-left">
                    <Search className="w-4 h-4 stroke-[1.5]" /> Search
                  </button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-brand-primary z-[60] flex flex-col"
          >
            <div className="container mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between border-b border-brand-text/10">
              <span className="text-xl font-serif text-brand-text">Search</span>
              <button onClick={() => setIsSearchOpen(false)} className="text-brand-text p-2 hover:text-brand-accent transition-colors">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
            <div className="flex-1 container mx-auto px-4 md:px-8 flex flex-col pt-12 md:pt-24 max-w-3xl">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-brand-text/20 text-2xl md:text-4xl lg:text-5xl font-serif text-brand-text placeholder:text-brand-text/20 pb-4 focus:outline-none focus:border-brand-text transition-colors"
                />
                <button type="submit" className="absolute right-0 bottom-4 text-brand-text hover:text-brand-accent transition-colors">
                  <Search className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
                </button>
              </form>
              <div className="mt-12 flex gap-4 text-[10px] uppercase tracking-widest text-brand-text/50">
                <span>Popular:</span>
                <button onClick={() => { setSearchQuery("Dress"); setTimeout(handleSearch, 0); }} className="hover:text-brand-text transition-colors">Dresses</button>
                <button onClick={() => { setSearchQuery("Silk"); setTimeout(handleSearch, 0); }} className="hover:text-brand-text transition-colors">Silk</button>
                <button onClick={() => { setSearchQuery("Gown"); setTimeout(handleSearch, 0); }} className="hover:text-brand-text transition-colors">Gowns</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
