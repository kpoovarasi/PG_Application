"use client"

import { useAuth } from "@/lib/auth-context"
import { mockTenants, mockRooms } from "@/lib/mock-data"
import { BedDouble, Snowflake, Fan, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TenantRoom() {
  const { user } = useAuth()
  const tenant = mockTenants.find((t) => t.id === user?.id) || mockTenants[0]
  const room = mockRooms.find((r) => r.id === tenant.roomId) || mockRooms[0]

  const conditionColor = (c: string) => {
    switch (c) {
      case "good": return "default" as const
      case "fair": return "secondary" as const
      case "needs-repair": return "destructive" as const
      default: return "secondary" as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Room Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BedDouble className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Room {room.roomNumber}</h2>
              <p className="text-sm text-muted-foreground">{room.pgName}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <div className="mt-1 flex items-center gap-1.5">
                {room.type === "AC" ? <Snowflake className="h-4 w-4 text-primary" /> : <Fan className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{room.type}</span>
              </div>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Floor</p>
              <p className="mt-1 text-sm font-medium text-foreground">Floor {room.floor}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Occupancy</p>
              <p className="mt-1 text-sm font-medium text-foreground">{room.occupants} / {room.capacity} beds</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Monthly Rent</p>
              <p className="mt-1 text-sm font-bold text-foreground">{"Rs."}{room.rent.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            Room Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {room.assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium text-foreground">{asset.name}</span>
                <Badge variant={conditionColor(asset.condition)}>{asset.condition}</Badge>
              </div>
            ))}
            {room.assets.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No assets assigned</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
