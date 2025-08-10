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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, UserPlus, Edit, Trash2, Eye, Key } from "lucide-react"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
  phone: string | null
  email: string | null
  current_grade: string | null
  birth_date: string | null
  address: string | null
  created_at: string
}

interface StudentDetails extends Student {
  parents: {
    id: string
    parent_type: string
    first_name: string
    last_name: string
    occupation: string | null
    workplace: string | null
    phone: string | null
    line_id: string | null
    email: string | null
  }[]
  student_preferences: {
    preferred_school_1: string | null
    preferred_school_2: string | null
    pdpa_consent: boolean | null
    branch_id: string | null
    branches: {
      name: string
    } | null
  } | null
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editStudent, setEditStudent] = useState<StudentDetails | null>(null)
  const [viewStudent, setViewStudent] = useState<StudentDetails | null>(null)
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null)
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Student | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
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

      await fetchStudents()
    }

    checkAuthAndFetchData()
  }, [router])

  async function fetchStudents() {
    try {
      console.log("🔍 Fetching students...")
      const { data, error } = await DatabaseService.getStudents()

      if (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลนักเรียนได้",
          variant: "destructive",
        })
        return
      }

      console.log("👩‍🎓 Students fetched:", data?.length || 0)
      setStudents(data || [])
    } catch (error) {
      console.error("Exception fetching students:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchStudentDetails(studentId: string) {
    try {
      console.log("🔍 Fetching student details for:", studentId)
      const { data, error } = await DatabaseService.getStudentDetails(studentId)

      if (error) {
        console.error("Error fetching student details:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลรายละเอียดนักเรียนได้",
          variant: "destructive",
        })
        return null
      }

      console.log("👤 Student details fetched:", !!data)
      return data
    } catch (error) {
      console.error("Exception fetching student details:", error)
      return null
    }
  }

  async function handleEditStudent(formData: FormData) {
    if (!editStudent) return

    try {
      const updates = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        current_grade: formData.get("current_grade") as string,
        address: formData.get("address") as string,
      }

      const { error } = await DatabaseService.updateStudent(editStudent.id, updates)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไขข้อมูลนักเรียนได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "แก้ไขข้อมูลนักเรียนแล้ว (โหมดจำลอง)" : "แก้ไขข้อมูลนักเรียนแล้ว",
      })

      setIsEditDialogOpen(false)
      setEditStudent(null)
      await fetchStudents()
    } catch (error) {
      console.error("Error editing student:", error)
    }
  }

  async function handleDeleteStudent() {
    if (!deleteStudent) return

    try {
      const { error } = await DatabaseService.deleteStudent(deleteStudent.id)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบนักเรียนได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "ลบนักเรียนแล้ว (โหมดจำลอง)" : "ลบนักเรียนแล้ว",
      })

      setIsDeleteDialogOpen(false)
      setDeleteStudent(null)
      await fetchStudents()
    } catch (error) {
      console.error("Error deleting student:", error)
    }
  }

  async function handleResetPassword(formData: FormData) {
    if (!resetPasswordStudent) return

    try {
      const newPassword = formData.get("new_password") as string
      const confirmPassword = formData.get("confirm_password") as string

      if (newPassword !== confirmPassword) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "รหัสผ่านไม่ตรงกัน",
          variant: "destructive",
        })
        return
      }

      if (newPassword.length < 10) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัวอักษร",
          variant: "destructive",
        })
        return
      }

      // In offline mode, just simulate success
      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "รีเซ็ตรหัสผ่านแล้ว (โหมดจำลอง)" : "รีเซ็ตรหัสผ่านแล้ว",
      })

      setIsResetPasswordDialogOpen(false)
      setResetPasswordStudent(null)
    } catch (error) {
      console.error("Error resetting password:", error)
    }
  }

  async function handleViewStudent(student: Student) {
    const details = await fetchStudentDetails(student.id)
    if (details) {
      setViewStudent(details)
      setIsViewDialogOpen(true)
    }
  }

  async function handleEditStudentClick(student: Student) {
    const details = await fetchStudentDetails(student.id)
    if (details) {
      setEditStudent(details)
      setIsEditDialogOpen(true)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    )
  }

  const fatherData = editStudent?.parents?.find((p) => p.parent_type === "father")
  const motherData = editStudent?.parents?.find((p) => p.parent_type === "mother")

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
          <h1 className="text-2xl font-bold">จัดการนักเรียน</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อนักเรียน</CardTitle>
          <CardDescription>
            จำนวนนักเรียนทั้งหมด: {students.length} คน
            {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="search">ค้นหานักเรียน</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ค้นหาด้วยชื่อ, นามสกุล, ชื่อเล่น หรือเบอร์โทร"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="pt-6">
              <Link href="/register">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  เพิ่มนักเรียนใหม่
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "ไม่พบนักเรียนที่ค้นหา" : "ยังไม่มีนักเรียนในระบบ"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>ชื่อเล่น</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>ชั้นเรียน</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.nickname || "-"}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>{student.email || "-"}</TableCell>
                    <TableCell>
                      {student.current_grade ? <Badge variant="secondary">{student.current_grade}</Badge> : "-"}
                    </TableCell>
                    <TableCell>{new Date(student.created_at).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell>
                      <Badge variant="default">ใช้งานอยู่</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewStudent(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditStudentClick(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResetPasswordStudent(student)
                            setIsResetPasswordDialogOpen(true)
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteStudent(student)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ข้อมูลนักเรียน</DialogTitle>
            <DialogDescription>รายละเอียดข้อมูลนักเรียนทั้งหมด</DialogDescription>
          </DialogHeader>
          {viewStudent && (
            <div className="grid gap-6">
              {/* ข้อมูลนักเรียน */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อ-นามสกุล</Label>
                    <p className="text-sm">
                      {viewStudent.first_name} {viewStudent.last_name}
                    </p>
                  </div>
                  <div>
                    <Label>ชื่อเล่น</Label>
                    <p className="text-sm">{viewStudent.nickname || "-"}</p>
                  </div>
                  <div>
                    <Label>เบอร์โทร</Label>
                    <p className="text-sm">{viewStudent.phone || "-"}</p>
                  </div>
                  <div>
                    <Label>อีเมล</Label>
                    <p className="text-sm">{viewStudent.email || "-"}</p>
                  </div>
                  <div>
                    <Label>วันเกิด</Label>
                    <p className="text-sm">
                      {viewStudent.birth_date ? new Date(viewStudent.birth_date).toLocaleDateString("th-TH") : "-"}
                    </p>
                  </div>
                  <div>
                    <Label>ชั้นเรียน</Label>
                    <p className="text-sm">{viewStudent.current_grade || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>ที่อยู่</Label>
                    <p className="text-sm">{viewStudent.address || "-"}</p>
                  </div>
                </div>
              </div>

              {/* ข้อมูลผู้ปกครอง */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ข้อมูลผู้ปกครอง</h3>
                {viewStudent.parents?.map((parent) => (
                  <div key={parent.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{parent.parent_type === "father" ? "บิดา" : "มารดา"}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>ชื่อ</Label>
                        <p>
                          {parent.first_name} {parent.last_name}
                        </p>
                      </div>
                      <div>
                        <Label>อาชีพ</Label>
                        <p>{parent.occupation || "-"}</p>
                      </div>
                      <div>
                        <Label>สถานที่ทำงาน</Label>
                        <p>{parent.workplace || "-"}</p>
                      </div>
                      <div>
                        <Label>เบอร์โทร</Label>
                        <p>{parent.phone || "-"}</p>
                      </div>
                      <div>
                        <Label>ไอดีไลน์</Label>
                        <p>{parent.line_id || "-"}</p>
                      </div>
                      <div>
                        <Label>อีเมล</Label>
                        <p>{parent.email || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ข้อมูลความต้องการ */}
              {viewStudent.student_preferences && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">ข้อมูลความต้องการ</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>สถานศึกษาที่สนใจอันดับ 1</Label>
                      <p>{viewStudent.student_preferences.preferred_school_1 || "-"}</p>
                    </div>
                    <div>
                      <Label>สถานศึกษาที่สนใจอันดับ 2</Label>
                      <p>{viewStudent.student_preferences.preferred_school_2 || "-"}</p>
                    </div>
                    <div>
                      <Label>สาขาที่เลือก</Label>
                      <p>{viewStudent.student_preferences.branches?.name || "-"}</p>
                    </div>
                    <div>
                      <Label>ยินยอม PDPA</Label>
                      <p>{viewStudent.student_preferences.pdpa_consent ? "ยินยอม" : "ไม่ยินยอม"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลนักเรียน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลนักเรียนและผู้ปกครอง</DialogDescription>
          </DialogHeader>
          <form action={handleEditStudent}>
            <div className="grid gap-6 py-4">
              {/* ข้อมูลนักเรียน */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">ข้อมูลนักเรียน</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first_name">ชื่อ</Label>
                    <Input
                      id="edit-first_name"
                      name="first_name"
                      defaultValue={editStudent?.first_name}
                      placeholder="ชื่อ"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last_name">นามสกุล</Label>
                    <Input
                      id="edit-last_name"
                      name="last_name"
                      defaultValue={editStudent?.last_name}
                      placeholder="นามสกุล"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nickname">ชื่อเล่น</Label>
                    <Input
                      id="edit-nickname"
                      name="nickname"
                      defaultValue={editStudent?.nickname || ""}
                      placeholder="ชื่อเล่น"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">เบอร์โทร</Label>
                    <Input id="edit-phone" name="phone" defaultValue={editStudent?.phone || ""} placeholder="เบอร์โทร" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">อีเมล</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      defaultValue={editStudent?.email || ""}
                      placeholder="อีเมล"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-current_grade">ชั้นเรียน</Label>
                    <Select name="current_grade" defaultValue={editStudent?.current_grade || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชั้นเรียน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">ประถมศึกษาปีที่ 1</SelectItem>
                        <SelectItem value="p2">ประถมศึกษาปีที่ 2</SelectItem>
                        <SelectItem value="p3">ประถมศึกษาปีที่ 3</SelectItem>
                        <SelectItem value="p4">ประถมศึกษาปีที่ 4</SelectItem>
                        <SelectItem value="p5">ประถมศึกษาปีที่ 5</SelectItem>
                        <SelectItem value="p6">ประถมศึกษาปีที่ 6</SelectItem>
                        <SelectItem value="m1">มัธยมศึกษาปีที่ 1</SelectItem>
                        <SelectItem value="m2">มัธยมศึกษาปีที่ 2</SelectItem>
                        <SelectItem value="m3">มัธยมศึกษาปีที่ 3</SelectItem>
                        <SelectItem value="m4">มัธยมศึกษาปีที่ 4</SelectItem>
                        <SelectItem value="m5">มัธยมศึกษาปีที่ 5</SelectItem>
                        <SelectItem value="m6">มัธยมศึกษาปีที่ 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-address">ที่อยู่</Label>
                    <Input
                      id="edit-address"
                      name="address"
                      defaultValue={editStudent?.address || ""}
                      placeholder="ที่อยู่"
                    />
                  </div>
                </div>
              </div>

              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded">
                  💡 โหมดออฟไลน์: การแก้ไขจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกการแก้ไข</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
            <DialogDescription>
              รีเซ็ตรหัสผ่านสำหรับ "{resetPasswordStudent?.first_name} {resetPasswordStudent?.last_name}"
            </DialogDescription>
          </DialogHeader>
          <form action={handleResetPassword}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">รหัสผ่านใหม่ (ไม่ต่ำกว่า 10 ตัว)</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  placeholder="รหัสผ่านใหม่"
                  required
                  minLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  required
                  minLength={10}
                />
              </div>
              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  💡 โหมดออฟไลน์: การรีเซ็ตจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">รีเซ็ตรหัสผ่าน</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบนักเรียน</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบนักเรียน "{deleteStudent?.first_name} {deleteStudent?.last_name}"?
              <br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้และจะลบข้อมูลที่เกี่ยวข้องทั้งหมด
              {connectionMode === "offline" && (
                <span className="block mt-2 text-blue-600">💡 โหมดออฟไลน์: การลบจะเป็นการจำลองเท่านั้น</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>
              ลบนักเรียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
