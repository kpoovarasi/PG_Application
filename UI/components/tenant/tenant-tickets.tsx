import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { TicketCheck, Plus, AlertCircle, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

const statusIcons: Record<string, typeof AlertCircle> = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle2,
  closed: XCircle,
}

const statusColors: Record<string, string> = {
  open: "bg-destructive/10 text-destructive",
  "in-progress": "bg-warning/10 text-warning-foreground",
  resolved: "bg-success/10 text-success",
  closed: "bg-secondary text-secondary-foreground",
}

export function TenantTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newTicket, setNewTicket] = useState({
    category: "other",
    subject: "",
    description: "",
    priority: "medium",
  })

  useEffect(() => {
    if (user?.id) {
      fetchTickets()
    }
  }, [user?.id])

  async function fetchTickets() {
    try {
      setLoading(true)
      const data = await api.tickets.list({ tenantId: Number(user?.id) })
      setTickets(data)
      setError(null)
    } catch (err: any) {
      console.error("Tickets fetch error:", err)
      setError("Failed to load tickets.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const tenant = await api.tenants.byUser(Number(user?.id))

      const ticketData = {
        tenant_name: tenant.name,
        room_number: tenant.room_number || "N/A",
        ...newTicket,
        status: "open",
      }

      await api.tickets.create(ticketData)
      toast.success("Ticket raised successfully")
      setShowAdd(false)
      setNewTicket({ category: "other", subject: "", description: "", priority: "medium" })
      fetchTickets()
    } catch (err: any) {
      toast.error(err.message || "Failed to raise ticket")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading tickets...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tickets.length} tickets</p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Raise Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Raise a Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="wifi">WiFi</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowAdd(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const StatusIcon = statusIcons[ticket.status] || AlertCircle
          return (
            <Card key={ticket.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusColors[ticket.status] || "bg-secondary text-secondary-foreground"}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                      <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{(ticket.status || "open").replace("-", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{ticket.category}</span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      {ticket.resolved_at && (
                        <span>Resolved: {new Date(ticket.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {!loading && tickets.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <TicketCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No tickets raised yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
