"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatCurrency } from "@/lib/utils"
import { Users, GraduationCap, Building2, DollarSign, BookOpen, UserPlus, TrendingUp, Settings } from "lucide-react"
import type { User } from "@/lib/database.types"

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const { data, error } = await DatabaseService.getStatistics(branchId)
      if (error) {
        console.error("Error loading statistics:", error)
      } else {
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      title: "จัดการนักเรียน",
      description: "ดูและจัดการข้อมูลนักเรียน",
      icon: Users,
      href: "/admin/students",
      color: "bg-blue-500",
    },
    {
      title: "จัดการครู",
      description: "จัดการข้อมูลครูและมอบหมายวิชา",
      icon: GraduationCap,
      href: "/admin/teachers",
      color: "bg-green-500",
    },
    {
      title: "จัดการคอร์ส",
      description: "สร้างและจัดการคอร์สเรียน",
      icon: BookOpen,
      href: "/admin/courses",
      color: "bg-purple-500",
    },
    {
      title: "การลงทะเบียน",
      description: "ลงทะเบียนนักเรียนและจัดการการชำระเงิน",
      icon: UserPlus,
      href: "/admin/enrollments",
      color: "bg-orange-500",
    },
    {
      title: "รายงานรายได้",
      description: "ดูรายงานรายได้และค่าคอมมิชชั่น",
      icon: DollarSign,
      href: "/admin/revenue",
      color: "bg-emerald-500",
    },
    {
      title: "รายงานสรุป",
      description: "รายงานและสถิติต่างๆ",
      icon: TrendingUp,
      href: "/admin/reports",
      color: "bg-indigo-500",
    },
  ]

  // Add branch management for superadmin
  if (user.role === "superadmin") {
    menuItems.splice(2, 0, {
      title: "จัดการสาขา",
      description: "ดูและจัดการข้อมูลสาขาทั้งหมด",
      icon: Building2,
      href: "/admin/branches",
      color: "bg-red-500",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  แดชบอร์ด{user.role === "superadmin" ? "ผู้ดูแลระบบ" : "ผู้จัดการสาขา"}
                </h1>
                <p className="text-sm text-gray-500">
                  ยินดีต้อนรับ {user.first_name} {user.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{DatabaseService.isOfflineMode() ? "โหมดออฟไลน์" : "เชื่อมต่อแล้ว"}</Badge>
              <Button onClick={logout} variant="outline" size="sm">
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">คน</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คอร์สทั้งหมด</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">คอร์ส</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การลงทะเบียน</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">
                  ชำระแล้ว {stats.paidEnrollments} | รอชำระ {stats.pendingPayments}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">ค่าคอมมิชชั่น {formatCurrency(stats.totalCommission)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.href} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(item.href)} className="w-full" variant="outline">
                  เข้าสู่หน้า
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>การดำเนินการด่วน</CardTitle>
            <CardDescription>ฟังก์ชันที่ใช้บ่อย</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => router.push("/admin/enrollments")} className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>ลงทะเบียนนักเรียนใหม่</span>
              </Button>
              <Button
                onClick={() => router.push("/admin/courses")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>เพิ่มคอร์สใหม่</span>
              </Button>
              <Button
                onClick={() => router.push("/admin/students")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>เพิ่มนักเรียนใหม่</span>
              </Button>
              <Button
                onClick={() => router.push("/admin/teachers")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <GraduationCap className="h-4 w-4" />
                <span>เพิ่มครูใหม่</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
