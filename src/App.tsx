import React, { Suspense, useEffect } from "react"
import { createHashRouter, RouterProvider, useRouteError } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { ToastProvider } from "./context/ToastContext"
import { analyticsService } from "./services/analytics/analyticsService"

// Layouts
import { MainLayout } from "./layout/MainLayout"
import { AdminLayout } from "./layout/AdminLayout"
import { ProtectedRoute } from "./layout/ProtectedRoute"
import { PageWrapper } from "./layout/PageWrapper"

// UI
import { FullPageLoader } from "./ui/Loader"

// Lazy-loaded Pages (Code Splitting for Performance)
const Home = React.lazy(() => import("./pages/Home").then(module => ({ default: module.Home })))
const Products = React.lazy(() => import("./pages/Products").then(module => ({ default: module.Products })))
const ProductDetails = React.lazy(() => import("./pages/ProductDetails").then(module => ({ default: module.ProductDetails })))
const Cart = React.lazy(() => import("./pages/CartCheckout").then(module => ({ default: module.Cart })))
const Checkout = React.lazy(() => import("./pages/CartCheckout").then(module => ({ default: module.Checkout })))
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess").then(module => ({ default: module.OrderSuccess })))
const Payment = React.lazy(() => import("./pages/Payment").then(module => ({ default: module.Payment })))

const TrackOrder = React.lazy(() => import("./pages/TrackOrder").then(module => ({ default: module.TrackOrder })))
const OrderStatus = React.lazy(() => import("./pages/OrderStatus").then(module => ({ default: module.OrderStatus })))
const AdminLogin = React.lazy(() => import("./pages/Admin").then(module => ({ default: module.AdminLogin })))
const DashboardOverview = React.lazy(() => import("./pages/admin/DashboardOverview").then(module => ({ default: module.DashboardOverview })))
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts").then(module => ({ default: module.AdminProducts })))
const AdminProductForm = React.lazy(() => import("./pages/admin/AdminProductForm").then(module => ({ default: module.AdminProductForm })))
const AdminInventory = React.lazy(() => import("./pages/admin/AdminInventory").then(module => ({ default: module.AdminInventory })))
const AdminOrders = React.lazy(() => import("./pages/admin/AdminOrders").then(module => ({ default: module.AdminOrders })))
const AdminOrderDetails = React.lazy(() => import("./pages/admin/AdminOrderDetails").then(module => ({ default: module.AdminOrderDetails })))
const AdminOffers = React.lazy(() => import("./pages/admin/AdminOffers").then(module => ({ default: module.AdminOffers })))
const AdminOfferForm = React.lazy(() => import("./pages/admin/AdminOfferForm").then(module => ({ default: module.AdminOfferForm })))
const AdminCategories = React.lazy(() => import("./pages/admin/AdminCategories").then(module => ({ default: module.AdminCategories })))
const AdminCategoryForm = React.lazy(() => import("./pages/admin/AdminCategoryForm").then(module => ({ default: module.AdminCategoryForm })))
const AdminCollections = React.lazy(() => import("./pages/admin/AdminCollections").then(module => ({ default: module.AdminCollections })))
const AdminCollectionForm = React.lazy(() => import("./pages/admin/AdminCollectionForm").then(module => ({ default: module.AdminCollectionForm })))
const AdminSettings = React.lazy(() => import("./pages/admin/AdminSettings").then(module => ({ default: module.AdminSettings })))
const AdminTrending = React.lazy(() => import("./pages/admin/AdminTrending").then(module => ({ default: module.AdminTrending })))
const AdminVideos = React.lazy(() => import("./pages/admin/AdminVideos").then(module => ({ default: module.AdminVideos })))
const AdminVideoForm = React.lazy(() => import("./pages/admin/AdminVideoForm").then(module => ({ default: module.AdminVideoForm })))
const AdminCoupons = React.lazy(() => import("./pages/admin/AdminCoupons").then(module => ({ default: module.AdminCoupons })))
const AdminCouponForm = React.lazy(() => import("./pages/admin/AdminCouponForm").then(module => ({ default: module.AdminCouponForm })))
// Global Error Boundary to handle ChunkLoadErrors after deployments
function GlobalErrorBoundary() {
  const error = useRouteError() as Error;
  
  if (
    error?.name === 'ChunkLoadError' || 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed')
  ) {
    // Hard refresh to fetch new chunks
    window.location.reload();
    return <FullPageLoader />;
  }

  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-[#FDFBF9]">
      <h2 className="text-2xl font-serif mb-2 text-charcoal">Oops! Something went wrong.</h2>
      <p className="mb-6 text-charcoal/60 max-w-md">{error?.message || "An unexpected error occurred."}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-3 bg-charcoal text-white rounded-full hover:bg-charcoal/90 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
}

// Architecture: HashRouter is used for GitHub pages compatibility (no server config required).
const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <PageWrapper title="Home">
            <Home />
          </PageWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <PageWrapper title="Collection">
            <Products />
          </PageWrapper>
        ),
      },
      {
        path: "products/:id",
        element: (
          <PageWrapper title="Product Details">
            <ProductDetails />
          </PageWrapper>
        ),
      },
      {
        path: "cart",
        element: (
          <PageWrapper title="Shopping Bag">
            <Cart />
          </PageWrapper>
        ),
      },
      {
        path: "checkout",
        element: (
          <PageWrapper title="Secure Checkout">
            <Checkout />
          </PageWrapper>
        ),
      },
      { path: "order-success/:id", element: (
        <PageWrapper title="Order Confirmation">
          <OrderSuccess />
        </PageWrapper>
      ) },
      { path: "payment/:orderId", element: (
        <PageWrapper title="Secure Payment">
          <Payment />
        </PageWrapper>
      ) },

      { path: "track-order", element: (
        <PageWrapper title="Track Order">
          <TrackOrder />
        </PageWrapper>
      ) },
      { path: "order-status/:orderId", element: (
        <PageWrapper title="Order Status">
          <OrderStatus />
        </PageWrapper>
      ) },
    ]
  },
  {
    path: "/admin",
    element: (
      <PageWrapper title="Admin Login">
        <AdminLogin />
      </PageWrapper>
    ),
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <PageWrapper title="Dashboard">
            <DashboardOverview />
          </PageWrapper>
        ),
      },
      {
        path: "products",
        element: (
          <PageWrapper title="Manage Products">
            <AdminProducts />
          </PageWrapper>
        ),
      },
      {
        path: "products/new",
        element: (
          <PageWrapper title="Add Product">
            <AdminProductForm />
          </PageWrapper>
        ),
      },
      {
        path: "inventory",
        element: (
          <PageWrapper title="Inventory Management">
            <AdminInventory />
          </PageWrapper>
        ),
      },
      {
        path: "orders",
        element: (
          <PageWrapper title="Order Management">
            <AdminOrders />
          </PageWrapper>
        ),
      },
      {
        path: "orders/:orderId",
        element: (
          <PageWrapper title="Order Details">
            <AdminOrderDetails />
          </PageWrapper>
        ),
      },
      {
        path: "products/edit/:id",
        element: (
          <PageWrapper title="Edit Product">
            <AdminProductForm />
          </PageWrapper>
        ),
      },
      {
        path: "offers",
        element: (
          <PageWrapper title="Manage Offers">
            <AdminOffers />
          </PageWrapper>
        ),
      },
      {
        path: "offers/new",
        element: (
          <PageWrapper title="Create Campaign">
            <AdminOfferForm />
          </PageWrapper>
        ),
      },
      {
        path: "offers/edit/:id",
        element: (
          <PageWrapper title="Edit Campaign">
            <AdminOfferForm />
          </PageWrapper>
        ),
      },
      {
        path: "categories",
        element: (
          <PageWrapper title="Manage Categories">
            <AdminCategories />
          </PageWrapper>
        ),
      },
      {
        path: "categories/new",
        element: (
          <PageWrapper title="Add Category">
            <AdminCategoryForm />
          </PageWrapper>
        ),
      },
      {
        path: "categories/edit/:id",
        element: (
          <PageWrapper title="Edit Category">
            <AdminCategoryForm />
          </PageWrapper>
        ),
      },
      {
        path: "collections",
        element: (
          <PageWrapper title="Manage Collections">
            <AdminCollections />
          </PageWrapper>
        ),
      },
      {
        path: "collections/new",
        element: (
          <PageWrapper title="Add Collection">
            <AdminCollectionForm />
          </PageWrapper>
        ),
      },
      {
        path: "collections/edit/:id",
        element: (
          <PageWrapper title="Edit Collection">
            <AdminCollectionForm />
          </PageWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <PageWrapper title="Settings">
            <AdminSettings />
          </PageWrapper>
        ),
      },
      {
        path: "trending",
        element: (
          <PageWrapper title="Trending Now">
            <AdminTrending />
          </PageWrapper>
        ),
      },
      {
        path: "coupons",
        element: (
          <PageWrapper title="Manage Coupons">
            <AdminCoupons />
          </PageWrapper>
        ),
      },
      {
        path: "coupons/new",
        element: (
          <PageWrapper title="Add Coupon">
            <AdminCouponForm />
          </PageWrapper>
        ),
      },
      {
        path: "coupons/edit/:id",
        element: (
          <PageWrapper title="Edit Coupon">
            <AdminCouponForm />
          </PageWrapper>
        ),
      },
      {
        path: "videos",
        element: (
          <PageWrapper title="Live & Reels">
            <AdminVideos />
          </PageWrapper>
        ),
      },
      {
        path: "videos/new",
        element: (
          <PageWrapper title="Add Video">
            <AdminVideoForm />
          </PageWrapper>
        ),
      },
      {
        path: "videos/edit/:id",
        element: (
          <PageWrapper title="Edit Video">
            <AdminVideoForm />
          </PageWrapper>
        ),
      }
    ]
  }
])

function App() {
  useEffect(() => {
    analyticsService.initGA();
  }, [])

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Suspense fallback={<FullPageLoader />}>
                <RouterProvider router={router} />
              </Suspense>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App
