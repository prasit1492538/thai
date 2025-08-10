"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { jsonDatabase } from "@/lib/json-database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, ArrowLeft, TrendingUp, Building2 } from "lucide-react"
import type { User, Revenue } from "@/lib/database.types"

export default function RevenuePage() {
  const [user, setUser] = useState<User | null>(null)
  const [revenue, setRevenue] = useState<Revenue[]>([])
  const [branchAnalysis, setBranchAnalysis] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadRevenueData()
  }, [router])

  const loadRevenueData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [revenueResult] = await Promise.all([DatabaseService.getRevenue(startDate, endDate, branchId)])

      if (revenueResult.error) {
        console.error("Error loading revenue:", revenueResult.error)
      } else {
        setRevenue(revenueResult.data)
      }

      // Load branch analysis
      const analysis = await jsonDatabase.getBranchRevenueAnalysis(branchId)
      setBranchAnalysis(analysis)
    } catch (error) {
      console.error("Error loading revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilter = () => {
    setLoading(true)
    loadRevenueData()
  }

  const getTotalRevenue = () => {
    return revenue.reduce((sum, rev) => sum + rev.amount, 0)
  }

  const getTotalCommission = () => {
    return branchAnalysis.reduce((sum, branch) => sum + branch.commission, 0)
  }

  const getNetRevenue = () => {
    return branchAnalysis.reduce((sum, branch) => sum + branch.netRevenue, 0)
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
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">รายงานรายได้</h1>
                  <p className="text-sm text-gray-500">
                    ดูรายงานรายได้และค่าคอมมิชชั่น{user.role === "admin" ? ` - ${user.branch_name}` : "ทั้งหมด"}
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
        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>กรองข้อมูลตามวันที่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">วันที่เริ่มต้น</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleDateFilter}>กรองข้อมูล</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
              <p className="text-xs text-muted-foreground">รายได้ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ค่าคอมมิชชั่นรวม</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalCommission())}</div>
              <p className="text-xs text-muted-foreground">ค่าคอมมิชชั่นทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้สุทธิ</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getNetRevenue())}</div>
              <p className="text-xs text-muted-foreground">รายได้หลังหักค่าคอมมิชชั่น</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              วิเคราะห์รายได้แต่ละสาขา
            </CardTitle>
            <CardDescription>รายได้ ค่าคอมมิชชั่น และรายได้สุทธิของแต่ละสาขา</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สาขา</TableHead>
                    <TableHead>อัตราค่าคอมมิชชั่น</TableHead>
                    <TableHead>รายได้รวม</TableHead>
                    <TableHead>ค่าคอมมิชชั่น</TableHead>
                    <TableHead>รายได้สุทธิ</TableHead>
                    <TableHead>จำนวนนักเรียน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchAnalysis.map((analysis) => (
                    <TableRow key={analysis.branch.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{analysis.branch.name}</div>
                          <div className="text-sm text-gray-500">{analysis.branch.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">
                          {(analysis.branch.commission_rate * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(analysis.totalRevenue)}</TableCell>
                      <TableCell className="text-red-600 font-medium">-{formatCurrency(analysis.commission)}</TableCell>
                      <TableCell className="text-green-600 font-bold">{formatCurrency(analysis.netRevenue)}</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {analysis.enrollmentCount} คน
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดรายได้</CardTitle>
            <CardDescription>รายการรายได้ทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สาขา</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>แหล่งที่มา</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell>{formatDate(rev.date)}</TableCell>
                      <TableCell className="font-medium">{rev.branch_name}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(rev.amount)}</TableCell>
                      <TableCell>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {rev.source === "course_enrollment" ? "ลงทะเบียนคอร์ส" : rev.source}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{rev.description}</TableCell>
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
