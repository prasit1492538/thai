# ระบบจัดการโรงเรียนสอนภาษาไทย

ระบบจัดการนักเรียน คอร์สเรียน และรายได้สำหรับโรงเรียนสอนภาษาไทย

## คุณสมบัติ

- 🔐 **ระบบ Authentication** - เข้าสู่ระบบด้วยหมายเลขโทรศัพท์
- 👥 **จัดการผู้ใช้** - นักเรียน, ครู, ผู้ดูแล
- 📚 **จัดการคอร์สเรียน** - เพิ่ม แก้ไข ลบคอร์ส
- 🏢 **จัดการสาขา** - ข้อมูลสาขาและค่าคอมมิชชั่น
- 💰 **รายงานรายได้** - ติดตามรายได้และสถิติ
- 📊 **Dashboard** - ภาพรวมของระบบ
- 📱 **Responsive Design** - ใช้งานได้บนมือถือ

## เทคโนโลยี

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: JSON Database (In-Memory)
- **Icons**: Lucide React

## การติดตั้ง

1. Clone repository
\`\`\`bash
git clone <repository-url>
cd thai-tutoring-system
\`\`\`

2. ติดตั้ง dependencies
\`\`\`bash
npm install
\`\`\`

3. รันโปรเจค
\`\`\`bash
npm run dev
\`\`\`

4. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## บัญชีทดสอบ

| บทบาท | หมายเลขโทรศัพท์ | ชื่อ |
|--------|------------------|------|
| Super Admin | 0845678901 | ผู้ดูแลระบบ |
| Admin | 0812345678 | สมชาย ใจดี |
| Teacher | 0834567890 | สมหญิง สอนดี |
| Student | 0823456789 | สมศรี เรียนดี |

## โครงสร้างโปรเจค

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin/             # หน้าผู้ดูแล
│   ├── teacher/           # หน้าครู
│   ├── dashboard/         # หน้านักเรียน
│   └── page.tsx           # หน้าเข้าสู่ระบบ
├── components/            # React Components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities และ Services
│   ├── auth.ts           # Authentication
│   ├── database-service.ts # Database Service
│   ├── json-database.ts  # JSON Database
│   └── utils.ts          # Utility functions
└── types/                # TypeScript types
\`\`\`

## การใช้งาน

### เข้าสู่ระบบ
1. เปิดหน้าเว็บ
2. กรอกหมายเลขโทรศัพท์
3. กดปุ่ม "เข้าสู่ระบบ"

### ผู้ดูแลระบบ
- จัดการนักเรียน: เพิ่ม แก้ไข ลบข้อมูลนักเรียน
- จัดการคอร์ส: สร้างและจัดการคอร์สเรียน
- จัดการสาขา: ข้อมูลสาขาและค่าคอมมิชชั่น
- รายงาน: ดูสถิติและรายงานต่างๆ

### ครู
- ดูตารางสอน
- เช็คชื่อนักเรียน
- ดูข้อมูลนักเรียนในคอร์ส

### นักเรียน
- ดูตารางเรียน
- ดูข้อมูลการลงทะเบียน
- ติดตามความคืบหน้า

## การพัฒนา

### เพิ่มฟีเจอร์ใหม่
1. สร้าง component ใน `components/`
2. เพิ่ม route ใน `app/`
3. อัพเดท database service ใน `lib/`

### การจัดการข้อมูล
ข้อมูลถูกเก็บใน `lib/json-database.ts` ในรูปแบบ JSON object
สามารถแก้ไขข้อมูลเริ่มต้นได้ในไฟล์นี้

## License

MIT License
