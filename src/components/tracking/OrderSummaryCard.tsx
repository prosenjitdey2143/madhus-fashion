import { Package, MapPin } from "lucide-react"
import type { Order } from "../../types"

interface OrderSummaryCardProps {
  order: Order
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  
  const StatusBadge = ({ status, type = "order" }: { status: string, type?: "order" | "payment" }) => {
    let classes = "bg-charcoal/5 text-charcoal/60 border-charcoal/10"
    
    if (type === "order") {
      if (status === "pending" || status === "processing") classes = "bg-amber-100 text-amber-700 border-amber-200"
      if (status === "shipped") classes = "bg-blue-100 text-blue-700 border-blue-200"
      if (status === "delivered") classes = "bg-emerald-100 text-emerald-700 border-emerald-200"
      if (status === "cancelled") classes = "bg-red-100 text-red-700 border-red-200"
    } else {
      if (status === "pending" || status === "submitted") classes = "bg-amber-100 text-amber-700 border-amber-200"
      if (status === "verified") classes = "bg-emerald-100 text-emerald-700 border-emerald-200"
      if (status === "failed" || status === "rejected") classes = "bg-red-100 text-red-700 border-red-200"
    }

    return (
      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${classes}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Order Info & Status */}
      <div className="bg-white rounded-xl border border-charcoal/10 shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold mb-1">Order Number</p>
            <h2 className="text-xl font-serif text-charcoal">{order.orderId}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-charcoal/10 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold mb-2">Order Status</p>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold mb-2">Payment Status</p>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-white rounded-xl border border-charcoal/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-charcoal/10 flex items-center">
          <Package className="w-5 h-5 text-charcoal/40 mr-2" />
          <h3 className="font-medium text-charcoal">Order Details</h3>
        </div>
        
        <div className="divide-y divide-charcoal/5 max-h-80 overflow-y-auto">
          {order.products.map(item => (
            <div key={item.id} className="p-4 sm:p-6 flex gap-4 hover:bg-secondary/5 transition-colors">
              <div className="w-16 h-20 bg-secondary/20 rounded relative overflow-hidden border border-charcoal/5 shrink-0">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-medium text-charcoal text-sm truncate">{item.name}</h4>
                <p className="text-xs text-charcoal/50 mt-1">Size: {item.size} • Qty: {item.quantity}</p>
                <p className="text-sm font-medium text-charcoal mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-charcoal/[0.02] border-t border-charcoal/10 space-y-2 text-sm">
          <div className="flex justify-between text-charcoal/60">
            <span>Subtotal</span>
            <span>₹{order.amount?.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-charcoal/60">
            <span>Shipping</span>
            <span>{order.amount?.shipping === 0 ? "Free" : `₹${order.amount?.shipping.toFixed(2)}`}</span>
          </div>
          {order.amount?.savings > 0 && (
            <div className="flex justify-between text-success">
              <span>Savings</span>
              <span>-₹{order.amount?.savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-serif text-charcoal pt-4 border-t border-charcoal/10 mt-2">
            <span>Total</span>
            <span>₹{order.amount?.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl border border-charcoal/10 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-charcoal/40 mr-2" />
          <h3 className="font-medium text-charcoal">Shipping Address</h3>
        </div>
        <div className="text-sm text-charcoal/70 leading-relaxed ml-7">
          <p className="font-medium text-charcoal">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
          <p>{order.customerInfo.address}</p>
          <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.postalCode}</p>
          <p>India</p>
        </div>
      </div>

    </div>
  )
}
