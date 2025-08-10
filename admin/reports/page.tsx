"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, BookOpen, DollarSign, TrendingUp } from "lucide-react"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  totalStudents: number
  totalCourses: number
  totalRevenue: number
  totalBranches: number
  recentEnrollments: any[]
  branchStats: any[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalBranches: 0,
    recentEnrollments: [],
    branchStats: [],
  })
  const [loading, setLoading] = useState(true)
  const [connectionMode, setConnectionMode] = useState<string>("checking")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAuthAndFetchData() {
      const session = getSession()

      if (!session) {
        router.push("/")
        return
      }

      if (session.role === "student") {
        router.push("/dashboard")
        return
      }

      // Initialize database service
      await DatabaseService.initialize()
      setConnectionMode(DatabaseService.getConnectionMode())

      await fetchReportData()
    }

    checkAuthAndFetchData()
  }, [router])

  async function fetchReportData() {
    try {
      console.log("🔍 Fetching report data...")

      // Get statistics
      const { data: stats, error: statsError } = await DatabaseService.getStatistics()

      if (statsError) {
        console.error("Error fetching statistics:", statsError)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสถิติได้",
          variant: "destructive",
        })
        return
      }

      // Get recent enrollments
      const { data: enrollments, error: enrollmentError } = await DatabaseService.getEnrollments()

      if (enrollmentError) {
        console.error("Error fetching enrollments:", enrollmentError)
      }

      // Get branches for branch stats
      const { data: branches, error: branchError } = await DatabaseService.getBranches()

      if (branchError) {
        console.error("Error fetching branches:", branchError)
      }

      // Get revenue data for branch stats
      const { data: revenueData, error: revenueError } = await DatabaseService.getRevenue()

      if (revenueError) {
        console.error("Error fetching revenue:", revenueError)
      }

      // Calculate branch statistics
      const branchStats =
        branches?.map((branch) => {
          const branchRevenue = revenueData?.filter((r) => r.branch_id === branch.id) || []
          const totalRevenue = branchRevenue.reduce((sum, r) => sum + r.amount, 0)

          return {
            name: branch.name,
            revenue: totalRevenue,
            schedules: 2, // Mock data for schedules count
          }
        }) || []

      setReportData({
        totalStudents: stats?.totalStudents || 0,
        totalCourses: stats?.totalCourses || 0,
        totalRevenue: stats?.totalRevenue || 0,
        totalBranches: stats?.totalBranches || 0,
        recentEnrollments: enrollments || [],
        branchStats,
      })

      console.log("📊 Report data fetched successfully")
    } catch (error) {
      console.error("Exception fetching report data:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลรายงานได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">รายงานและสถิติ</h1>
          <Badge variant={connectionMode === "offline" ? "outline" : "default"}>
            {connectionMode === "offline" ? "📱 โหมดออฟไลน์" : "✅ ออนไลน์"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={logout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalStudents}</div>
              <p className="text-xs text-muted-foreground">คน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หลักสูตรทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalCourses}</div>
              <p className="text-xs text-muted-foreground">คอร์ส</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">บาท</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การลงทะเบียน</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.recentEnrollments.length}</div>
              <p className="text-xs text-muted-foreground">ล่าสุด</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติตามสาขา</CardTitle>
            <CardDescription>
              รายได้และจำนวนตารางเรียนแต่ละสาขา
              {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.branchStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูลสาขา</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สาขา</TableHead>
                    <TableHead>รายได้</TableHead>
                    <TableHead>จำนวนตารางเรียน</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.branchStats.map((branch, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.revenue.toLocaleString()} บาท</TableCell>
                      <TableCell>{branch.schedules} ตาราง</TableCell>
                      <TableCell>
                        <Badge variant="default">ใช้งานอยู่</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>การลงทะเบียนล่าสุด</CardTitle>
            <CardDescription>
              รายการลงทะเบียนเรียนล่าสุด 10 รายการ
              {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.recentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีการลงทะเบียนเรียน</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>นักเรียน</TableHead>
                    <TableHead>คอร์ส</TableHead>
                    <TableHead>จำนวนครั้งที่เข้าเรียน</TableHead>
                    <TableHead>วันที่ลงทะเบียน</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recentEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.users?.first_name} {enrollment.users?.last_name}
                      </TableCell>
                      <TableCell>{enrollment.courses?.name}</TableCell>
                      <TableCell>{enrollment.sessions_attended} ครั้ง</TableCell>
                      <TableCell>{new Date(enrollment.created_at).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell>
                        <Badge variant="default">กำลังเรียน</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
