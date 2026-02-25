"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockTickets, type Ticket } from "@/lib/mock-data"
import { TicketCheck, Plus, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  const tenantId = user?.id || "tenant-1"
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets.filter((t) => t.tenantId === tenantId))
  const [showAdd, setShowAdd] = useState(false)
  const [newTicket, setNewTicket] = useState({
    category: "other" as Ticket["category"],
    subject: "",
    description: "",
    priority: "medium" as Ticket["priority"],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ticket: Ticket = {
      id: `tkt-${Date.now()}`,
      tenantId,
      tenantName: user?.name || "Tenant",
      roomNumber: "101",
      ...newTicket,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTickets([ticket, ...tickets])
    setShowAdd(false)
    setNewTicket({ category: "other", subject: "", description: "", priority: "medium" })
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
                  <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v as Ticket["category"] })}>
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
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as Ticket["priority"] })}>
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
                <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const StatusIcon = statusIcons[ticket.status]
          return (
            <Card key={ticket.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusColors[ticket.status]}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                      <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">{ticket.status.replace("-", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      {ticket.resolvedAt && (
                        <span>Resolved: {new Date(ticket.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {tickets.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <TicketCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No tickets raised yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
