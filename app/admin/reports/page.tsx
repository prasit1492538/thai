"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart3, ArrowLeft, Users, BookOpen, Building2, DollarSign, TrendingUp, Calendar } from "lucide-react"
import type { User, Enrollment, Course, Branch } from "@/lib/database.types"

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalBranches: 0,
    totalRevenue: 0,
  })
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadReportsData()
  }, [router])

  const loadReportsData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [statsResult, enrollmentsResult, coursesResult, branchesResult] = await Promise.all([
        DatabaseService.getStatistics(branchId),
        DatabaseService.getEnrollments(branchId),
        DatabaseService.getCourses(branchId),
        DatabaseService.getBranches(),
      ])

      if (statsResult.error) {
        console.error("Error loading statistics:", statsResult.error)
      } else {
        setStats(statsResult.data)
      }

      if (enrollmentsResult.error) {
        console.error("Error loading enrollments:", enrollmentsResult.error)
      } else {
        setEnrollments(enrollmentsResult.data)
      }

      if (coursesResult.error) {
        console.error("Error loading courses:", coursesResult.error)
      } else {
        setCourses(coursesResult.data)
      }

      if (branchesResult.error) {
        console.error("Error loading branches:", branchesResult.error)
      } else {
        setBranches(branchesResult.data)
      }
    } catch (error) {
      console.error("Error loading reports data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentsByStatus = () => {
    const statusCounts = {
      active: enrollments.filter((e) => e.status === "active").length,
      completed: enrollments.filter((e) => e.status === "completed").length,
      cancelled: enrollments.filter((e) => e.status === "cancelled").length,
    }
    return statusCounts
  }

  const getPaymentStatusCounts = () => {
    const paymentCounts = {
      paid: enrollments.filter((e) => e.payment_status === "paid").length,
      pending: enrollments.filter((e) => e.payment_status === "pending").length,
      refunded: enrollments.filter((e) => e.payment_status === "refunded").length,
    }
    return paymentCounts
  }

  const getCoursePopularity = () => {
    const courseEnrollments = courses
      .map((course) => {
        const enrollmentCount = enrollments.filter((e) => e.course_id === course.id).length
        return {
          ...course,
          enrollmentCount,
          revenue: enrollmentCount * course.price,
        }
      })
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)

    return courseEnrollments
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

  const enrollmentsByStatus = getEnrollmentsByStatus()
  const paymentStatusCounts = getPaymentStatusCounts()
  const coursePopularity = getCoursePopularity()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/admin")} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">รายงานและสถิติ</h1>
                  <p className="text-sm text-gray-500">
                    ดูรายงานและสถิติการดำเนินงาน{user.role === "admin" ? ` - ${user.branch_name}` : "ทั้งหมด"}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">นักเรียนในระบบ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คอร์สทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">คอร์สที่เปิดสอน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สาขาทั้งหมด</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBranches}</div>
              <p className="text-xs text-muted-foreground">สาขาในระบบ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">รายได้ทั้งหมด</p>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Status Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                สถานะการลงทะเบียน
              </CardTitle>
              <CardDescription>จำนวนนักเรียนแยกตามสถานะ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">กำลังเรียน</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{enrollmentsByStatus.active}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0
                        ? ((enrollmentsByStatus.active / enrollments.length) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">จบแล้ว</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{enrollmentsByStatus.completed}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0
                        ? ((enrollmentsByStatus.completed / enrollments.length) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ยกเลิก</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{enrollmentsByStatus.cancelled}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0
                        ? ((enrollmentsByStatus.cancelled / enrollments.length) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                สถานะการชำระเงิน
              </CardTitle>
              <CardDescription>จำนวนนักเรียนแยกตามสถานะการชำระเงิน</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ชำระแล้ว</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{paymentStatusCounts.paid}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0 ? ((paymentStatusCounts.paid / enrollments.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">รอชำระ</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{paymentStatusCounts.pending}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0
                        ? ((paymentStatusCounts.pending / enrollments.length) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">คืนเงิน</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{paymentStatusCounts.refunded}</Badge>
                    <span className="text-sm text-gray-500">
                      {enrollments.length > 0
                        ? ((paymentStatusCounts.refunded / enrollments.length) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Popularity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              ความนิยมของคอร์ส
            </CardTitle>
            <CardDescription>คอร์สที่มีนักเรียนลงทะเบียนมากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>คอร์ส</TableHead>
                    <TableHead>ระดับชั้น</TableHead>
                    <TableHead>ค่าเรียน</TableHead>
                    <TableHead>จำนวนนักเรียน</TableHead>
                    <TableHead>รายได้</TableHead>
                    <TableHead>สาขา</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursePopularity.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.grade_level}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(course.price)}</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {course.enrollmentCount} คน
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(course.revenue)}</TableCell>
                      <TableCell>{course.branch_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              การลงทะเบียนล่าสุด
            </CardTitle>
            <CardDescription>รายการลงทะเบียนล่าสุดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>นักเรียน</TableHead>
                    <TableHead>คอร์ส</TableHead>
                    <TableHead>วันที่ลงทะเบียน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การชำระเงิน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments
                    .sort((a, b) => new Date(b.enrollment_date).getTime() - new Date(a.enrollment_date).getTime())
                    .slice(0, 10)
                    .map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.student_first_name} {enrollment.student_last_name}
                        </TableCell>
                        <TableCell>{enrollment.course_name}</TableCell>
                        <TableCell>{formatDate(enrollment.enrollment_date)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              enrollment.status === "active"
                                ? "default"
                                : enrollment.status === "completed"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {enrollment.status === "active"
                              ? "กำลังเรียน"
                              : enrollment.status === "completed"
                                ? "จบแล้ว"
                                : "ยกเลิก"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              enrollment.payment_status === "paid"
                                ? "default"
                                : enrollment.payment_status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {enrollment.payment_status === "paid"
                              ? "ชำระแล้ว"
                              : enrollment.payment_status === "pending"
                                ? "รอชำระ"
                                : "คืนเงิน"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
