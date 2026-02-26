// ========== TYPES ==========
export type Role = "admin" | "tenant"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export interface PG {
  id: string
  name: string
  address: string
  totalRooms: number
  occupiedRooms: number
  totalBeds: number
  occupiedBeds: number
}

export interface Room {
  id: string
  pgId: string
  pgName: string
  roomNumber: string
  floor: number
  type: "AC" | "Non-AC"
  capacity: number
  occupants: number
  rent: number
  status: "available" | "occupied" | "maintenance"
  assets: Asset[]
}

export interface Asset {
  id: string
  name: string
  condition: "good" | "fair" | "needs-repair"
  assignedTo?: string
}

export interface Tenant {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  roomId: string
  roomNumber: string
  pgName: string
  stayType: "monthly" | "daily"
  joinDate: string
  rentAmount: number
  securityDeposit: number
  emergencyContact: string
  idProof: string
  status: "active" | "inactive"
}

export interface Message {
  id: string
  type: "rent-reminder" | "holiday-notice" | "announcement"
  title: string
  content: string
  sentAt: string
  sentBy: string
  recipients: "all" | string[]
}

export interface MenuItem {
  day: string
  breakfast: string
  lunch: string
  dinner: string
}

export interface Holiday {
  id: string
  date: string
  name: string
  description: string
}

export interface Invoice {
  id: string
  tenantId: string
  tenantName: string
  roomNumber: string
  month: string
  rentAmount: number
  electricity: number
  water: number
  maintenance: number
  total: number
  status: "paid" | "pending" | "overdue"
  dueDate: string
  paidDate?: string
}

export interface Ticket {
  id: string
  tenantId: string
  tenantName: string
  roomNumber: string
  category: "plumbing" | "electrical" | "wifi" | "furniture" | "cleaning" | "other"
  subject: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

// ========== MOCK DATA (DISABLED) ==========
// All components now use the real API via @/lib/api

export const mockUsers: User[] = []
export const mockPGs: PG[] = []
export const mockRooms: Room[] = []
export const mockTenants: Tenant[] = []
export const mockMessages: Message[] = []
export const mockMenu: MenuItem[] = []
export const mockHolidays: Holiday[] = []
export const mockInvoices: Invoice[] = []
export const mockTickets: Ticket[] = []
export const commonAssets: Asset[] = []
