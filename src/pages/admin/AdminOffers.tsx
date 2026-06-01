import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Edit2, Trash2, AlertTriangle, X, Tag, Megaphone, Calendar } from "lucide-react"
import { offerService } from "../../services/firebase/offerService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Skeleton } from "../../ui/Skeleton"
import { useToast } from "../../context/ToastContext"
import type { Offer } from "../../types"

export function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const data = await offerService.getAllOffers()
        setOffers(data)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    setIsDeleting(true)
    try {
      await offerService.deleteOffer(offerToDelete.id, offerToDelete.bannerImage)
      toast(`Campaign deleted successfully`, "success")
      setOffers(prev => prev.filter(o => o.id !== offerToDelete.id))
      setOfferToDelete(null)
    } catch (err) {
      console.error(err)
      toast("Failed to delete campaign. Please try again.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  // Metrics
  const activeCount = offers.filter(o => o.active).length
  const scheduledCount = offers.filter(o => o.startDate && new Date(o.startDate) > new Date()).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader 
        title="Marketing & Offers" 
        subtitle="Manage homepage banners, seasonal campaigns, and global discounts."
        action={
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate("/dashboard/offers/new")}
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Campaigns" value={offers.length.toString()} icon={<Megaphone className="w-5 h-5 text-charcoal/60" />} />
        <MetricCard title="Active Campaigns" value={activeCount.toString()} icon={<Tag className="w-5 h-5 text-emerald-600" />} />
        <MetricCard title="Scheduled" value={scheduledCount.toString()} icon={<Calendar className="w-5 h-5 text-blue-600" />} />
      </div>

      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-charcoal/5 dark:bg-dark-pill border-b border-charcoal/10 dark:border-dark-border text-xs uppercase tracking-wider text-charcoal/50 dark:text-dark-muted">
                <th className="px-6 py-4 font-semibold">Campaign</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="w-full h-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-12 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-600">
                    Failed to load campaigns. Check your connection.
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-secondary/20 dark:bg-dark-pill rounded-full flex items-center justify-center mb-4">
                        <Megaphone className="w-8 h-8 text-charcoal/40 dark:text-dark-muted" />
                      </div>
                      <p className="text-lg font-serif text-charcoal dark:text-dark-text mb-2">No campaigns found</p>
                      <p className="text-sm text-charcoal/50 dark:text-dark-muted max-w-sm mb-6">
                        You have not created any promotional banners yet.
                      </p>
                      <Button onClick={() => navigate("/dashboard/offers/new")}>Create First Campaign</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr 
                    key={offer.id} className="hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-12 bg-secondary/20 dark:bg-dark-bg rounded overflow-hidden flex-shrink-0">
                          {offer.bannerImage && (
                            <img loading="lazy" src={offer.bannerImage} alt={offer.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal dark:text-dark-text text-sm">{offer.title}</p>
                          {offer.subtitle && <p className="text-xs text-charcoal/50 dark:text-dark-muted line-clamp-1">{offer.subtitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-charcoal/70 dark:text-dark-muted">Level {offer.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-charcoal dark:text-dark-text">
                        {offer.discount ? `${offer.discount}% OFF` : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={offer.active} startDate={offer.startDate} endDate={offer.endDate} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/dashboard/offers/edit/${offer.id}`)}
                          className="p-2 text-charcoal/60 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-white dark:hover:bg-dark-surfaceHover rounded transition-colors shadow-sm dark:shadow-none"
                          title="Edit Campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setOfferToDelete(offer)}
                          className="p-2 text-red-600/60 dark:text-red-400/80 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors shadow-sm dark:shadow-none"
                          title="Delete Campaign"
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
        {offerToDelete && (
          <>
            <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-50"
              onClick={() => !isDeleting && setOfferToDelete(null)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-surface rounded-xl shadow-2xl z-50 p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-charcoal dark:text-dark-text">Delete Campaign</h3>
                    <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">This will instantly remove the banner from the storefront.</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isDeleting && setOfferToDelete(null)}
                  className="text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-secondary/10 dark:bg-dark-pill p-4 rounded-lg mb-8 flex items-center gap-4">
                <img loading="lazy" src={offerToDelete.bannerImage} alt="" className="w-20 h-10 object-cover rounded" />
                <div>
                  <p className="font-medium text-charcoal dark:text-dark-text text-sm">{offerToDelete.title}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setOfferToDelete(null)}
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

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div >
      <AdminCard className="relative overflow-hidden bg-white dark:bg-dark-surface">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-charcoal/60 dark:text-dark-muted">{title}</p>
          <div className="p-2 bg-secondary/10 dark:bg-dark-pill rounded-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-3xl font-serif text-charcoal dark:text-dark-text">{value}</h3>
      </AdminCard>
    </div>
  )
}

function StatusBadge({ active, startDate, endDate }: { active: boolean, startDate?: string, endDate?: string }) {
  if (!active) {
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-charcoal/10 text-charcoal/60">Inactive</span>
  }
  
  const now = new Date()
  if (startDate && new Date(startDate) > now) {
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>
  }
  
  if (endDate && new Date(endDate) < now) {
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Expired</span>
  }

  return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>
}
