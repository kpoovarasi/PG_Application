import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { TicketCheck, Filter, AlertCircle, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [statusFilter, priorityFilter])

  async function fetchTickets() {
    try {
      setLoading(true)
      const data = await api.tickets.list({
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter
      })
      setTickets(data)
      setError(null)
    } catch (err: any) {
      console.error("Tickets fetch error:", err)
      setError("Failed to load tickets.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      setUpdating(true)
      await api.tickets.update(id, { status: newStatus })
      toast.success(`Ticket marked as ${newStatus}`)

      // Update local state
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t))
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus })
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket")
    } finally {
      setUpdating(false)
    }
  }

  const filtered = tickets

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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} tickets</span>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchTickets} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {(["open", "in-progress", "resolved", "closed"] as const).map((status) => {
          const Icon = statusIcons[status]
          const count = tickets.filter((t) => t.status === status).length
          return (
            <Card key={status}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusColors[status]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="capitalize text-xs text-muted-foreground">{status.replace("-", " ")}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.map((ticket) => {
          const StatusIcon = statusIcons[ticket.status] || AlertCircle
          return (
            <Card key={ticket.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedTicket(ticket)}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusColors[ticket.status] || "bg-secondary"}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ticket.tenant_name} - Room {ticket.room_number || "N/A"} | {ticket.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{(ticket.status || "open").replace("-", " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <TicketCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No tickets found</p>
          </div>
        )}
      </div>

      {/* Ticket Detail */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{selectedTicket.subject}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{selectedTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Tenant</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.tenant_name}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.room_number || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground capitalize">{selectedTicket.category}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground pt-1">Update Status:</span>
                {(["open", "in-progress", "resolved", "closed"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selectedTicket.status === s ? "default" : "outline"}
                    onClick={() => handleUpdateStatus(selectedTicket.id, s)}
                    disabled={updating}
                    className="capitalize text-xs"
                  >
                    {s.replace("-", " ")}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
