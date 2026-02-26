import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { CalendarDays, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function TenantHolidays() {
  const [holidays, setHolidays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <p className="text-sm text-muted-foreground">Upcoming holidays and important dates</p>
        {error && <Button variant="ghost" size="sm" onClick={fetchHolidays} className="text-destructive">Retry</Button>}
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
                  <span className="text-lg font-bold leading-tight">{dateObj.getDate()}</span>
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
              </CardContent>
            </Card>
          )
        })}
        {!loading && holidays.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No holidays found</p>
          </div>
        )}
      </div>
    </div>
  )
}
