import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import Lenis from "lenis"
import { useLocation } from "react-router-dom"

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const location = useLocation()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.5, // Reduced from 1.2s to 0.5s to fix "laggy" feeling
      easing: (t) => 1 - Math.pow(1 - t, 4), // Snappier easeOutQuart
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.5, // Scroll slightly further per tick for better responsiveness
      touchMultiplier: 2,
    })
    
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Reset scroll position on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return <>{children}</>
}
