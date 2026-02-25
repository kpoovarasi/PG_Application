"use client"

import { mockPGs, mockRooms, mockTickets, mockInvoices, mockTenants } from "@/lib/mock-data"
import { Building2, BedDouble, Users, TicketCheck, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function AdminDashboard() {
  const totalRooms = mockPGs.reduce((sum, pg) => sum + pg.totalRooms, 0)
  const occupiedRooms = mockPGs.reduce((sum, pg) => sum + pg.occupiedRooms, 0)
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100)
  const openTickets = mockTickets.filter((t) => t.status === "open" || t.status === "in-progress").length
  const overdueInvoices = mockInvoices.filter((i) => i.status === "overdue").length
  const totalTenants = mockTenants.filter((t) => t.status === "active").length

  const summaryCards = [
    { title: "Total PGs", value: mockPGs.length, icon: Building2, color: "text-primary" },
    { title: "Total Rooms", value: totalRooms, icon: BedDouble, color: "text-chart-2" },
    { title: "Active Tenants", value: totalTenants, icon: Users, color: "text-chart-4" },
    { title: "Open Tickets", value: openTickets, icon: TicketCheck, color: "text-chart-5" },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Occupancy + Overdue */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{occupancyRate}%</span>
              <span className="mb-1 text-sm text-muted-foreground">occupied</span>
            </div>
            <Progress value={occupancyRate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{occupiedRooms} occupied</span>
              <span>{totalRooms - occupiedRooms} vacant</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
              <span className="text-sm font-medium text-foreground">Overdue Invoices</span>
              <Badge variant="destructive">{overdueInvoices}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-warning/10 p-3">
              <span className="text-sm font-medium text-foreground">Open Tickets</span>
              <Badge className="bg-warning text-warning-foreground">{openTickets}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <span className="text-sm font-medium text-foreground">Rooms in Maintenance</span>
              <Badge variant="secondary">{mockRooms.filter((r) => r.status === "maintenance").length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PG Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PG Properties Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPGs.map((pg) => {
              const rate = Math.round((pg.occupiedRooms / pg.totalRooms) * 100)
              return (
                <div key={pg.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{pg.name}</h3>
                    <p className="text-sm text-muted-foreground">{pg.address}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{pg.totalRooms}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{pg.occupiedBeds}/{pg.totalBeds}</p>
                      <p className="text-xs text-muted-foreground">Beds</p>
                    </div>
                    <div className="w-24">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium text-foreground">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTickets.slice(0, 4).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.tenantName} - Room {ticket.roomNumber}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Badge variant={
                    ticket.priority === "high" ? "destructive" :
                    ticket.priority === "medium" ? "default" : "secondary"
                  }>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline">{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
