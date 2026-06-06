import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react"
import { videoService, type VideoData } from "../../services/firebase/videoService"
import { AdminPageHeader } from "../../ui/admin/AdminPageHeader"
import { AdminCard } from "../../ui/admin/AdminCard"
import { useToast } from "../../context/ToastContext"
import { Skeleton } from "../../ui/Skeleton"

export function AdminVideos() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const data = await videoService.getAllVideos()
      setVideos(data)
    } catch (err) {
      console.error(err)
      toast("Failed to load videos", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await videoService.deleteVideo(id)
        toast("Video deleted successfully", "success")
        fetchVideos()
      } catch (err) {
        console.error(err)
        toast("Failed to delete video", "error")
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <AdminPageHeader 
          title="Live & Reels" 
          subtitle="Manage your video gallery"
        />
        <Link 
          to="/dashboard/videos/new" 
          className="bg-charcoal text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-charcoal/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </Link>
      </div>

      <AdminCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : videos.length === 0 ? (
          <div className="p-16 text-center text-charcoal/40 dark:text-dark-muted">
            <p className="mb-4">No videos added yet.</p>
            <Link to="/dashboard/videos/new" className="text-charcoal dark:text-dark-text hover:underline text-sm font-medium">
              Add your first video
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/20 dark:bg-dark-pill text-charcoal/60 dark:text-dark-muted text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Preview</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5 dark:divide-dark-border">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-secondary/5 dark:hover:bg-dark-surfaceHover transition-colors group">
                    <td className="px-6 py-4 w-32">
                      <div className="w-16 h-24 bg-charcoal/5 dark:bg-dark-bg rounded overflow-hidden relative">
                        {video.type === 'facebook' ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#1877F2]/10 dark:bg-[#1877F2]/20 text-[#1877F2] font-bold text-xs">
                            FB
                          </div>
                        ) : (
                          <video 
                            src={video.videoUrl} 
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-charcoal dark:text-dark-text">{video.title}</p>
                      <a href={video.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-charcoal/50 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text flex items-center gap-1 mt-1 truncate max-w-[300px]">
                        <ExternalLink className="w-3 h-3" />
                        {video.videoUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-charcoal dark:text-dark-text">
                        {video.priority === 999 || video.priority === undefined ? '-' : video.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-charcoal/5 dark:bg-dark-pill text-charcoal dark:text-dark-text rounded text-xs font-medium uppercase tracking-wider">
                        {video.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/dashboard/videos/edit/${video.id}`}
                          className="p-2 text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-dark-text hover:bg-secondary/10 dark:hover:bg-dark-surfaceHover rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(video.id!, video.title)}
                          className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
