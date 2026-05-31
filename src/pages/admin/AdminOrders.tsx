import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Package, DollarSign, Clock, CheckCircle, Eye } from "lucide-react"
import { orderService } from "../../services/firebase/orderService"
import type { Order } from "../../types"
import { Button } from "../../ui/Button"

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: Order["orderStatus"]) => {
    try {
      await orderService.updateOrder(orderId, { orderStatus: newStatus })
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update order status")
    }
  }

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo.phone && order.customerInfo.phone.includes(searchTerm));
      
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  })

  // Metrics Calculation
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.orderStatus === "pending" || o.orderStatus === "processing").length
  const completedOrders = orders.filter(o => o.orderStatus === "delivered").length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount?.total || 0), 0)

  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm flex flex-col justify-between transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary/10 dark:bg-dark-pill rounded-lg text-charcoal dark:text-dark-text">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-charcoal/10 dark:bg-dark-pill text-charcoal/60 dark:text-dark-muted'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-charcoal/50 dark:text-dark-muted mb-1">{title}</p>
        <h3 className="text-2xl font-serif text-charcoal dark:text-dark-text">{value}</h3>
      </div>
    </div>
  )

  const StatusBadge = ({ status, type = "order" }: { status: string, type?: "order" | "payment" }) => {
    let classes = "bg-charcoal/5 text-charcoal/60 dark:bg-dark-pill dark:text-dark-muted"
    
    if (type === "order") {
      if (status === "pending" || status === "processing") classes = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
      if (status === "shipped") classes = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
      if (status === "delivered") classes = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
      if (status === "cancelled") classes = "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
    } else {
      if (status === "pending" || status === "submitted") classes = "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
      if (status === "verified") classes = "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
      if (status === "failed" || status === "rejected") classes = "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full uppercase tracking-wider ${classes}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary/20 dark:bg-dark-surface rounded-xl" />)}
        </div>
        <div className="h-16 bg-secondary/20 dark:bg-dark-surface rounded-lg animate-pulse" />
        <div className="h-96 bg-secondary/10 dark:bg-dark-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900">
        <p>{error}</p>
        <Button onClick={fetchOrders} className="mt-4" variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-charcoal dark:text-dark-text">Orders Management</h1>
          <p className="text-charcoal/60 dark:text-dark-muted mt-1 text-sm">Monitor, track, and manage customer orders.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Orders" value={totalOrders} icon={Package} />
        <MetricCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} trend={12} />
        <MetricCard title="Action Required" value={pendingOrders} icon={Clock} />
        <MetricCard title="Completed" value={completedOrders} icon={CheckCircle} />
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 dark:text-dark-muted" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name, or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary/10 dark:bg-dark-pill border border-transparent dark:border-dark-border focus:border-charcoal/20 dark:focus:border-dark-surfaceHover rounded-lg text-sm focus:outline-none dark:text-dark-text dark:placeholder:text-dark-muted/60 transition-colors"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full sm:w-auto flex items-center bg-secondary/10 dark:bg-dark-pill rounded-lg px-3 py-2 border border-transparent dark:border-dark-border focus-within:border-charcoal/20 dark:focus-within:border-dark-surfaceHover">
            <Filter className="w-4 h-4 text-charcoal/40 dark:text-dark-muted mr-2" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-charcoal dark:text-dark-text focus:outline-none w-full sm:w-32 appearance-none cursor-pointer"
            >
              <option value="all" className="dark:bg-dark-surface">All Orders</option>
              <option value="pending" className="dark:bg-dark-surface">Pending</option>
              <option value="processing" className="dark:bg-dark-surface">Processing</option>
              <option value="shipped" className="dark:bg-dark-surface">Shipped</option>
              <option value="delivered" className="dark:bg-dark-surface">Delivered</option>
              <option value="cancelled" className="dark:bg-dark-surface">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-charcoal/10 dark:border-dark-border shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border">
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider">Order Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-charcoal/60 dark:text-dark-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
              <>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-charcoal/50">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const date = order.createdAt ? new Date((order.createdAt as any).seconds * 1000) : new Date()
                    return (
                      <tr 
                        key={order.orderId} className="hover:bg-charcoal/[0.02] dark:hover:bg-dark-surfaceHover transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono font-medium text-sm text-charcoal dark:text-dark-text">{order.orderId}</span>
                            <span className="text-xs text-charcoal/50 dark:text-dark-muted mt-1">
                              {date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-charcoal dark:text-dark-text">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                            <span className="text-xs text-charcoal/50 dark:text-dark-muted mt-1">{order.customerInfo.phone || order.customerInfo.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-charcoal dark:text-dark-text">${order.amount?.total.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={order.paymentStatus} type="payment" />
                            <span className="text-[10px] text-charcoal/40 dark:text-dark-muted uppercase tracking-wider">{order.paymentMethod || "UNKNOWN"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.orderStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end space-x-3">
                            <select 
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as any)}
                              className="bg-secondary/10 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded px-2 py-1 text-xs text-charcoal dark:text-dark-text focus:outline-none cursor-pointer"
                            >
                              <option value="pending" className="dark:bg-dark-surface">Pending</option>
                              <option value="processing" className="dark:bg-dark-surface">Processing</option>
                              <option value="shipped" className="dark:bg-dark-surface">Shipped</option>
                              <option value="delivered" className="dark:bg-dark-surface">Delivered</option>
                              <option value="cancelled" className="dark:bg-dark-surface">Cancelled</option>
                            </select>
                            <Link to={`/dashboard/orders/${order.orderId}`} className="text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors p-1">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-charcoal/10 dark:border-dark-border flex items-center justify-between text-sm text-charcoal/60 dark:text-dark-muted bg-charcoal/[0.01] dark:bg-dark-surface">
          <span>Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded border border-charcoal/10 dark:border-dark-border hover:bg-charcoal/5 dark:hover:bg-dark-surfaceHover transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-charcoal/10 dark:border-dark-border hover:bg-charcoal/5 dark:hover:bg-dark-surfaceHover transition-colors disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
