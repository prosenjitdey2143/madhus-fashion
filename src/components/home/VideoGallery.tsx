import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"

import { videoService, type VideoData } from "../../services/firebase/videoService"

export function VideoGallery() {
  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null)
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const data = await videoService.getAllVideos()
        setVideos(data)
      } catch (err) {
        console.error("Failed to fetch videos", err)
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollAmount = clientWidth * 0.75
      const targetScroll = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      })
    }
  }

  if (!loading && videos.length === 0) return null

  return (
    <section className="py-24 bg-brand-primary border-t border-brand-text/5 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-text mb-4">Live & Reels</h2>
            <p className="text-sm text-brand-text/60 max-w-md font-light">
              Catch up on our latest Facebook Live sessions, styling tips, and exclusive behind-the-scenes moments.
            </p>
          </div>
          <a href="#" className="text-[11px] uppercase tracking-[0.2em] border-b border-brand-text pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors shrink-0">
            Follow our Socials
          </a>
        </div>

        {/* Horizontal Scrollable Gallery */}
        <div className="relative group/gallery">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-text flex items-center justify-center shadow-float opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 md:flex hidden hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 px-1 scroll-smooth"
          >
            {videos.map((video) => (
              <div 
                key={video.id} 
                className="snap-start flex-none w-[140px] xs:w-[160px] sm:w-[180px] md:w-[220px] aspect-[9/16] rounded-2xl overflow-hidden bg-brand-pale border border-brand-text/5 relative group cursor-pointer shadow-soft hover:shadow-soft-hover hover:scale-[1.02] transition-all duration-500 ease-luxury"
                onClick={() => setActiveVideo(video)}
              >
                {/* Native Video / Iframe Preview */}
                {video.type === 'facebook' ? (
                  <iframe 
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.videoUrl)}&show_text=false&width=400`}
                    className="w-full h-full border-none object-cover pointer-events-none"
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-brand-text/10 group-hover:bg-brand-text/30 transition-colors duration-500" />
                
                {/* Play Button Icon (Hide for Facebook as it has its own) */}
                {video.type !== 'facebook' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:bg-brand-accent group-hover:border-brand-accent transition-all duration-300 group-hover:scale-110 pointer-events-none">
                      <Play className="w-5 h-5 ml-1 fill-white" />
                    </div>
                  </div>
                )}

                {/* Title Gradient */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-text/80 to-transparent">
                  <p className="text-white text-xs md:text-sm font-medium line-clamp-2 leading-relaxed">
                    {video.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-text flex items-center justify-center shadow-float opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 md:flex hidden hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Custom Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayerModal 
            video={activeVideo} 
            onClose={() => setActiveVideo(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function VideoPlayerModal({ video, onClose }: { video: VideoData, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Lock body scroll and trigger autoplay
  useEffect(() => {
    document.body.style.overflow = "hidden"

    if (videoRef.current) {
      // Try to play with audio first (enabled by user tap gesture that triggered modal opening)
      const playPromise = videoRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.log("Autoplay unmuted failed, attempting muted autoplay:", err)
            if (videoRef.current) {
              // Muted autoplay is allowed by modern browsers
              videoRef.current.muted = true
              setIsMuted(true)
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true)
                })
                .catch((err2) => {
                  console.error("Muted autoplay also failed:", err2)
                  setIsPlaying(false)
                })
            }
          })
      }
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error("Play failed on click/tap:", err)
          })
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-text/95 backdrop-blur-sm p-4 md:p-8"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-brand-text transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Container (Vertical bounds) */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative h-[80vh] md:h-[90vh] max-w-[90vw] aspect-[9/16] bg-black shadow-2xl rounded-lg overflow-hidden group"
      >
        {video.type === 'facebook' ? (
          <iframe 
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.videoUrl)}&show_text=false&width=400&autoplay=true`}
            className="w-full h-full border-none overflow-hidden"
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        ) : (
          <>
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              autoPlay
              playsInline
              loop
              onClick={togglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Custom Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium mb-4">{video.title}</p>
              
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="hover:text-brand-accent transition-colors">
                    {isPlaying ? (
                      <div className="w-6 h-6 flex gap-1 justify-center items-center">
                        <div className="w-1.5 h-4 bg-current" />
                        <div className="w-1.5 h-4 bg-current" />
                      </div>
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </button>
                  <button onClick={toggleMute} className="hover:text-brand-accent transition-colors">
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                </div>
                
                <button onClick={toggleFullscreen} className="hover:text-brand-accent transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
