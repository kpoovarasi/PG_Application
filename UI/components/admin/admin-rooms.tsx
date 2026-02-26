import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { BedDouble, Filter, Eye, Package, Snowflake, Fan, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([])
  const [commonAssets, setCommonAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null)
  const [roomAssets, setRoomAssets] = useState<any[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [roomsData, commonAssetsData] = await Promise.all([
        api.rooms.list(),
        api.rooms.commonAssets()
      ])
      setRooms(roomsData)
      setCommonAssets(commonAssetsData)
      setError(null)
    } catch (err: any) {
      console.error("Rooms fetch error:", err)
      setError("Failed to load rooms data.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRoom = async (room: any) => {
    setSelectedRoom(room)
    setRoomAssets([])
    try {
      setLoadingAssets(true)
      const assets = await api.rooms.assets(room.id)
      setRoomAssets(assets)
    } catch (err) {
      console.error("Failed to load room assets:", err)
    } finally {
      setLoadingAssets(false)
    }
  }

  const filteredRooms = rooms.filter((room) => {
    if (typeFilter !== "all" && room.type !== typeFilter) return false
    if (statusFilter !== "all" && room.status !== statusFilter) return false
    return true
  })

  const statusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success/10 text-success"
      case "occupied": return "bg-primary/10 text-primary"
      case "maintenance": return "bg-destructive/10 text-destructive"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const conditionColor = (c: string) => {
    switch (c) {
      case "good": return "default" as const
      case "fair": return "secondary" as const
      case "needs-repair": return "destructive" as const
      default: return "secondary" as const
    }
  }

  if (loading && rooms.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading rooms...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="common-assets">Common Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4 mt-4">
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-3 p-4 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">Retry</Button>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="Non-AC">Non-AC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredRooms.length} rooms found
            </span>
          </div>

          {/* Room Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Room {room.room_number}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{room.pg_name}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      {room.type === "AC" ? <Snowflake className="h-3 w-3" /> : <Fan className="h-3 w-3" />}
                      {room.type}
                    </Badge>
                    <Badge variant="outline">Floor {room.floor}</Badge>
                    <Badge variant="outline">{room.occupants}/{room.capacity} beds</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {"Rs."}{room.rent?.toLocaleString() || "0"}
                      <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleSelectRoom(room)} className="gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!loading && filteredRooms.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center">
                <BedDouble className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No rooms found matching filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="common-assets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Common Area Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commonAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium text-foreground">{asset.name}</span>
                    <Badge variant={conditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </div>
                ))}
                {commonAssets.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No common assets listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Room Detail Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Room {selectedRoom?.room_number} Details
            </DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">PG Name</p>
                  <p className="text-sm font-medium text-foreground">{selectedRoom.pg_name}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">{selectedRoom.type}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Floor</p>
                  <p className="text-sm font-medium text-foreground">{selectedRoom.floor}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="text-sm font-medium text-foreground">{selectedRoom.occupants}/{selectedRoom.capacity}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Rent</p>
                  <p className="text-sm font-medium text-foreground">{"Rs."}{selectedRoom.rent?.toLocaleString() || "0"}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground capitalize">{selectedRoom.status}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Room Assets</h4>
                <div className="space-y-2">
                  {loadingAssets ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                      <span className="text-xs text-muted-foreground">Loading assets...</span>
                    </div>
                  ) : roomAssets.length > 0 ? (
                    roomAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                        <span className="text-sm text-foreground">{asset.name}</span>
                        <Badge variant={conditionColor(asset.condition)} className="text-xs">
                          {asset.condition}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-muted-foreground py-2 italic">No specific assets assigned to this room.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
