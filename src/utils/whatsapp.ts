import type { Order } from "../types";
import { APP_CONFIG } from "../config/constants";

/**
 * Generates a dynamic WhatsApp message from an order object.
 */
export const generateWhatsAppMessage = (order: Order): string => {
  const { customerInfo, products, amount, paymentScreenshot, orderId } = order;

  // Greeting
  let message = `Hello Madhus Fashion House,\n\n*New Order Request*\nOrder ID: ${orderId}\n\n`;

  // Customer Details
  message += `*Customer Details:*\n`;
  message += `Name: ${customerInfo.firstName} ${customerInfo.lastName}\n`;
  if (customerInfo.phone) message += `Phone: ${customerInfo.phone}\n`;
  message += `Email: ${customerInfo.email}\n`;
  message += `Address: ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.postalCode}\n\n`;

  // Product Details
  message += `*Products:*\n`;
  products.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Size: ${item.size} | Qty: ${item.quantity} | Price: ₹${item.price.toFixed(2)}\n`;
  });

  message += `\n*Order Summary*\n`;
  message += `Subtotal: ₹${amount.subtotal.toFixed(2)}\n`;
  if (amount.savings > 0) message += `Savings: -₹${amount.savings.toFixed(2)}\n`;
  if (amount.shipping === 0) {
    message += `Shipping: Complimentary\n`;
  } else {
    message += `Shipping: ₹${amount.shipping.toFixed(2)}\n`;
  }
  
  message += `*Grand Total: ₹${amount.total.toFixed(2)}*\n\n`;

  // Payment Confirmation
  message += `*Payment Status:*\n`;
  message += `UPI Payment Completed.\n`;
  message += `Please attach your payment screenshot to this message so we can verify your order immediately.\n\n`;
  if (paymentScreenshot) {
    message += `Screenshot Uploaded: Yes\n`;
  } else {
    message += `Screenshot Uploaded: No\n`;
  }

  return message;
};

/**
 * Generates the wa.me redirect URL
 */
export const getWhatsAppRedirectUrl = (order: Order): string => {
  const message = generateWhatsAppMessage(order);
  const encodedMessage = encodeURIComponent(message);
  
  // Format number by stripping non-numeric characters (except leading +)
  let phone = APP_CONFIG.BUSINESS_WHATSAPP_NUMBER.replace(/[^\d+]/g, '');
  
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};
