import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Bell, PartyPopper, Megaphone, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const typeIcons: Record<string, typeof Bell> = {
  "rent-reminder": Bell,
  "holiday-notice": PartyPopper,
  "announcement": Megaphone,
}

const typeColors: Record<string, string> = {
  "rent-reminder": "bg-warning/10 text-warning-foreground",
  "holiday-notice": "bg-primary/10 text-primary",
  "announcement": "bg-chart-2/10 text-chart-2",
}

export function TenantNotifications() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchMessages()
    }
  }, [user?.id])

  async function fetchMessages() {
    try {
      setLoading(true)
      const data = await api.messages.forTenant(Number(user?.id))
      setMessages(data)
      setError(null)
    } catch (err: any) {
      console.error("Messages fetch error:", err)
      setError("Failed to load notifications.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading notifications...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{messages.length} notifications</p>
        {error && <Button variant="ghost" size="sm" onClick={fetchMessages} className="text-destructive">Retry</Button>}
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const Icon = typeIcons[msg.type] || Megaphone
          return (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[msg.type] || "bg-secondary text-secondary-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{msg.title}</h3>
                      <Badge variant="outline" className="capitalize text-xs">{(msg.type || "announcement").replace("-", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{msg.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {!loading && messages.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
