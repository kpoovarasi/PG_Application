import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { api, getToken, clearToken } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "tenant"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const token = getToken()
      if (token) {
        const userData = await api.auth.me(token)
        setUser({
          id: String(userData.id),
          name: userData.name,
          email: userData.email,
          role: userData.role as "admin" | "tenant"
        })
      }
    } catch (err) {
      console.error("Auth me error:", err)
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password)
    setUser({
      id: String(data.user_id),
      name: data.name,
      email: email,
      role: data.role as "admin" | "tenant"
    })
  }, [])

  const logout = useCallback(() => {
    api.auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
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
