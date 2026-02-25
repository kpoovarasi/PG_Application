"use client"

import { useState } from "react"
import { mockTickets, type Ticket } from "@/lib/mock-data"
import { TicketCheck, Filter, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false
    return true
  })

  const updateStatus = (id: string, newStatus: Ticket["status"]) => {
    setTickets(tickets.map((t) =>
      t.id === id
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString(), ...(newStatus === "resolved" || newStatus === "closed" ? { resolvedAt: new Date().toISOString() } : {}) }
        : t
    ))
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() })
    }
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
          const StatusIcon = statusIcons[ticket.status]
          return (
            <Card key={ticket.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedTicket(ticket)}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusColors[ticket.status]}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ticket.tenantName} - Room {ticket.roomNumber} | {ticket.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{ticket.status.replace("-", " ")}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
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
                  <p className="text-sm font-medium text-foreground">{selectedTicket.tenantName}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.roomNumber}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground capitalize">{selectedTicket.category}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(selectedTicket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground">Update Status:</span>
                {(["open", "in-progress", "resolved", "closed"] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selectedTicket.status === s ? "default" : "outline"}
                    onClick={() => updateStatus(selectedTicket.id, s)}
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
