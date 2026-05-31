import React, { createContext, useContext, useState, useEffect } from "react"

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isWishlistOpen, setWishlistOpen] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("madhus_wishlist")
      if (stored) {
        setWishlistIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load wishlist", e)
    }
  }, [])

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("madhus_wishlist", JSON.stringify(wishlistIds))
  }, [wishlistIds])

  const addToWishlist = (productId: string) => {
    setWishlistIds(prev => {
      if (prev.includes(productId)) return prev
      return [...prev, productId]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistIds(prev => prev.filter(id => id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId)
  }

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        isWishlistOpen,
        setWishlistOpen
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
