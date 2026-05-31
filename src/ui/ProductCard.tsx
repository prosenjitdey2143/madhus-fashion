import { Link, useNavigate } from "react-router-dom"
import { cn } from "../utils/utils"
import { ShoppingBag, Heart } from "lucide-react"
import { useWishlist } from "../context/WishlistContext"

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: "NEW" | "SALE" | "BESTSELLER" | "OUT OF STOCK" | "LIMITED EDITION";
  className?: string;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  imageUrl,
  badge,
  className
}: ProductCardProps) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist()
  
  const isSaved = isInWishlist(id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation()
    toggleWishlist(id)
  }

  return (
    <div className={cn("group flex flex-col cursor-pointer", className)}>
      <Link to={`/products/${id}`} className="block relative overflow-hidden aspect-[3/4] mb-4 bg-brand-pale rounded-md">
        
        {/* Subtle Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-700 z-10" />
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4 z-20">
            <span className={cn(
              "text-[10px] font-medium tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm",
              badge === "SALE" ? "bg-red-500/90 text-white" :
              badge === "OUT OF STOCK" ? "bg-charcoal/90 text-white" :
              "bg-white/90 text-charcoal"
            )}>
              {badge}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md shadow-sm bg-white/60 hover:bg-white text-brand-text transition-all duration-300"
        >
          <Heart 
            className={cn("w-4 h-4 transition-colors duration-300", isSaved ? "fill-brand-accent text-brand-accent" : "stroke-[1.5]")} 
          />
        </button>

        {/* Edge-to-Edge Image */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-[1200ms] ease-[0.25,1,0.5,1]"
            />
          ) : (
            <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-charcoal/30">
              No Image
            </div>
          )}
        </div>

        {/* Floating Quick Add Button */}
        <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.25,1,0.5,1]">
          <button 
            disabled={badge === "OUT OF STOCK"}
            onClick={(e) => {
              e.preventDefault();
              if (badge !== "OUT OF STOCK") navigate(`/products/${id}`);
            }}
            className="w-full bg-white/95 backdrop-blur-md text-charcoal font-medium text-[11px] uppercase tracking-widest py-3.5 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-charcoal hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            {badge === "OUT OF STOCK" ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>View Details</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Typography Area */}
      <div className="flex flex-col items-start px-1">
        <Link to={`/products/${id}`} className="font-sans font-medium text-sm text-charcoal mb-1.5 hover:text-charcoal/70 transition-colors line-clamp-1 w-full">
          {name}
        </Link>
        <div className="flex items-center space-x-2 font-sans">
          <p className="font-medium text-sm text-charcoal">₹{price.toFixed(2)}</p>
          {originalPrice && (
            <p className="text-[13px] text-charcoal/50 line-through decoration-charcoal/30">₹{originalPrice.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
