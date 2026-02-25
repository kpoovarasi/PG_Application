"use client"

import { useState } from "react"
import { mockTenants, mockRooms, type Tenant } from "@/lib/mock-data"
import { Users, Search, Plus, Eye, X, User, Phone, Mail, Calendar, Home, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminTenants() {
  const [search, setSearch] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTenant, setNewTenant] = useState({
    name: "", email: "", phone: "", roomId: "", stayType: "monthly" as "monthly" | "daily",
    emergencyContact: "", idProof: "",
  })

  const filteredTenants = mockTenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.tenantId.toLowerCase().includes(search.toLowerCase()) ||
    t.roomNumber.includes(search)
  )

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAddForm(false)
    setNewTenant({ name: "", email: "", phone: "", roomId: "", stayType: "monthly", emergencyContact: "", idProof: "" })
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
                  <Select value={newTenant.roomId} onValueChange={(v) => setNewTenant({ ...newTenant, roomId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                    <SelectContent>
                      {mockRooms.filter((r) => r.status === "available").map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.roomNumber} - {r.pgName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stay Type</Label>
                  <Select value={newTenant.stayType} onValueChange={(v) => setNewTenant({ ...newTenant, stayType: v as "monthly" | "daily" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input value={newTenant.emergencyContact} onChange={(e) => setNewTenant({ ...newTenant, emergencyContact: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ID Proof</Label>
                <Input placeholder="e.g., Aadhaar - XXXX-XXXX-1234" value={newTenant.idProof} onChange={(e) => setNewTenant({ ...newTenant, idProof: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit">Create Tenant</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    {tenant.tenantId} | Room {tenant.roomNumber} | {tenant.pgName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{tenant.stayType}</Badge>
                <span className="text-sm font-semibold text-foreground">
                  {"Rs."}{tenant.rentAmount.toLocaleString()}
                  <span className="font-normal text-muted-foreground">
                    /{tenant.stayType === "monthly" ? "mo" : "day"}
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
        {filteredTenants.length === 0 && (
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
                  <p className="text-sm text-muted-foreground">{selectedTenant.tenantId}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: Mail, label: "Email", value: selectedTenant.email },
                  { icon: Phone, label: "Phone", value: selectedTenant.phone },
                  { icon: Home, label: "Room", value: `${selectedTenant.roomNumber} - ${selectedTenant.pgName}` },
                  { icon: Calendar, label: "Join Date", value: selectedTenant.joinDate },
                  { icon: CreditCard, label: "Rent", value: `Rs.${selectedTenant.rentAmount.toLocaleString()} (${selectedTenant.stayType})` },
                  { icon: CreditCard, label: "Security Deposit", value: `Rs.${selectedTenant.securityDeposit.toLocaleString()}` },
                  { icon: Phone, label: "Emergency", value: selectedTenant.emergencyContact },
                  { icon: User, label: "ID Proof", value: selectedTenant.idProof },
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
