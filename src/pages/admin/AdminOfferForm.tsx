import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2, Search, CheckSquare, Square } from "lucide-react"
import { offerService } from "../../services/firebase/offerService"
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
import type { Offer, Product } from "../../types"

export function AdminOfferForm() {
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
  const [subtitle, setSubtitle] = useState("")
  const [description, setDescription] = useState("")
  const [ctaText, setCtaText] = useState("Shop Now")
  const [ctaLink, setCtaLink] = useState("/products")
  const [discount, setDiscount] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [imageUrlInput, setImageUrlInput] = useState("")
  
  // Controls
  const [active, setActive] = useState(true)
  const [priority, setPriority] = useState("1")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Product picker
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState("")

  useEffect(() => {
    async function loadOffer() {
      if (!id) return;
      try {
        const offer = await offerService.getOfferById(id)
        if (offer) {
          setTitle(offer.title)
          setSubtitle(offer.subtitle || "")
          setDescription(offer.description || "")
          setCtaText(offer.ctaText || "")
          setCtaLink(offer.ctaLink || "")
          setDiscount(offer.discount ? offer.discount.toString() : "")
          setBannerImage(offer.bannerImage)
          setActive(offer.active)
          setPriority(offer.priority.toString())
          setSelectedProductIds(offer.productIds || [])
          if (offer.startDate) setStartDate(offer.startDate.substring(0, 16))
          if (offer.endDate) setEndDate(offer.endDate.substring(0, 16))
        } else {
          toast("Campaign not found.", "error")
          navigate("/dashboard/offers")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load campaign.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadOffer()
  }, [id, navigate, toast])

  // Fetch all products for the picker
  useEffect(() => {
    async function loadProducts() {
      try {
        const prods = await productService.getProducts()
        setAllProducts(prods)
      } catch (err) {
        console.error("Failed to load products for picker", err)
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      // If replacing an existing banner, we could optionally delete the old one here to save space
      const url = await storageService.uploadOfferBanner(file, (progress) => {
        setUploadProgress(progress)
      })
      setBannerImage(url)
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload banner")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveBanner = async () => {
    if (!bannerImage) return;
    try {
      await storageService.deleteImage(bannerImage)
      setBannerImage("")
      toast("Banner removed", "success")
    } catch (e) {
      console.warn("Could not delete from storage", e)
      setBannerImage("")
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setBannerImage(imageUrlInput.trim());
    setImageUrlInput("");
  }

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const handleSave = async () => {
    if (!title.trim()) return toast("Campaign title is required", "error")
    if (!bannerImage) return toast("A banner image is required", "error")
    if (!ctaText.trim()) return toast("Button text is required", "error")
    if (!ctaLink.trim()) return toast("Button link is required", "error")

    setSaving(true)

    const offerData: Omit<Offer, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      discount: discount ? Number(discount) : undefined,
      ctaText: ctaText.trim(),
      ctaLink: ctaLink.trim(),
      bannerImage,
      active,
      priority: Number(priority) || 0,
      productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined
    }

    try {
      if (isEditMode && id) {
        await offerService.updateOffer(id, offerData)
        toast("Campaign updated successfully", "success")
      } else {
        await offerService.createOffer(offerData)
        toast("Campaign created successfully", "success")
      }
      navigate("/dashboard/offers")
    } catch (err) {
      console.error(err)
      toast("Failed to save campaign", "error")
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
          onClick={() => navigate("/dashboard/offers")}
          className="p-2 -ml-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <AdminPageHeader 
            title={isEditMode ? "Edit Campaign" : "New Campaign"} 
            subtitle={isEditMode ? `Updating ${title}` : "Create a new promotional banner"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Hero Banner Visual *</h2>
            <p className="text-sm text-charcoal/60 dark:text-dark-muted mb-4">Upload or paste a link for a high resolution editorial image. Desktop ratio 16:9 recommended.</p>

            <div className="flex gap-2 mb-6">
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
                Set URL
              </Button>
            </div>

            {bannerImage ? (
              <div className="relative rounded-lg overflow-hidden group bg-secondary/10 dark:bg-dark-bg aspect-video">
                <img loading="lazy" src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={handleRemoveBanner}
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

          {/* Copy Details */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Marketing Copy</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Headline *</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. The Summer Silk Collection" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Subtitle (Optional)</label>
              <Input 
                value={subtitle} 
                onChange={e => setSubtitle(e.target.value)} 
                placeholder="e.g. Effortless elegance for the new season" 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Description (Optional)</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
                placeholder="Additional details for the promotion..." 
                className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border dark:text-dark-text rounded-lg p-3 text-sm focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover transition-colors resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Button Text *</label>
                <Input 
                  value={ctaText} 
                  onChange={e => setCtaText(e.target.value)} 
                  placeholder="e.g. Shop Now" 
                  className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Button Link *</label>
                <Input 
                  value={ctaLink} 
                  onChange={e => setCtaLink(e.target.value)} 
                  placeholder="e.g. /products?category=Dresses" 
                  className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                />
              </div>
            </div>
          </AdminCard>
          {/* Product Picker */}
          <AdminCard className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Campaign Products</h2>
                <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-1">Pick the products you want to feature in this campaign's offers section.</p>
              </div>
              {selectedProductIds.length > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-charcoal dark:bg-dark-text text-white dark:text-dark-bg">
                  {selectedProductIds.length} selected
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 dark:text-dark-muted" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border dark:text-dark-text rounded-lg focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover transition-colors"
              />
            </div>

            {/* Quick actions */}
            {allProducts.length > 0 && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProductIds(filteredProducts.map(p => p.id))}
                  className="flex items-center gap-1.5 text-xs text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Select all visible
                </button>
                <span className="text-charcoal/20 dark:text-dark-border">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="flex items-center gap-1.5 text-xs text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors"
                >
                  <Square className="w-3.5 h-3.5" /> Clear all
                </button>
              </div>
            )}

            {/* Product list */}
            {productsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-charcoal/40 dark:text-dark-muted text-center py-8">
                {productSearch ? "No products match your search." : "No products found. Add products first."}
              </p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id)
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        isSelected
                          ? "border-charcoal/40 bg-charcoal/5 dark:border-dark-text dark:bg-dark-surfaceHover shadow-sm"
                          : "border-charcoal/8 bg-secondary/5 hover:border-charcoal/20 hover:bg-secondary/10 dark:border-dark-border dark:bg-dark-pill dark:hover:border-dark-surfaceHover dark:hover:bg-dark-surfaceHover"
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors",
                        isSelected ? "bg-charcoal border-charcoal dark:bg-dark-text dark:border-dark-text" : "border-charcoal/20 bg-white dark:border-dark-border dark:bg-dark-surface"
                      )}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white dark:text-dark-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Product image */}
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary/20 dark:bg-dark-bg flex-shrink-0">
                        {product.images?.[0] ? (
                          <img loading="lazy" src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal/20 dark:text-dark-muted text-xs">No img</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal dark:text-dark-text truncate">{product.name}</p>
                        <p className="text-xs text-charcoal/40 dark:text-dark-muted mt-0.5">{product.category}</p>
                      </div>

                      {/* Price & badges */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-charcoal dark:text-dark-text">₹{product.price}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-charcoal/40 dark:text-dark-muted line-through">₹{product.originalPrice}</p>
                        )}
                        <div className="flex gap-1 justify-end mt-1">
                          {product.bestSeller && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">Best Seller</span>}
                          {product.newArrival && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">New</span>}
                          {product.stock === 0 && <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">Out of stock</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedProductIds.length > 0 && (
              <p className="text-xs text-charcoal/50 dark:text-dark-muted pt-2 border-t border-charcoal/5 dark:border-dark-border">
                ✦ {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} will appear in the Exclusive Offers section for this campaign.
              </p>
            )}
          </AdminCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Controls */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Visibility</h2>
            
            <Toggle label="Active Campaign" checked={active} onChange={() => setActive(!active)} />
            
            <div className="pt-4 space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Display Priority</label>
              <p className="text-xs text-charcoal/50 dark:text-dark-muted mb-2">Set to 1, 2, or 3. Priority 1 is the first slide. Maximum 3 slides allowed.</p>
              <Input 
                type="number"
                min="1"
                max="3"
                value={priority} 
                onChange={e => {
                  const val = Math.min(Math.max(Number(e.target.value) || 1, 1), 3);
                  setPriority(val.toString());
                }} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
              />
            </div>

            <div className="pt-2 space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Discount Highlight %</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-dark-muted">%</span>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={discount} 
                  onChange={e => setDiscount(e.target.value)} 
                  placeholder="Optional"
                  className="w-full pl-7 bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                />
              </div>
            </div>
          </AdminCard>

          {/* Schedule */}
          <AdminCard className="space-y-6">
            <h2 className="text-xl font-serif text-charcoal dark:text-dark-text mb-4">Schedule</h2>
            <p className="text-xs text-charcoal/50 dark:text-dark-muted mb-4">Leave empty to run indefinitely.</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Start Date</label>
              <Input 
                type="datetime-local"
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">End Date</label>
              <Input 
                type="datetime-local"
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border text-sm"
              />
            </div>
          </AdminCard>

        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white/80 dark:bg-dark-surface/90 backdrop-blur-md border-t border-charcoal/10 dark:border-dark-border p-4 z-30 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <Button variant="outline" onClick={() => navigate("/dashboard/offers")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || uploadingImage} className="min-w-[140px] flex items-center justify-center gap-2">
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Create Campaign"}</span>
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
