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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Edit, Building, Plus, UserPlus, Trash2, Users } from "lucide-react"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"
import bcrypt from "bcryptjs"

interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  commission_percentage: number
  created_at: string
}

interface AdminUser {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
  phone: string | null
  email: string | null
  role: string
  created_at: string
  user_branches?: {
    branches: {
      id: string
      name: string
    }
  }[]
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [editAdminUser, setEditAdminUser] = useState<AdminUser | null>(null)
  const [deleteAdminUser, setDeleteAdminUser] = useState<AdminUser | null>(null)
  const [deleteBranch, setDeleteBranch] = useState<Branch | null>(null)
  const [isEditBranchDialogOpen, setIsEditBranchDialogOpen] = useState(false)
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false)
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false)
  const [isEditAdminDialogOpen, setIsEditAdminDialogOpen] = useState(false)
  const [isDeleteAdminDialogOpen, setIsDeleteAdminDialogOpen] = useState(false)
  const [isDeleteBranchDialogOpen, setIsDeleteBranchDialogOpen] = useState(false)
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

      if (session.role !== "superadmin") {
        router.push("/admin")
        return
      }

      // Initialize database service
      await DatabaseService.initialize()
      setConnectionMode(DatabaseService.getConnectionMode())

      await fetchBranches()
      await fetchAdminUsers()
    }

    checkAuth()
  }, [router])

  async function fetchBranches() {
    try {
      console.log("🔍 Fetching branches...")
      const { data, error } = await DatabaseService.getBranches()

      if (error) {
        console.error("Error fetching branches:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลสาขาได้",
          variant: "destructive",
        })
        return
      }

      console.log("🏢 Branches fetched:", data?.length || 0)
      setBranches(data || [])
    } catch (error) {
      console.error("Exception fetching branches:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูลสาขา",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchAdminUsers() {
    try {
      console.log("🔍 Fetching admin users...")
      const { data, error } = await DatabaseService.getAdminUsers()

      if (error) {
        console.error("Error fetching admin users:", error)
        return
      }

      console.log("👨‍💼 Admin users fetched:", data?.length || 0)
      setAdminUsers(data || [])
    } catch (error) {
      console.error("Exception fetching admin users:", error)
    }
  }

  async function handleAddBranch(formData: FormData) {
    try {
      const branchData = {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        commission_percentage: Number.parseFloat(formData.get("commission_percentage") as string),
      }

      const { error } = await DatabaseService.addBranch(branchData)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มสาขาได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "เพิ่มสาขาใหม่แล้ว (โหมดจำลอง)" : "เพิ่มสาขาใหม่แล้ว",
      })

      setIsAddBranchDialogOpen(false)
      await fetchBranches()
    } catch (error) {
      console.error("Error adding branch:", error)
    }
  }

  async function handleEditBranch(formData: FormData) {
    if (!editBranch) return

    try {
      const updates = {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        commission_percentage: Number.parseFloat(formData.get("commission_percentage") as string),
      }

      const { error } = await DatabaseService.updateBranch(editBranch.id, updates)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไขข้อมูลสาขาได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "แก้ไขข้อมูลสาขาแล้ว (โหมดจำลอง)" : "แก้ไขข้อมูลสาขาแล้ว",
      })

      setIsEditBranchDialogOpen(false)
      setEditBranch(null)
      await fetchBranches()
    } catch (error) {
      console.error("Error editing branch:", error)
    }
  }

  async function handleDeleteBranch() {
    if (!deleteBranch) return

    try {
      const { error } = await DatabaseService.deleteBranch(deleteBranch.id)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบสาขาได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "ลบสาขาแล้ว (โหมดจำลอง)" : "ลบสาขาแล้ว",
      })

      setIsDeleteBranchDialogOpen(false)
      setDeleteBranch(null)
      await fetchBranches()
    } catch (error) {
      console.error("Error deleting branch:", error)
    }
  }

  async function handleAddAdmin(formData: FormData) {
    try {
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (password !== confirmPassword) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "รหัสผ่านไม่ตรงกัน",
          variant: "destructive",
        })
        return
      }

      if (password.length < 10) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัวอักษร",
          variant: "destructive",
        })
        return
      }

      const hashedPassword = connectionMode === "offline" ? "hashed_password" : await bcrypt.hash(password, 10)

      const userData = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        password: hashedPassword,
        role: "admin",
      }

      const { data: newUser, error } = await DatabaseService.createAdminUser(userData)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถสร้าง Admin ได้",
          variant: "destructive",
        })
        return
      }

      // Assign to branch if selected
      const branchId = formData.get("branch_id") as string
      if (branchId && newUser) {
        await DatabaseService.assignUserToBranch(newUser.id, branchId)
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "สร้าง Admin ใหม่แล้ว (โหมดจำลอง)" : "สร้าง Admin ใหม่แล้ว",
      })

      setIsAddAdminDialogOpen(false)
      await fetchAdminUsers()
    } catch (error) {
      console.error("Error adding admin:", error)
    }
  }

  async function handleEditAdmin(formData: FormData) {
    if (!editAdminUser) return

    try {
      const updates = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
      }

      const { error } = await DatabaseService.updateAdminUser(editAdminUser.id, updates)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไข Admin ได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "แก้ไข Admin แล้ว (โหมดจำลอง)" : "แก้ไข Admin แล้ว",
      })

      setIsEditAdminDialogOpen(false)
      setEditAdminUser(null)
      await fetchAdminUsers()
    } catch (error) {
      console.error("Error editing admin:", error)
    }
  }

  async function handleDeleteAdmin() {
    if (!deleteAdminUser) return

    try {
      const { error } = await DatabaseService.deleteAdminUser(deleteAdminUser.id)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบ Admin ได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "ลบ Admin แล้ว (โหมดจำลอง)" : "ลบ Admin แล้ว",
      })

      setIsDeleteAdminDialogOpen(false)
      setDeleteAdminUser(null)
      await fetchAdminUsers()
    } catch (error) {
      console.error("Error deleting admin:", error)
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
          <h1 className="text-2xl font-bold">จัดการสาขาและ Admin</h1>
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

      <Tabs defaultValue="branches" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            จัดการสาขา
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            จัดการ Admin
          </TabsTrigger>
        </TabsList>

        {/* Branches Tab */}
        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    ข้อมูลสาขาทั้งหมด
                  </CardTitle>
                  <CardDescription>
                    จัดการข้อมูลสาขาและเปอร์เซ็นต์ค่าคอมมิชชั่น
                    {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
                  </CardDescription>
                </div>
                <Dialog open={isAddBranchDialogOpen} onOpenChange={setIsAddBranchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มสาขาใหม่
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>เพิ่มสาขาใหม่</DialogTitle>
                      <DialogDescription>กรอกข้อมูลสาขาใหม่</DialogDescription>
                    </DialogHeader>
                    <form action={handleAddBranch}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-name">ชื่อสาขา</Label>
                          <Input id="add-name" name="name" placeholder="ชื่อสาขา" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-address">ที่อยู่</Label>
                          <Input id="add-address" name="address" placeholder="ที่อยู่สาขา" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-phone">เบอร์โทร</Label>
                          <Input id="add-phone" name="phone" placeholder="เบอร์โทรสาขา" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-commission">เปอร์เซ็นต์ค่าคอมมิชชั่น (%)</Label>
                          <Input
                            id="add-commission"
                            name="commission_percentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="15.00"
                            required
                          />
                        </div>
                        {connectionMode === "offline" && (
                          <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 โหมดออฟไลน์: การเพิ่มจะเป็นการจำลองเท่านั้น
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit">เพิ่มสาขา</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูลสาขา</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อสาขา</TableHead>
                      <TableHead>ที่อยู่</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>เปอร์เซ็นต์ค่าคอมมิชชั่น</TableHead>
                      <TableHead>วันที่สร้าง</TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address || "-"}</TableCell>
                        <TableCell>{branch.phone || "-"}</TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">{branch.commission_percentage}%</span>
                        </TableCell>
                        <TableCell>{new Date(branch.created_at).toLocaleDateString("th-TH")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditBranch(branch)
                                setIsEditBranchDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteBranch(branch)
                                setIsDeleteBranchDialogOpen(true)
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
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    ผู้ดูแลระบบทั้งหมด
                  </CardTitle>
                  <CardDescription>
                    จัดการ Admin แต่ละสาขา
                    {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
                  </CardDescription>
                </div>
                <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      เพิ่ม Admin ใหม่
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>เพิ่ม Admin ใหม่</DialogTitle>
                      <DialogDescription>กรอกข้อมูล Admin ใหม่</DialogDescription>
                    </DialogHeader>
                    <form action={handleAddAdmin}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="add-first_name">ชื่อ</Label>
                            <Input id="add-first_name" name="first_name" placeholder="ชื่อ" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-last_name">นามสกุล</Label>
                            <Input id="add-last_name" name="last_name" placeholder="นามสกุล" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-nickname">ชื่อเล่น</Label>
                          <Input id="add-nickname" name="nickname" placeholder="ชื่อเล่น" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-phone">เบอร์โทรศัพท์</Label>
                          <Input id="add-phone" name="phone" placeholder="เบอร์โทรศัพท์" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-email">อีเมล</Label>
                          <Input id="add-email" name="email" type="email" placeholder="อีเมล" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-password">รหัสผ่าน (ไม่ต่ำกว่า 10 ตัว)</Label>
                          <Input
                            id="add-password"
                            name="password"
                            type="password"
                            placeholder="รหัสผ่าน"
                            required
                            minLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-confirmPassword">ยืนยันรหัสผ่าน</Label>
                          <Input
                            id="add-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="ยืนยันรหัสผ่าน"
                            required
                            minLength={10}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-branch_id">สาขาที่ดูแล</Label>
                          <Select name="branch_id">
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสาขา (ไม่บังคับ)" />
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
                        {connectionMode === "offline" && (
                          <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 โหมดออฟไลน์: การเพิ่มจะเป็นการจำลองเท่านั้น
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit">เพิ่ม Admin</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {adminUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล Admin</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ชื่อเล่น</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead>สาขาที่ดูแล</TableHead>
                      <TableHead>วันที่สร้าง</TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.nickname || "-"}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "superadmin" ? "default" : "secondary"}>
                            {user.role === "superadmin" ? "Super Admin" : "Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.user_branches && user.user_branches.length > 0
                            ? user.user_branches.map((ub) => ub.branches.name).join(", ")
                            : user.role === "superadmin"
                              ? "ทุกสาขา"
                              : "-"}
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString("th-TH")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditAdminUser(user)
                                setIsEditAdminDialogOpen(true)
                              }}
                              disabled={user.role === "superadmin"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteAdminUser(user)
                                setIsDeleteAdminDialogOpen(true)
                              }}
                              disabled={user.role === "superadmin"}
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
        </TabsContent>
      </Tabs>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditBranchDialogOpen} onOpenChange={setIsEditBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสาขา</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลสาขาและเปอร์เซ็นต์ค่าคอมมิชชั่น</DialogDescription>
          </DialogHeader>
          <form action={handleEditBranch}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">ชื่อสาขา</Label>
                <Input id="edit-name" name="name" defaultValue={editBranch?.name} placeholder="ชื่อสาขา" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">ที่อยู่</Label>
                <Input
                  id="edit-address"
                  name="address"
                  defaultValue={editBranch?.address || ""}
                  placeholder="ที่อยู่สาขา"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทร</Label>
                <Input id="edit-phone" name="phone" defaultValue={editBranch?.phone || ""} placeholder="เบอร์โทรสาขา" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-commission">เปอร์เซ็นต์ค่าคอมมิชชั่น (%)</Label>
                <Input
                  id="edit-commission"
                  name="commission_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={editBranch?.commission_percentage}
                  placeholder="15.00"
                  required
                />
              </div>
              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  💡 โหมดออฟไลน์: การแก้ไขจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditBranchDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกการแก้ไข</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditAdminDialogOpen} onOpenChange={setIsEditAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูล Admin</DialogTitle>
            <DialogDescription>แก้ไขข้อมูล Admin</DialogDescription>
          </DialogHeader>
          <form action={handleEditAdmin}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first_name">ชื่อ</Label>
                  <Input
                    id="edit-first_name"
                    name="first_name"
                    defaultValue={editAdminUser?.first_name}
                    placeholder="ชื่อ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last_name">นามสกุล</Label>
                  <Input
                    id="edit-last_name"
                    name="last_name"
                    defaultValue={editAdminUser?.last_name}
                    placeholder="นามสกุล"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nickname">ชื่อเล่น</Label>
                <Input
                  id="edit-nickname"
                  name="nickname"
                  defaultValue={editAdminUser?.nickname || ""}
                  placeholder="ชื่อเล่น"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={editAdminUser?.phone || ""}
                  placeholder="เบอร์โทรศัพท์"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">อีเมล</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editAdminUser?.email || ""}
                  placeholder="อีเมล"
                />
              </div>
              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  💡 โหมดออฟไลน์: การแก้ไขจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditAdminDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกการแก้ไข</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Branch Confirmation Dialog */}
      <Dialog open={isDeleteBranchDialogOpen} onOpenChange={setIsDeleteBranchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบสาขา</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบสาขา "{deleteBranch?.name}"?
              <br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้และจะลบข้อมูลที่เกี่ยวข้องทั้งหมด
              {connectionMode === "offline" && (
                <span className="block mt-2 text-blue-600">💡 โหมดออฟไลน์: การลบจะเป็นการจำลองเท่านั้น</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteBranchDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteBranch}>
              ลบสาขา
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <Dialog open={isDeleteAdminDialogOpen} onOpenChange={setIsDeleteAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบ Admin</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ Admin "{deleteAdminUser?.first_name} {deleteAdminUser?.last_name}"?
              <br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
              {connectionMode === "offline" && (
                <span className="block mt-2 text-blue-600">💡 โหมดออฟไลน์: การลบจะเป็นการจำลองเท่านั้น</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAdminDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              ลบ Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
