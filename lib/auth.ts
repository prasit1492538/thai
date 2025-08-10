import { DatabaseService } from "./database-service"
import type { User } from "./database.types"

export interface Session {
  user: User
  expiresAt: number
}

const SESSION_KEY = "thai_tutor_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function login(phone: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validate phone number format
    if (!phone || phone.length < 10) {
      return { success: false, error: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" }
    }

    // Find user by phone
    const { data: user, error } = await DatabaseService.findUserByPhone(phone)

    if (error || !user) {
      return { success: false, error: "ไม่พบผู้ใช้งานในระบบ" }
    }

    // Create session
    const session: Session = {
      user,
      expiresAt: Date.now() + SESSION_DURATION,
    }

    // Store session in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null

  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null

    const session: Session = JSON.parse(sessionData)

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch (error) {
    console.error("Session error:", error)
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
    window.location.href = "/"
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function hasRole(roles: string[]): boolean {
  const session = getSession()
  if (!session) return false
  return roles.includes(session.user.role)
}
