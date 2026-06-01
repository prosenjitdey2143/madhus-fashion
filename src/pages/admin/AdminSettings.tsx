import { useState, useEffect } from "react"
import { Save, Store, Mail, Globe } from "lucide-react"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"
import { useToast } from "../../context/ToastContext"
import { storeSettingsService } from "../../services/firebase/storeSettingsService"

export function AdminSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("payment")

  // Example state for settings
  const [storeName, setStoreName] = useState("Madhus Fashion")
  const [contactEmail, setContactEmail] = useState("support@madhusfashion.com")
  const [currency, setCurrency] = useState("INR")
  const [taxRate, setTaxRate] = useState("8.5")

  // Notification Settings
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)

  // Payment Settings
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [upiId, setUpiId] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [tempQrUrl, setTempQrUrl] = useState("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await storeSettingsService.getSettings()
        setWhatsappNumber(data.whatsappNumber)
        setUpiId(data.upiId)
        setQrCodeUrl(data.qrCodeUrl || "")
        setTempQrUrl(data.qrCodeUrl || "")
      } catch (err) {
        console.error(err)
        toast("Failed to load store settings", "error")
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === "payment") {
        const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '')
        await storeSettingsService.updateSettings({
          whatsappNumber: cleanNumber,
          upiId,
          qrCodeUrl
        })
        setWhatsappNumber(cleanNumber)
        toast("Payment settings saved successfully", "success")
      } else {
        // Simulate API call for other tabs
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast("Settings saved successfully", "success")
      }
    } catch (err) {
      toast("Failed to save settings", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-charcoal/50">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <AdminPageHeader 
        title="Settings" 
        subtitle="Manage your store preferences and configurations."
        action={
          <Button 
            className="flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === "profile" ? "bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text shadow-sm border border-charcoal/5 dark:border-dark-border" : "text-charcoal/60 dark:text-dark-muted hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover hover:text-charcoal dark:hover:text-dark-text"}`}
          >
            <Store className="w-4 h-4" /> Store Profile
          </button>
          <button 
            onClick={() => setActiveTab("regional")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === "regional" ? "bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text shadow-sm border border-charcoal/5 dark:border-dark-border" : "text-charcoal/60 dark:text-dark-muted hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover hover:text-charcoal dark:hover:text-dark-text"}`}
          >
            <Globe className="w-4 h-4" /> Regional
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === "notifications" ? "bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text shadow-sm border border-charcoal/5 dark:border-dark-border" : "text-charcoal/60 dark:text-dark-muted hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover hover:text-charcoal dark:hover:text-dark-text"}`}
          >
            <Mail className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === "payment" ? "bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text shadow-sm border border-charcoal/5 dark:border-dark-border" : "text-charcoal/60 dark:text-dark-muted hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover hover:text-charcoal dark:hover:text-dark-text"}`}
          >
            <Store className="w-4 h-4" /> Checkout & Payment
          </button>
        </div>

        <div 
          key={activeTab} className="md:col-span-2 space-y-8"
        >
          {activeTab === "profile" && (
            <AdminCard className="space-y-6">
              <div className="border-b border-charcoal/10 dark:border-dark-border pb-4 mb-4">
                <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Store Profile</h2>
                <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">This information is displayed publicly on your storefront.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Store Name</label>
                  <Input 
                    value={storeName} 
                    onChange={e => setStoreName(e.target.value)} 
                    className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Contact Email</label>
                  <Input 
                    type="email"
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)} 
                    className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                  />
                </div>
              </div>
            </AdminCard>
          )}

          {activeTab === "regional" && (
            <AdminCard className="space-y-6">
              <div className="border-b border-charcoal/10 dark:border-dark-border pb-4 mb-4">
                <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Regional Configurations</h2>
                <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">Set your local currency and taxation preferences.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Currency</label>
                  <select 
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-secondary/5 dark:bg-dark-pill border border-charcoal/10 dark:border-dark-border rounded-lg p-3 text-sm focus:outline-none focus:border-charcoal/30 dark:focus:border-dark-surfaceHover dark:text-dark-text transition-colors appearance-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Default Tax Rate (%)</label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={taxRate} 
                    onChange={e => setTaxRate(e.target.value)} 
                    className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
                  />
                </div>
              </div>
            </AdminCard>
          )}

          {activeTab === "notifications" && (
            <AdminCard className="space-y-6">
              <div className="border-b border-charcoal/10 dark:border-dark-border pb-4 mb-4">
                <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Notifications</h2>
                <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">Manage admin alert preferences.</p>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-charcoal dark:text-dark-text bg-secondary/10 dark:bg-dark-pill border-charcoal/20 dark:border-dark-border rounded focus:ring-charcoal dark:focus:ring-dark-border"
                  />
                  <span className="text-sm font-medium text-charcoal/80 dark:text-dark-muted group-hover:text-charcoal dark:group-hover:text-dark-text transition-colors">Daily Email Summary</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={orderAlerts}
                    onChange={e => setOrderAlerts(e.target.checked)}
                    className="w-4 h-4 text-charcoal dark:text-dark-text bg-secondary/10 dark:bg-dark-pill border-charcoal/20 dark:border-dark-border rounded focus:ring-charcoal dark:focus:ring-dark-border"
                  />
                  <span className="text-sm font-medium text-charcoal/80 dark:text-dark-muted group-hover:text-charcoal dark:group-hover:text-dark-text transition-colors">New Order Alerts</span>
                </label>
              </div>
            </AdminCard>
          )}

          {activeTab === "payment" && (
            <AdminCard className="space-y-6">
              <div className="border-b border-charcoal/10 dark:border-dark-border pb-4 mb-4">
                <h2 className="text-xl font-serif text-charcoal dark:text-dark-text">Checkout & Payment</h2>
                <p className="text-sm text-charcoal/60 dark:text-dark-muted mt-1">Configure where orders are sent and how payments are received.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Admin WhatsApp Number</label>
                  <Input 
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 919876543210 (Include country code)"
                    className="bg-secondary/5 dark:bg-dark-pill"
                  />
                  <p className="text-[10px] text-charcoal/50 dark:text-dark-muted mt-1">
                    Include country code (e.g., 91 for India). Do not include + or spaces. Customers will be redirected to this number with their order details after checkout.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Store UPI ID</label>
                  <Input 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. storename@upi"
                    className="bg-secondary/5 dark:bg-dark-pill"
                  />
                  <p className="text-[10px] text-charcoal/50 dark:text-dark-muted mt-1">
                    Customers will see this UPI ID on the secure payment page.
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">QR Code Image Link</label>
                  <div className="flex gap-2">
                    <Input 
                      value={tempQrUrl}
                      onChange={(e) => setTempQrUrl(e.target.value)}
                      placeholder="e.g. https://example.com/my-qr-code.png"
                      className="bg-secondary/5 dark:bg-dark-pill"
                    />
                    <Button 
                      type="button"
                      onClick={() => setQrCodeUrl(tempQrUrl)}
                      className="whitespace-nowrap bg-charcoal text-white dark:bg-white dark:text-dark-surface hover:bg-charcoal/90 dark:hover:bg-white/90"
                    >
                      Add Barcode
                    </Button>
                  </div>
                  <p className="text-[10px] text-charcoal/50 dark:text-dark-muted mt-1">
                    Paste a direct image link to your UPI QR Code, then click "Add Barcode" to preview it. Leave empty and click "Add" to hide it.
                  </p>
                  {qrCodeUrl && (
                    <div className="mt-4 w-32 h-32 border border-charcoal/10 dark:border-dark-border rounded-lg p-2 bg-white flex items-center justify-center overflow-hidden">
                      <img loading="lazy" src={qrCodeUrl} alt="QR Code Preview" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>' }} />
                    </div>
                  )}
                </div>
              </div>
            </AdminCard>
          )}
        </div>

      </div>
    </div>
  )
}
