import { useState, useEffect, useRef } from "react"
import { SEO } from "../components/SEO"
import { analyticsService } from "../services/analytics/analyticsService"
import { cn } from "../utils/utils"
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useToast } from "../context/ToastContext"
import { orderService } from "../services/firebase/orderService"

// --- State Combobox Component ---
function StateCombobox({ value, onChange, error, className }: { value: string, onChange: (val: string) => void, error?: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const filteredStates = states.filter(s => s.toLowerCase().includes(inputValue.toLowerCase()));

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (state: string) => {
    setInputValue(state);
    onChange(state);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredStates.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredStates.length) {
        handleSelect(filteredStates[highlightedIndex]);
      } else if (filteredStates.length > 0) {
        handleSelect(filteredStates[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <input 
        type="text" 
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="State / Province *" 
        className={className}
      />
      {isOpen && filteredStates.length > 0 && (
        <ul 
          ref={listRef}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 w-full mt-1 bg-[#F9F7F1] border border-brand-text/10 shadow-lg max-h-60 overflow-y-auto custom-scrollbar"
        >
          {filteredStates.map((state, index) => (
            <li 
              key={state}
              onClick={() => handleSelect(state)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "px-4 py-3 text-[13px] font-light cursor-pointer transition-colors border-b border-brand-text/5 last:border-0",
                highlightedIndex === index ? "bg-brand-text/10 text-brand-text font-medium" : "text-brand-text hover:bg-brand-text/5"
              )}
            >
              {state}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{error}</p>}
    </div>
  );
}

// --- Promo Code Component ---
function PromoCodeForm() {
  const { appliedCoupon, applyCoupon, removeCoupon, totalPrice } = useCart()
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setIsLoading(true)
    const result = await applyCoupon(code)
    setIsLoading(false)
    
    if (result.success) {
      toast(result.message, "success")
      setCode("")
    } else {
      toast(result.message, "error")
    }
  }

  if (appliedCoupon) {
    return (
      <div className="mt-6 mb-6 p-4 bg-success/5 border border-success/20 flex justify-between items-center">
        <div>
          <p className="text-[12px] font-medium text-success flex items-center gap-2">
            Coupon Applied <ShieldCheck className="w-4 h-4" />
          </p>
          <p className="text-[10px] text-success/80 uppercase tracking-widest mt-1">
            {appliedCoupon.code} - {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`}
          </p>
        </div>
        <button 
          onClick={removeCoupon}
          className="text-[10px] text-brand-text/50 hover:text-error uppercase tracking-widest transition-colors"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 mb-6 flex gap-2">
      <input 
        type="text" 
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Promo / Coupon Code" 
        className="flex-grow bg-transparent border-b border-brand-text/20 py-2 px-2 text-[13px] font-light focus:outline-none focus:border-brand-text uppercase"
      />
      <button 
        type="submit" 
        disabled={isLoading || !code}
        className="px-6 py-2 bg-brand-text text-brand-primary text-[10px] uppercase tracking-widest hover:bg-brand-text/80 transition-colors disabled:opacity-50"
      >
        {isLoading ? "..." : "Apply"}
      </button>
    </form>
  )
}
// ----------------------------

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, savings, clearCart, couponDiscount } = useCart()
  const [isClearing, setIsClearing] = useState(false)

  // Cart component doesn't know the user's state, so we estimate based on the highest rate (85) or just say "Calculated at checkout"
  const shippingThreshold = 1000;
  // If cart total is >= 1000, shipping is free. Otherwise we leave it to be calculated at checkout.
  const isShippingFree = totalPrice >= shippingThreshold && items.length > 0;
  const grandTotal = totalPrice - couponDiscount;

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-32 max-w-[1400px] min-h-[70vh] flex flex-col items-center justify-center text-center bg-brand-primary pt-[120px]">
        <SEO title="Your Bag" noindex={true} />
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 flex items-center justify-center text-brand-text/30 mb-6">
            <ShoppingBag className="w-10 h-10 stroke-[1]" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif text-brand-text">Your Bag Is Empty</h2>
          <p className="text-[13px] text-brand-text/60 font-light max-w-md leading-relaxed">
            Discover our latest essentials and add some luxury to your wardrobe.
          </p>
          <Link 
            to="/products"
            className="mt-8 bg-brand-text text-brand-primary text-[11px] uppercase tracking-[0.2em] px-12 py-4 hover:bg-brand-text/80 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-[70vh] bg-brand-primary pt-[104px]">
      <SEO 
        title="Your Shopping Bag"
        description="Review your luxury fashion selections before checkout."
        noindex={true}
      />
      <div className="container mx-auto px-4 md:px-8 pt-6 pb-16 md:py-16 max-w-[1400px]">
        <h1 className="text-3xl lg:text-5xl font-serif text-brand-text mb-6 md:mb-16">Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-8">
              <>
                {items.map((item) => (
                  <div 
                    key={item.id} className="flex gap-6 pb-8 border-b border-brand-text/10"
                  >
                    <Link to={`/products/${item.productId}`} className="w-32 md:w-40 aspect-[3/4] bg-brand-pale flex-shrink-0 block relative group overflow-hidden">
                      {item.originalPrice && (
                        <div className="absolute top-2 left-2 bg-error text-brand-primary text-[9px] uppercase tracking-[0.2em] px-2 py-1 z-10">
                          SALE
                        </div>
                      )}
                      <img loading="lazy" src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </Link>
                    <div className="flex flex-col justify-between flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="font-serif text-lg text-brand-text hover:text-brand-accent transition-colors">{item.name}</h3>
                          </Link>
                          {item.category && <p className="text-[10px] text-brand-text/50 uppercase tracking-[0.2em] mt-2">{item.category}</p>}
                          <p className="text-[13px] text-brand-text/70 mt-2 font-light">Size: {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-brand-text font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          {item.originalPrice && (
                            <p className="text-[13px] text-brand-text/40 line-through mt-1">₹{(item.originalPrice * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-brand-text/20">
                          <button 
                            className="w-10 h-10 flex items-center justify-center text-brand-text/60 hover:text-brand-text transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >−</button>
                          <span className="w-10 text-center text-[13px]">{item.quantity}</span>
                          <button 
                            className="w-10 h-10 flex items-center justify-center text-brand-text/60 hover:text-brand-text transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 hover:text-error transition-colors pb-1 border-b border-transparent hover:border-error"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
              
              {/* Clear Cart Button */}
              <div className="flex justify-end pt-4">
                {isClearing ? (
                  <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em]">
                    <span className="text-error/80">Are you sure?</span>
                    <button 
                      onClick={() => { clearCart(); setIsClearing(false); }}
                      className="text-error hover:text-error/80 transition-colors border-b border-error pb-0.5"
                    >
                      Yes, clear
                    </button>
                    <button 
                      onClick={() => setIsClearing(false)}
                      className="text-brand-text/60 hover:text-brand-text transition-colors border-b border-brand-text/60 hover:border-brand-text pb-0.5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsClearing(true)}
                    className="text-[11px] uppercase tracking-[0.2em] text-brand-text/50 hover:text-brand-text transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Bag</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-brand-pale p-8 lg:p-10 sticky top-[140px]">
              <h2 className="text-xl font-serif text-brand-text mb-4 pb-4 border-b border-brand-text/10">Order Summary</h2>
              
              <PromoCodeForm />

              <div className="space-y-6 text-[13px] text-brand-text/80 mb-8 font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Savings</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{isShippingFree ? "Free" : "Calculated at checkout"}</span>
                </div>
                {!isShippingFree && items.length > 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-brand-text/50 mt-1 text-right">Free shipping over ₹{shippingThreshold}</p>
                )}
                
                <div className="border-t border-brand-text/10 pt-6 mt-6 flex justify-between text-lg text-brand-text">
                  <span className="font-serif">Estimated Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link 
                  to="/checkout"
                  className="w-full bg-brand-text text-brand-primary text-[11px] uppercase tracking-[0.2em] py-5 flex items-center justify-center gap-3 hover:bg-brand-text/80 transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </Link>
                <Link to="/products" className="block text-center text-[10px] uppercase tracking-[0.2em] text-brand-text/60 hover:text-brand-text transition-colors mt-6 border-b border-transparent hover:border-brand-text w-max mx-auto pb-1">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Checkout() {
  const { items, totalPrice, savings, clearCart, couponDiscount, appliedCoupon } = useCart()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  useEffect(() => {
    if (items.length > 0) {
      analyticsService.checkoutStart(items, totalPrice);
    }
  }, [items.length]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // If cart is empty, redirect back to cart
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-[1400px] min-h-[70vh] flex flex-col items-center justify-center text-center bg-brand-primary pt-[120px]">
        <SEO title="Checkout" noindex={true} />
        <h2 className="text-3xl lg:text-4xl font-serif text-brand-text mb-6">Your bag is empty</h2>
        <p className="text-[13px] text-brand-text/60 font-light max-w-md leading-relaxed mb-8">You need items in your cart to proceed to checkout.</p>
        <Link 
          to="/products"
          className="bg-brand-text text-brand-primary text-[11px] uppercase tracking-[0.2em] px-12 py-4 hover:bg-brand-text/80 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const shippingThreshold = 1000;
  const totalWeight = items.reduce((sum, item) => sum + (item.quantity * (item.weight || 0.5)), 0);
  
  // Calculate dynamic shipping based on subtotal *before* coupon
  let shippingCost = 0;
  if (totalPrice < shippingThreshold) {
    const stateStr = formData.state.toLowerCase().trim();
    const isWestBengal = stateStr === 'west bengal' || stateStr === 'wb';
    const baseRate = isWestBengal ? 49 : 85;
    const calculatedWeight = Math.max(1, Math.ceil(totalWeight));
    shippingCost = calculatedWeight * baseRate;
  }
  
  const grandTotal = totalPrice - couponDiscount + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev }
        delete newErrs[name]
        return newErrs
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required"
    
    // Phone validation (basic India / International 10-15 digits)
    const phoneClean = formData.phone.replace(/[^0-9+]/g, '')
    if (!phoneClean || phoneClean.length < 10) newErrors.phone = "Valid phone number required"
    
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.pincode.trim() || formData.pincode.length < 4) newErrors.pincode = "Valid PIN code required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast("Please complete all required fields correctly", "error")
      return
    }

    setIsSubmitting(true)

    try {
      // Create the order in Firestore
      const orderId = await orderService.createOrder({
        customerInfo: {
          email: formData.email,
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode
        },
        products: items,
        appliedCoupon: appliedCoupon?.code,
        amount: {
          subtotal: totalPrice,
          shipping: shippingCost,
          couponDiscount: couponDiscount,
          total: grandTotal,
          savings: savings
        },
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        orderStatus: 'processing'
      })

      clearCart()
      toast("Order created! Proceeding to payment...", "success")
      navigate(`/payment/${orderId}`)

    } catch (err: any) {
      console.error(err)
      analyticsService.trackError('Checkout_Submission_Failed', err.message || 'Unknown error during checkout');
      toast("Failed to process order. Please try again.", "error")
      setIsSubmitting(false)
    }
  }

  const inputClasses = "w-full bg-transparent border-b border-brand-text/30 py-3 px-2 text-[13px] font-light focus:outline-none focus:border-brand-text text-brand-text placeholder:text-brand-text/40 transition-colors";

  return (
    <div className="bg-brand-primary pt-[104px] min-h-screen">
      <div className="container mx-auto px-4 pt-4 pb-12 md:py-16 max-w-[1400px]">
        <SEO title="Secure Checkout" noindex={true} />
        
        <div className="flex items-center gap-4 mb-3 md:mb-16 text-[10px] uppercase tracking-[0.2em]">
          <Link to="/cart" className="text-brand-text/50 hover:text-brand-text transition-colors">Bag</Link>
          <span className="text-brand-text/30">/</span>
          <span className="text-brand-text font-medium">Checkout</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-serif text-brand-text mb-6 md:mb-12">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            
            <form onSubmit={handleCheckout} className="space-y-10 lg:space-y-16">
              
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-text mb-6 md:mb-8">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address *" 
                      className={cn(inputClasses, errors.email && "border-error")}
                    />
                    {errors.email && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.email}</p>}
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number *" 
                      className={cn(inputClasses, errors.phone && "border-error")}
                    />
                    {errors.phone && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-text mb-6 md:mb-8">Shipping Address</h2>
                <div className="space-y-5 sm:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                    <div>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name *" 
                        className={cn(inputClasses, errors.firstName && "border-error")}
                      />
                      {errors.firstName && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.firstName}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name *" 
                        className={cn(inputClasses, errors.lastName && "border-error")}
                      />
                      {errors.lastName && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street Address, Apartment, Suite *" 
                      className={cn(inputClasses, errors.address && "border-error")}
                    />
                    {errors.address && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
                    <div className="sm:col-span-1">
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City *" 
                        className={cn(inputClasses, errors.city && "border-error")}
                      />
                      {errors.city && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.city}</p>}
                    </div>
                    <div className="sm:col-span-1">
                      <StateCombobox 
                        value={formData.state}
                        onChange={(val) => {
                          setFormData(prev => ({ ...prev, state: val }));
                          if (errors.state) {
                            setErrors(prev => {
                              const newErrs = { ...prev };
                              delete newErrs.state;
                              return newErrs;
                            });
                          }
                        }}
                        error={errors.state}
                        className={cn(inputClasses, errors.state && "border-error")}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <input 
                        type="text" 
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Postal Code *" 
                        className={cn(inputClasses, errors.pincode && "border-error")}
                      />
                      {errors.pincode && <p className="text-error text-[10px] mt-2 px-2 uppercase tracking-widest">{errors.pincode}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      disabled 
                      value="India" 
                      className="w-full bg-brand-text/5 border-b border-brand-text/10 py-3 px-4 text-[13px] font-light text-brand-text/60 cursor-not-allowed"
                    />
                    <p className="text-[10px] uppercase tracking-widest text-brand-text/40 mt-3 px-2">Currently shipping to India only.</p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-brand-text/10">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-text text-brand-primary text-[11px] uppercase tracking-[0.2em] py-5 hover:bg-brand-text/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Continue to Payment"}
                </button>
                <div className="flex items-center justify-center mt-6 text-[10px] uppercase tracking-widest text-brand-text/50 gap-3">
                  <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                  <span>256-bit encrypted secure checkout</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <div className="bg-brand-pale p-6 lg:p-10 sticky top-[140px]">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-text mb-4 pb-4 border-b border-brand-text/10 flex justify-between items-center">
                <span>In Your Bag</span>
                <span className="text-brand-text/60">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
              </h2>

              <PromoCodeForm />
              
              <div className="space-y-6 mb-10 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 aspect-[3/4] bg-brand-primary relative flex-shrink-0">
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-text text-brand-primary text-[10px] flex items-center justify-center z-10">
                        {item.quantity}
                      </div>
                      <img loading="lazy" src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center flex-grow">
                      <h3 className="font-serif text-[15px] text-brand-text line-clamp-1">{item.name}</h3>
                      <p className="text-[11px] font-light text-brand-text/60 mt-1">Size: {item.size}</p>
                    </div>
                    <div className="flex flex-col justify-center text-right">
                      <p className="text-[13px] font-medium text-brand-text">₹{(item.price * item.quantity).toFixed(2)}</p>
                      {item.originalPrice && (
                        <p className="text-[11px] text-brand-text/40 line-through mt-0.5">₹{(item.originalPrice * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-6 text-[13px] text-brand-text/80 font-light pt-8 border-t border-brand-text/10">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-₹{savings.toFixed(2)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping {shippingCost > 0 && `(${totalWeight} kg)`}</span>
                  <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-brand-text/50 mt-1 text-right">Free shipping over ₹{shippingThreshold}</p>
                )}
                
                <div className="pt-6 border-t border-brand-text/10 flex justify-between items-center mt-2">
                  <span className="font-serif text-2xl text-brand-text">Total</span>
                  <span className="font-medium text-xl text-brand-text">₹{grandTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-brand-text/40 text-right mt-1">Includes all applicable taxes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
