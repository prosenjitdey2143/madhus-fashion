import { Link } from "react-router-dom"
import { Globe } from "lucide-react"

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-brand-text text-brand-primary pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Story */}
          <div className="md:col-span-12 lg:col-span-4">
            <Link to="/" className="text-3xl font-serif text-brand-primary tracking-tight mb-6 block leading-none">
              Madhus Fashion
            </Link>
            <p className="text-brand-primary/60 text-sm leading-relaxed max-w-sm mb-8 font-light">
              Elevating everyday elegance. Discover our curated collection of luxury women's dresses designed to inspire confidence and timeless beauty.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-brand-primary/60 hover:text-brand-accent transition-colors"><InstagramIcon className="w-5 h-5 stroke-[1.5]" /></a>
              <a href="#" className="text-brand-primary/60 hover:text-brand-accent transition-colors"><FacebookIcon className="w-5 h-5 stroke-[1.5]" /></a>
              <a href="#" className="text-brand-primary/60 hover:text-brand-accent transition-colors"><TwitterIcon className="w-5 h-5 stroke-[1.5]" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 lg:col-span-2 lg:col-start-6">
            <h4 className="font-serif text-lg mb-6 text-brand-primary">Explore</h4>
            <ul className="space-y-4 text-[13px] text-brand-primary/60">
              <li><Link to="/products" className="hover:text-brand-accent transition-colors">Shop All</Link></li>
              <li><Link to="/products?category=new" className="hover:text-brand-accent transition-colors">New Arrivals</Link></li>
              <li><Link to="/products?category=best" className="hover:text-brand-accent transition-colors">Best Sellers</Link></li>
              <li><Link to="/products?category=collections" className="hover:text-brand-accent transition-colors">Collections</Link></li>

            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-serif text-lg mb-6 text-brand-primary">Assistance</h4>
            <ul className="space-y-4 text-[13px] text-brand-primary/60">
              <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-brand-accent transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="hover:text-brand-accent transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="hover:text-brand-accent transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-serif text-lg mb-6 text-brand-primary">The Insider</h4>
            <p className="text-[13px] text-brand-primary/60 mb-6 font-light leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and editorial content.
            </p>
            <form className="flex flex-col space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent border-b border-brand-primary/20 pb-2 px-0 text-sm focus:outline-none focus:border-brand-accent text-brand-primary placeholder:text-brand-primary/40 transition-colors"
              />
              <button type="submit" className="text-[11px] uppercase tracking-[0.2em] text-brand-text bg-brand-primary py-3 px-6 hover:bg-brand-accent hover:text-brand-primary transition-colors w-max mt-2">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 text-brand-primary/40">
            <Globe className="w-4 h-4 stroke-[1.5]" />
            <span className="text-[11px] uppercase tracking-widest">India / INR</span>
          </div>
          
          <p className="text-[11px] text-brand-primary/40 tracking-wider">
            &copy; {new Date().getFullYear()} MADHUS FASHION. ALL RIGHTS RESERVED.
          </p>
          
          <div className="flex space-x-6 text-[11px] uppercase tracking-widest text-brand-primary/40">
            <Link to="/privacy" className="hover:text-brand-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
