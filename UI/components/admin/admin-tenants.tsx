import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Search, Plus, Eye, User, Phone, Mail, Calendar, Home, CreditCard, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function AdminTenants() {
  const [tenants, setTenants] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [newTenant, setNewTenant] = useState({
    name: "", email: "", phone: "", room_id: "", stay_type: "monthly",
    emergency_contact: "", id_proof: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [tenantsData, roomsData] = await Promise.all([
        api.tenants.list(),
        api.rooms.list()
      ])
      setTenants(tenantsData)
      setRooms(roomsData)
      setError(null)
    } catch (err: any) {
      console.error("Tenants fetch error:", err)
      setError("Failed to load tenants. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.tenant_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.room_number?.includes(search)
  )

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenant.room_id) {
      toast.error("Please select a room")
      return
    }

    try {
      setSubmitting(true)
      await api.tenants.create({
        ...newTenant,
        room_id: parseInt(newTenant.room_id),
        status: "active"
      })
      toast.success("Tenant onboarded successfully")
      setShowAddForm(false)
      setNewTenant({ name: "", email: "", phone: "", room_id: "", stay_type: "monthly", emergency_contact: "", id_proof: "" })
      fetchData() // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to create tenant")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && tenants.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading tenants...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or room..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Onboard New Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newTenant.email} onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={newTenant.phone} onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select value={newTenant.room_id} onValueChange={(v) => setNewTenant({ ...newTenant, room_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                    <SelectContent>
                      {rooms.filter(r => r.status === "available").map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.room_number} - {r.pg_name}
                        </SelectItem>
                      ))}
                      {rooms.filter(r => r.status === "available").length === 0 && (
                        <SelectItem value="none" disabled>No available rooms</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stay Type</Label>
                  <Select value={newTenant.stay_type} onValueChange={(v) => setNewTenant({ ...newTenant, stay_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input value={newTenant.emergency_contact} onChange={(e) => setNewTenant({ ...newTenant, emergency_contact: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ID Proof</Label>
                <Input placeholder="e.g., Aadhaar - XXXX-XXXX-1234" value={newTenant.id_proof} onChange={(e) => setNewTenant({ ...newTenant, id_proof: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Tenant
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

      {/* Tenant List */}
      <div className="space-y-3">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                      {tenant.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tenant.tenant_id} | Room {tenant.room_number || "N/A"} | {tenant.pg_name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{tenant.stay_type}</Badge>
                <span className="text-sm font-semibold text-foreground">
                  {"Rs."}{tenant.rent_amount?.toLocaleString() || "0"}
                  <span className="font-normal text-muted-foreground">
                    /{tenant.stay_type === "monthly" ? "mo" : "day"}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTenant(tenant)} className="gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredTenants.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No tenants found</p>
          </div>
        )}
      </div>

      {/* Tenant Detail Dialog */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedTenant.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTenant.tenant_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: Mail, label: "Email", value: selectedTenant.email },
                  { icon: Phone, label: "Phone", value: selectedTenant.phone },
                  { icon: Home, label: "Room", value: `${selectedTenant.room_number || "N/A"} - ${selectedTenant.pg_name || "N/A"}` },
                  { icon: Calendar, label: "Join Date", value: selectedTenant.join_date ? new Date(selectedTenant.join_date).toLocaleDateString() : "N/A" },
                  { icon: CreditCard, label: "Rent", value: `Rs.${selectedTenant.rent_amount?.toLocaleString() || "0"} (${selectedTenant.stay_type})` },
                  { icon: CreditCard, label: "Security Deposit", value: `Rs.${selectedTenant.security_deposit?.toLocaleString() || "0"}` },
                  { icon: Phone, label: "Emergency", value: selectedTenant.emergency_contact },
                  { icon: User, label: "ID Proof", value: selectedTenant.id_proof },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="truncate text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
