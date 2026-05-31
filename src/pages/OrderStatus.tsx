import { useState, useEffect } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, SearchX } from "lucide-react"
import { orderService } from "../services/firebase/orderService"
import type { Order } from "../types"
import { OrderTimeline } from "../components/tracking/OrderTimeline"
import { OrderSummaryCard } from "../components/tracking/OrderSummaryCard"
import { Button } from "../ui/Button"

export function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get("email")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      setError("")
      
      const data = await orderService.getOrderById(id)
      
      if (!data) {
        setError("We couldn't find an order with that ID.")
        return
      }

      // Basic Privacy Check: Verify email matches if provided
      if (emailParam && data.customerInfo.email.toLowerCase() !== emailParam.toLowerCase()) {
        setError("The email provided does not match our records for this order.")
        return
      }

      setOrder(data)
    } catch (err) {
      console.error(err)
      setError("Unable to load order details at this time. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-5xl animate-pulse space-y-8">
          <div className="h-8 w-32 bg-charcoal/10 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-charcoal/5" />
            <div className="space-y-8">
              <div className="h-64 bg-white rounded-xl border border-charcoal/5" />
              <div className="h-64 bg-white rounded-xl border border-charcoal/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-secondary/30 pt-32 pb-24 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-charcoal/5 text-center max-w-md w-full mx-4">
          <SearchX className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-charcoal mb-3">Order Not Found</h2>
          <p className="text-charcoal/60 mb-8">{error}</p>
          <Link to="/track-order">
            <Button className="w-full shadow-soft-hover">Try Again</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30 pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="space-y-8">
          
          <div>
            <Link to="/track-order" className="inline-flex items-center text-sm text-charcoal/50 hover:text-charcoal transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tracking
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal">Track Your Order</h1>
            <p className="text-charcoal/60 mt-2">View the current status and timeline of your delivery.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Timeline Column */}
            <div className="lg:col-span-2">
              <OrderTimeline order={order} />
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-1">
              <OrderSummaryCard order={order} />
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
