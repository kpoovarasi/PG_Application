import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { FileText, Download, Search, Filter, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [markingPaid, setMarkingPaid] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  async function fetchInvoices() {
    try {
      setLoading(true)
      const data = await api.invoices.list({
        status: statusFilter === "all" ? undefined : statusFilter
      })
      setInvoices(data)
      setError(null)
    } catch (err: any) {
      console.error("Invoices fetch error:", err)
      setError("Failed to load invoices.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (id: number) => {
    try {
      setMarkingPaid(true)
      const today = new Date().toISOString()
      await api.invoices.markPaid(id, today)
      toast.success("Invoice marked as paid")
      // Update local state or refetch
      setSelectedInvoice(null)
      fetchInvoices()
    } catch (err: any) {
      toast.error(err.message || "Failed to update invoice")
    } finally {
      setMarkingPaid(false)
    }
  }

  const filtered = invoices.filter((inv) => {
    const term = search.toLowerCase()
    if (search &&
      !inv.tenant_name?.toLowerCase().includes(term) &&
      !inv.room_number?.includes(search) &&
      !inv.month?.toLowerCase().includes(term)
    ) return false
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

  const paidAmount = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === "pending").reduce((s, i) => s + (i.total || 0), 0)
  const overdueAmount = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + (i.total || 0), 0)

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

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchInvoices} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Invoice summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Paid Amount</p>
            <p className="text-2xl font-bold text-success">
              {"Rs."}{paidAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-2xl font-bold text-warning">
              {"Rs."}{pendingAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Overdue Amount</p>
            <p className="text-2xl font-bold text-destructive">
              {"Rs."}{overdueAmount.toLocaleString()}
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
                  <h3 className="font-semibold text-foreground">{inv.tenant_name}</h3>
                  <p className="text-sm text-muted-foreground">Room {inv.room_number || "N/A"} | {inv.month}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-foreground">{"Rs."}{inv.total?.toLocaleString() || "0"}</span>
                {statusBadge(inv.status)}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
          </div>
        )}
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
                  <h3 className="font-semibold text-foreground">{selectedInvoice.tenant_name}</h3>
                  <p className="text-sm text-muted-foreground">Room {selectedInvoice.room_number || "N/A"} | {selectedInvoice.month}</p>
                </div>
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
                    <span className="text-foreground">{"Rs."}{item.amount?.toLocaleString() || "0"}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{"Rs."}{selectedInvoice.total?.toLocaleString() || "0"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium text-foreground">{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : "N/A"}</p>
                </div>
                {selectedInvoice.paid_date && (
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Paid Date</p>
                    <p className="font-medium text-foreground">{new Date(selectedInvoice.paid_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedInvoice.status !== "paid" && (
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    disabled={markingPaid}
                  >
                    {markingPaid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Mark as Paid
                  </Button>
                )}
                <Button variant="outline" className={selectedInvoice.status !== "paid" ? "w-1/3 gap-2" : "w-full gap-2"}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
