import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Tag } from "lucide-react"
import { couponService } from "../../services/firebase/couponService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"
import { useToast } from "../../context/ToastContext"
import type { Coupon } from "../../types"

// Simple Label component since it's not exported from Form.tsx
function Label({ htmlFor, children, className = "" }: { htmlFor: string, children: React.ReactNode, className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-charcoal dark:text-dark-text mb-1.5 ${className}`}>
      {children}
    </label>
  )
}

const DEFAULT_FORM: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'> = {
  code: "",
  type: "percentage",
  value: 0,
  isActive: true,
  minOrderValue: undefined
}

export function AdminCouponForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchCoupon() {
      if (!id) return;
      try {
        const data = await couponService.getCouponById(id);
        if (data) {
          setFormData({
            code: data.code,
            type: data.type,
            value: data.value,
            isActive: data.isActive,
            minOrderValue: data.minOrderValue
          });
        } else {
          toast("Coupon not found", "error");
          navigate("/dashboard/coupons");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to load coupon", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchCoupon();
  }, [id, navigate, toast])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required"
    } else if (formData.code.indexOf(' ') >= 0) {
      newErrors.code = "Code cannot contain spaces"
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Discount value must be greater than 0"
    }
    
    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    
    let parsedValue: any = value
    if (type === 'number') {
      parsedValue = value === '' ? undefined : Number(value)
    }
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked
    }
    if (name === 'code') {
      parsedValue = String(value).toUpperCase().replace(/\s/g, '')
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast("Please fix the errors in the form", "error")
      return
    }

    setSaving(true)
    try {
      if (isEditing && id) {
        await couponService.updateCoupon(id, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast("Coupon updated successfully", "success")
      } else {
        await couponService.createCoupon({
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        toast("Coupon created successfully", "success")
      }
      navigate("/dashboard/coupons")
    } catch (err) {
      console.error(err)
      toast(`Failed to ${isEditing ? 'update' : 'create'} coupon`, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-charcoal/60">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <AdminPageHeader 
        title={isEditing ? "Edit Coupon" : "Create Coupon"}
        subtitle={isEditing ? `Editing ${formData.code}` : "Create a new discount code"}
        backLink="/dashboard/coupons"
        action={
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Coupon"}</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <AdminCard title="Coupon Details">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input 
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. SUMMER20"
                    className="font-mono uppercase"
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-1">
                    Customers will enter this code at checkout.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type">Discount Type *</Label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-dark-bg border border-charcoal/20 dark:border-dark-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:ring-1 focus:ring-charcoal dark:focus:border-dark-text dark:focus:ring-dark-text transition-colors dark:text-dark-text appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="value">Discount Value *</Label>
                    <div className="relative">
                      {formData.type === 'fixed' && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50 dark:text-dark-muted">₹</span>
                      )}
                      <Input 
                        id="value"
                        name="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.value || ''}
                        onChange={handleChange}
                        placeholder="0"
                        className={formData.type === 'fixed' ? 'pl-8' : ''}
                      />
                      {formData.type === 'percentage' && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/50 dark:text-dark-muted">%</span>
                      )}
                    </div>
                    {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="minOrderValue">Minimum Order Value (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50 dark:text-dark-muted">₹</span>
                    <Input 
                      id="minOrderValue"
                      name="minOrderValue"
                      type="number"
                      min="0"
                      value={formData.minOrderValue || ''}
                      onChange={handleChange}
                      placeholder="e.g. 1000"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-charcoal/50 dark:text-dark-muted mt-1">
                    The coupon will only apply if the cart subtotal is greater than this amount.
                  </p>
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Status">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/10 dark:bg-dark-pill rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-charcoal dark:text-dark-text">Active</p>
                    <p className="text-xs text-charcoal/60 dark:text-dark-muted">Enable this coupon</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-charcoal/20 dark:bg-dark-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                
                <div className="bg-charcoal/5 dark:bg-dark-bg p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-charcoal dark:text-dark-text flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-charcoal/50" />
                    Summary
                  </h4>
                  <p className="text-xs text-charcoal/70 dark:text-dark-muted mb-1">
                    Customers will get <strong>{formData.type === 'percentage' ? `${formData.value || 0}%` : `₹${formData.value || 0}`} OFF</strong>.
                  </p>
                  {formData.minOrderValue && (
                    <p className="text-xs text-charcoal/70 dark:text-dark-muted">
                      Requires a minimum purchase of ₹{formData.minOrderValue}.
                    </p>
                  )}
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      </form>
    </div>
  )
}
