import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  CreditCard, 
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ExternalLink,
  ZoomIn,
  X
} from "lucide-react"
import { serverTimestamp } from "firebase/firestore"
import { orderService } from "../../services/firebase/orderService"
import type { Order, CartItem } from "../../types"
import { Button } from "../../ui/Button"
import { ConfirmationModal } from "../../components/admin/ConfirmationModal"

export function AdminOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Verification states
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState<{type: "success" | "error", message: string} | null>(null)
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
    }
  }, [orderId])

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(id)
      if (data) {
        setOrder(data)
      } else {
        setError("Order not found.")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load order details.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (newStatus: Order["orderStatus"]) => {
    if (!order) return
    try {
      setActionLoading(true)
      setFeedback(null)
      
      const payload: Partial<Order> = { orderStatus: newStatus }
      
      if (newStatus === "processing") payload.processingAt = serverTimestamp()
      if (newStatus === "shipped") payload.shippedAt = serverTimestamp()
      if (newStatus === "delivered") payload.deliveredAt = serverTimestamp()
      if (newStatus === "cancelled") payload.cancelledAt = serverTimestamp()
      
      await orderService.updateOrder(order.orderId, payload as any)
      setOrder({ ...order, ...payload })
      
      setFeedback({
        type: "success",
        message: `Order marked as ${newStatus}.`
      })
      
      setCancelModalOpen(false)
    } catch (err) {
      console.error(err)
      setFeedback({
        type: "error",
        message: "Failed to update order status. Please try again."
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePaymentStatus = async (newStatus: Order["paymentStatus"]) => {
    if (!order) return
    try {
      setActionLoading(true)
      setFeedback(null)
      
      const payload: Partial<Order> = { paymentStatus: newStatus }
      
      if (newStatus === "verified") {
        payload.verifiedAt = serverTimestamp()
      }
      
      await orderService.updateOrder(order.orderId, payload as any)
      setOrder({ ...order, ...payload })
      
      setFeedback({
        type: "success",
        message: `Payment successfully ${newStatus}.`
      })
      
      setVerifyModalOpen(false)
      setRejectModalOpen(false)
    } catch (err) {
      console.error(err)
      setFeedback({
        type: "error",
        message: "Failed to update payment status. Please try again."
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-secondary/20 dark:bg-dark-surface rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-secondary/20 dark:bg-dark-surface rounded-xl" />
            <div className="h-96 bg-secondary/20 dark:bg-dark-surface rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-secondary/20 dark:bg-dark-surface rounded-xl" />
            <div className="h-64 bg-secondary/20 dark:bg-dark-surface rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-100 flex flex-col items-center justify-center min-h-[50vh]">
        <XCircle className="w-12 h-12 mb-4 text-red-500/50" />
        <h2 className="text-xl font-serif mb-2">Oops!</h2>
        <p className="mb-6">{error || "Order not found."}</p>
        <Button onClick={() => navigate("/dashboard/orders")} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
          Back to Orders
        </Button>
      </div>
    )
  }

  const creationDate = order.createdAt ? new Date((order.createdAt as any).seconds * 1000) : new Date()

  const StatusBadge = ({ status, type = "order" }: { status: string, type?: "order" | "payment" }) => {
    let classes = "bg-charcoal/5 dark:bg-dark-pill text-charcoal/60 dark:text-dark-muted border-charcoal/10 dark:border-dark-border"
    
    if (type === "order") {
      if (status === "pending" || status === "processing") classes = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
      if (status === "shipped") classes = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
      if (status === "delivered") classes = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
      if (status === "cancelled") classes = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
    } else {
      if (status === "pending" || status === "submitted") classes = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
      if (status === "verified") classes = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
      if (status === "failed" || status === "rejected") classes = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
    }

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider border ${classes}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate("/dashboard/orders")}
            className="flex items-center text-sm text-charcoal/50 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <h1 className="text-3xl font-serif text-charcoal dark:text-dark-text font-medium">{order.orderId}</h1>
            <StatusBadge status={order.orderStatus} />
          </div>
          <p className="text-charcoal/50 dark:text-dark-muted mt-1 text-sm">
            Placed on {creationDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {order.paymentStatus !== "verified" && (
            <Button size="sm" onClick={() => setVerifyModalOpen(true)} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-soft-hover">
              <CheckCircle className="w-4 h-4 mr-2" /> Verify Payment
            </Button>
          )}
          {order.orderStatus === "pending" && order.paymentStatus === "verified" && (
            <Button size="sm" onClick={() => handleUpdateOrderStatus("processing")} className="bg-charcoal hover:bg-charcoal/90 border-none text-white shadow-soft-hover" disabled={actionLoading}>
              <Package className="w-4 h-4 mr-2" /> Mark Processing
            </Button>
          )}
          {order.orderStatus === "processing" && (
            <Button size="sm" onClick={() => handleUpdateOrderStatus("shipped")} className="bg-blue-600 hover:bg-blue-700 border-none text-white shadow-soft-hover" disabled={actionLoading}>
              <Truck className="w-4 h-4 mr-2" /> Mark Shipped
            </Button>
          )}
          {order.orderStatus === "shipped" && (
            <Button size="sm" onClick={() => handleUpdateOrderStatus("delivered")} className="bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-soft-hover" disabled={actionLoading}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark Delivered
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer Info Card */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text border-b border-charcoal/10 dark:border-dark-border pb-4 mb-6">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-charcoal/40 dark:text-dark-muted uppercase tracking-wider text-[10px] font-semibold mb-1">Full Name</p>
                  <p className="font-medium text-charcoal dark:text-dark-text text-base">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-charcoal/40 dark:text-dark-muted uppercase tracking-wider text-[10px] font-semibold mb-1">Contact</p>
                  <div className="space-y-1">
                    {order.customerInfo.phone && (
                      <p className="flex items-center text-charcoal/80 dark:text-dark-muted"><Phone className="w-3.5 h-3.5 mr-2 text-charcoal/40 dark:text-dark-muted" /> {order.customerInfo.phone}</p>
                    )}
                    <p className="flex items-center text-charcoal/80 dark:text-dark-muted"><Mail className="w-3.5 h-3.5 mr-2 text-charcoal/40 dark:text-dark-muted" /> {order.customerInfo.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-charcoal/40 dark:text-dark-muted uppercase tracking-wider text-[10px] font-semibold mb-1">Shipping Address</p>
                  <div className="flex items-start text-charcoal/80 dark:text-dark-muted">
                    <MapPin className="w-4 h-4 mr-2 text-charcoal/40 dark:text-dark-muted mt-0.5 shrink-0" />
                    <div>
                      <p>{order.customerInfo.address}</p>
                      <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.postalCode}</p>
                      <p className="mt-1 font-medium text-charcoal dark:text-dark-text">India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-charcoal/10 dark:border-dark-border">
              <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Order Items <span className="text-sm font-sans font-normal text-charcoal/40 dark:text-dark-muted ml-2">({order.products.length})</span></h2>
            </div>
            <div className="divide-y divide-charcoal/5 dark:divide-dark-border">
              {order.products.map((item: CartItem) => (
                <div key={item.id} className="p-6 md:px-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors">
                  <button 
                    onClick={() => setPreviewImage(item.imageUrl)}
                    className="w-20 h-24 bg-secondary/20 dark:bg-dark-bg rounded flex-shrink-0 relative overflow-hidden border border-charcoal/5 dark:border-dark-border group cursor-zoom-in"
                    title="Click to enlarge image"
                  >
                    <img loading="lazy" src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div className="flex-grow">
                    <Link 
                      to={`/products/${item.productId}`} 
                      target="_blank" 
                      className="font-medium text-charcoal dark:text-dark-text text-lg hover:text-brand-accent transition-colors inline-flex items-center gap-2 group"
                      title="View product on storefront"
                    >
                      {item.name}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brand-accent transition-opacity" />
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-charcoal/60 dark:text-dark-muted">
                      <p>Size: <span className="font-medium text-charcoal dark:text-dark-text">{item.size}</span></p>
                      <div className="w-1 h-1 bg-charcoal/20 dark:bg-dark-border rounded-full" />
                      <p>Qty: <span className="font-medium text-charcoal dark:text-dark-text">{item.quantity}</span></p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 w-full sm:w-auto flex justify-between sm:block border-t border-charcoal/10 dark:border-dark-border sm:border-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                    <span className="sm:hidden text-sm text-charcoal/60 dark:text-dark-muted">Subtotal</span>
                    <div>
                      <p className="font-medium text-charcoal dark:text-dark-text">₹{(item.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-charcoal/40 dark:text-dark-muted mt-1">₹{item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Financial Summary */}
            <div className="p-6 md:p-8 bg-charcoal/[0.02] dark:bg-dark-bg border-t border-charcoal/10 dark:border-dark-border">
              <div className="w-full md:w-1/2 ml-auto space-y-3 text-sm text-charcoal/80 dark:text-dark-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.amount?.subtotal.toFixed(2)}</span>
                </div>
                {order.amount?.savings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount Savings</span>
                    <span>-₹{order.amount?.savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.amount?.shipping === 0 ? "Free" : `₹${order.amount?.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-charcoal/10 dark:border-dark-border pt-3 mt-3 flex justify-between items-center text-lg">
                  <span className="font-serif text-charcoal dark:text-dark-text">Grand Total</span>
                  <span className="font-serif font-medium text-charcoal dark:text-dark-text">₹{order.amount?.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Payment Card */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text border-b border-charcoal/10 dark:border-dark-border pb-4 mb-6">Payment</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 dark:text-dark-muted font-semibold mb-1">Status</p>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 dark:text-dark-muted font-semibold mb-1">Method</p>
                  <div className="flex items-center text-sm font-medium text-charcoal dark:text-dark-text">
                    <CreditCard className="w-4 h-4 mr-1.5 text-charcoal/60 dark:text-dark-muted" />
                    {order.paymentMethod || "UNKNOWN"}
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {feedback && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <p>{feedback.message}</p>
                </div>
              )}

              {/* Action Buttons for Payment */}
              {order.paymentStatus !== 'verified' && (
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-charcoal/10 dark:border-dark-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setRejectModalOpen(true)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs dark:border-red-900 dark:hover:bg-red-950"
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setVerifyModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 border-none text-white text-xs shadow-soft-hover"
                    disabled={actionLoading}
                  >
                    Verify
                  </Button>
                </div>
              )}

              {/* Payment Proof Viewer */}
              <div className="pt-4 border-t border-charcoal/10 dark:border-dark-border">
                <p className="text-[10px] uppercase tracking-wider text-charcoal/40 dark:text-dark-muted font-semibold mb-3">Payment Proof</p>
                <div className="h-32 rounded-lg border border-dashed border-charcoal/20 dark:border-dark-border bg-secondary/5 dark:bg-dark-pill flex flex-col items-center justify-center text-charcoal/60 dark:text-dark-muted px-4 text-center">
                  <Package className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium text-charcoal dark:text-dark-text">Verify via WhatsApp</p>
                  <p className="text-xs mt-1 text-charcoal/40 dark:text-dark-muted">Customers are instructed to send their payment screenshot directly to your business WhatsApp number.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text border-b border-charcoal/10 dark:border-dark-border pb-4 mb-6">Timeline</h2>
            
            <div className="relative border-l-2 border-charcoal/10 dark:border-dark-border ml-3 space-y-8 mt-2 pb-2">
              
              {/* Created */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-charcoal dark:bg-dark-text rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1E1E1E]" />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-dark-text">Order Placed</p>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-0.5">{creationDate.toLocaleString()}</p>
                </div>
              </div>

              {/* Payment Verified */}
              <div className={`relative pl-6 ${order.paymentStatus === 'verified' ? '' : 'opacity-40'}`}>
                <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1E1E1E] ${order.paymentStatus === 'verified' ? 'bg-emerald-500' : 'bg-charcoal/20 dark:bg-dark-border'}`} />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-dark-text">Payment Verified</p>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-0.5">Admin approval step</p>
                </div>
              </div>

              {/* Shipped */}
              <div className={`relative pl-6 ${order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? '' : 'opacity-40'}`}>
                <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1E1E1E] ${order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'bg-blue-500' : 'bg-charcoal/20 dark:bg-dark-border'}`} />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-dark-text">Order Shipped</p>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-0.5">Handed over to carrier</p>
                </div>
              </div>

              {/* Delivered */}
              <div className={`relative pl-6 ${order.orderStatus === 'delivered' ? '' : 'opacity-40'}`}>
                <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#1E1E1E] ${order.orderStatus === 'delivered' ? 'bg-emerald-500' : 'bg-charcoal/20 dark:bg-dark-border'}`} />
                <div>
                  <p className="text-sm font-medium text-charcoal dark:text-dark-text">Delivered</p>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-0.5">Completed</p>
                </div>
              </div>

            </div>

            {/* Quick Status Update */}
            <div className="mt-8 pt-6 border-t border-charcoal/10 dark:border-dark-border">
              <label className="text-[10px] uppercase tracking-wider text-charcoal/40 dark:text-dark-muted font-semibold mb-2 block">Change Order Status</label>
              <select 
                value={order.orderStatus}
                onChange={(e) => {
                  if (e.target.value === "cancelled") {
                    setCancelModalOpen(true)
                  } else {
                    handleUpdateOrderStatus(e.target.value as any)
                  }
                }}
                disabled={actionLoading || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                className="w-full bg-secondary/10 dark:bg-dark-pill border border-charcoal/20 dark:border-dark-border rounded-lg px-3 py-2.5 text-sm text-charcoal dark:text-dark-text focus:border-charcoal/40 dark:focus:border-dark-surfaceHover focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
              >
                <option value="pending" disabled={order.orderStatus !== 'pending'}>Pending</option>
                <option value="processing" disabled={order.orderStatus === 'shipped' || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}>Processing</option>
                <option value="shipped" disabled={order.orderStatus === 'pending' || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}>Shipped</option>
                <option value="delivered" disabled={order.orderStatus !== 'shipped'}>Delivered</option>
                <option value="cancelled" disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}>Cancelled</option>
              </select>
              
              {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                <Button 
                  variant="outline" 
                  onClick={() => setCancelModalOpen(true)}
                  disabled={actionLoading}
                  className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Verification Modals */}
      <ConfirmationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onConfirm={() => handleUpdatePaymentStatus('verified')}
        title="Verify Payment"
        message="Are you sure you want to verify this payment? This will update the order and allow it to proceed to processing."
        confirmText="Verify Payment"
        type="success"
        isLoading={actionLoading}
      />

      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={() => handleUpdatePaymentStatus('rejected')}
        title="Reject Payment"
        message="Are you sure you want to reject this payment proof? This will flag the order and require the customer to submit a new payment."
        confirmText="Reject Payment"
        type="danger"
        isLoading={actionLoading}
      />

      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => handleUpdateOrderStatus('cancelled')}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and will move the order to a permanently cancelled state."
        confirmText="Yes, Cancel Order"
        type="danger"
        isLoading={actionLoading}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative inline-block max-w-[90vw] max-h-[90vh]">
            <img loading="lazy" src={previewImage} 
              alt="Product Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl bg-white dark:bg-dark-surface"
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-charcoal/90 rounded-full text-charcoal dark:text-white hover:bg-white transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
