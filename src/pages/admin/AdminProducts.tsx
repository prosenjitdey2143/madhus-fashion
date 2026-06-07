import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search, Edit2, Trash2, AlertTriangle, X, LayoutGrid, List } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import { productService } from "../../services/firebase/productService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import type { Product } from "../../types"
import { cn } from "../../utils/utils"

export function AdminProducts() {
  const { products, loading, error } = useProducts()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true)
    try {
      await productService.deleteProduct(productToDelete.id, productToDelete.images)
      toast(`${productToDelete.name} deleted successfully`, "success")
      setProductToDelete(null)
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast("Failed to delete product. Please try again.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedProducts.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const productsToDelete = products.filter(p => selectedProducts.has(p.id));
      await Promise.all(productsToDelete.map(p => productService.deleteProduct(p.id, p.images)));
      toast(`Successfully deleted ${selectedProducts.size} products.`, "success");
      setSelectedProducts(new Set());
      setShowBulkDeleteModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast("Failed to delete some products. Please try again.", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProducts(newSet);
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
        {/* Toolbar */}
        <div className="p-4 border-b border-charcoal/10 dark:border-dark-border flex flex-col md:flex-row gap-4 items-center justify-between bg-charcoal/5 dark:bg-dark-pill">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 dark:text-dark-muted" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-dark-bg border border-charcoal/10 dark:border-dark-border rounded-lg focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text dark:placeholder:text-dark-muted/60 transition-colors"
              />
            </div>
            
            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 text-sm text-charcoal/60 dark:text-dark-muted font-medium cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-charcoal dark:accent-dark-text rounded border-charcoal/20 cursor-pointer"
                checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                onChange={() => {
                  if (filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length) {
                    setSelectedProducts(new Set());
                  } else {
                    setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
                  }
                }}
              />
              <span className="hidden sm:inline">Select All</span>
            </label>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {selectedProducts.size > 0 && (
              <Button 
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-500/10 text-sm h-9"
                onClick={() => setShowBulkDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedProducts.size})
              </Button>
            )}

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-white dark:bg-dark-bg border border-charcoal/10 dark:border-dark-border rounded-lg p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "grid" 
                      ? "bg-charcoal text-white dark:bg-dark-text dark:text-dark-surface" 
                      : "text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text"
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "list" 
                      ? "bg-charcoal text-white dark:bg-dark-text dark:text-dark-surface" 
                      : "text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text"
                  )}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-charcoal/60 dark:text-dark-muted font-medium shrink-0">
                {filteredProducts.length} Items
              </div>
            </div>
          </div>
        </div>
        {/* Category Filter Pills */}
        <div className="px-4 py-3 border-b border-charcoal/10 dark:border-dark-border bg-white dark:bg-dark-bg overflow-x-auto custom-scrollbar flex items-center gap-2">
          {uniqueCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-charcoal text-white dark:bg-dark-text dark:text-dark-surface shadow-sm"
                  : "bg-secondary/10 text-charcoal/70 hover:bg-secondary/20 dark:bg-dark-pill dark:text-dark-muted dark:hover:bg-dark-surfaceHover dark:hover:text-dark-text"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {viewMode === "grid" ? (
          /* Grid View */
          loading ? (
            /* Grid Skeletons */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-secondary/5 dark:bg-dark-bg">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-charcoal/10 dark:border-dark-border p-4 space-y-4 shadow-sm animate-pulse">
                  <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="w-1/3 h-3 rounded" />
                    <Skeleton className="w-full h-5 rounded" />
                    <Skeleton className="w-2/3 h-5 rounded" />
                  </div>
                  <div className="pt-2 border-t border-charcoal/5 dark:border-dark-border flex justify-between">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-12 h-4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-24 text-center text-red-600 bg-secondary/5 dark:bg-dark-bg">
              Failed to load products. Check your connection.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center bg-secondary/5 dark:bg-dark-bg">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-pill rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-charcoal/40 dark:text-dark-muted" />
                </div>
                <p className="text-lg font-serif text-charcoal dark:text-dark-text mb-2">No products found</p>
                <p className="text-sm text-charcoal/50 dark:text-dark-muted max-w-sm">
                  {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first product."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-secondary/5 dark:bg-dark-bg">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                return (
                  <div 
                    key={product.id}
                    className={cn(
                      "group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col shadow-soft hover:shadow-soft-hover hover:scale-[1.02]",
                      isSelected 
                        ? "border-charcoal dark:border-dark-text ring-1 ring-charcoal dark:ring-dark-text" 
                        : "border-charcoal/10 dark:border-dark-border"
                    )}
                  >
                    {/* Checkbox and Image Container */}
                    <div className="relative aspect-[3/4] bg-secondary/10 dark:bg-dark-pill overflow-hidden shrink-0">
                      {product.images?.[0] ? (
                        <img 
                          loading="lazy" 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-charcoal/20 dark:text-dark-muted bg-secondary/5">
                          No Image
                        </div>
                      )}

                      {/* Header Overlay (Checkbox & Actions) */}
                      <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/45 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
                        {/* Checkbox */}
                        <label className="cursor-pointer p-1">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                            className="w-4 h-4 rounded text-charcoal accent-charcoal border-white/40 cursor-pointer shadow-sm"
                          />
                        </label>

                        {/* Quick Actions */}
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                            className="p-1.5 bg-white hover:bg-brand-primary text-charcoal rounded-md shadow transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Badges Overlay */}
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10">
                        {product.featured && (
                          <span className="px-2 py-0.5 bg-white/95 text-charcoal text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                            Featured
                          </span>
                        )}
                        {product.bestSeller && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                            Bestseller
                          </span>
                        )}
                        {product.newArrival && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                            New
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Container */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-charcoal/40 dark:text-dark-muted font-bold block mb-1">
                          {product.category}
                        </span>
                        <h3 className="text-sm font-medium text-charcoal dark:text-dark-text line-clamp-2 mb-2 min-h-[40px] leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-charcoal/5 dark:border-dark-border mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-semibold text-charcoal dark:text-dark-text">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-charcoal/40 dark:text-dark-muted line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>

                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          product.stock === 0 
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                            : product.stock < 5 
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" 
                              : "bg-charcoal/5 text-charcoal/80 dark:bg-dark-pill dark:text-dark-muted"
                        )}>
                          Qty: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* List/Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                  <th className="px-6 py-4 font-semibold w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-charcoal dark:accent-dark-text rounded border-charcoal/20 cursor-pointer"
                      checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                      onChange={() => {
                        if (filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length) {
                          setSelectedProducts(new Set());
                        } else {
                          setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
                        }
                      }}
                    />
                  </th>
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="w-4 h-4 rounded" /></td>
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
                    <td colSpan={7} className="px-6 py-12 text-center text-red-600">
                      Failed to load products. Check your connection.
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
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
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-charcoal dark:accent-dark-text rounded border-charcoal/20 cursor-pointer"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
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
        )}
      </AdminCard>

      {/* Delete Single Product Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <>
        {showBulkDeleteModal && (
          <>
            <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-50"
              onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-2xl z-50 p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-charcoal dark:text-dark-text">Bulk Delete Products</h3>
                    <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">This action cannot be undone.</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
                  className="text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-secondary/10 dark:bg-dark-pill p-4 rounded-lg mb-8">
                <p className="font-medium text-charcoal dark:text-dark-text mb-1">
                  You are about to delete {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-charcoal/60 dark:text-dark-muted">
                  All images associated with these products will also be permanently deleted from storage.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleBulkDeleteConfirm}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? "Deleting..." : `Delete ${selectedProducts.size} Items`}
                </Button>
              </div>
            </div>
          </>
        )}
      </>
    </div>
  )
}
