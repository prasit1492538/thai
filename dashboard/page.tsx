"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession, logout } from "@/lib/auth"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = getSession()

      if (!session) {
        router.push("/")
        return
      }

      if (session.role !== "student") {
        router.push(session.role === "teacher" ? "/teacher" : "/admin")
        return
      }

      setUser(session)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">แดชบอร์ดนักเรียน</h1>
        <Button variant="outline" onClick={logout}>
          ออกจากระบบ
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ</CardTitle>
            <CardDescription>ข้อมูลส่วนตัว</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>ชื่อ:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>เบอร์โทรศัพท์:</strong> {user.phone}
              </p>
              <p>
                <strong>บทบาท:</strong> {user.role}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>คอร์สเรียนของฉัน</CardTitle>
            <CardDescription>รายการคอร์สที่ลงทะเบียนแล้ว</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">ยังไม่มีคอร์สเรียน</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
