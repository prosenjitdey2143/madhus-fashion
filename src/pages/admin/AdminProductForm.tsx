import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { productService } from "../../services/firebase/productService"
import { storageService } from "../../services/firebase/storageService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"

import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../utils/utils"
import { ImageUploader } from "../../ui/admin/ImageUploader"

const SIZES = ["One Size", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

import { collectionService } from "../../services/firebase/collectionService"
import { categoryService } from "../../services/firebase/categoryService"

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [stock, setStock] = useState("10")
  const [weight, setWeight] = useState("0.5")
  const [sizes, setSizes] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState("")
  
  // Flags
  const [featured, setFeatured] = useState(false)
  const [newArrival, setNewArrival] = useState(false)
  const [bestSeller, setBestSeller] = useState(false)
  const [discount, setDiscount] = useState("")
  const [productCollections, setProductCollections] = useState<string[]>([])
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false)
  const [dynamicCollections, setDynamicCollections] = useState<{value: string, label: string}[]>([])
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])

  // Fetch collections and categories for the dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const cols = await collectionService.getAllCollections()
        const options = cols.map(c => {
          let val = c.id
          if (c.link && c.link.includes("collection=")) {
            val = c.link.split("collection=")[1].split("&")[0]
          }
          return { value: val, label: c.title }
        })
        setDynamicCollections([{ value: "", label: "None (No Collection)" }, ...options])

        const cats = await categoryService.getActiveCategories()
        if (cats && cats.length > 0) {
          const catTitles = cats.map(c => c.title)
          setDynamicCategories(catTitles)
          // Set default category to first dynamic category if not already set (e.g. from loading product)
          setCategory(prev => prev || catTitles[0])
        }
      } catch (err) {
        console.error("Failed to load collections or categories", err)
      }
    }
    fetchData()
  }, [])

  // Auto-calculate discount
  useEffect(() => {
    if (price && originalPrice) {
      const p = Number(price);
      const op = Number(originalPrice);
      if (op > p && p > 0) {
        const discountPercent = Math.round(((op - p) / op) * 100);
        setDiscount(discountPercent.toString());
      } else {
        setDiscount("");
      }
    } else {
      setDiscount("");
    }
  }, [price, originalPrice]);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const prod = await productService.getProductById(id)
        if (prod) {
          setName(prod.name)
          setDescription(prod.description)
          setCategory(prod.category)
          setPrice(prod.price.toString())
          setOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : "")
          setStock(prod.stock.toString())
          setWeight(prod.weight ? prod.weight.toString() : "0.5")
          setSizes(prod.sizes || [])
          setImages(prod.images || [])
          setFeatured(prod.featured || false)
          setNewArrival(prod.newArrival || false)
          setBestSeller(prod.bestSeller || false)
          setDiscount(prod.discount ? prod.discount.toString() : "")
          setProductCollections(prod.collections || (prod.collection ? [prod.collection] : []))
        } else {
          toast("Product not found.", "error")
          navigate("/dashboard/products")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load product.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id, navigate, toast])

  const toggleSize = (size: string) => {
    setSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const toggleCollection = (collectionValue: string) => {
    if (!collectionValue) return; // Skip empty value ("None")
    setProductCollections(prev => 
      prev.includes(collectionValue) 
        ? prev.filter(c => c !== collectionValue)
        : [...prev, collectionValue]
    )
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      const url = await storageService.uploadProductImage(file, (progress) => {
        setUploadProgress(progress)
      })
      setImages(prev => [...prev, url])
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = async (urlToRemove: string) => {
    // Optimistically update UI
    setImages(prev => prev.filter(url => url !== urlToRemove))
    
    // In edit mode, we might want to actually delete from storage now, or wait until save.
    // For safety, we'll try to delete from storage directly if they click remove, 
    // or you could build a trash queue. We'll delete directly to save space.
    try {
      await storageService.deleteImage(urlToRemove)
      toast("Image deleted from storage", "success")
    } catch (err) {
      console.warn("Failed to delete from storage, but removed from UI", err)
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()])
      setImageUrlInput("")
    }
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) return toast("Product name is required", "error")
    if (!description.trim()) return toast("Description is required", "error")
    if (!category) return toast("Category is required. Please create a category first.", "error")
    if (!price || isNaN(Number(price))) return toast("Valid price is required", "error")
    if (images.length === 0) return toast("At least one image is required", "error")
    if (sizes.length === 0) return toast("Select at least one size", "error")

    setSaving(true)

    const productData: any = {
      name: name.trim(),
      description: description.trim(),
      category,
      collections: productCollections,
      price: Number(price),
      weight: Number(weight),
      stock: Number(stock),
      sizes,
      images,
      featured,
      newArrival,
      bestSeller,
    }
    
    if (originalPrice) productData.originalPrice = Number(originalPrice)
    else productData.originalPrice = null
    
    if (discount) productData.discount = Number(discount)
    else productData.discount = null

    try {
      if (isEditMode && id) {
        await productService.updateProduct(id, productData)
        toast("Product updated successfully", "success")
      } else {
        await productService.createProduct(productData)
        toast("Product created successfully", "success")
      }
      navigate("/dashboard/products")
    } catch (err) {
      console.error(err)
      toast("Failed to save product", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="w-1/3 h-10 mb-8" />
        <Skeleton className="w-full h-[600px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate("/dashboard/products")}
          className="p-2 -ml-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <AdminPageHeader 
            title={isEditMode ? "Edit Product" : "New Product"} 
            subtitle={isEditMode ? `Updating ${name}` : "Add a new piece to the collection"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Basic Information</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Product Name *</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Midnight Silk Slip Dress" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Description *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={5}
                placeholder="Detailed description of the fabric, fit, and styling..." 
                className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg p-3 text-sm focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text dark:placeholder:text-dark-muted/60 transition-colors resize-none"
              />
            </div>
          </AdminCard>

          {/* Media */}
          <AdminCard className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Media Gallery *</h2>
              <span className="text-xs text-charcoal/40 dark:text-dark-muted">{images.length} uploaded</span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <>
                  {images.map((img, idx) => (
                    <div 
                      key={img} className="aspect-[3/4] rounded-lg bg-secondary/10 dark:bg-dark-bg relative group overflow-hidden"
                    >
                      <img loading="lazy" src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => removeImage(img)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-white dark:bg-dark-text text-charcoal dark:text-dark-surface text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              <Input 
                value={imageUrlInput} 
                onChange={e => setImageUrlInput(e.target.value)} 
                placeholder="Or paste an image URL (e.g. from Google Images) and click Add" 
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
          </AdminCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Organization */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Organization</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Category *</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg p-3 text-sm focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text transition-colors appearance-none"
              >
                {dynamicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-charcoal/5 dark:border-dark-border relative">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text flex justify-between">
                <span>Lookbook Collections</span>
                <span className="text-xs text-charcoal/40 dark:text-dark-muted">{productCollections.length} selected</span>
              </label>
              <p className="text-xs text-charcoal/40 dark:text-dark-muted mb-2">Tag this product to multiple collections.</p>
              
              <div className="relative">
                {/* Dropdown Header */}
                <div 
                  className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg p-3 text-sm cursor-pointer flex justify-between items-center transition-colors hover:border-charcoal/30 dark:hover:border-dark-surfaceHover"
                  onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)}
                >
                  <span className="truncate text-charcoal/80 dark:text-dark-text font-medium pr-4">
                    {productCollections.length === 0 
                      ? "None (No Collection)" 
                      : productCollections.map(val => dynamicCollections.find(c => c.value === val)?.label || val).join(", ")}
                  </span>
                  <span className="text-charcoal/40 dark:text-dark-muted text-[10px]">▼</span>
                </div>
                
                {/* Dropdown Menu */}
                {isCollectionDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCollectionDropdownOpen(false)} />
                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-dark-surface border border-charcoal/10 dark:border-dark-border rounded-lg shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
                      {dynamicCollections.map(col => {
                        const isChecked = col.value === "" ? productCollections.length === 0 : productCollections.includes(col.value);
                        return (
                          <label key={col.value} className="group flex items-center gap-3 px-4 py-3 hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover cursor-pointer border-b border-charcoal/5 dark:border-dark-border last:border-0 transition-colors">
                            <div className="relative flex items-center shrink-0">
                              <input 
                                type="checkbox"
                                className="peer sr-only"
                                checked={isChecked}
                                onChange={() => {
                                  if (col.value === "") {
                                    setProductCollections([]);
                                    setIsCollectionDropdownOpen(false);
                                  } else {
                                    toggleCollection(col.value);
                                  }
                                }}
                              />
                              <div className={cn(
                                "w-5 h-5 rounded border transition-all duration-300 flex items-center justify-center",
                                isChecked 
                                  ? "bg-charcoal border-charcoal dark:bg-dark-text dark:border-dark-text shadow-sm" 
                                  : "border-charcoal/30 dark:border-dark-border bg-transparent group-hover:border-charcoal/50 dark:group-hover:border-dark-muted"
                              )}>
                                {isChecked && (
                                  <svg className="w-3.5 h-3.5 text-white dark:text-dark-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={cn(
                              "text-sm transition-colors truncate",
                              isChecked ? "text-charcoal font-semibold dark:text-dark-text" : "text-charcoal/70 dark:text-dark-muted"
                            )}>
                              {col.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </AdminCard>

          {/* Pricing */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-dark-muted">₹</span>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full pl-7 bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Compare At</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-dark-muted">₹</span>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={originalPrice} 
                    onChange={e => setOriginalPrice(e.target.value)} 
                    className="w-full pl-7 bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Discount % (Auto-calculated)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-dark-muted">%</span>
                  <Input 
                    type="number"
                    value={discount} 
                    disabled
                    className="w-full pl-7 bg-secondary/10 dark:bg-dark-surface border-charcoal/10 dark:border-dark-border cursor-not-allowed text-charcoal/60 dark:text-dark-muted"
                  />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Inventory */}
          <AdminCard className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Inventory</h2>
            </div>
            
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Total Stock Quantity *</label>
              <Input 
                type="number"
                min="0"
                step="1"
                value={stock} 
                onChange={e => setStock(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>
            
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Weight (kg) *</label>
              <Input 
                type="number"
                min="0"
                step="0.01"
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text flex justify-between">
                <span>Available Sizes *</span>
                <span className="text-xs text-charcoal/40 dark:text-dark-muted">{sizes.length} selected</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "px-3 py-1.5 border rounded-md text-xs font-medium transition-colors",
                      sizes.includes(size) 
                        ? "bg-charcoal text-primary border-charcoal dark:bg-dark-text dark:text-dark-surface dark:border-dark-text" 
                        : "bg-transparent border-charcoal/20 text-charcoal/60 hover:border-charcoal/40 hover:text-charcoal dark:border-dark-border dark:text-dark-muted dark:hover:border-dark-surfaceHover dark:hover:text-dark-text"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </AdminCard>

          {/* Flags */}
          <AdminCard className="space-y-4">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Product Flags</h2>
            
            <Toggle label="Featured Product" checked={featured} onChange={() => setFeatured(!featured)} />
            <Toggle label="New Arrival" checked={newArrival} onChange={() => setNewArrival(!newArrival)} />
            <Toggle label="Best Seller" checked={bestSeller} onChange={() => setBestSeller(!bestSeller)} />
          </AdminCard>

        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white/80 dark:bg-dark-surface/90 backdrop-blur-md border-t border-charcoal/10 dark:border-dark-border p-4 z-30 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <Button variant="outline" onClick={() => navigate("/dashboard/products")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || uploadingImage} className="min-w-[140px] flex items-center justify-center gap-2">
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Product"}</span>
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
        checked ? "bg-charcoal dark:bg-dark-text" : "bg-charcoal/20 dark:bg-dark-border"
      )}>
        <div 
          className="absolute top-0.5 bottom-0.5 w-4 bg-white dark:bg-dark-surface rounded-full shadow-sm" style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
    </div>
  )
}
