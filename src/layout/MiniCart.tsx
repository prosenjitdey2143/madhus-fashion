import { useNavigate } from "react-router-dom";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function MiniCart() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleClose = () => setCartOpen(false);

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    handleClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-primary z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-charcoal/10 flex-shrink-0 bg-white">
              <span className="font-serif text-xl text-charcoal tracking-wide">Shopping Bag</span>
              <button 
                onClick={handleClose}
                className="text-charcoal/50 hover:text-charcoal transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-primary/50">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center text-charcoal/30">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-charcoal font-serif text-lg">Your bag is empty.</p>
                  <Button variant="outline" onClick={handleClose}>Continue Shopping</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <>
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 p-4 border border-brand-text/5 bg-brand-pale/30 shadow-soft rounded-sm">
                        <div className="w-20 aspect-[3/4] bg-secondary/10 flex-shrink-0 overflow-hidden">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-between flex-1 py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif text-sm text-charcoal line-clamp-1 pr-2">{item.name}</h4>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-charcoal/40 hover:text-error transition-colors focus:outline-none flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-charcoal/60 mt-1">Size: {item.size}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-charcoal/10 rounded-sm">
                              <button 
                                className="px-2 py-1 text-charcoal/60 hover:text-charcoal text-xs"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >-</button>
                              <span className="px-2 py-1 text-xs">{item.quantity}</span>
                              <button 
                                className="px-2 py-1 text-charcoal/60 hover:text-charcoal text-xs"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >+</button>
                            </div>
                            <p className="text-sm font-medium text-charcoal">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-charcoal/10 bg-white flex-shrink-0 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-center text-charcoal">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-serif text-lg">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
                  <Button variant="outline" className="w-full" onClick={handleViewCart}>View Bag</Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
