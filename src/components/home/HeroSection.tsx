import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { offerService } from "../../services/firebase/offerService";

const DEFAULT_SLIDES = [
  {
    subtitle: "Spring / Summer 2026",
    title: "Modern Elegance",
    description: "Quiet luxury essentials designed for the sophisticated woman.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Shop The Edit",
    ctaLink: "/products?category=new"
  },
  {
    subtitle: "Evening Collection",
    title: "Midnight Glamour",
    description: "Make a statement with our new meticulously crafted evening wear.",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1908&auto=format&fit=crop",
    ctaText: "Explore Evening",
    ctaLink: "/products?category=evening"
  },
  {
    subtitle: "Resort Edit",
    title: "Sun-Kissed Silhouettes",
    description: "Breezy linens and effortless styles for your next getaway.",
    image: "https://images.unsplash.com/photo-1515347619152-47535cbd4a2c?q=80&w=2070&auto=format&fit=crop",
    ctaText: "Discover Resort",
    ctaLink: "/products?category=resort"
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const activeOffers = await offerService.getActiveOffers();
        setOffers(activeOffers.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch offers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const SLIDES = offers.length > 0 ? offers.map(offer => ({
    subtitle: offer.subtitle || "New Collection",
    title: offer.title,
    description: offer.description || "",
    image: offer.bannerImage,
    ctaText: offer.ctaText || "Shop Now",
    ctaLink: offer.ctaLink || "/products"
  })) : DEFAULT_SLIDES;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  // Auto-play
  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [SLIDES.length]);

  if (loading) {
    return (
      <section className="relative w-full h-[90vh] md:h-screen bg-brand-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[90vh] md:h-screen bg-brand-primary overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "easeOut" }}
              src={SLIDES[currentSlide].image} 
              alt={SLIDES[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-text/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-text/90 via-brand-text/20 to-transparent" />
          </div>

          {/* Text Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-4 md:px-8">
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] md:text-[13px] uppercase tracking-[0.5em] text-white/90 mb-4 md:mb-6 font-semibold drop-shadow-md"
            >
              {SLIDES[currentSlide].subtitle}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-serif text-white leading-[1.05] mb-6 tracking-tighter drop-shadow-xl"
            >
              {SLIDES[currentSlide].title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm md:text-base text-white/95 mb-8 max-w-xl mx-auto font-light leading-relaxed drop-shadow-md tracking-wide"
            >
              {SLIDES[currentSlide].description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link 
                to={SLIDES[currentSlide].ctaLink} 
                className="group inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-charcoal transition-all duration-500 shadow-xl"
              >
                <span>{SLIDES[currentSlide].ctaText}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute z-20 bottom-24 left-0 right-0 px-8 flex justify-between items-center md:hidden">
         <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm"><ChevronLeft className="w-5 h-5"/></button>
         <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm"><ChevronRight className="w-5 h-5"/></button>
      </div>

      <div className="hidden md:flex absolute z-20 top-1/2 -translate-y-1/2 left-8">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>
      <div className="hidden md:flex absolute z-20 top-1/2 -translate-y-1/2 right-8">
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-500 h-[2px] rounded-full ${currentSlide === idx ? "w-12 bg-white" : "w-6 bg-white/40 hover:bg-white/70"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
