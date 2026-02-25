"use client"

import { mockMenu } from "@/lib/mock-data"
import { UtensilsCrossed } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TenantMenuView() {
  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">This week{"'"}s food menu</p>
      <div className="space-y-3">
        {mockMenu.map((item) => {
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
      </div>
    </div>
  )
}
