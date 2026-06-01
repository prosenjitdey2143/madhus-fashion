import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Edit2, Trash2, AlertTriangle, X } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import { productService } from "../../services/firebase/productService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import type { Product } from "../../types"

export function AdminProducts() {
  const { products, loading, error } = useProducts()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true)
    try {
      await productService.deleteProduct(productToDelete.id, productToDelete.images)
      toast(`${productToDelete.name} deleted successfully`, "success")
      setProductToDelete(null)
      // Note: we don't need to manually refetch, as long as useProducts triggers a reload, 
      // but standard Firestore getDocs doesn't auto-sync unless we use onSnapshot.
      // Since useProducts uses one-time getDocs, a page refresh or forcing a fetch would be needed.
      // For now, removing it from DOM implicitly might require a hard reload or context update.
      window.location.reload() // Quick fix for full CRUD sync without heavy state management overhaul
    } catch (err) {
      console.error(err)
      toast("Failed to delete product. Please try again.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader 
        title="Products" 
        subtitle="Manage your catalog, pricing, and inventory."
        action={
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard/products/new")}
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        }
      />

      <AdminCard className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-charcoal/10 dark:border-dark-border flex items-center justify-between bg-charcoal/5 dark:bg-dark-pill">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 dark:text-dark-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-dark-bg border border-charcoal/10 dark:border-dark-border rounded-lg focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text dark:placeholder:text-dark-muted/60 transition-colors"
            />
          </div>
          <div className="text-sm text-charcoal/60 dark:text-dark-muted font-medium">
            {filteredProducts.length} Items
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="w-full h-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-12 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-600">
                    Failed to load products. Check your connection.
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-pill rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-charcoal/40 dark:text-dark-muted" />
                      </div>
                      <p className="text-lg font-serif text-charcoal dark:text-dark-text mb-2">No products found</p>
                      <p className="text-sm text-charcoal/50 dark:text-dark-muted max-w-sm">
                        {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first product."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr 
                    key={product.id} className="hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-secondary/20 dark:bg-dark-bg rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0] && (
                            <img loading="lazy" src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal dark:text-dark-text text-sm line-clamp-1">{product.name}</p>
                          {product.originalPrice && (
                            <span className="text-xs text-charcoal/40 dark:text-dark-muted line-through mr-2">₹{product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal/70 dark:text-dark-muted">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal dark:text-dark-text">₹{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : product.stock < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-charcoal dark:text-dark-text'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {product.featured && <span className="px-2 py-1 bg-charcoal/10 dark:bg-dark-pill text-charcoal dark:text-dark-text rounded text-[10px] uppercase font-bold tracking-wider">Featured</span>}
                        {product.bestSeller && <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded text-[10px] uppercase font-bold tracking-wider">Best Seller</span>}
                        {product.newArrival && <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider">New</span>}
                        {product.stock === 0 && <span className="px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 rounded text-[10px] uppercase font-bold tracking-wider">Out of Stock</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                          className="p-2 text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-surfaceHover rounded transition-colors shadow-sm dark:shadow-none"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(product)}
                          className="p-2 text-red-600/60 dark:text-red-400/80 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors shadow-sm dark:shadow-none"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Delete Confirmation Modal */}
      <>
        {productToDelete && (
          <>
            <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-50"
              onClick={() => !isDeleting && setProductToDelete(null)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-2xl z-50 p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-charcoal dark:text-dark-text">Delete Product</h3>
                    <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">This action cannot be undone.</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isDeleting && setProductToDelete(null)}
                  className="text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-secondary/10 dark:bg-dark-pill p-4 rounded-lg mb-8 flex items-center gap-4">
                <img loading="lazy" src={productToDelete.images[0]} alt="" className="w-12 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium text-charcoal dark:text-dark-text">{productToDelete.name}</p>
                  <p className="text-xs text-charcoal/60 dark:text-dark-muted">ID: {productToDelete.id}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </div>
          </>
        )}
      </>
    </div>
  )
}
