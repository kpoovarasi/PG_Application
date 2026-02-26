import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { FileText, Download, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export function TenantInvoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchInvoices()
    }
  }, [user?.id])

  async function fetchInvoices() {
    try {
      setLoading(true)
      const data = await api.invoices.list({ tenantId: Number(user?.id) })
      setInvoices(data)
      setError(null)
    } catch (err: any) {
      console.error("Invoices fetch error:", err)
      setError("Failed to load invoices.")
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return <Badge className="bg-success text-success-foreground">Paid</Badge>
      case "pending": return <Badge className="bg-warning text-warning-foreground">Pending</Badge>
      case "overdue": return <Badge variant="destructive">Overdue</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading invoices...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{invoices.length} invoices</p>
        {error && (
          <Button variant="outline" size="sm" onClick={fetchInvoices} className="text-destructive h-8">
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>

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
                  <p className="text-sm text-muted-foreground">Room {inv.room_number || "N/A"} | Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-foreground">{"Rs."}{(inv.total || 0).toLocaleString()}</span>
                {statusBadge(inv.status)}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && invoices.length === 0 && (
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
                <p className="text-sm text-muted-foreground">Room {selectedInvoice.room_number || "N/A"}</p>
                {statusBadge(selectedInvoice.status)}
              </div>
              <Separator />
              <div className="space-y-2">
                {[
                  { label: "Rent", amount: selectedInvoice.rent_amount },
                  { label: "Electricity", amount: selectedInvoice.electricity },
                  { label: "Water", amount: selectedInvoice.water },
                  { label: "Maintenance", amount: selectedInvoice.maintenance },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{"Rs."}{(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{"Rs."}{(selectedInvoice.total || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                </div>
                {selectedInvoice.paid_date && (
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Paid Date</p>
                    <p className="font-medium text-foreground">{new Date(selectedInvoice.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
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
