"use client"

import { useState } from "react"
import { mockMenu, type MenuItem } from "@/lib/mock-data"
import { UtensilsCrossed, Edit2, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function AdminMenu() {
  const [menu, setMenu] = useState<MenuItem[]>(mockMenu)
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MenuItem | null>(null)

  const startEdit = (item: MenuItem) => {
    setEditingDay(item.day)
    setEditForm({ ...item })
  }

  const saveEdit = () => {
    if (!editForm) return
    setMenu(menu.map((m) => (m.day === editForm.day ? editForm : m)))
    setEditingDay(null)
    setEditForm(null)
  }

  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage the weekly food menu for all PGs</p>

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
                      <Button size="sm" variant="ghost" onClick={() => { setEditingDay(null); setEditForm(null) }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" onClick={saveEdit} className="gap-1">
                        <Save className="h-3.5 w-3.5" />
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
