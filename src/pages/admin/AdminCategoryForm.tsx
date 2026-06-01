import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { categoryService } from "../../services/firebase/categoryService"
import { storageService } from "../../services/firebase/storageService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../utils/utils"
import { ImageUploader } from "../../ui/admin/ImageUploader"
import type { Category } from "../../types"

export function AdminCategoryForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  
  // Media upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [items, setItems] = useState("120+ items")
  const [link, setLink] = useState("")
  const [image, setImage] = useState("")
  const [imageUrlInput, setImageUrlInput] = useState("")
  
  // Controls
  const [active, setActive] = useState(true)
  const [priority, setPriority] = useState("1")

  const [linkManuallyEdited, setLinkManuallyEdited] = useState(false)

  // Auto-generate link from title when creating a new category
  useEffect(() => {
    if (!isEditMode && !linkManuallyEdited && title) {
      const formattedTitle = title.trim().toLowerCase().replace(/\s+/g, '-')
      setLink(`/products?category=${formattedTitle}`)
    } else if (!isEditMode && !linkManuallyEdited && !title) {
      setLink("")
    }
  }, [title, isEditMode, linkManuallyEdited])

  useEffect(() => {
    async function loadCategory() {
      if (!id) return;
      try {
        const category = await categoryService.getCategoryById(id)
        if (category) {
          setTitle(category.title)
          setItems(category.items || "")
          setLink(category.link || "")
          setImage(category.image)
          setActive(category.active)
          setPriority(category.priority.toString())
        } else {
          toast("Category not found.", "error")
          navigate("/dashboard/categories")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load category.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadCategory()
  }, [id, navigate, toast])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      const url = await storageService.uploadCategoryImage(file, (progress) => {
        setUploadProgress(progress)
      })
      setImage(url)
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!image) return;
    try {
      await storageService.deleteImage(image)
      setImage("")
      toast("Image removed", "success")
    } catch (e) {
      console.warn("Could not delete from storage", e)
      setImage("")
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImage(imageUrlInput.trim());
    setImageUrlInput("");
  }

  const handleSave = async () => {
    // Validation
    if (!title.trim()) return toast("Category title is required", "error")
    if (!image) return toast("An image is required", "error")
    if (!link.trim()) return toast("Link is required", "error")
    
    setSaving(true)

    const categoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      items: items.trim(),
      link: link.trim(),
      image,
      active,
      priority: Number(priority) || 0,
    }

    try {
      if (isEditMode && id) {
        await categoryService.updateCategory(id, categoryData)
        toast("Category updated successfully", "success")
      } else {
        await categoryService.createCategory(categoryData)
        toast("Category created successfully", "success")
      }
      navigate("/dashboard/categories")
    } catch (err) {
      console.error(err)
      toast("Failed to save category", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="w-1/3 h-10 mb-8" />
        <Skeleton className="w-full h-64 rounded-xl" />
        <Skeleton className="w-full h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate("/dashboard/categories")}
          className="p-2 -ml-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <AdminPageHeader 
            title={isEditMode ? "Edit Category" : "New Category"} 
            subtitle={isEditMode ? `Updating ${title}` : "Create a new category for the homepage"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Category Image *</h2>
            <p className="text-sm text-charcoal/60 dark:text-dark-muted mb-4">Upload a square or portrait image (will be displayed as a circle).</p>

            {image ? (
              <div className="relative rounded-xl overflow-hidden group bg-secondary/10 dark:bg-dark-bg w-64 h-64 mx-auto border border-charcoal/10 dark:border-dark-border">
                <img loading="lazy" src={image} alt="Category Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Replace Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={imageUrlInput} 
                    onChange={e => setImageUrlInput(e.target.value)} 
                    placeholder="Paste an image URL (e.g. from Google Images)" 
                    className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddImageUrl} variant="outline" className="whitespace-nowrap">
                    Add URL
                  </Button>
                </div>
                
                <ImageUploader 
                  onUpload={handleImageUpload}
                  isUploading={uploadingImage}
                  progress={uploadProgress}
                  error={uploadError}
                  onClearError={() => setUploadError(null)}
                />
              </div>
            )}
          </AdminCard>

          {/* Details */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Category Details</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Title *</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Dresses" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Items Label (Optional)</label>
              <Input 
                value={items} 
                onChange={e => setItems(e.target.value)} 
                placeholder="e.g. 120+ items" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Link *</label>
              <Input 
                value={link} 
                onChange={e => {
                  setLink(e.target.value)
                  setLinkManuallyEdited(true)
                }} 
                placeholder="e.g. /products?category=dresses" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>
          </AdminCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Controls */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Visibility</h2>
            
            <Toggle label="Active Category" checked={active} onChange={() => setActive(!active)} />
            
            <div className="pt-4 space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Display Priority</label>
              <p className="text-xs text-charcoal/50 dark:text-dark-muted mb-2">Categories with lower priority numbers (e.g. 1) appear first in the scrollable list.</p>
              <Input 
                type="number"
                min="0"
                value={priority} 
                onChange={e => setPriority(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>
          </AdminCard>

        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white/80 dark:bg-dark-surface/90 backdrop-blur-md border-t border-charcoal/10 dark:border-dark-border p-4 z-30 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <Button variant="outline" onClick={() => navigate("/dashboard/categories")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || uploadingImage} className="min-w-[140px] flex items-center justify-center gap-2">
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Category"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 cursor-pointer group" onClick={onChange}>
      <span className="text-sm font-medium text-charcoal/80 dark:text-dark-text group-hover:text-charcoal dark:group-hover:text-white transition-colors">{label}</span>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-300",
        checked ? "bg-emerald-500" : "bg-charcoal/20 dark:bg-dark-border"
      )}>
        <div 
          className="absolute top-0.5 bottom-0.5 w-4 bg-white dark:bg-dark-surface rounded-full shadow-sm" style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </div>
  )
}
