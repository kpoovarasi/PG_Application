"use client"

import { mockMessages } from "@/lib/mock-data"
import { Bell, PartyPopper, Megaphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const typeIcons: Record<string, typeof Bell> = {
  "rent-reminder": Bell,
  "holiday-notice": PartyPopper,
  "announcement": Megaphone,
}

const typeColors: Record<string, string> = {
  "rent-reminder": "bg-warning/10 text-warning-foreground",
  "holiday-notice": "bg-primary/10 text-primary",
  "announcement": "bg-chart-2/10 text-chart-2",
}

export function TenantNotifications() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{mockMessages.length} notifications</p>
      <div className="space-y-3">
        {mockMessages.map((msg) => {
          const Icon = typeIcons[msg.type] || Megaphone
          return (
            <Card key={msg.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[msg.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{msg.title}</h3>
                      <Badge variant="outline" className="capitalize text-xs">{msg.type.replace("-", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{msg.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(msg.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
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
