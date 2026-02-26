import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { UtensilsCrossed, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function TenantMenuView() {
  const [menu, setMenu] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setError("Failed to load menu.")
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">This week{"'"}s food menu</p>
        {error && <Button variant="ghost" size="sm" onClick={fetchMenu} className="text-destructive">Retry</Button>}
      </div>
      <div className="space-y-3">
        {menu.map((item) => {
          const isToday = item.day === today
          return (
            <Card key={item.day} className={isToday ? "ring-2 ring-primary" : ""}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{item.day}</h3>
                  {isToday && <Badge>Today</Badge>}
                </div>
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
              </CardContent>
            </Card>
          )
        })}
        {!loading && menu.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No menu found</p>
          </div>
        )}
      </div>
    </div>
  )
}
