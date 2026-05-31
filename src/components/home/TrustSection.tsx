import { Package, ShieldCheck, RefreshCw, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const TRUST_ITEMS = [
  {
    icon: Package,
    title: "Complimentary Delivery",
    description: "Free express shipping across India on all orders over ₹10,000, delivered in our signature packaging."
  },
  {
    icon: Sparkles,
    title: "Bespoke Styling",
    description: "Connect with our expert fashion consultants for personalized sizing and ensemble recommendations."
  },
  {
    icon: RefreshCw,
    title: "Effortless Exchanges",
    description: "A seamless 14-day return and exchange policy to ensure your complete satisfaction with every piece."
  },
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    description: "Experience peace of mind with our state-of-the-art encrypted checkout and secure payment gateways."
  }
]

export function TrustSection() {
  return (
    <section className="py-12 md:py-16 bg-brand-primary border-t border-brand-text/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {TRUST_ITEMS.map((item, idx) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 mb-6 flex items-center justify-center text-brand-text">
                <item.icon className="w-8 h-8 stroke-[1]" />
              </div>
              <h3 className="font-serif text-lg text-brand-text mb-3">{item.title}</h3>
              <p className="text-[13px] text-brand-text/60 font-light leading-relaxed max-w-xs">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
