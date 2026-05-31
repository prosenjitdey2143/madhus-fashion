import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Package, ArrowRight } from "lucide-react"
import { Button } from "../ui/Button"

export function TrackOrder() {
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!orderId.trim()) {
      setError("Please enter your Order ID.")
      return
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    // Pass email as a URL parameter for basic validation on the next page
    navigate(`/order-status/${encodeURIComponent(orderId.trim())}?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <div className="min-h-screen bg-secondary/30 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-lg">
        
        <div
          className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-charcoal/5"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-charcoal/60" />
            </div>
            <h1 className="text-3xl font-serif text-charcoal mb-3">Track Your Order</h1>
            <p className="text-charcoal/60">Enter your order details below to check the real-time status of your delivery.</p>
          </div>

          <form onSubmit={handleTrack} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-charcoal/70 mb-1.5">
                  Order ID
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. MF-2026-ABCDE"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal/70 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Used during checkout"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-charcoal/40 mt-2 ml-1">For security, please verify the email associated with this order.</p>
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-base mt-4 shadow-soft-hover">
              Track Order <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
