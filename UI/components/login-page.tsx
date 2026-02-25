"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/mock-data"
import { Building2, User, Lock, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
  const { login } = useAuth()
  const [role, setRole] = useState<Role>("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const success = login(email, password, role)
    if (!success) {
      setError("Invalid credentials. Please try again.")
    }
  }

  const presetCredentials = (selectedRole: Role) => {
    setRole(selectedRole)
    if (selectedRole === "admin") {
      setEmail("admin@pgmanager.com")
    } else {
      setEmail("arjun@email.com")
    }
    setPassword("demo123")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">PG Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your PG property</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Choose your role and enter credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => presetCredentials("admin")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  role === "admin"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Building2 className="h-6 w-6" />
                <span className="text-sm font-medium">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => presetCredentials("tenant")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  role === "tenant"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Tenant</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full gap-2">
                Sign In as {role === "admin" ? "Admin" : "Tenant"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo: Click a role card above to auto-fill credentials
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
