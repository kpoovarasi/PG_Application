import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { BedDouble, Snowflake, Fan, Package, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TenantRoom() {
  const { user } = useAuth()
  const [room, setRoom] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchRoomData()
    }
  }, [user?.id])

  async function fetchRoomData() {
    try {
      setLoading(true)
      // 1. Get tenant details by user_id to find their roomId
      const tenant = await api.tenants.byUser(Number(user?.id))

      if (!tenant.room_id) {
        setError("You are not currently assigned to any room.")
        setLoading(false)
        return
      }

      // 2. Fetch room details and assets
      const [roomData, assetsData] = await Promise.all([
        api.rooms.get(tenant.room_id),
        api.rooms.assets(tenant.room_id)
      ])

      setRoom(roomData)
      setAssets(assetsData)
      setError(null)
    } catch (err: any) {
      console.error("Room data fetch error:", err)
      setError("Failed to load room details.")
    } finally {
      setLoading(false)
    }
  }

  const conditionColor = (c: string) => {
    switch (c?.toLowerCase()) {
      case "good": return "default" as const
      case "fair": return "secondary" as const
      case "needs-repair": return "destructive" as const
      default: return "secondary" as const
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading room details...</span>
      </div>
    )
  }

  if (error || !room) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error || "Room details not found"}</p>
        </CardContent>
      </Card>
    )
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
              <h2 className="text-xl font-bold text-foreground">Room {room.room_number || room.number}</h2>
              <p className="text-sm text-muted-foreground">{room.pg_name}</p>
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
              <p className="mt-1 text-sm font-medium text-foreground">{room.occupants || 0} / {room.capacity} beds</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Monthly Rent</p>
              <p className="mt-1 text-sm font-bold text-foreground">{"Rs."}{(room.rent || 0).toLocaleString()}</p>
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
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium text-foreground">{asset.name}</span>
                <Badge variant={conditionColor(asset.condition)}>{asset.condition}</Badge>
              </div>
            ))}
            {assets.length === 0 && (
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
