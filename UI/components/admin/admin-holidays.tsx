"use client"

import { useState } from "react"
import { mockHolidays, type Holiday } from "@/lib/mock-data"
import { CalendarDays, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AdminHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays)
  const [showAdd, setShowAdd] = useState(false)
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "", description: "" })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setHolidays([...holidays, { id: `h-${Date.now()}`, ...newHoliday }].sort((a, b) => a.date.localeCompare(b.date)))
    setShowAdd(false)
    setNewHoliday({ date: "", name: "", description: "" })
  }

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id))
  }

  const today = new Date().toISOString().split("T")[0]

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
                <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
      </div>
    </div>
  )
}
