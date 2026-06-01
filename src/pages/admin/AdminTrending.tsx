import { useState, useEffect } from "react"
import { Save, Image as ImageIcon, Search, CheckSquare, Square } from "lucide-react"
import { trendingService } from "../../services/firebase/trendingService"
import { productService } from "../../services/firebase/productService"
import { storageService } from "../../services/firebase/storageService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input, Textarea } from "../../ui/Form"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import { cn } from "../../utils/utils"
import { ImageUploader } from "../../ui/admin/ImageUploader"
import type { TrendingSettings, TrendingCard, Product } from "../../types"

// Default structure based on the current layout
const DEFAULT_CARDS: TrendingCard[] = [
  {
    id: "card_1",
    title: "Summer Silhouettes",
    subtitle: "EST. 01 / SELECTION",
    description: "Breathable, flowing designs crafted from finest linens and raw cotton, inspired by sun-kissed European afternoons.",
    mainImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop",
    textureImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    productIds: []
  },
  {
    id: "card_2",
    title: "Evening Elegance",
    subtitle: "EST. 02 / SELECTION",
    description: "Command attention in structured evening wear, liquid satins, and tailored coordinates made for moonlit occasions.",
    mainImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop",
    textureImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
    productIds: []
  }
];

export function AdminTrending() {
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState("")
  
  const [settings, setSettings] = useState<TrendingSettings>({
    sectionTitle: "Trending Now",
    sectionSubtitle: "Seasonal Editorial",
    sectionDescription: "Curated visual stories capturing the essence of the current era. Each piece is a testament to structured luxury and modern ease.",
    cards: DEFAULT_CARDS
  })

  // Upload States
  const [uploadingImage, setUploadingImage] = useState<string | null>(null) // Tracks which image is uploading

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingData, products] = await Promise.all([
          trendingService.getTrendingSettings(),
          productService.getProducts()
        ])
        if (trendingData) {
          // Merge with default cards in case data is missing
          setSettings({
            ...trendingData,
            cards: [
              trendingData.cards?.[0] || DEFAULT_CARDS[0],
              trendingData.cards?.[1] || DEFAULT_CARDS[1]
            ]
          })
        }
        setAllProducts(products)
      } catch (err) {
        console.error("Failed to load trending data", err)
        toast("Failed to load data.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const handleImageUpload = async (file: File, cardIndex: number, imageType: 'mainImage' | 'textureImage') => {
    const uploadKey = `${cardIndex}-${imageType}`
    setUploadingImage(uploadKey)
    try {
      const url = await storageService._uploadInternal(file, 'trending')
      
      setSettings(prev => {
        const newCards = [...prev.cards]
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          [imageType]: url
        }
        return { ...prev, cards: newCards }
      })
      toast("Image uploaded successfully", "success")
    } catch (error) {
      console.error(error)
      toast("Failed to upload image", "error")
    } finally {
      setUploadingImage(null)
    }
  }

  const handleSave = async () => {
    if (!settings.sectionTitle.trim()) return toast("Section title is required", "error")
    
    setSaving(true)
    try {
      await trendingService.saveTrendingSettings(settings)
      toast("Trending section updated!", "success")
    } catch (error) {
      toast("Failed to save changes", "error")
    } finally {
      setSaving(false)
    }
  }

  const toggleProduct = (cardIndex: number, productId: string) => {
    setSettings(prev => {
      const newCards = [...prev.cards]
      const card = newCards[cardIndex]
      const isSelected = card.productIds.includes(productId)
      
      newCards[cardIndex] = {
        ...card,
        productIds: isSelected 
          ? card.productIds.filter(id => id !== productId)
          : [...card.productIds, productId]
      }
      return { ...prev, cards: newCards }
    })
  }

  const updateCardText = (cardIndex: number, field: keyof TrendingCard, value: string) => {
    setSettings(prev => {
      const newCards = [...prev.cards]
      newCards[cardIndex] = {
        ...newCards[cardIndex],
        [field]: value
      }
      return { ...prev, cards: newCards }
    })
  }

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-charcoal/5 dark:bg-dark-pill w-1/4 rounded"></div>
        <div className="h-64 bg-charcoal/5 dark:bg-dark-surface rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <AdminPageHeader 
        title="Trending Now"
        subtitle="Manage the high-fashion editorial section on the homepage."
        action={
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        }
      />

      {/* Section Global Settings */}
      <AdminCard className="space-y-6 border-t-4 border-t-brand-accent dark:border-t-dark-border">
        <div>
          <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Section Header</h2>
          <p className="text-sm text-charcoal/50 dark:text-dark-muted mt-1">Configure the main title and description for the entire section.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Section Title</label>
            <Input 
              value={settings.sectionTitle} 
              onChange={e => setSettings(prev => ({...prev, sectionTitle: e.target.value}))} 
              className="bg-secondary/5 dark:bg-dark-pill"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Section Subtitle (e.g. Seasonal Editorial)</label>
            <Input 
              value={settings.sectionSubtitle} 
              onChange={e => setSettings(prev => ({...prev, sectionSubtitle: e.target.value}))} 
              className="bg-secondary/5 dark:bg-dark-pill"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text mb-1.5 block">Section Description</label>
          <Textarea 
            value={settings.sectionDescription} 
            onChange={e => setSettings(prev => ({...prev, sectionDescription: e.target.value}))}
            className="bg-secondary/5 dark:bg-dark-pill min-h-[80px]" 
          />
        </div>
      </AdminCard>

      {/* Cards Config */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {settings.cards.map((card, index) => (
          <AdminCard key={card.id} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-charcoal/10 dark:border-dark-border pb-4">
              <div className="w-8 h-8 rounded bg-charcoal dark:bg-dark-pill text-white flex items-center justify-center font-serif text-sm">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-serif text-charcoal dark:text-dark-text">Card {index + 1} Configuration</h3>
                <p className="text-xs text-charcoal/50 dark:text-dark-muted">{index === 0 ? 'Left column (Tall)' : 'Right column (Overlapping)'}</p>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Card Title</label>
                <Input 
                  value={card.title} 
                  onChange={e => updateCardText(index, 'title', e.target.value)}
                  className="bg-secondary/5 dark:bg-dark-pill"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Card Subtitle</label>
                <Input 
                  value={card.subtitle} 
                  onChange={e => updateCardText(index, 'subtitle', e.target.value)}
                  className="bg-secondary/5 dark:bg-dark-pill"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text mb-1.5 block">Card Description</label>
                <Textarea 
                  value={card.description} 
                  onChange={e => updateCardText(index, 'description', e.target.value)}
                  className="bg-secondary/5 dark:bg-dark-pill min-h-[80px]" 
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4 pt-4 border-t border-charcoal/5 dark:border-dark-border">
              <h4 className="text-sm font-medium text-charcoal dark:text-dark-text">Images</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-charcoal/60 dark:text-dark-muted">Main Image</label>
                  {card.mainImage && (
                    <div className="w-full h-32 rounded bg-charcoal/5 dark:bg-dark-bg overflow-hidden mb-2">
                      <img loading="lazy" src={card.mainImage} className="w-full h-full object-cover" alt="Main" />
                    </div>
                  )}
                  <ImageUploader 
                    onUpload={(file) => handleImageUpload(file, index, 'mainImage')}
                    isUploading={uploadingImage === `${index}-mainImage`}
                    progress={0}
                    error={null}
                    onClearError={() => {}}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-charcoal/60 dark:text-dark-muted">Detail/Texture Image</label>
                  {card.textureImage && (
                    <div className="w-full h-32 rounded bg-charcoal/5 dark:bg-dark-bg overflow-hidden mb-2">
                      <img loading="lazy" src={card.textureImage} className="w-full h-full object-cover" alt="Texture" />
                    </div>
                  )}
                  <ImageUploader 
                    onUpload={(file) => handleImageUpload(file, index, 'textureImage')}
                    isUploading={uploadingImage === `${index}-textureImage`}
                    progress={0}
                    error={null}
                    onClearError={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Linked Products */}
            <div className="space-y-4 pt-4 border-t border-charcoal/5 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-charcoal dark:text-dark-text">Linked Products</h4>
                {card.productIds.length > 0 && (
                  <span className="text-[10px] bg-charcoal dark:bg-dark-pill text-white dark:text-dark-text px-2 py-0.5 rounded-full font-medium">
                    {card.productIds.length} Selected
                  </span>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/40 dark:text-dark-muted" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products to link..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text"
                />
              </div>

              <div className="h-48 overflow-y-auto border border-charcoal/10 dark:border-dark-border rounded bg-white dark:bg-dark-surface">
                {filteredProducts.map(product => {
                  const isSelected = card.productIds.includes(product.id)
                  return (
                    <div 
                      key={product.id}
                      onClick={() => toggleProduct(index, product.id)}
                      className={cn(
                        "flex items-center gap-3 p-2 border-b border-charcoal/5 dark:border-dark-border cursor-pointer hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover transition-colors",
                        isSelected && "bg-charcoal/5 dark:bg-dark-pill"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0",
                        isSelected ? "bg-charcoal dark:bg-dark-text border-charcoal dark:border-dark-text" : "border-charcoal/20 dark:border-dark-border"
                      )}>
                        {isSelected && <CheckSquare className="w-3 h-3 text-white dark:text-dark-surface" />}
                      </div>
                      
                      <div className="w-8 h-8 rounded bg-secondary/20 dark:bg-dark-bg shrink-0 overflow-hidden">
                        {product.images?.[0] && <img loading="lazy" src={product.images[0]} className="w-full h-full object-cover" />}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-charcoal dark:text-dark-text truncate">{product.name}</p>
                        <p className="text-[10px] text-charcoal/40 dark:text-dark-muted truncate">{product.category}</p>
                      </div>
                    </div>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <div className="p-4 text-center text-xs text-charcoal/40 dark:text-dark-muted">No products found.</div>
                )}
              </div>
              <p className="text-[10px] text-charcoal/50 dark:text-dark-muted leading-relaxed">
                When a user clicks "Discover The Collection" on this card, they will be taken to a page showing only these hand-picked items.
              </p>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
