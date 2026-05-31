declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Ensure the dataLayer exists
window.dataLayer = window.dataLayer || [];

// Create a safe gtag wrapper
export function gtag(..._args: any[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

class AnalyticsService {
  private isInitialized = false;

  private isAdminRoute(): boolean {
    const hash = window.location.hash || '';
    return hash.includes('/admin') || hash.includes('/dashboard');
  }

  public initGA() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      console.warn('Analytics: Missing or placeholder GA_MEASUREMENT_ID. Analytics disabled.');
      return;
    }

    if (this.isInitialized) return;

    // Load the gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize config
    window.gtag = window.gtag || gtag;
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // We will handle this manually for SPA routing
    });

    this.isInitialized = true;
    console.log('Analytics initialized successfully.');
  }

  public pageView(url: string, title: string) {
    if (this.isAdminRoute()) return;
    
    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: window.location.href,
        page_path: url,
      });
    }
  }

  public productView(product: any) {
    if (this.isAdminRoute()) return;
    
    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'view_item', {
        currency: 'INR',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
          }
        ]
      });
    }
  }

  public addToCart(product: any, quantity: number = 1) {
    if (this.isAdminRoute()) return;

    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price * quantity,
        items: [
          {
            item_id: product.productId || product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: quantity
          }
        ]
      });
    }
  }

  public removeFromCart(product: any, quantity: number = 1) {
    if (this.isAdminRoute()) return;

    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'INR',
        value: product.price * quantity,
        items: [
          {
            item_id: product.productId || product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: quantity
          }
        ]
      });
    }
  }

  public checkoutStart(cartItems: any[], totalValue: number) {
    if (this.isAdminRoute()) return;

    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: totalValue,
        items: cartItems.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  }

  public purchase(orderId: string, cartItems: any[], totalValue: number, shippingCost: number) {
    if (this.isAdminRoute()) return;

    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'INR',
        value: totalValue,
        shipping: shippingCost,
        items: cartItems.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  }

  public trackError(errorName: string, errorMessage: string) {
    if (this.isAdminRoute()) return;

    if (this.isInitialized && GA_MEASUREMENT_ID) {
      window.gtag('event', 'exception', {
        description: `${errorName}: ${errorMessage}`,
        fatal: false
      });
    }
  }
}

export const analyticsService = new AnalyticsService();
