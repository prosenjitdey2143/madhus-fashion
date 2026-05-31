import { AlertTriangle, Info, X } from "lucide-react"
import { Button } from "../../ui/Button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "success" | "info"
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false
}: ConfirmationModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case "success":
        return <Info className="w-6 h-6 text-emerald-600" />
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const getConfirmButtonClasses = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 border-none text-white shadow-soft-hover"
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-soft-hover"
      default:
        return "bg-charcoal hover:bg-charcoal/90 border-none text-white shadow-soft-hover"
    }
  }

  return (
    <>
      {isOpen && (
        <>
          <div onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-100' : type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                    {getIcon()}
                  </div>
                  <button 
                    onClick={onClose} 
                    disabled={isLoading}
                    className="text-charcoal/40 hover:text-charcoal transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-serif text-charcoal mb-2">{title}</h3>
                <p className="text-charcoal/70 text-sm leading-relaxed mb-8">{message}</p>
                
                <div className="flex items-center justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                  <Button 
                    onClick={onConfirm}
                    className={getConfirmButtonClasses()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
