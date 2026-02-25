"use client"

import { mockHolidays } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TenantHolidays() {
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Upcoming holidays and important dates</p>
      <div className="space-y-3">
        {mockHolidays.map((holiday) => {
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
      </div>
    </div>
  )
}
