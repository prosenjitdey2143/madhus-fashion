import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { collectionService } from "../../services/firebase/collectionService"
import { storageService } from "../../services/firebase/storageService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../utils/utils"
import { ImageUploader } from "../../ui/admin/ImageUploader"
import type { DBCollection } from "../../types"

export function AdminCollectionForm() {
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
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [isLinkManuallyEdited, setIsLinkManuallyEdited] = useState(false)
  const [image, setImage] = useState("")
  const [imageUrlInput, setImageUrlInput] = useState("")
  
  // Controls
  const [active, setActive] = useState(true)
  const [priority, setPriority] = useState("1")

  // Auto-generate link from title
  useEffect(() => {
    if (!isEditMode && !isLinkManuallyEdited) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setLink(slug ? `/products?collection=${slug}` : '');
    }
  }, [title, isEditMode, isLinkManuallyEdited]);

  useEffect(() => {
    async function loadCollection() {
      if (!id) return;
      try {
        const col = await collectionService.getCollectionById(id)
        if (col) {
          setTitle(col.title)
          setDescription(col.description || "")
          setLink(col.link || "")
          setImage(col.image)
          setActive(col.active)
          setPriority(col.priority.toString())
        } else {
          toast("Collection not found.", "error")
          navigate("/dashboard/collections")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load collection.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadCollection()
  }, [id, navigate, toast])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      // Reusing category image upload bucket since it's general files/categories/collections
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
    if (!title.trim()) return toast("Collection title is required", "error")
    if (!description.trim()) return toast("Description is required", "error")
    if (!image) return toast("An image is required", "error")
    if (!link.trim()) return toast("Link is required", "error")
    
    setSaving(true)

    const collectionData: Omit<DBCollection, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      image,
      active,
      priority: Number(priority) || 0,
    }

    try {
      if (isEditMode && id) {
        await collectionService.updateCollection(id, collectionData)
        toast("Collection updated successfully", "success")
      } else {
        await collectionService.createCollection(collectionData)
        toast("Collection created successfully", "success")
      }
      navigate("/dashboard/collections")
    } catch (err) {
      console.error(err)
      toast("Failed to save collection", "error")
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
          onClick={() => navigate("/dashboard/collections")}
          className="p-2 -ml-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <AdminPageHeader 
            title={isEditMode ? "Edit Collection" : "New Collection"} 
            subtitle={isEditMode ? `Updating ${title}` : "Create a new lookbook collection for the homepage"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Collection Image *</h2>
            <p className="text-sm text-charcoal/60 dark:text-dark-muted mb-4">Upload or paste a link for a high-resolution portrait or landscape editorial photo.</p>

            <div className="flex gap-2 mb-6">
              <Input 
                value={imageUrlInput} 
                onChange={e => setImageUrlInput(e.target.value)} 
                placeholder="Paste an image URL (e.g. from Google Images)" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border dark:text-dark-text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
              />
              <Button type="button" onClick={handleAddImageUrl} variant="outline" className="whitespace-nowrap">
                Set URL
              </Button>
            </div>

            {image ? (
              <div className="relative rounded-xl overflow-hidden group bg-secondary/10 dark:bg-dark-pill w-full aspect-[4/5] max-w-sm mx-auto border border-charcoal/10 dark:border-dark-border">
                <img src={image} alt="Collection Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <ImageUploader 
                onUpload={handleImageUpload}
                isUploading={uploadingImage}
                progress={uploadProgress}
                error={uploadError}
                onClearError={() => setUploadError(null)}
              />
            )}
          </AdminCard>

          {/* Details */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Collection Details</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Title *</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Modern Minimalist" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border dark:text-dark-text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Description *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={4}
                placeholder="Brief editorial description introducing this collection..." 
                className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg p-3 text-sm focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover transition-colors resize-none dark:text-dark-text"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Link *</label>
              <Input 
                value={link} 
                onChange={e => {
                  setLink(e.target.value);
                  setIsLinkManuallyEdited(true);
                }} 
                placeholder="e.g. /products?collection=minimalist" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border dark:text-dark-text"
              />
            </div>
          </AdminCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Controls */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Visibility</h2>
            
            <Toggle label="Active Collection" checked={active} onChange={() => setActive(!active)} />
            
            <div className="pt-4 space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Display Priority</label>
              <p className="text-xs text-charcoal/50 dark:text-dark-muted mb-2">Collections with higher priority numbers appear first on the page.</p>
              <Input 
                type="number"
                min="0"
                value={priority} 
                onChange={e => setPriority(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border dark:text-dark-text"
              />
            </div>
          </AdminCard>

        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-t border-charcoal/10 dark:border-dark-border p-4 z-30 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] transition-colors">
        <Button variant="outline" onClick={() => navigate("/dashboard/collections")} disabled={saving} className="dark:text-dark-text dark:border-dark-border">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || uploadingImage} className="min-w-[140px] flex items-center justify-center gap-2">
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Collection"}</span>
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
        checked ? "bg-emerald-500" : "bg-charcoal/20 dark:bg-dark-pill"
      )}>
        <div 
          className="absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full shadow-sm" style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </div>
  )
}
