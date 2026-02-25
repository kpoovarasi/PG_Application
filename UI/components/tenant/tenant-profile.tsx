"use client"

import { useAuth } from "@/lib/auth-context"
import { mockTenants } from "@/lib/mock-data"
import { User, Mail, Phone, Home, Calendar, CreditCard, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TenantProfile() {
  const { user } = useAuth()
  const tenant = mockTenants.find((t) => t.id === user?.id) || mockTenants[0]

  const details = [
    { icon: Mail, label: "Email", value: tenant.email },
    { icon: Phone, label: "Phone", value: tenant.phone },
    { icon: Home, label: "Room", value: `${tenant.roomNumber} - ${tenant.pgName}` },
    { icon: Calendar, label: "Join Date", value: new Date(tenant.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
    { icon: CreditCard, label: "Monthly Rent", value: `Rs.${tenant.rentAmount.toLocaleString()}` },
    { icon: CreditCard, label: "Security Deposit", value: `Rs.${tenant.securityDeposit.toLocaleString()}` },
    { icon: Clock, label: "Stay Type", value: tenant.stayType === "monthly" ? "Monthly Basis" : "Daily Basis" },
    { icon: Phone, label: "Emergency Contact", value: tenant.emergencyContact },
    { icon: Shield, label: "ID Proof", value: tenant.idProof },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {tenant.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{tenant.name}</h2>
            <p className="text-sm text-muted-foreground">Tenant ID: {tenant.tenantId}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant={tenant.status === "active" ? "default" : "secondary"}>{tenant.status}</Badge>
              <Badge variant="outline" className="capitalize">{tenant.stayType}</Badge>
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
