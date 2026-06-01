import { useState } from "react"
import { Search, Package, AlertTriangle, AlertOctagon, CheckCircle2, PackageCheck } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import { productService } from "../../services/firebase/productService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import type { Product } from "../../types"

export function AdminInventory() {
  const { products, loading, error } = useProducts()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStockValue, setEditStockValue] = useState<string>("")
  const [savingId, setSavingId] = useState<string | null>(null)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Metrics
  const inStockCount = products.filter(p => p.stock > 5).length
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id)
    setEditStockValue(product.stock.toString())
  }

  const handleSaveEdit = async (productId: string) => {
    const newStock = parseInt(editStockValue, 10)
    if (isNaN(newStock) || newStock < 0) {
      toast("Please enter a valid stock number", "error")
      return
    }

    setSavingId(productId)
    try {
      await productService.updateProduct(productId, { stock: newStock })
      toast("Inventory updated successfully", "success")
      setEditingId(null)
      // Hard refresh for sync since useProducts isn't a live listener currently
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast("Failed to update inventory", "error")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader 
        title="Inventory" 
        subtitle="Manage product availability and stock alerts."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Catalog" value={products.length.toString()} icon={<Package className="w-5 h-5" />} />
        <MetricCard title="In Stock" value={inStockCount.toString()} icon={<PackageCheck className="w-5 h-5 text-emerald-600" />} />
        <MetricCard title="Low Stock" value={lowStockCount.toString()} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} alert />
        <MetricCard title="Out of Stock" value={outOfStockCount.toString()} icon={<AlertOctagon className="w-5 h-5 text-red-600" />} critical />
      </div>

      <AdminCard className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-charcoal/10 dark:border-dark-border flex items-center justify-between bg-charcoal/5 dark:bg-dark-surface">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 dark:text-dark-muted" />
            <input 
              type="text" 
              placeholder="Search products or IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover transition-colors dark:text-dark-text dark:placeholder:text-dark-muted/60"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">SKU / ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="w-full h-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-600">
                    Failed to load inventory data. Check your connection.
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-charcoal/50 dark:text-dark-muted">No products match your search.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-secondary/20 dark:bg-dark-bg rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <img loading="lazy" src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <p className="font-medium text-charcoal dark:text-dark-text text-sm">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-charcoal/40 dark:text-dark-muted font-mono">
                      {product.id}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge stock={product.stock} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {editingId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              min="0"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              className="w-20 text-center text-sm border border-charcoal/20 dark:border-dark-border bg-transparent dark:text-dark-text rounded p-1 focus:outline-none focus:border-charcoal dark:focus:border-dark-surfaceHover"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveEdit(product.id)}
                              disabled={savingId === product.id}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1 text-charcoal/40 dark:text-dark-muted hover:bg-charcoal/5 dark:hover:bg-dark-surfaceHover rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleStartEdit(product)}
                            className="px-4 py-1.5 border border-transparent hover:border-charcoal/20 dark:hover:border-dark-border hover:bg-white dark:hover:bg-dark-surfaceHover rounded cursor-pointer font-medium text-charcoal dark:text-dark-text transition-all text-sm group flex items-center gap-2"
                            title="Click to quick edit"
                          >
                            <span>{product.stock}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-charcoal/40 dark:text-dark-muted uppercase tracking-wide">Edit</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}

function MetricCard({ title, value, icon, alert = false, critical = false }: { title: string, value: string, icon: React.ReactNode, alert?: boolean, critical?: boolean }) {
  let bg = "bg-white dark:bg-dark-surface"
  if (alert) bg = "bg-amber-50/50 dark:bg-amber-500/10"
  if (critical) bg = "bg-red-50/50 dark:bg-red-500/10"

  return (
    <div >
      <AdminCard className={`relative overflow-hidden ${bg}`}>
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-charcoal/60 dark:text-dark-muted">{title}</p>
          <div className="p-2 bg-white dark:bg-dark-pill rounded-lg shadow-sm dark:shadow-none">
            {icon}
          </div>
        </div>
        <h3 className="text-3xl font-serif text-charcoal dark:text-dark-text">{value}</h3>
      </AdminCard>
    </div>
  )
}

function StatusBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>
  }
  if (stock <= 5) {
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">Low Stock</span>
  }
  return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">In Stock</span>
}
