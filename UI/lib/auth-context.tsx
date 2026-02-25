"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type User, type Role, mockUsers } from "@/lib/mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: Role) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((email: string, _password: string, role: Role): boolean => {
    const found = mockUsers.find((u) => u.email === email && u.role === role)
    if (found) {
      setUser(found)
      return true
    }
    // Demo: allow any login for the selected role
    if (role === "admin") {
      setUser(mockUsers[0])
      return true
    }
    setUser(mockUsers[1])
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
