import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { collectionService } from "../../services/firebase/collectionService"

const DEFAULT_COLLECTIONS = [
  {
    title: "The Diwali Edit",
    description: "Gleam in opulent hand-woven silk sarees and gold embroidered outfits made for festive nights.",
    image: "/diwali_lookbook.png",
    link: "/products?collection=diwali"
  },
  {
    title: "Durga Puja Couture",
    description: "Bespoke crimson and classic ivory ensembles tailored for spectacular cultural celebration rituals.",
    image: "/durgapuja_lookbook.png",
    link: "/products?collection=durgapuja"
  },
  {
    title: "Holika Milan Edit",
    description: "Bask in soft pastel muslins and light organzas decorated with floral hues for Holi celebrations.",
    image: "/holi_lookbook.png",
    link: "/products?collection=holi"
  },
  {
    title: "Eid Luxury Selection",
    description: "Exquisite Anarkalis, tailored fusion wear, and premium pastel pieces crafted for celebratory dinners.",
    image: "/eid_lookbook.png",
    link: "/products?collection=eid"
  },
  {
    title: "Bhai Dooj Specials",
    description: "Elegant, semi-formal traditional wear to celebrate sacred familial bonds and classic customs.",
    image: "/bhaidudh_lookbook.png",
    link: "/products?collection=bhaidudh"
  },
  {
    title: "Winter Solstice Edit",
    description: "Stay warm in structured cashmere trench coats, fine wool shawls, and premium seasonal layers.",
    image: "/winter_lookbook.png",
    link: "/products?collection=winter"
  },
  {
    title: "Nightfall Party Styles",
    description: "Command the room in structured evening blazers, liquid satins, and shimmering party coordinates.",
    image: "/party_lookbook.png",
    link: "/products?collection=party"
  },
  {
    title: "Office Elegance",
    description: "Sharp contemporary tailoring and sophisticated matching coordinates for effortless workplace styling.",
    image: "/office_lookbook.png",
    link: "/products?collection=office"
  },
  {
    title: "Sun-Drenched Picnic",
    description: "Flowy, relaxed linen dresses and sunhat-ready floral prints crafted for blissful outdoor afternoons.",
    image: "/picnic_lookbook.png",
    link: "/products?collection=picnic"
  }
]

export function CollectionsSection() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollections() {
      try {
        const activeCollections = await collectionService.getActiveCollections();
        setCollections(activeCollections);
      } catch (err) {
        console.error("Failed to fetch lookbook collections", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  const displayCollections = collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

  return (
    <section className="py-16 md:py-24 bg-[#faf9f8] relative min-h-[300px]">
      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-accent mb-4 block font-semibold">
              Curated Lookbooks
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-charcoal leading-tight">
              Our Collections
            </h2>
          </div>
          
          <div className="mt-8 md:mt-0 pb-2">
            <Link 
              to="/products?category=collections" 
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-charcoal hover:text-charcoal/70 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-charcoal/20 after:origin-right hover:after:origin-left hover:after:scale-x-0 after:transition-transform after:duration-500"
            >
              Discover All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* Collections Editorial Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-charcoal/30 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-[300px] md:auto-rows-[400px]">
            {displayCollections.map((collection, idx) => {
              const isFeatured = idx === 0;
              const gridClasses = isFeatured 
                ? "md:col-span-2 lg:col-span-2 row-span-2" 
                : "col-span-1 row-span-1";

              return (
                <motion.div 
                  key={collection.id || collection.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className={`group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-700 ${gridClasses}`}
                >
                  <Link to={collection.link} className="block w-full h-full relative">
                    <img 
                      src={collection.image} 
                      alt={collection.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-luxury group-hover:scale-110"
                    />
                    
                    {/* Smooth Gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                    {/* Top Badge for Featured */}
                    {isFeatured && (
                      <div className="absolute top-6 left-6 z-20">
                        <span className="bg-accent text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full shadow-md">
                          Featured Selection
                        </span>
                      </div>
                    )}

                    {/* Content Box (No Glassmorphism) */}
                    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-6 md:p-8">
                      <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                        <div className="flex justify-between items-end gap-4">
                          <div className="flex-1">
                            <h3 className={`font-serif text-white mb-2 ${isFeatured ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'}`}>
                              {collection.title}
                            </h3>
                            {isFeatured && (
                              <p className="text-white/90 text-sm md:text-base font-light max-w-md hidden md:block mt-4">
                                {collection.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Animated Button */}
                          <div className="bg-white text-charcoal p-3 md:px-6 md:py-3 rounded-full opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:bg-charcoal hover:text-white">
                            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Shop Now</span>
                            <ArrowRight className="w-5 h-5 stroke-[2]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  )
}
