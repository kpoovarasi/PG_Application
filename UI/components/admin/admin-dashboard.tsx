import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Building2, BedDouble, Users, TicketCheck, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [pgs, setPgs] = useState<any[]>([])
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [sumData, pgsData, ticketsData] = await Promise.all([
          api.dashboard.summary(),
          api.dashboard.pgsOverview(),
          api.tickets.list({ status: "open" })
        ])
        setSummary(sumData)
        setPgs(pgsData)
        setRecentTickets(ticketsData.slice(0, 4))
        setError(null)
      } catch (err: any) {
        console.error("Dashboard fetch error:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  const summaryCards = [
    { title: "Total PGs", value: summary.total_pgs, icon: Building2, color: "text-primary" },
    { title: "Total Rooms", value: summary.total_rooms, icon: BedDouble, color: "text-chart-2" },
    { title: "Active Tenants", value: summary.active_tenants, icon: Users, color: "text-chart-4" },
    { title: "Open Tickets", value: summary.open_tickets, icon: TicketCheck, color: "text-chart-5" },
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
              <span className="text-4xl font-bold text-foreground">{summary.occupancy_rate}%</span>
              <span className="mb-1 text-sm text-muted-foreground">occupied</span>
            </div>
            <Progress value={summary.occupancy_rate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{summary.occupied_rooms} occupied</span>
              <span>{summary.vacant_rooms} vacant</span>
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
              <Badge variant="destructive">{summary.overdue_invoices}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-warning/10 p-3">
              <span className="text-sm font-medium text-foreground">Open Tickets</span>
              <Badge className="bg-warning text-warning-foreground">{summary.open_tickets}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <span className="text-sm font-medium text-foreground">Rooms in Maintenance</span>
              <Badge variant="secondary">{summary.maintenance_rooms}</Badge>
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
            {pgs.map((pg) => {
              return (
                <div key={pg.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{pg.name}</h3>
                    <p className="text-sm text-muted-foreground">{pg.address}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{pg.total_rooms}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{pg.occupied_beds}/{pg.total_beds}</p>
                      <p className="text-xs text-muted-foreground">Beds</p>
                    </div>
                    <div className="w-24">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium text-foreground">{pg.occupancy_rate}%</span>
                      </div>
                      <Progress value={pg.occupancy_rate} className="h-2" />
                    </div>
                  </div>
                </div>
              )
            })}
            {pgs.length === 0 && <p className="text-center text-muted-foreground py-4">No properties found.</p>}
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
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.tenant_name} - Room {ticket.room_number || "N/A"}
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
            {recentTickets.length === 0 && <p className="text-center text-muted-foreground py-4">No recent tickets.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
