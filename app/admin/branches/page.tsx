"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatDate } from "@/lib/utils"
import { Building2, ArrowLeft, Edit, AlertCircle, Plus } from "lucide-react"
import type { User, Branch } from "@/lib/database.types"

export default function BranchesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadBranches()
  }, [router])

  const loadBranches = async () => {
    try {
      const { data, error } = await DatabaseService.getBranches()
      if (error) {
        console.error("Error loading branches:", error)
      } else {
        setBranches(data)
      }
    } catch (error) {
      console.error("Error loading branches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBranch = async (branchData: Omit<Branch, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await DatabaseService.createBranch(branchData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการเพิ่มสาขา")
      } else {
        alert("เพิ่มสาขาสำเร็จ")
        setIsAddDialogOpen(false)
        loadBranches()
      }
    } catch (error) {
      console.error("Error adding branch:", error)
      alert("เกิดข้อผิดพลาดในการเพิ่มสาขา")
    }
  }

  const handleEditBranch = async (branchData: Partial<Branch>) => {
    if (!selectedBranch) return

    try {
      const { data, error } = await DatabaseService.updateBranch(selectedBranch.id, branchData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขสาขา")
      } else {
        alert("แก้ไขสาขาสำเร็จ")
        setIsEditDialogOpen(false)
        setSelectedBranch(null)
        loadBranches()
      }
    } catch (error) {
      console.error("Error editing branch:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขสาขา")
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
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">จัดการสาขา</h1>
                  <p className="text-sm text-gray-500">ดูและจัดการข้อมูลสาขาทั้งหมด</p>
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
        {/* Branches Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>รายการสาขา ({branches.length} สาขา)</span>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มสาขาใหม่
              </Button>
            </CardTitle>
            <CardDescription>สาขาทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>ยังไม่มีสาขาในระบบ</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อสาขา</TableHead>
                      <TableHead>ที่อยู่</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>อัตราค่าคอมมิชชั่น</TableHead>
                      <TableHead>วันที่สร้าง</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(branch.commission_rate * 100).toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>{formatDate(branch.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBranch(branch)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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

      {/* Add Branch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มสาขาใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลสาขาใหม่</DialogDescription>
          </DialogHeader>
          <BranchForm onSubmit={handleAddBranch} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขสาขา</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลสาขา {selectedBranch?.name}</DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm
              branch={selectedBranch}
              onSubmit={handleEditBranch}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedBranch(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BranchForm({
  branch,
  onSubmit,
  onCancel,
}: {
  branch?: Branch
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    address: branch?.address || "",
    phone: branch?.phone || "",
    commission_rate: branch?.commission_rate || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">ชื่อสาขา</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">ที่อยู่</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
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
        <Label htmlFor="commission_rate">อัตราค่าคอมมิชชั่น (0.00 - 1.00)</Label>
        <Input
          id="commission_rate"
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={formData.commission_rate}
          onChange={(e) => setFormData({ ...formData, commission_rate: Number.parseFloat(e.target.value) })}
          required
        />
        <p className="text-sm text-gray-500 mt-1">ตัวอย่าง: 0.15 = 15%</p>
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
