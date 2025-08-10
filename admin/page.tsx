"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession, logout } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [userBranches, setUserBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const session = getSession()

      if (!session) {
        router.push("/")
        return
      }

      if (session.role === "student") {
        router.push("/dashboard")
        return
      }

      if (session.role === "teacher") {
        router.push("/teacher")
        return
      }

      setUser(session)

      // Fetch user branches if not superadmin
      if (session.role === "admin") {
        await fetchUserBranches(session.id)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function fetchUserBranches(userId: string) {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("user_branches")
        .select(`
          branches (
            id,
            name,
            commission_percentage
          )
        `)
        .eq("user_id", userId)

      setUserBranches(data?.map((item) => item.branches) || [])
    } catch (error) {
      console.error("Error fetching user branches:", error)
    }
  }

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

  const isSuperAdmin = user.role === "superadmin"

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? "Super Administrator"
              : `Administrator - ${userBranches.map((branch) => branch?.name).join(", ")}`}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          ออกจากระบบ
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ</CardTitle>
            <CardDescription>ข้อมูลผู้ดูแลระบบ</CardDescription>
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
              {!isSuperAdmin && userBranches.length > 0 && (
                <p>
                  <strong>สาขาที่ดูแล:</strong> {userBranches.map((branch) => branch?.name).join(", ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>จัดการนักเรียน</CardTitle>
              <CardDescription>ดูและจัดการข้อมูลนักเรียน</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/students">
                <Button className="w-full">ดูรายชื่อนักเรียน</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>จัดการคอร์ส</CardTitle>
              <CardDescription>จัดการหลักสูตรและตารางเรียน</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/courses">
                <Button className="w-full">จัดการคอร์ส</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายงาน</CardTitle>
              <CardDescription>ดูรายงานและสถิติ</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button className="w-full">ดูรายงาน</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>คำนวณรายได้</CardTitle>
              <CardDescription>คำนวณเปอร์เซ็นต์รายได้แต่ละสาขา</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/revenue">
                <Button className="w-full">คำนวณรายได้</Button>
              </Link>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>จัดการสาขา</CardTitle>
                <CardDescription>จัดการข้อมูลสาขาและเปอร์เซ็นต์</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/branches">
                  <Button className="w-full">จัดการสาขา</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
