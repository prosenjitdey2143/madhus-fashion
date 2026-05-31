import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { videoService } from "../../services/firebase/videoService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { Button } from "../../ui/Button"
import { Input } from "../../ui/Form"
import { useToast } from "../../context/ToastContext"
import { Skeleton } from "../../ui/Skeleton"

export function AdminVideoForm() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [type, setType] = useState<'mp4' | 'facebook'>('mp4')

  useEffect(() => {
    async function loadVideo() {
      if (!id) return
      try {
        const vid = await videoService.getVideoById(id)
        if (vid) {
          setTitle(vid.title)
          setVideoUrl(vid.videoUrl)
          setType(vid.type)
        } else {
          toast("Video not found.", "error")
          navigate("/dashboard/videos")
        }
      } catch (err) {
        console.error(err)
        toast("Failed to load video.", "error")
      } finally {
        setLoading(false)
      }
    }
    loadVideo()
  }, [id, navigate, toast])

  // Automatically detect Facebook link
  useEffect(() => {
    if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch")) {
      setType("facebook")
    } else if (videoUrl && type === "facebook" && !videoUrl.includes("facebook.com") && !videoUrl.includes("fb.watch")) {
      setType("mp4")
    }
  }, [videoUrl, type])

  const handleSave = async () => {
    if (!title.trim()) return toast("Title is required", "error")
    if (!videoUrl.trim()) return toast("Video URL is required", "error")

    setSaving(true)
    const videoData = {
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      type
    }

    try {
      if (isEditMode && id) {
        await videoService.updateVideo(id, videoData)
        toast("Video updated successfully", "success")
      } else {
        await videoService.createVideo(videoData)
        toast("Video added successfully", "success")
      }
      navigate("/dashboard/videos")
    } catch (err) {
      console.error(err)
      toast("Failed to save video", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="w-1/3 h-10 mb-8" />
        <Skeleton className="w-full h-[400px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate("/dashboard/videos")}
          className="p-2 -ml-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <AdminPageHeader 
            title={isEditMode ? "Edit Video" : "Add New Video"} 
            subtitle="Add a video link to show in the storefront gallery"
          />
        </div>
      </div>

      <AdminCard className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Video Title *</label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Styling the Midnight Gown" 
            className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-charcoal/80 dark:text-dark-text">Video Link (URL) *</label>
          <Input 
            value={videoUrl} 
            onChange={e => setVideoUrl(e.target.value)} 
            placeholder="e.g. https://www.facebook.com/... or https://.../video.mp4" 
            className="w-full bg-secondary/5 dark:bg-dark-pill border-charcoal/10 dark:border-dark-border"
          />
          <p className="text-xs text-charcoal/40 dark:text-dark-muted mt-1">
            Paste a Facebook video link or a direct .mp4 URL. The system will automatically detect the format!
          </p>
        </div>
      </AdminCard>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] bg-white/80 dark:bg-dark-surface/90 backdrop-blur-md border-t border-charcoal/10 dark:border-dark-border p-4 z-30 flex justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <Button variant="outline" onClick={() => navigate("/dashboard/videos")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px] flex items-center justify-center gap-2">
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Save Changes" : "Add Video"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
