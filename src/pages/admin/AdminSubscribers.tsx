import { useState, useEffect } from "react"
import { AdminCard } from "../../ui/admin/AdminCard"
import { SEO } from "../../components/SEO"
import { useToast } from "../../context/ToastContext"
import { subscriberService, type Subscriber } from "../../services/firebase/subscriberService"
import { MessageCircle, Phone, Clock } from "lucide-react"

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const data = await subscriberService.getSubscribers()
      setSubscribers(data)
    } catch (error) {
      console.error(error)
      toast("Failed to load subscribers", "error")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <SEO title="Manage Subscribers | Admin" noindex={true} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-charcoal dark:text-dark-text mb-1">
            WhatsApp Subscribers
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-dark-text/60">
            View all customers who have subscribed to WhatsApp updates.
          </p>
        </div>
        <div className="bg-brand-pale dark:bg-dark-border px-4 py-2 rounded border border-charcoal/10 dark:border-dark-text/10 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-brand-accent dark:text-dark-accent" />
          <span className="font-medium text-charcoal dark:text-dark-text">{subscribers.length} Total</span>
        </div>
      </div>

      <AdminCard>
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-pulse flex items-center text-charcoal/50 dark:text-dark-text/50">
              <MessageCircle className="w-5 h-5 mr-2 animate-bounce" /> Loading subscribers...
            </div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto text-charcoal/20 dark:text-dark-text/20 mb-4" />
            <h3 className="text-lg font-medium text-charcoal dark:text-dark-text mb-2">
              No Subscribers Yet
            </h3>
            <p className="text-sm text-charcoal/60 dark:text-dark-text/60">
              When customers subscribe via the footer, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-charcoal/10 dark:border-dark-text/10 bg-secondary/5 dark:bg-dark-bg/50">
                  <th className="py-4 px-4 text-xs uppercase tracking-wider text-charcoal/60 dark:text-dark-text/60 font-medium w-16">
                    #
                  </th>
                  <th className="py-4 px-4 text-xs uppercase tracking-wider text-charcoal/60 dark:text-dark-text/60 font-medium">
                    WhatsApp Number
                  </th>
                  <th className="py-4 px-4 text-xs uppercase tracking-wider text-charcoal/60 dark:text-dark-text/60 font-medium">
                    Subscribed On
                  </th>
                  <th className="py-4 px-4 text-xs uppercase tracking-wider text-charcoal/60 dark:text-dark-text/60 font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 dark:divide-dark-text/10">
                {subscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id || index}
                    className="hover:bg-secondary/5 dark:hover:bg-dark-border/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-charcoal/50 dark:text-dark-text/50">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-charcoal dark:text-dark-text font-medium">
                        <Phone className="w-4 h-4 text-brand-accent/70 dark:text-dark-accent/70" />
                        {subscriber.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-charcoal/70 dark:text-dark-text/70">
                        <Clock className="w-4 h-4 opacity-50" />
                        {formatDate(subscriber.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={`https://wa.me/${subscriber.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-accent dark:text-dark-accent hover:text-brand-accent/80 transition-colors bg-brand-accent/10 dark:bg-dark-accent/10 px-3 py-1.5 rounded"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </a>
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
