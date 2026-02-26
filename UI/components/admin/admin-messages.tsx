import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { MessageSquare, Send, Bell, PartyPopper, Megaphone, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

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

export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [newMsg, setNewMsg] = useState({
    type: "announcement",
    title: "",
    content: "",
    recipients: "all"
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [messagesData, tenantsData] = await Promise.all([
        api.messages.list(),
        api.tenants.list()
      ])
      setMessages(messagesData)
      setTenants(tenantsData.filter(t => t.status === "active"))
      setError(null)
    } catch (err: any) {
      console.error("Messages fetch error:", err)
      setError("Failed to load messages.")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        type: newMsg.type,
        title: newMsg.title,
        content: newMsg.content,
        recipients: newMsg.recipients === "all" ? "all" : [newMsg.recipients],
        sent_by: "Admin"
      }
      await api.messages.send(payload)
      toast.success("Message sent successfully")
      setShowCompose(false)
      setNewMsg({ type: "announcement", title: "", content: "", recipients: "all" })
      fetchData() // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading messages...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{messages.length} messages sent</p>
        <Dialog open={showCompose} onOpenChange={setShowCompose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newMsg.type} onValueChange={(v) => setNewMsg({ ...newMsg, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent-reminder">Rent Reminder</SelectItem>
                      <SelectItem value="holiday-notice">Holiday Notice</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select value={newMsg.recipients} onValueChange={(v) => setNewMsg({ ...newMsg, recipients: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newMsg.title} onChange={(e) => setNewMsg({ ...newMsg, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={4} value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowCompose(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" className="gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Message
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Message List */}
      <div className="space-y-3">
        {messages.map((msg) => {
          const Icon = typeIcons[msg.type] || Megaphone
          return (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[msg.type] || "bg-secondary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{msg.title}</h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {msg.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{msg.sent_at ? new Date(msg.sent_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                      <span>To: {msg.recipients === "all" ? "All Tenants" : `${Array.isArray(msg.recipients) ? msg.recipients.length : 1} tenant(s)`}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {!loading && messages.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No messages sent yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
