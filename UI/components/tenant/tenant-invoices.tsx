"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockInvoices, type Invoice } from "@/lib/mock-data"
import { FileText, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export function TenantInvoices() {
  const { user } = useAuth()
  const tenantId = user?.id || "tenant-1"
  const invoices = mockInvoices.filter((i) => i.tenantId === tenantId)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

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
      <p className="text-sm text-muted-foreground">{invoices.length} invoices</p>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <Card key={inv.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedInvoice(inv)}>
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{inv.month}</h3>
                  <p className="text-sm text-muted-foreground">Room {inv.roomNumber} | Due: {inv.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-foreground">{"Rs."}{inv.total.toLocaleString()}</span>
                {statusBadge(inv.status)}
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Detail */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice - {selectedInvoice?.month}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Room {selectedInvoice.roomNumber}</p>
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
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
