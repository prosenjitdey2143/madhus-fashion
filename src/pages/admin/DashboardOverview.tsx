import { Package, Users, IndianRupee, AlertTriangle, Plus, ListOrdered, Tag, ArrowRight, Clock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Skeleton } from "../../ui/Skeleton"
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics"
import type { Order } from "../../types"


export function DashboardOverview() {
  const navigate = useNavigate();
  const { 
    totalRevenue, 
    activeOrders, 
    productCatalogSize, 
    lowStockCount, 
    recentOrders,
    loading,
    error 
  } = useDashboardMetrics();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <AdminPageHeader 
        title="Dashboard" 
        subtitle="Welcome back. Here's what's happening today."
        action={
          <Button className="flex items-center gap-2" onClick={() => navigate("/dashboard/products/new")}>
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </Button>
        }
      />

      {/* Metrics Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard 
          title="Total Revenue" 
          value={loading ? null : `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={<IndianRupee className="w-5 h-5 text-charcoal/60 dark:text-dark-muted" />} 
          trend="Lifetime Revenue"
        />
        <MetricCard 
          title="Active Orders" 
          value={loading ? null : activeOrders.toString()} 
          icon={<Users className="w-5 h-5 text-charcoal/60 dark:text-dark-muted" />} 
          trend="Processing & Shipped"
        />
        <MetricCard 
          title="Product Catalog" 
          value={loading ? null : productCatalogSize.toString()} 
          icon={<Package className="w-5 h-5 text-charcoal/60 dark:text-dark-muted" />} 
          trend="Total live items"
        />
        <MetricCard 
          title="Low Stock Alerts" 
          value={loading ? null : lowStockCount.toString()} 
          icon={<AlertTriangle className={lowStockCount > 0 ? "w-5 h-5 text-red-600/80 dark:text-red-400" : "w-5 h-5 text-charcoal/60 dark:text-dark-muted"} />} 
          trend={lowStockCount > 0 ? "Requires attention" : "Inventory healthy"}
          alert={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif text-charcoal dark:text-dark-text flex items-center gap-2">
              <Clock className="w-5 h-5 text-charcoal/50 dark:text-dark-muted" />
              Recent Orders
            </h2>
            <Link to="/dashboard/orders" className="text-sm text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <AdminCard noPadding className="overflow-hidden">
            {error ? (
              <div className="p-12 text-center text-red-600/80 dark:text-red-400">{error}</div>
            ) : loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="w-1/3 h-4" />
                      <Skeleton className="w-1/4 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-charcoal/10 dark:border-dark-border rounded-xl">
                <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-pill rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Package className="w-8 h-8 text-charcoal/40 dark:text-dark-muted" />
                </div>
                <h3 className="text-lg font-medium text-charcoal dark:text-dark-text mb-1">No orders yet</h3>
                <p className="text-charcoal/50 dark:text-dark-muted text-sm max-w-sm mx-auto">When customers place orders, they will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-left">
                    <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                      <th className="p-4 font-semibold rounded-tl-lg">Order ID</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
                    {recentOrders.map((order) => (
                      <tr 
                        key={order.orderId} 
                        className="border-b border-charcoal/5 dark:border-dark-border/50 hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors cursor-pointer group"
                        onClick={() => navigate(`/dashboard/orders/${order.orderId}`)}
                      >
                        <td className="p-4 text-sm font-medium text-charcoal dark:text-dark-text">#{order.orderId}</td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-charcoal dark:text-dark-text">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                          <p className="text-xs text-charcoal/50 dark:text-dark-muted">{order.customerInfo.email}</p>
                        </td>
                        <td className="p-4 text-sm text-charcoal/70 dark:text-dark-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-medium text-charcoal dark:text-dark-text text-right">
                          ₹{order.amount.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-secondary/10 dark:bg-dark-surface border border-charcoal/10 dark:border-dark-border p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-charcoal/5 dark:bg-dark-pill rounded-full blur-3xl"></div>
            <h2 className="text-lg font-serif text-charcoal dark:text-dark-text mb-2 relative z-10">Quick Actions</h2>
            <p className="text-sm text-charcoal/60 dark:text-dark-muted mb-6 relative z-10">Common tasks you might want to do right now.</p>
            
            <div className="space-y-3 relative z-10">
              <QuickActionButton onClick={() => navigate("/dashboard/products/new")} icon={<Plus className="w-5 h-5" />} label="Add New Product" />
              <QuickActionButton onClick={() => navigate("/dashboard/inventory")} icon={<Package className="w-5 h-5" />} label="Manage Inventory" />
              <QuickActionButton onClick={() => navigate("/dashboard/orders")} icon={<ListOrdered className="w-5 h-5" />} label="View All Orders" />
              <QuickActionButton onClick={() => navigate("/dashboard/offers")} icon={<Tag className="w-5 h-5" />} label="Create Offer Code" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: Order['orderStatus'] }) {
  const styles: Record<Order['orderStatus'], string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-amber-500/20 dark:text-amber-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    shipped: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
  }
  
  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}

function MetricCard({ title, value, icon, trend, alert = false }: { title: string, value: string | null, icon: React.ReactNode, trend: string, alert?: boolean }) {
  return (
    <div>
      <AdminCard className={`relative overflow-hidden group hover:shadow-soft-hover transition-all duration-300 ${alert ? 'border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/20' : 'dark:bg-dark-surface'}`}>
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-charcoal/60 dark:text-dark-muted">{title}</p>
          <div className="p-2 bg-secondary/10 dark:bg-dark-pill rounded-lg group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        {value === null ? (
          <Skeleton className="w-1/2 h-8 mb-2" />
        ) : (
          <h3 className="text-3xl font-serif text-charcoal dark:text-dark-text mb-2">{value}</h3>
        )}
        <p className={`text-xs ${alert ? 'text-red-600 dark:text-red-400' : 'text-charcoal/40 dark:text-dark-muted'}`}>{trend}</p>
      </AdminCard>
    </div>
  )
}

const QuickActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-white dark:hover:bg-dark-surfaceHover dark:bg-dark-pill bg-white/50 border border-transparent dark:border-dark-border hover:border-charcoal/10 dark:hover:border-dark-border shadow-sm hover:shadow-md transition-all group">
    <div className="p-2 bg-secondary/10 dark:bg-dark-bg rounded group-hover:bg-charcoal dark:group-hover:bg-dark-accent group-hover:text-white transition-colors text-charcoal/60 dark:text-dark-muted">
      {icon}
    </div>
    <span className="font-medium text-sm text-charcoal/80 dark:text-dark-text group-hover:text-charcoal dark:group-hover:text-white transition-colors">{label}</span>
    <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-charcoal/40 dark:text-dark-muted group-hover:text-charcoal dark:group-hover:text-white" />
  </button>
)
