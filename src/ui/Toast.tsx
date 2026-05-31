import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />
  };

  return (
    <>
      <div  className={cn(
          "flex items-center gap-3 px-4 py-3 min-w-[300px] shadow-soft bg-white border border-charcoal/10",
          "text-charcoal text-sm font-medium"
        )}
      >
        {icons[type]}
        <p className="flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="text-charcoal/40 hover:text-charcoal transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
