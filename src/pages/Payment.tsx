import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
// import { Input } from "../ui/Form" // Removed unused Input import
import { useToast } from "../context/ToastContext"
import { orderService } from "../services/firebase/orderService"
import { storeSettingsService } from "../services/firebase/storeSettingsService"
import { couponService } from "../services/firebase/couponService"
import { ClipboardCopy, ShieldCheck, MessageCircle, QrCode, Tag } from "lucide-react"

export function Payment() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upiId, setUpiId] = useState("madhusfashion@upi")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  useEffect(() => {
    async function fetchDetails() {
      if (!orderId) return
      try {
        const [orderData, settingsData] = await Promise.all([
          orderService.getOrderById(orderId),
          storeSettingsService.getSettings()
        ])
        
        if (orderData) {
          setOrder(orderData)
        } else {
          toast("Order not found.", "error")
          navigate("/cart")
        }
        
        if (settingsData) {
          setUpiId(settingsData.upiId)
          setWhatsappNumber(settingsData.whatsappNumber)
          setQrCodeUrl(settingsData.qrCodeUrl || "")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load details.", "error")
        navigate("/cart")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [orderId, toast, navigate])

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId)
      toast("UPI ID copied to clipboard", "success")
    } catch (e) {
      toast("Failed to copy UPI ID", "error")
    }
  }

  const handleProceed = async () => {
    if (!orderId) return;
    try {
      // Update order to indicate payment has been submitted via WhatsApp
      await orderService.updateOrder(orderId, {
        paymentStatus: 'submitted' 
      });

      // Construct WhatsApp message
      const productList = order.products.map((item: any) => 
        `- ${item.name} (Size: ${item.size}, Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n  Link: ${window.location.origin}/products/${item.productId}`
      ).join('\n');

      const message = `*Payment Verification & Order Details*\n\n` +
        `Hello! I have completed the payment for my order.\n\n` +
        `*Order ID:* ${orderId}\n` +
        `*Total Paid:* ₹${order.amount?.total ?? 0}\n\n` +
        `*Items Ordered:*\n${productList}\n\n` +
        `_Please find my payment screenshot attached below._`;

      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp in new tab
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
      
      // Navigate to success page
      navigate(`/order-success/${orderId}`)
    } catch (err) {
      console.error(err)
      toast("Something went wrong", "error")
    }
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode || !orderId || !order) return
    setIsApplyingCoupon(true)
    try {
      const coupon = await couponService.getCouponByCode(couponCode)
      if (!coupon) {
        toast("Invalid coupon code", "error")
        return
      }
      if (!coupon.isActive) {
        toast("This coupon is no longer active", "error")
        return
      }
      if (coupon.minOrderValue && order.amount.subtotal < coupon.minOrderValue) {
        toast(`This coupon requires a minimum order of ₹${coupon.minOrderValue}`, "error")
        return
      }

      let discount = 0
      if (coupon.type === 'percentage') {
        discount = order.amount.subtotal * (coupon.value / 100)
      } else {
        discount = coupon.value
      }

      const newTotal = order.amount.subtotal + order.amount.shipping - discount
      
      const newAmount = {
        ...order.amount,
        couponDiscount: discount,
        total: newTotal
      }

      await orderService.updateOrder(orderId, {
        amount: newAmount,
        appliedCoupon: coupon.code
      })

      setOrder({
        ...order,
        amount: newAmount,
        appliedCoupon: coupon.code
      })

      setCouponCode("")
      toast("Coupon applied successfully!", "success")
    } catch (err) {
      console.error(err)
      toast("Failed to apply coupon", "error")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    if (!orderId || !order) return
    setIsApplyingCoupon(true)
    try {
      const newTotal = order.amount.subtotal + order.amount.shipping
      const newAmount = {
        ...order.amount,
        couponDiscount: 0,
        total: newTotal
      }

      await orderService.updateOrder(orderId, {
        amount: newAmount,
        appliedCoupon: null
      })

      setOrder({
        ...order,
        amount: newAmount,
        appliedCoupon: null
      })
      toast("Coupon removed", "success")
    } catch (err) {
      console.error(err)
      toast("Failed to remove coupon", "error")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-charcoal/50">Loading payment details…</div>
      </div>
    )
  }

  if (!order) return null

  const { amount, products } = order
  const grandTotal = amount?.total ?? 0

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-8 text-center">
        Secure Payment
      </h1>

      {/* Order Summary */}
      <section className="bg-secondary/5 border border-charcoal/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-serif text-charcoal mb-4">Order Summary</h2>
        <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
          {products.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="w-16 h-20 bg-secondary/20 rounded relative flex-shrink-0">
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-charcoal text-primary text-xs rounded-full flex items-center justify-center font-medium z-10 shadow-sm">
                  {item.quantity}
                </div>
                <img loading="lazy" src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-charcoal line-clamp-1">{item.name}</h3>
                <p className="text-xs text-charcoal/50">Size: {item.size}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-charcoal">${(item.price * item.quantity).toFixed(2)}</p>
                {item.originalPrice && (
                  <p className="text-xs text-charcoal/40 line-through mt-0.5">${(item.originalPrice * item.quantity).toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-charcoal/10 pt-4 mt-4 text-sm flex justify-between">
          <span>Subtotal</span>
          <span className="text-charcoal font-medium">₹{amount?.subtotal?.toFixed(2)}</span>
        </div>
        <div className="pt-2 text-sm flex justify-between">
          <span>Shipping</span>
          <span className="text-charcoal font-medium">₹{amount?.shipping?.toFixed(2)}</span>
        </div>
        {amount?.couponDiscount > 0 && (
          <div className="pt-2 text-sm flex justify-between text-success">
            <span>Coupon Discount ({order.appliedCoupon})</span>
            <span className="font-medium">-₹{amount?.couponDiscount?.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-charcoal/10 pt-4 mt-4 text-lg font-serif flex justify-between">
          <span>Total to Pay</span>
          <span className="text-charcoal">₹{grandTotal.toFixed(2)}</span>
        </div>
      </section>

      {/* Promo Code Section */}
      <section className="bg-secondary/5 border border-charcoal/10 rounded-lg p-6 mb-8">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium text-charcoal mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4" /> Have a promo code?
        </h2>
        {order.appliedCoupon ? (
          <div className="p-4 bg-success/5 border border-success/20 flex justify-between items-center rounded">
            <div>
              <p className="text-[12px] font-medium text-success flex items-center gap-2">
                Coupon Applied <ShieldCheck className="w-4 h-4" />
              </p>
              <p className="text-[10px] text-success/80 uppercase tracking-widest mt-1">
                {order.appliedCoupon} - ₹{order.amount?.couponDiscount?.toFixed(2)} OFF
              </p>
            </div>
            <button 
              onClick={handleRemoveCoupon}
              disabled={isApplyingCoupon}
              className="text-[10px] text-charcoal/50 hover:text-red-500 uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter Code" 
              className="flex-grow bg-white border border-charcoal/20 py-2 px-3 text-[13px] font-light focus:outline-none focus:border-charcoal uppercase rounded-l"
            />
            <button 
              type="submit" 
              disabled={isApplyingCoupon || !couponCode}
              className="px-6 py-2 bg-charcoal text-white text-[10px] uppercase tracking-widest hover:bg-charcoal/80 transition-colors disabled:opacity-50 rounded-r"
            >
              {isApplyingCoupon ? "..." : "Apply"}
            </button>
          </form>
        )}
      </section>

      {/* UPI Payment Section */}
      <section className="bg-primary/5 border border-charcoal/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-serif text-charcoal mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Pay with UPI
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* QR Code */}
          <div className="flex-shrink-0">
            {qrCodeUrl ? (
              <img loading="lazy" src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 object-contain border border-charcoal/20 rounded bg-white p-2" />
            ) : (
              <div className="w-48 h-48 border border-charcoal/20 border-dashed rounded bg-secondary/5 flex flex-col items-center justify-center text-charcoal/40">
                <QrCode className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium px-4 text-center">Scan QR using any UPI App</span>
              </div>
            )}
          </div>
          {/* UPI Details */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-charcoal">UPI ID:</span>
              <code className="bg-secondary/10 px-2 py-1 rounded text-sm text-charcoal">{upiId}</code>
              <Button variant="outline" size="sm" onClick={handleCopyUPI} className="flex items-center gap-1">
                <ClipboardCopy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-charcoal/70">
              Open any UPI app (Google Pay, PhonePe, Paytm, BHIM), paste the UPI ID or scan the QR code, and pay the exact amount shown above.
            </p>
            <div className="bg-brand-accent/10 p-4 rounded border border-brand-accent/20 my-4">
              <p className="text-sm text-brand-accent font-medium mb-1">Important: Take a Screenshot!</p>
              <p className="text-xs text-charcoal/70">Please take a screenshot of your successful payment before proceeding.</p>
            </div>
            <p className="text-sm text-charcoal/70">After payment, click the button below to complete your order and send us the screenshot directly on WhatsApp.</p>
            <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white border-none" onClick={handleProceed}>
              <MessageCircle className="w-5 h-5" />
              I Have Paid - Send Screenshot on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <div className="flex justify-center mt-6">
        <Link to="/cart" className="text-sm text-charcoal/50 hover:text-charcoal transition-colors">
          Return to Cart
        </Link>
      </div>
    </div>
  )
}


