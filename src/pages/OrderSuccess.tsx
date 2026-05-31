import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { CheckCircle2, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "../ui/Button"
import { orderService } from "../services/firebase/orderService"
import { getWhatsAppRedirectUrl } from "../utils/whatsapp"
import type { Order } from "../types"
import { SEO } from "../components/SEO"
import { analyticsService } from "../services/analytics/analyticsService"

export function OrderSuccess() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    async function fetchOrder() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const fetchedOrder = await orderService.getOrderById(id)
        setOrder(fetchedOrder)
        // Track final conversion
        if (fetchedOrder) {
          analyticsService.purchase(
            id, 
            fetchedOrder.products, 
            fetchedOrder.amount.total, 
            fetchedOrder.amount.shipping
          );
        }
      } catch (error: any) {
        console.error("Failed to load order:", error)
        analyticsService.trackError('OrderSuccess_Load_Failed', error.message || 'Unknown error loading order');
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleWhatsAppRedirect = () => {
    if (order) {
      const url = getWhatsAppRedirectUrl(order)
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="animate-pulse text-charcoal/50">Loading order details...</div>
      </div>
    )
  }

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
      <SEO title="Order Confirmed" noindex={true} />
      <div 
        className="max-w-2xl w-full bg-secondary/5 border border-charcoal/10 rounded-2xl p-8 md:p-16 text-center shadow-sm"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Almost There!</h1>
        <p className="text-lg text-charcoal/70 mb-8 font-light">
          Your order request is saved. To finalize your purchase and help us process it immediately, please send the order details to our WhatsApp.
        </p>

        <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-10 max-w-sm mx-auto shadow-sm">
          <p className="text-sm text-charcoal/50 uppercase tracking-widest mb-2 font-medium">Order Reference</p>
          <p className="text-xl md:text-2xl font-mono text-charcoal font-semibold">{id || "PENDING"}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
          {order && (
            <Button 
              size="lg" 
              className="w-full shadow-soft-hover flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none" 
              onClick={handleWhatsAppRedirect}
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span className="font-semibold text-lg">Send Order on WhatsApp</span>
            </Button>
          )}

          <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2 border-charcoal/20" asChild>
            <Link to="/products">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
