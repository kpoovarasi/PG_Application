import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { UtensilsCrossed, Edit2, Save, X, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function AdminMenu() {
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMenu()
  }, [])

  async function fetchMenu() {
    try {
      setLoading(true)
      const data = await api.menu.all()
      setMenu(data)
      setError(null)
    } catch (err: any) {
      console.error("Menu fetch error:", err)
      setError("Failed to load menu data.")
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: any) => {
    setEditingDay(item.day)
    setEditForm({ ...item })
  }

  const saveEdit = async () => {
    if (!editForm) return
    try {
      setSaving(true)
      await api.menu.update(editForm.day, {
        breakfast: editForm.breakfast,
        lunch: editForm.lunch,
        dinner: editForm.dinner
      })
      toast.success(`${editForm.day} menu updated`)
      setMenu(menu.map((m) => (m.day === editForm.day ? editForm : m)))
      setEditingDay(null)
      setEditForm(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to update menu")
    } finally {
      setSaving(false)
    }
  }

  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]

  if (loading && menu.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading menu...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage the weekly food menu for all PGs</p>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchMenu} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {menu.map((item) => {
          const isToday = item.day === today
          const isEditing = editingDay === item.day

          return (
            <Card key={item.day} className={isToday ? "ring-2 ring-primary" : ""}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">{item.day}</h3>
                    {isToday && <Badge>Today</Badge>}
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingDay(null); setEditForm(null) }} disabled={saving}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" onClick={saveEdit} className="gap-1" disabled={saving}>
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEdit(item)} className="gap-1">
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditing && editForm ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Breakfast</p>
                      <Input value={editForm.breakfast} onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })} />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Lunch</p>
                      <Input value={editForm.lunch} onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })} />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Dinner</p>
                      <Input value={editForm.dinner} onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs font-medium text-muted-foreground">Breakfast</p>
                      <p className="mt-0.5 text-sm text-foreground">{item.breakfast}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs font-medium text-muted-foreground">Lunch</p>
                      <p className="mt-0.5 text-sm text-foreground">{item.lunch}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs font-medium text-muted-foreground">Dinner</p>
                      <p className="mt-0.5 text-sm text-foreground">{item.dinner}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
