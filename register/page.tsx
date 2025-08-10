"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { register } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { DatabaseService } from "@/lib/database-service"

export default function RegisterPage() {
  const [date, setDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [connectionMode, setConnectionMode] = useState<string>("checking")
  const { toast } = useToast()

  useEffect(() => {
    async function fetchBranches() {
      try {
        // Initialize database service
        await DatabaseService.initialize()
        setConnectionMode(DatabaseService.getConnectionMode())

        console.log("🔍 Fetching branches for registration...")
        const { data, error } = await DatabaseService.getBranches()

        if (error) {
          console.error("Error fetching branches:", error)
          return
        }

        console.log("🏢 Branches fetched for registration:", data?.length || 0)
        setBranches(data || [])
      } catch (err) {
        console.error("Exception when fetching branches:", err)
      }
    }

    fetchBranches()
  }, [])

  async function handleSubmit(formData: FormData) {
    if (!date) {
      toast({
        title: "กรุณาเลือกวันเกิด",
        variant: "destructive",
      })
      return
    }

    formData.set("birthDate", date.toISOString().split("T")[0])

    setIsLoading(true)
    const result = await register(formData)
    setIsLoading(false)

    if (result?.error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description:
          connectionMode === "offline"
            ? "กรุณาเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่านของคุณ (โหมดจำลอง)"
            : "กรุณาเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่านของคุณ",
      })
      window.location.href = "/"
    }
  }

  return (
    <div className="flex justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อสมัครสมาชิก</CardDescription>
          <div className="flex justify-center">
            <Badge variant={connectionMode === "offline" ? "outline" : "default"}>
              {connectionMode === "offline" ? "📱 โหมดออฟไลน์" : "✅ ออนไลน์"}
            </Badge>
          </div>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ข้อมูลนักเรียน */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">ข้อมูลนักเรียน</h3>
                <Separator />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input id="firstName" name="firstName" placeholder="ชื่อ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input id="lastName" name="lastName" placeholder="นามสกุล" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">ชื่อเล่น</Label>
                <Input id="nickname" name="nickname" placeholder="ชื่อเล่น" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">วันเดือนปีเกิด</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">ชั้นเรียนปัจจุบัน</Label>
                <Select name="grade">
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Input id="address" name="address" placeholder="ที่อยู่" />
              </div>

              {/* ข้อมูลบิดา */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">ข้อมูลบิดา</h3>
                <Separator />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">ชื่อบิดา</Label>
                <Input id="fatherName" name="fatherName" placeholder="ชื่อบิดา" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherOccupation">อาชีพ</Label>
                <Input id="fatherOccupation" name="fatherOccupation" placeholder="อาชีพ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherWorkplace">สถานที่ทำงาน</Label>
                <Input id="fatherWorkplace" name="fatherWorkplace" placeholder="สถานที่ทำงาน" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherPhone">เบอร์โทรศัพท์</Label>
                <Input id="fatherPhone" name="fatherPhone" type="tel" placeholder="เบอร์โทรศัพท์" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherLine">ไอดีไลน์</Label>
                <Input id="fatherLine" name="fatherLine" placeholder="ไอดีไลน์" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherEmail">อีเมล</Label>
                <Input id="fatherEmail" name="fatherEmail" type="email" placeholder="อีเมล" required />
              </div>

              {/* ข้อมูลมารดา */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">ข้อมูลมารดา</h3>
                <Separator />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">ชื่อมารดา</Label>
                <Input id="motherName" name="motherName" placeholder="ชื่อมารดา" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherOccupation">อาชีพ</Label>
                <Input id="motherOccupation" name="motherOccupation" placeholder="อาชีพ" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherWorkplace">สถานที่ทำงาน</Label>
                <Input id="motherWorkplace" name="motherWorkplace" placeholder="สถานที่ทำงาน" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherPhone">เบอร์โทรศัพท์</Label>
                <Input id="motherPhone" name="motherPhone" type="tel" placeholder="เบอร์โทรศัพท์" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherLine">ไอดีไลน์</Label>
                <Input id="motherLine" name="motherLine" placeholder="ไอดีไลน์" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherEmail">อีเมล</Label>
                <Input id="motherEmail" name="motherEmail" type="email" placeholder="อีเมล" />
              </div>

              {/* ข้อมูลสถานศึกษาที่สนใจ */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">สถานศึกษาที่สนใจ</h3>
                <Separator />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school1">สถานศึกษาที่สนใจอันดับ 1</Label>
                <Input id="school1" name="school1" placeholder="สถานศึกษาที่สนใจอันดับ 1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school2">สถานศึกษาที่สนใจอันดับ 2</Label>
                <Input id="school2" name="school2" placeholder="สถานศึกษาที่สนใจอันดับ 2" />
              </div>

              {/* ข้อมูลการสมัคร */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">ข้อมูลการสมัคร</h3>
                <Separator />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน (ไม่ต่ำกว่า 10 ตัว)</Label>
                <Input id="password" name="password" type="password" placeholder="รหัสผ่าน" required minLength={10} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="branch">สาขาโรงเรียนติว</Label>
                <Select name="branch">
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

              <div className="flex items-start space-x-2 md:col-span-2">
                <Checkbox id="pdpa" name="pdpa" />
                <Label htmlFor="pdpa" className="text-sm leading-tight">
                  ข้าพเจ้าอนุญาตให้ทางสถาบันนำรูปของนักเรียนบางภาพในห้องเรียนประชาสัมพันธ์ผ่านสื่อต่างๆของทางสถาบัน (PDPA)
                </Label>
              </div>

              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded md:col-span-2">
                  💡 โหมดออฟไลน์: การสมัครสมาชิกจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" type="submit" disabled={isLoading || connectionMode === "checking"}>
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
            <div className="text-center text-sm mt-2">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/" className="text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
