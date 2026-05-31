import { useEffect, useState } from "react"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // If target is a link, button, or has a specific 'cursor-hover' class
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-hover') ||
        target.closest('.cursor-hover')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mousemove", updateHoverState)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mousemove", updateHoverState)
    }
  }, [])

  // Do not render on mobile devices
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return null;
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 w-4 h-4 bg-charcoal rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      />
      <div
        className="fixed top-0 left-0 w-10 h-10 border border-charcoal/30 rounded-full pointer-events-none z-[9998] hidden md:block"
      />
    </>
  )
}
