import { motion } from "framer-motion"

const REVIEWS = [
  {
    text: "The quality of the silk is exceptional. It drapes beautifully and feels like a second skin. Truly a luxury experience from unboxing to wearing for my sister's sangeet.",
    author: "Priya S.",
    product: "Midnight Silk Gown"
  },
  {
    text: "I wore this to a Diwali party and received compliments all night. The tailoring is impeccable, perfectly blending modern silhouettes with traditional elegance.",
    author: "Neha M.",
    product: "Crimson Velvet Midi"
  },
  {
    text: "Perfectly understated luxury. The packaging was beautiful, and the fit was exactly as described. Cannot wait to order from the upcoming festive collection again.",
    author: "Anjali K.",
    product: "Organza Puff Sleeve Top"
  }
]

export function SocialProof() {
  return (
    <section className="py-12 md:py-16 bg-brand-pale overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-text/60 mb-4 block font-medium">
            Word of Mouth
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-brand-text">Client Testimonials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-brand-primary p-8 lg:p-12 border border-brand-text/5 text-center flex flex-col h-full"
            >
              <div className="flex justify-center space-x-1 mb-8 text-brand-accent">
                {/* 5 Stars */}
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
              <p className="text-[13px] text-brand-text/80 font-light leading-relaxed mb-8 flex-grow">
                "{review.text}"
              </p>
              <div>
                <p className="font-serif text-brand-text mb-1">{review.author}</p>
                <p className="text-[10px] uppercase tracking-widest text-brand-text/40">{review.product}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
