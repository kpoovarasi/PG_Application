"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard, BedDouble, Users, MessageSquare, CalendarDays,
  UtensilsCrossed, FileText, TicketCheck, LogOut, Building2,
  Menu, X, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminRooms } from "@/components/admin/admin-rooms"
import { AdminTenants } from "@/components/admin/admin-tenants"
import { AdminMessages } from "@/components/admin/admin-messages"
import { AdminMenu } from "@/components/admin/admin-menu"
import { AdminHolidays } from "@/components/admin/admin-holidays"
import { AdminInvoices } from "@/components/admin/admin-invoices"
import { AdminTickets } from "@/components/admin/admin-tickets"

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rooms", label: "Rooms & Assets", icon: BedDouble },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "menu", label: "Food Menu", icon: UtensilsCrossed },
  { id: "holidays", label: "Holidays", icon: CalendarDays },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "tickets", label: "Tickets", icon: TicketCheck },
]

export function AdminPortal() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <AdminDashboard />
      case "rooms": return <AdminRooms />
      case "tenants": return <AdminTenants />
      case "messages": return <AdminMessages />
      case "menu": return <AdminMenu />
      case "holidays": return <AdminHolidays />
      case "invoices": return <AdminInvoices />
      case "tickets": return <AdminTickets />
      default: return <AdminDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold">PG Manager</span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {adminNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id)
                  setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
                {activePage === item.id && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">Admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-foreground" />
            <span className="sr-only">Open menu</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground capitalize">
            {adminNav.find((n) => n.id === activePage)?.label || "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}
