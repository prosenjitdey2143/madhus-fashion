import { CheckCircle2, Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import type { Order } from "../../types"

interface OrderTimelineProps {
  order: Order
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  
  // Format dates securely
  const formatTime = (timestamp: any) => {
    if (!timestamp) return null
    try {
      // Firebase timestamp object
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      }
      // String or Date object
      return new Date(timestamp).toLocaleString("en-US", {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return null
    }
  }

  const isCancelled = order.orderStatus === "cancelled" || order.paymentStatus === "rejected"
  
  // Determine if a stage is complete
  const isPaymentVerified = order.paymentStatus === "verified"
  const isProcessing = order.orderStatus === "processing" || order.orderStatus === "shipped" || order.orderStatus === "delivered"
  const isShipped = order.orderStatus === "shipped" || order.orderStatus === "delivered"
  const isDelivered = order.orderStatus === "delivered"

  const timelineSteps = [
    {
      id: "placed",
      title: "Order Placed",
      description: "We have received your order",
      icon: Clock,
      completed: true, // Always completed if it exists
      time: formatTime(order.createdAt),
      active: order.orderStatus === "pending" && !isPaymentVerified && !isCancelled
    },
    {
      id: "verified",
      title: "Payment Verified",
      description: "Payment has been confirmed",
      icon: CheckCircle2,
      completed: isPaymentVerified,
      time: formatTime(order.verifiedAt),
      active: order.orderStatus === "pending" && isPaymentVerified && !isCancelled
    },
    {
      id: "processing",
      title: "Processing",
      description: "Your order is being prepared",
      icon: Package,
      completed: isProcessing,
      time: formatTime(order.processingAt),
      active: order.orderStatus === "processing" && !isCancelled
    },
    {
      id: "shipped",
      title: "Shipped",
      description: "Handed over to delivery partner",
      icon: Truck,
      completed: isShipped,
      time: formatTime(order.shippedAt),
      active: order.orderStatus === "shipped" && !isCancelled
    },
    {
      id: "delivered",
      title: "Delivered",
      description: "Order has been delivered",
      icon: CheckCircle,
      completed: isDelivered,
      time: formatTime(order.deliveredAt),
      active: order.orderStatus === "delivered"
    }
  ]

  if (isCancelled) {
    timelineSteps.push({
      id: "cancelled",
      title: "Cancelled",
      description: "Order has been cancelled",
      icon: XCircle,
      completed: true,
      time: formatTime(order.cancelledAt) || formatTime(new Date()),
      active: true
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className="bg-white rounded-xl border border-charcoal/10 shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-serif text-charcoal mb-8 border-b border-charcoal/10 pb-4">Order Status</h2>
      
      <div
        className="relative"
      >
        {/* Connecting Line background */}
        <div className="absolute left-[21px] top-4 bottom-8 w-0.5 bg-charcoal/5" />

        <div className="space-y-8">
          {timelineSteps.map((step, index) => {
            
            // For cancelled orders, we might want to hide future uncompleted steps 
            // to keep the timeline clean. Let's hide uncompleted steps if cancelled.
            if (isCancelled && !step.completed && step.id !== "cancelled") return null

            const isLast = index === timelineSteps.length - 1
            const Icon = step.icon
            
            // Styling based on state
            let iconBgClasses = "bg-white border-2 border-charcoal/20 text-charcoal/20"
            let textClasses = "text-charcoal/40"
            
            if (step.completed) {
              if (step.id === "cancelled") {
                iconBgClasses = "bg-red-500 border-2 border-red-500 text-white"
                textClasses = "text-red-600"
              } else {
                iconBgClasses = "bg-charcoal border-2 border-charcoal text-white"
                textClasses = "text-charcoal"
              }
            } else if (step.active) {
              iconBgClasses = "bg-white border-2 border-charcoal text-charcoal"
              textClasses = "text-charcoal"
            }

            return (
              <div key={step.id} className="relative flex gap-6">
                
                {/* Colored progress line overlay */}
                {!isLast && step.completed && (
                  <div className="absolute left-[21px] top-10 bottom-[-32px] w-0.5 bg-charcoal" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300 ${iconBgClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="pt-2 flex-1 pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className={`font-medium text-lg ${textClasses}`}>{step.title}</h3>
                      <p className={`text-sm mt-1 ${step.completed || step.active ? 'text-charcoal/60' : 'text-charcoal/40'}`}>
                        {step.description}
                      </p>
                    </div>
                    {step.time && (
                      <span className="text-xs font-medium text-charcoal/40 bg-secondary/10 px-2.5 py-1 rounded-full w-fit">
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
