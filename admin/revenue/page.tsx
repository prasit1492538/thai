"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calculator, DollarSign, Percent } from "lucide-react"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"

interface BranchRevenue {
  id: string
  name: string
  commission_percentage: number
  total_revenue: number
  commission_amount: number
  net_revenue: number
  revenue_records: {
    amount: number
    date: string
    description: string
  }[]
}

export default function RevenuePage() {
  const [user, setUser] = useState<any>(null)
  const [branchRevenues, setBranchRevenues] = useState<BranchRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [connectionMode, setConnectionMode] = useState<string>("checking")
  const router = useRouter()
  const { toast } = useToast()

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

      // Initialize database service
      await DatabaseService.initialize()
      setConnectionMode(DatabaseService.getConnectionMode())

      await fetchRevenueData()
    }

    checkAuth()
  }, [router, selectedMonth])

  async function fetchRevenueData() {
    try {
      console.log("🔍 Fetching revenue data...")

      // กำหนดช่วงวันที่ของเดือนที่เลือก
      const startDate = `${selectedMonth}-01`
      const endDate = `${selectedMonth}-31`

      console.log("🔍 Fetching revenue data for:", { startDate, endDate })

      // Fetch branches
      const { data: branches, error: branchError } = await DatabaseService.getBranches()

      if (branchError) {
        console.error("Error fetching branches:", branchError)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสาขาได้",
          variant: "destructive",
        })
        return
      }

      console.log("🏢 Branches fetched:", branches?.length)

      // Fetch revenue data
      const { data: revenueData, error: revenueError } = await DatabaseService.getRevenue(startDate, endDate)

      if (revenueError) {
        console.error("Error fetching revenue:", revenueError)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลรายได้ได้",
          variant: "destructive",
        })
        return
      }

      console.log("💰 Revenue data fetched:", revenueData?.length)

      const branchRevenueData: BranchRevenue[] =
        branches?.map((branch) => {
          // Filter revenue for this branch and month
          const branchRevenue = revenueData?.filter((r) => r.branch_id === branch.id) || []

          const totalRevenue = branchRevenue.reduce((sum, r) => sum + (r.amount || 0), 0)
          const commissionAmount = totalRevenue * (branch.commission_percentage / 100)
          const netRevenue = totalRevenue - commissionAmount

          return {
            id: branch.id,
            name: branch.name,
            commission_percentage: branch.commission_percentage,
            total_revenue: totalRevenue,
            commission_amount: commissionAmount,
            net_revenue: netRevenue,
            revenue_records: branchRevenue.map((r) => ({
              amount: r.amount || 0,
              date: r.date || "",
              description: r.description || "",
            })),
          }
        }) || []

      console.log("📈 Final revenue data:", branchRevenueData)
      setBranchRevenues(branchRevenueData)
    } catch (error) {
      console.error("Exception fetching revenue data:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูล",
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

  if (!user) {
    return null
  }

  const isSuperAdmin = user.role === "superadmin"
  const totalCommission = branchRevenues.reduce((sum, branch) => sum + branch.commission_amount, 0)
  const totalNetRevenue = branchRevenues.reduce((sum, branch) => sum + branch.net_revenue, 0)
  const totalGrossRevenue = branchRevenues.reduce((sum, branch) => sum + branch.total_revenue, 0)

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
          <h1 className="text-2xl font-bold">คำนวณรายได้และเปอร์เซ็นต์</h1>
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
        {/* เลือกเดือน */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกช่วงเวลา</CardTitle>
            <CardDescription>เลือกเดือนที่ต้องการดูรายงาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">เดือน/ปี</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              <div className="pt-6">
                <Button onClick={fetchRevenueData}>
                  <Calculator className="h-4 w-4 mr-2" />
                  คำนวณ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* สรุปรายได้รวม */}
        {isSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รายได้รวมทั้งหมด</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGrossRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">บาท</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ค่าคอมมิชชั่นรวม</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalCommission.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">บาท</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รายได้สุทธิสาขา</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalNetRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">บาท</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* รายละเอียดแต่ละสาขา */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดรายได้แต่ละสาขา</CardTitle>
            <CardDescription>
              ข้อมูลรายได้และการคำนวณเปอร์เซ็นต์ประจำเดือน{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("th-TH", { year: "numeric", month: "long" })}
              {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {branchRevenues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูลสาขา</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สาขา</TableHead>
                    <TableHead>รายได้รวม</TableHead>
                    <TableHead>เปอร์เซ็นต์</TableHead>
                    <TableHead>ค่าคอมมิชชั่น</TableHead>
                    <TableHead>รายได้สุทธิ</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchRevenues.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.total_revenue.toLocaleString()} บาท</TableCell>
                      <TableCell>
                        <Badge variant="outline">{branch.commission_percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {branch.commission_amount.toLocaleString()} บาท
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {branch.net_revenue.toLocaleString()} บาท
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.total_revenue > 0 ? "default" : "secondary"}>
                          {branch.total_revenue > 0 ? "มีรายได้" : "ไม่มีรายได้"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* รายละเอียดรายได้แต่ละสาขา */}
        {branchRevenues.map(
          (branch) =>
            branch.revenue_records.length > 0 && (
              <Card key={branch.id}>
                <CardHeader>
                  <CardTitle>รายละเอียดรายได้ - {branch.name}</CardTitle>
                  <CardDescription>รายการรายได้ทั้งหมดของสาขา</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>รายละเอียด</TableHead>
                        <TableHead>จำนวนเงิน</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branch.revenue_records.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(record.date).toLocaleDateString("th-TH")}</TableCell>
                          <TableCell>{record.description || "-"}</TableCell>
                          <TableCell>{record.amount.toLocaleString()} บาท</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ),
        )}
      </div>
    </div>
  )
}
