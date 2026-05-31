import { Outlet, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { MiniCart } from "./MiniCart"
import { WishlistSidebar } from "../components/wishlist/WishlistSidebar"
import { SmoothScroll } from "./SmoothScroll"


export function MainLayout() {
  const location = useLocation()

  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen relative z-10 selection:bg-brand-accent/20">

        <Navbar />
        <MiniCart />
        <WishlistSidebar />
        <motion.main
          key={location.pathname} className="flex-grow pt-20" // Add padding top to account for fixed navbar
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
