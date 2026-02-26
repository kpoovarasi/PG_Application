import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { User, Mail, Phone, Home, Calendar, CreditCard, Shield, Clock, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TenantProfile() {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  async function fetchProfile() {
    try {
      setLoading(true)
      const tenant = await api.tenants.byUser(Number(user?.id))
      setTenant(tenant)
      setError(null)
    } catch (err: any) {
      console.error("Profile fetch error:", err)
      setError("Failed to load profile details.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error || "Tenant profile not found"}</p>
          <button onClick={fetchProfile} className="ml-auto text-sm font-medium underline">Retry</button>
        </CardContent>
      </Card>
    )
  }

  const details = [
    { icon: Mail, label: "Email", value: tenant.email },
    { icon: Phone, label: "Phone", value: tenant.phone },
    { icon: Home, label: "Room", value: `${tenant.room_number || "N/A"} - ${tenant.pg_name || "N/A"}` },
    { icon: Calendar, label: "Join Date", value: tenant.join_date ? new Date(tenant.join_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A" },
    { icon: CreditCard, label: "Monthly Rent", value: `Rs.${(tenant.rent_amount || 0).toLocaleString()}` },
    { icon: CreditCard, label: "Security Deposit", value: `Rs.${(tenant.security_deposit || 0).toLocaleString()}` },
    { icon: Clock, label: "Stay Type", value: tenant.stay_type === "monthly" ? "Monthly Basis" : "Daily Basis" },
    { icon: Phone, label: "Emergency Contact", value: tenant.emergency_contact },
    { icon: Shield, label: "ID Proof", value: tenant.id_proof },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {tenant.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{tenant.name}</h2>
            <p className="text-sm text-muted-foreground">Tenant ID: {tenant.tenant_id || tenant.id}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant={tenant.status === "active" ? "default" : "secondary"}>{tenant.status}</Badge>
              <Badge variant="outline" className="capitalize">{tenant.stay_type}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <item.icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="truncate text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
