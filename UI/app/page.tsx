"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginPage } from "@/components/login-page"
import { AdminPortal } from "@/components/admin/admin-portal"
import { TenantPortal } from "@/components/tenant/tenant-portal"

function AppRouter() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (user?.role === "admin") {
    return <AdminPortal />
  }

  return <TenantPortal />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
