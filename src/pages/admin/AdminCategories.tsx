import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Edit2, Trash2, AlertTriangle, X } from "lucide-react"
import { categoryService } from "../../services/firebase/categoryService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import type { Category } from "../../types"

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAllCategories()
      setCategories(data)
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true)
    try {
      await categoryService.deleteCategory(categoryToDelete.id, categoryToDelete.image)
      toast(`${categoryToDelete.title} deleted successfully`, "success")
      setCategoryToDelete(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
      toast("Failed to delete category. Please try again.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader 
        title="Categories" 
        subtitle="Manage 'Shop by Category' section on the homepage."
        action={
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard/categories/new")}
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        }
      />

      <AdminCard className="p-0 overflow-hidden">
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Link</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="w-full h-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-12 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-600">
                    Failed to load categories. Check your connection.
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-pill rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-charcoal/40 dark:text-dark-muted" />
                      </div>
                      <p className="text-lg font-serif text-charcoal dark:text-dark-text mb-2">No categories found</p>
                      <p className="text-sm text-charcoal/50 dark:text-dark-muted max-w-sm">
                        Get started by creating your first category.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr 
                    key={category.id} className="hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-bg rounded-full overflow-hidden flex-shrink-0">
                          {category.image && (
                            <img loading="lazy" src={category.image} alt={category.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal dark:text-dark-text text-sm">{category.title}</p>
                          <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-0.5">{category.items}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal/70 dark:text-dark-muted truncate max-w-[200px]">{category.link}</td>
                    <td className="px-6 py-4">
                      {category.active ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[10px] uppercase font-bold tracking-wider">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-charcoal/10 text-charcoal/70 rounded text-[10px] uppercase font-bold tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-charcoal dark:text-dark-text bg-secondary/20 dark:bg-dark-pill px-2 py-1 rounded">
                        {category.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/categories/edit/${category.id}`)}
                          className="p-2 text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-surfaceHover rounded transition-colors shadow-sm dark:shadow-none"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCategoryToDelete(category)}
                          className="p-2 text-red-600/60 dark:text-red-400/80 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors shadow-sm dark:shadow-none"
                          title="Delete Category"
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
        {categoryToDelete && (
          <>
            <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-50"
              onClick={() => !isDeleting && setCategoryToDelete(null)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-2xl z-50 p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-charcoal dark:text-dark-text">Delete Category</h3>
                    <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">This action cannot be undone.</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isDeleting && setCategoryToDelete(null)}
                  className="text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-secondary/10 dark:bg-dark-pill p-4 rounded-lg mb-8 flex items-center gap-4">
                <img loading="lazy" src={categoryToDelete.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-charcoal dark:text-dark-text">{categoryToDelete.title}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCategoryToDelete(null)}
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
