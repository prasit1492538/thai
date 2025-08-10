import { DatabaseService } from "@/lib/database-service"

export function getSession() {
  if (typeof window === "undefined") return null

  try {
    const sessionData = localStorage.getItem("user_session")
    if (!sessionData) return null

    return JSON.parse(sessionData)
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export async function getUserDetails() {
  try {
    const session = getSession()
    if (!session) return null

    // ถ้าเป็นโหมดออฟไลน์ ให้ return ข้อมูลจาก session
    if (session.connectionMode === "offline") {
      return {
        ...session,
        user_branches: [],
      }
    }

    // ถ้าเป็นโหมดออนไลน์ ให้ดึงข้อมูลจากฐานข้อมูล
    const { data: userDetails } = await DatabaseService.findUserByPhone(session.phone)
    return userDetails
  } catch (error) {
    console.error("User details error:", error)
    return null
  }
}

export async function getUserBranches() {
  try {
    const session = getSession()
    if (!session) return []

    // ถ้าเป็นโหมดออฟไลน์ ให้ return ข้อมูลจำลอง
    if (session.connectionMode === "offline") {
      const { data: branches } = await DatabaseService.getBranches()
      return branches || []
    }

    // ถ้าเป็นโหมดออนไลน์ ให้ดึงข้อมูลจากฐานข้อมูล
    const { data: branches } = await DatabaseService.getBranches()
    return branches || []
  } catch (error) {
    console.error("User branches error:", error)
    return []
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session")
    window.location.href = "/"
  }
}
