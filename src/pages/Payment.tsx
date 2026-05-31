import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
// import { Input } from "../ui/Form" // Removed unused Input import
import { useToast } from "../context/ToastContext"
import { orderService } from "../services/firebase/orderService"
import { storeSettingsService } from "../services/firebase/storeSettingsService"
import { ClipboardCopy, ShieldCheck, MessageCircle, QrCode } from "lucide-react"

export function Payment() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upiId, setUpiId] = useState("madhusfashion@upi")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

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
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded" />
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
        <div className="border-t border-charcoal/10 pt-4 mt-4 text-lg font-serif flex justify-between">
          <span>Total to Pay</span>
          <span className="text-charcoal">${grandTotal.toFixed(2)}</span>
        </div>
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
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 object-contain border border-charcoal/20 rounded bg-white p-2" />
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


