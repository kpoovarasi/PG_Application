"use client"

import { useState } from "react"
import { mockInvoices, type Invoice } from "@/lib/mock-data"
import { FileText, Download, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export function AdminInvoices() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const filtered = mockInvoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false
    if (search && !inv.tenantName.toLowerCase().includes(search.toLowerCase()) && !inv.roomNumber.includes(search)) return false
    return true
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-success text-success-foreground">Paid</Badge>
      case "pending": return <Badge className="bg-warning text-warning-foreground">Pending</Badge>
      case "overdue": return <Badge variant="destructive">Overdue</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tenant or room..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoice summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              {"Rs."}{mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-2xl font-bold text-warning">
              {"Rs."}{mockInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Overdue Amount</p>
            <p className="text-2xl font-bold text-destructive">
              {"Rs."}{mockInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.map((inv) => (
          <Card key={inv.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{inv.tenantName}</h3>
                  <p className="text-sm text-muted-foreground">Room {inv.roomNumber} | {inv.month}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-foreground">{"Rs."}{inv.total.toLocaleString()}</span>
                {statusBadge(inv.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedInvoice.tenantName}</h3>
                  <p className="text-sm text-muted-foreground">Room {selectedInvoice.roomNumber} | {selectedInvoice.month}</p>
                </div>
                {statusBadge(selectedInvoice.status)}
              </div>
              <Separator />
              <div className="space-y-2">
                {[
                  { label: "Rent", amount: selectedInvoice.rentAmount },
                  { label: "Electricity", amount: selectedInvoice.electricity },
                  { label: "Water", amount: selectedInvoice.water },
                  { label: "Maintenance", amount: selectedInvoice.maintenance },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{"Rs."}{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{"Rs."}{selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">{selectedInvoice.dueDate}</p>
                </div>
                {selectedInvoice.paidDate && (
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Paid Date</p>
                    <p className="font-medium text-foreground">{selectedInvoice.paidDate}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
