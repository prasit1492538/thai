"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatDate } from "@/lib/utils"
import { Users, Search, Plus, Edit, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import type { User, Branch } from "@/lib/database.types"

export default function StudentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadData()
  }, [router])

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone.includes(searchTerm) ||
          (student.nickname && student.nickname.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents(students)
    }
  }, [searchTerm, students])

  const loadData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [studentsResult, branchesResult] = await Promise.all([
        DatabaseService.getStudents(branchId),
        DatabaseService.getBranches(),
      ])

      if (studentsResult.error) {
        console.error("Error loading students:", studentsResult.error)
      } else {
        setStudents(studentsResult.data)
        setFilteredStudents(studentsResult.data)
      }

      if (branchesResult.error) {
        console.error("Error loading branches:", branchesResult.error)
      } else {
        setBranches(branchesResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentData: Omit<User, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await DatabaseService.createStudent(studentData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการเพิ่มนักเรียน")
      } else {
        alert("เพิ่มนักเรียนสำเร็จ")
        setIsAddDialogOpen(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding student:", error)
      alert("เกิดข้อผิดพลาดในการเพิ่มนักเรียน")
    }
  }

  const handleEditStudent = async (studentData: Partial<User>) => {
    if (!selectedStudent) return

    try {
      const { data, error } = await DatabaseService.updateStudent(selectedStudent.id, studentData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขนักเรียน")
      } else {
        alert("แก้ไขนักเรียนสำเร็จ")
        setIsEditDialogOpen(false)
        setSelectedStudent(null)
        loadData()
      }
    } catch (error) {
      console.error("Error editing student:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขนักเรียน")
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบนักเรียนคนนี้?")) {
      return
    }

    try {
      const { error } = await DatabaseService.deleteStudent(studentId)
      if (error) {
        alert("เกิดข้อผิดพลาดในการลบนักเรียน")
      } else {
        alert("ลบนักเรียนสำเร็จ")
        loadData()
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      alert("เกิดข้อผิดพลาดในการลบนักเรียน")
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
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">จัดการนักเรียน</h1>
                  <p className="text-sm text-gray-500">
                    ดูและจัดการข้อมูลนักเรียน{user.role === "admin" ? ` - ${user.branch_name}` : "ทั้งหมด"}
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
        {/* Search and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ค้นหานักเรียน</span>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มนักเรียนใหม่
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อ นามสกุล ชื่อเล่น หรือเบอร์โทร"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อนักเรียน ({filteredStudents.length} คน)</CardTitle>
            <CardDescription>รายการนักเรียนในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchTerm ? "ไม่พบนักเรียนที่ตรงกับการค้นหา" : "ยังไม่มีนักเรียนในระบบ"}</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ชื่อเล่น</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>ระดับชั้น</TableHead>
                      <TableHead>ผู้ปกครอง</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.nickname || "-"}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.current_grade || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {student.guardian_name} {student.guardian_surname}
                            </div>
                            <div className="text-gray-500">{student.guardian_occupation}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.branch_name || "-"}</TableCell>
                        <TableCell>{formatDate(student.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มนักเรียนใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลนักเรียนและผู้ปกครองใหม่</DialogDescription>
          </DialogHeader>
          <StudentForm
            branches={user.role === "admin" ? branches.filter((b) => b.id === user.branch_id) : branches}
            onSubmit={handleAddStudent}
            onCancel={() => setIsAddDialogOpen(false)}
            defaultBranchId={user.role === "admin" ? user.branch_id : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลนักเรียน</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของ {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm
              student={selectedStudent}
              branches={user.role === "admin" ? branches.filter((b) => b.id === user.branch_id) : branches}
              onSubmit={handleEditStudent}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedStudent(null)
              }}
              defaultBranchId={user.role === "admin" ? user.branch_id : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StudentForm({
  student,
  branches,
  onSubmit,
  onCancel,
  defaultBranchId,
}: {
  student?: User
  branches: Branch[]
  onSubmit: (data: any) => void
  onCancel: () => void
  defaultBranchId?: string
}) {
  const [formData, setFormData] = useState({
    first_name: student?.first_name || "",
    last_name: student?.last_name || "",
    nickname: student?.nickname || "",
    phone: student?.phone || "",
    email: student?.email || "",
    current_grade: student?.current_grade || "",
    branch_id: student?.branch_id || defaultBranchId || "",
    guardian_name: student?.guardian_name || "",
    guardian_surname: student?.guardian_surname || "",
    guardian_occupation: student?.guardian_occupation || "",
    guardian_line_id: student?.guardian_line_id || "",
    role: "student" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ข้อมูลนักเรียน</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">ชื่อ</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">นามสกุล</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="nickname">ชื่อเล่น</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current_grade">ระดับชั้น</Label>
            <Select
              value={formData.current_grade}
              onValueChange={(value) => setFormData({ ...formData, current_grade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับชั้น" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ม.1">ม.1</SelectItem>
                <SelectItem value="ม.2">ม.2</SelectItem>
                <SelectItem value="ม.3">ม.3</SelectItem>
                <SelectItem value="ม.4">ม.4</SelectItem>
                <SelectItem value="ม.5">ม.5</SelectItem>
                <SelectItem value="ม.6">ม.6</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="branch">สาขา</Label>
            <Select
              value={formData.branch_id}
              onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              disabled={branches.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกสาขา" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">ข้อมูลผู้ปกครอง</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardian_name">ชื่อผู้ปกครอง</Label>
            <Input
              id="guardian_name"
              value={formData.guardian_name}
              onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="guardian_surname">นามสกุลผู้ปกครอง</Label>
            <Input
              id="guardian_surname"
              value={formData.guardian_surname}
              onChange={(e) => setFormData({ ...formData, guardian_surname: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardian_occupation">อาชีพผู้ปกครอง</Label>
            <Input
              id="guardian_occupation"
              value={formData.guardian_occupation}
              onChange={(e) => setFormData({ ...formData, guardian_occupation: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="guardian_line_id">Line ID ผู้ปกครอง</Label>
            <Input
              id="guardian_line_id"
              value={formData.guardian_line_id}
              onChange={(e) => setFormData({ ...formData, guardian_line_id: e.target.value })}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึก</Button>
      </DialogFooter>
    </form>
  )
}
