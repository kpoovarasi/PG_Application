import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { CalendarDays, Plus, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export function AdminHolidays() {
  const [holidays, setHolidays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "", description: "" })

  useEffect(() => {
    fetchHolidays()
  }, [])

  async function fetchHolidays() {
    try {
      setLoading(true)
      const data = await api.holidays.list()
      setHolidays(data.sort((a: any, b: any) => a.date.localeCompare(b.date)))
      setError(null)
    } catch (err: any) {
      console.error("Holidays fetch error:", err)
      setError("Failed to load holidays.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.holidays.create(newHoliday)
      toast.success("Holiday added successfully")
      setShowAdd(false)
      setNewHoliday({ date: "", name: "", description: "" })
      fetchHolidays()
    } catch (err: any) {
      toast.error(err.message || "Failed to add holiday")
    } finally {
      setSubmitting(false)
    }
  }

  const removeHoliday = async (id: number) => {
    if (!confirm("Are you sure you want to remove this holiday?")) return
    try {
      await api.holidays.delete(id)
      toast.success("Holiday removed")
      setHolidays(holidays.filter((h) => h.id !== id))
    } catch (err: any) {
      toast.error(err.message || "Failed to remove holiday")
    }
  }

  const today = new Date().toISOString().split("T")[0]

  if (loading && holidays.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading holidays...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{holidays.length} holidays in the calendar</p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Holiday</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Holiday Name</Label>
                <Input value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newHoliday.description} onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowAdd(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
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
            <Button variant="outline" size="sm" onClick={fetchHolidays} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {holidays.map((holiday) => {
          const isPast = holiday.date < today
          const dateObj = new Date(holiday.date + "T00:00:00")
          return (
            <Card key={holiday.id} className={isPast ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium uppercase">
                    {dateObj.toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {dateObj.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{holiday.name}</h3>
                    {isPast && <Badge variant="secondary">Past</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{holiday.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeHoliday(holiday.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </CardContent>
            </Card>
          )
        })}
        {!loading && holidays.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No holidays added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
