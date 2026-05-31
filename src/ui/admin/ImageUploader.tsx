import React, { useCallback } from "react"
import { UploadCloud, AlertCircle, X, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
  error: string | null;
  onClearError: () => void;
}

export function ImageUploader({ 
  onUpload, 
  isUploading, 
  progress, 
  error, 
  onClearError 
}: ImageUploaderProps) {

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  }, [onUpload]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start justify-between text-sm">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
          <button onClick={onClearError} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative border-2 border-dashed border-charcoal/20 dark:border-dark-border rounded-xl p-8 text-center hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors group">
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-charcoal/40 dark:text-dark-muted animate-spin" />
              <div className="text-sm font-medium text-charcoal/60 dark:text-dark-muted">
                Uploading... {progress > 0 ? `${Math.round(progress)}%` : ""}
              </div>
              <div className="w-48 h-1.5 bg-charcoal/10 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-charcoal dark:bg-dark-text transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-white dark:bg-dark-surface rounded-full shadow-sm flex items-center justify-center text-charcoal/60 dark:text-dark-muted group-hover:text-charcoal dark:group-hover:text-dark-text transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal dark:text-dark-text">Click or drag image to upload</p>
                <p className="text-xs text-charcoal/40 dark:text-dark-muted mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
