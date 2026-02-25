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

// ========== MOCK DATA ==========

export const mockUsers: User[] = [
  { id: "admin-1", name: "Rajesh Kumar", email: "admin@pgmanager.com", role: "admin" },
  { id: "tenant-1", name: "Arjun Sharma", email: "arjun@email.com", role: "tenant" },
  { id: "tenant-2", name: "Priya Patel", email: "priya@email.com", role: "tenant" },
  { id: "tenant-3", name: "Vikram Singh", email: "vikram@email.com", role: "tenant" },
]

export const mockPGs: PG[] = [
  { id: "pg-1", name: "Sunshine PG", address: "123, MG Road, Bangalore", totalRooms: 20, occupiedRooms: 16, totalBeds: 40, occupiedBeds: 32 },
  { id: "pg-2", name: "Green Valley PG", address: "45, Koramangala, Bangalore", totalRooms: 15, occupiedRooms: 12, totalBeds: 30, occupiedBeds: 24 },
  { id: "pg-3", name: "City Nest PG", address: "78, HSR Layout, Bangalore", totalRooms: 10, occupiedRooms: 8, totalBeds: 20, occupiedBeds: 15 },
]

export const mockRooms: Room[] = [
  { id: "room-1", pgId: "pg-1", pgName: "Sunshine PG", roomNumber: "101", floor: 1, type: "AC", capacity: 2, occupants: 2, rent: 12000, status: "occupied", assets: [
    { id: "a1", name: "Single Bed", condition: "good" },
    { id: "a2", name: "Study Table", condition: "good" },
    { id: "a3", name: "Wardrobe", condition: "fair" },
    { id: "a4", name: "Chair", condition: "good" },
  ]},
  { id: "room-2", pgId: "pg-1", pgName: "Sunshine PG", roomNumber: "102", floor: 1, type: "AC", capacity: 2, occupants: 1, rent: 12000, status: "occupied", assets: [
    { id: "a5", name: "Single Bed", condition: "good" },
    { id: "a6", name: "Study Table", condition: "needs-repair" },
    { id: "a7", name: "Wardrobe", condition: "good" },
  ]},
  { id: "room-3", pgId: "pg-1", pgName: "Sunshine PG", roomNumber: "103", floor: 1, type: "Non-AC", capacity: 3, occupants: 3, rent: 8000, status: "occupied", assets: [
    { id: "a8", name: "Bunk Bed", condition: "good" },
    { id: "a9", name: "Single Bed", condition: "fair" },
    { id: "a10", name: "Study Table", condition: "good" },
  ]},
  { id: "room-4", pgId: "pg-1", pgName: "Sunshine PG", roomNumber: "201", floor: 2, type: "AC", capacity: 2, occupants: 0, rent: 13000, status: "available", assets: [
    { id: "a11", name: "Single Bed", condition: "good" },
    { id: "a12", name: "Study Table", condition: "good" },
    { id: "a13", name: "Wardrobe", condition: "good" },
    { id: "a14", name: "Chair", condition: "good" },
  ]},
  { id: "room-5", pgId: "pg-1", pgName: "Sunshine PG", roomNumber: "202", floor: 2, type: "Non-AC", capacity: 3, occupants: 2, rent: 7500, status: "occupied", assets: [
    { id: "a15", name: "Bunk Bed", condition: "fair" },
    { id: "a16", name: "Single Bed", condition: "good" },
  ]},
  { id: "room-6", pgId: "pg-2", pgName: "Green Valley PG", roomNumber: "G-101", floor: 1, type: "AC", capacity: 1, occupants: 1, rent: 15000, status: "occupied", assets: [
    { id: "a17", name: "Single Bed", condition: "good" },
    { id: "a18", name: "Study Table", condition: "good" },
    { id: "a19", name: "Wardrobe", condition: "good" },
    { id: "a20", name: "AC Unit", condition: "good" },
  ]},
  { id: "room-7", pgId: "pg-2", pgName: "Green Valley PG", roomNumber: "G-102", floor: 1, type: "Non-AC", capacity: 2, occupants: 2, rent: 9000, status: "occupied", assets: [
    { id: "a21", name: "Single Bed", condition: "good" },
    { id: "a22", name: "Single Bed", condition: "good" },
    { id: "a23", name: "Study Table", condition: "fair" },
  ]},
  { id: "room-8", pgId: "pg-3", pgName: "City Nest PG", roomNumber: "C-101", floor: 1, type: "AC", capacity: 2, occupants: 0, rent: 11000, status: "maintenance", assets: [
    { id: "a24", name: "Single Bed", condition: "needs-repair" },
    { id: "a25", name: "Study Table", condition: "needs-repair" },
  ]},
]

export const mockTenants: Tenant[] = [
  {
    id: "tenant-1", tenantId: "TEN-2024-001", name: "Arjun Sharma", email: "arjun@email.com",
    phone: "+91 98765 43210", roomId: "room-1", roomNumber: "101", pgName: "Sunshine PG",
    stayType: "monthly", joinDate: "2024-06-15", rentAmount: 12000, securityDeposit: 24000,
    emergencyContact: "+91 98765 43211", idProof: "Aadhaar - XXXX-XXXX-1234", status: "active",
  },
  {
    id: "tenant-2", tenantId: "TEN-2024-002", name: "Priya Patel", email: "priya@email.com",
    phone: "+91 87654 32109", roomId: "room-2", roomNumber: "102", pgName: "Sunshine PG",
    stayType: "monthly", joinDate: "2024-08-01", rentAmount: 12000, securityDeposit: 24000,
    emergencyContact: "+91 87654 32100", idProof: "Aadhaar - XXXX-XXXX-5678", status: "active",
  },
  {
    id: "tenant-3", tenantId: "TEN-2024-003", name: "Vikram Singh", email: "vikram@email.com",
    phone: "+91 76543 21098", roomId: "room-3", roomNumber: "103", pgName: "Sunshine PG",
    stayType: "monthly", joinDate: "2024-03-10", rentAmount: 8000, securityDeposit: 16000,
    emergencyContact: "+91 76543 21099", idProof: "PAN - ABCDE1234F", status: "active",
  },
  {
    id: "tenant-4", tenantId: "TEN-2024-004", name: "Neha Gupta", email: "neha@email.com",
    phone: "+91 65432 10987", roomId: "room-6", roomNumber: "G-101", pgName: "Green Valley PG",
    stayType: "daily", joinDate: "2025-01-20", rentAmount: 800, securityDeposit: 5000,
    emergencyContact: "+91 65432 10988", idProof: "Passport - J1234567", status: "active",
  },
  {
    id: "tenant-5", tenantId: "TEN-2024-005", name: "Rahul Verma", email: "rahul@email.com",
    phone: "+91 54321 09876", roomId: "room-5", roomNumber: "202", pgName: "Sunshine PG",
    stayType: "monthly", joinDate: "2024-11-01", rentAmount: 7500, securityDeposit: 15000,
    emergencyContact: "+91 54321 09877", idProof: "Aadhaar - XXXX-XXXX-9012", status: "active",
  },
  {
    id: "tenant-6", tenantId: "TEN-2023-010", name: "Anjali Rao", email: "anjali@email.com",
    phone: "+91 43210 98765", roomId: "room-7", roomNumber: "G-102", pgName: "Green Valley PG",
    stayType: "monthly", joinDate: "2023-09-15", rentAmount: 9000, securityDeposit: 18000,
    emergencyContact: "+91 43210 98766", idProof: "Aadhaar - XXXX-XXXX-3456", status: "inactive",
  },
]

export const mockMessages: Message[] = [
  { id: "msg-1", type: "rent-reminder", title: "Rent Due - February 2026", content: "Dear Tenants, this is a reminder that rent for February 2026 is due by the 5th. Please ensure timely payment to avoid late fees. Thank you!", sentAt: "2026-02-01T09:00:00", sentBy: "Admin", recipients: "all" },
  { id: "msg-2", type: "holiday-notice", title: "Holi Festival - Office Closed", content: "The management office will be closed on March 14th for Holi celebrations. Emergency contact: +91 98765 43210. Happy Holi!", sentAt: "2026-03-10T10:00:00", sentBy: "Admin", recipients: "all" },
  { id: "msg-3", type: "announcement", title: "Water Tank Cleaning", content: "Water tank cleaning is scheduled for this Saturday (Feb 28th) from 10 AM to 2 PM. Please store water in advance. We apologize for the inconvenience.", sentAt: "2026-02-24T14:00:00", sentBy: "Admin", recipients: "all" },
  { id: "msg-4", type: "announcement", title: "New WiFi Password", content: "The WiFi password has been updated. New password: PG@Sunshine2026. Please update your devices accordingly.", sentAt: "2026-02-20T11:30:00", sentBy: "Admin", recipients: ["tenant-1", "tenant-2", "tenant-3", "tenant-5"] },
  { id: "msg-5", type: "rent-reminder", title: "Late Payment Notice", content: "Your rent payment for January 2026 is overdue. Please clear the dues at the earliest to avoid any penalties.", sentAt: "2026-01-10T09:00:00", sentBy: "Admin", recipients: ["tenant-3"] },
]

export const mockMenu: MenuItem[] = [
  { day: "Monday", breakfast: "Poha, Tea/Coffee", lunch: "Dal, Rice, Roti, Sabzi", dinner: "Paneer Butter Masala, Roti, Rice" },
  { day: "Tuesday", breakfast: "Idli Sambar, Coffee", lunch: "Rajma, Rice, Roti, Salad", dinner: "Chole, Rice, Roti, Raita" },
  { day: "Wednesday", breakfast: "Aloo Paratha, Curd", lunch: "Kadhi Pakora, Rice, Roti", dinner: "Mix Veg, Dal, Rice, Roti" },
  { day: "Thursday", breakfast: "Upma, Tea/Coffee", lunch: "Dal Fry, Rice, Roti, Sabzi", dinner: "Egg Curry / Paneer, Rice, Roti" },
  { day: "Friday", breakfast: "Bread Toast, Omelette", lunch: "Sambar, Rice, Roti, Poriyal", dinner: "Biryani, Raita, Salad" },
  { day: "Saturday", breakfast: "Dosa, Chutney, Sambar", lunch: "Aloo Gobi, Dal, Rice, Roti", dinner: "Pasta, Garlic Bread, Soup" },
  { day: "Sunday", breakfast: "Chole Bhature, Lassi", lunch: "Special Thali", dinner: "Pulao, Paneer Tikka, Dessert" },
]

export const mockHolidays: Holiday[] = [
  { id: "h-1", date: "2026-01-26", name: "Republic Day", description: "National holiday - office closed" },
  { id: "h-2", date: "2026-03-14", name: "Holi", description: "Festival of colors" },
  { id: "h-3", date: "2026-04-02", name: "Good Friday", description: "Public holiday" },
  { id: "h-4", date: "2026-04-14", name: "Ambedkar Jayanti", description: "Public holiday" },
  { id: "h-5", date: "2026-05-01", name: "May Day", description: "Workers day" },
  { id: "h-6", date: "2026-08-15", name: "Independence Day", description: "National holiday - office closed" },
  { id: "h-7", date: "2026-10-02", name: "Gandhi Jayanti", description: "National holiday" },
  { id: "h-8", date: "2026-10-20", name: "Dussehra", description: "Festival holiday" },
  { id: "h-9", date: "2026-11-09", name: "Diwali", description: "Festival of lights" },
  { id: "h-10", date: "2026-12-25", name: "Christmas", description: "Festival holiday" },
]

export const mockInvoices: Invoice[] = [
  { id: "inv-1", tenantId: "tenant-1", tenantName: "Arjun Sharma", roomNumber: "101", month: "February 2026", rentAmount: 12000, electricity: 850, water: 200, maintenance: 500, total: 13550, status: "pending", dueDate: "2026-02-05" },
  { id: "inv-2", tenantId: "tenant-1", tenantName: "Arjun Sharma", roomNumber: "101", month: "January 2026", rentAmount: 12000, electricity: 920, water: 200, maintenance: 500, total: 13620, status: "paid", dueDate: "2026-01-05", paidDate: "2026-01-04" },
  { id: "inv-3", tenantId: "tenant-2", tenantName: "Priya Patel", roomNumber: "102", month: "February 2026", rentAmount: 12000, electricity: 780, water: 200, maintenance: 500, total: 13480, status: "pending", dueDate: "2026-02-05" },
  { id: "inv-4", tenantId: "tenant-2", tenantName: "Priya Patel", roomNumber: "102", month: "January 2026", rentAmount: 12000, electricity: 810, water: 200, maintenance: 500, total: 13510, status: "paid", dueDate: "2026-01-05", paidDate: "2026-01-03" },
  { id: "inv-5", tenantId: "tenant-3", tenantName: "Vikram Singh", roomNumber: "103", month: "February 2026", rentAmount: 8000, electricity: 650, water: 200, maintenance: 500, total: 9350, status: "overdue", dueDate: "2026-02-05" },
  { id: "inv-6", tenantId: "tenant-3", tenantName: "Vikram Singh", roomNumber: "103", month: "January 2026", rentAmount: 8000, electricity: 700, water: 200, maintenance: 500, total: 9400, status: "overdue", dueDate: "2026-01-05" },
  { id: "inv-7", tenantId: "tenant-4", tenantName: "Neha Gupta", roomNumber: "G-101", month: "February 2026", rentAmount: 15000, electricity: 1100, water: 200, maintenance: 500, total: 16800, status: "paid", dueDate: "2026-02-05", paidDate: "2026-02-02" },
  { id: "inv-8", tenantId: "tenant-5", tenantName: "Rahul Verma", roomNumber: "202", month: "February 2026", rentAmount: 7500, electricity: 600, water: 200, maintenance: 500, total: 8800, status: "pending", dueDate: "2026-02-05" },
]

export const mockTickets: Ticket[] = [
  { id: "tkt-1", tenantId: "tenant-1", tenantName: "Arjun Sharma", roomNumber: "101", category: "plumbing", subject: "Leaking tap in bathroom", description: "The bathroom tap has been leaking for 2 days. Water is dripping constantly.", status: "open", priority: "high", createdAt: "2026-02-23T10:30:00", updatedAt: "2026-02-23T10:30:00" },
  { id: "tkt-2", tenantId: "tenant-2", tenantName: "Priya Patel", roomNumber: "102", category: "wifi", subject: "Slow internet speed", description: "Internet speed has been very slow since yesterday. Unable to work from home.", status: "in-progress", priority: "medium", createdAt: "2026-02-22T14:00:00", updatedAt: "2026-02-23T09:00:00" },
  { id: "tkt-3", tenantId: "tenant-3", tenantName: "Vikram Singh", roomNumber: "103", category: "electrical", subject: "Fan not working", description: "The ceiling fan stopped working. Already tried switching it on/off.", status: "resolved", priority: "high", createdAt: "2026-02-20T08:00:00", updatedAt: "2026-02-21T16:00:00", resolvedAt: "2026-02-21T16:00:00" },
  { id: "tkt-4", tenantId: "tenant-5", tenantName: "Rahul Verma", roomNumber: "202", category: "furniture", subject: "Broken chair leg", description: "One of the chair legs broke while sitting. Need a replacement.", status: "open", priority: "low", createdAt: "2026-02-24T11:00:00", updatedAt: "2026-02-24T11:00:00" },
  { id: "tkt-5", tenantId: "tenant-4", tenantName: "Neha Gupta", roomNumber: "G-101", category: "cleaning", subject: "Room deep cleaning request", description: "Requesting a deep cleaning of my room this weekend.", status: "closed", priority: "low", createdAt: "2026-02-15T09:00:00", updatedAt: "2026-02-17T12:00:00", resolvedAt: "2026-02-17T12:00:00" },
  { id: "tkt-6", tenantId: "tenant-1", tenantName: "Arjun Sharma", roomNumber: "101", category: "other", subject: "Noisy neighbors at night", description: "The adjacent room tenants play loud music after 11 PM regularly.", status: "in-progress", priority: "medium", createdAt: "2026-02-19T22:00:00", updatedAt: "2026-02-20T10:00:00" },
]

export const commonAssets: Asset[] = [
  { id: "ca-1", name: "Washing Machine (Common Area)", condition: "good" },
  { id: "ca-2", name: "Refrigerator (Common Kitchen)", condition: "good" },
  { id: "ca-3", name: "Microwave (Common Kitchen)", condition: "fair" },
  { id: "ca-4", name: "Water Purifier (Ground Floor)", condition: "good" },
  { id: "ca-5", name: "TV (Common Room)", condition: "good" },
  { id: "ca-6", name: "CCTV Camera (Entrance)", condition: "good" },
  { id: "ca-7", name: "CCTV Camera (Corridor 1F)", condition: "good" },
  { id: "ca-8", name: "Generator (Backup)", condition: "fair" },
]
