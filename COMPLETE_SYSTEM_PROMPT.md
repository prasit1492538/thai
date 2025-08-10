# 🎯 **Complete Thai Tutoring School Management System Prompt**

## 📋 **Main System Prompt**

สร้างระบบจัดการโรงเรียนติวแบบครบครันด้วย Next.js 15, TypeScript, Tailwind CSS, และ Supabase

### ความต้องการหลัก:
1. ระบบ Authentication (Login/Register) 
2. ระบบจัดการผู้ใช้ 4 ระดับ: Student, Teacher, Admin, Superadmin
3. ระบบจัดการนักเรียนและผู้ปกครอง
4. ระบบจัดการคอร์สเรียนและตารางเรียน
5. ระบบคำนวณรายได้และเปอร์เซ็นต์ค่าคอมมิชชั่น
6. ระบบรายงานและสถิติ
7. ระบบเช็คชื่อสำหรับครู

### Tech Stack:
- Frontend: Next.js 15, React 18, TypeScript
- Styling: Tailwind CSS, shadcn/ui
- Database: Supabase (PostgreSQL)
- Authentication: Custom with bcrypt
- Icons: Lucide React

---

## 🗄️ **Database Schema**

### ตารางหลัก:
1. **users** - ข้อมูลผู้ใช้ทั้งหมด (id, email, phone, password, first_name, last_name, role, etc.)
2. **branches** - ข้อมูลสาขา (id, name, address, phone, commission_percentage)
3. **courses** - หลักสูตร (id, name, description, grade_level, price, total_sessions)
4. **schedules** - ตารางเรียน (id, course_id, branch_id, day_of_week, start_time, end_time)
5. **enrollments** - การลงทะเบียน (id, student_id, course_id, schedule_id, sessions_attended)
6. **parents** - ข้อมูลผู้ปกครอง (id, student_id, parent_type, first_name, last_name, occupation, etc.)
7. **student_preferences** - ความต้องการนักเรียน (id, student_id, preferred_school_1, preferred_school_2, branch_id, pdpa_consent)
8. **revenue** - รายได้ (id, branch_id, amount, date, description)
9. **attendance** - การเข้าเรียน (id, enrollment_id, date, checked_in, checked_by)
10. **user_branches** - เชื่อมโยงผู้ใช้กับสาขา (id, user_id, branch_id)

### ความสัมพันธ์:
- users 1:N parents
- users 1:1 student_preferences  
- users N:M branches (ผ่าน user_branches)
- courses 1:N schedules
- schedules 1:N enrollments
- enrollments 1:N attendance
- branches 1:N revenue
- branches 1:N schedules

### SQL Schema:
\`\`\`sql
-- สร้าง UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- สร้าง enum สำหรับบทบาทผู้ใช้
CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin', 'superadmin');

-- สร้างตาราง branches (สาขา)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  commission_percentage DECIMAL(5,2) DEFAULT 15.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง courses (หลักสูตร)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  grade_level VARCHAR(50),
  total_sessions INT NOT NULL DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง users (ผู้ใช้)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  birth_date DATE,
  address TEXT,
  current_grade VARCHAR(50),
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง parents (ข้อมูลผู้ปกครอง)
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_type VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  occupation VARCHAR(100),
  workplace VARCHAR(255),
  phone VARCHAR(20),
  line_id VARCHAR(100),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง schedules (ตารางเรียน)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง enrollments (การลงทะเบียนเรียน)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  sessions_attended INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id, schedule_id)
);

-- สร้างตาราง attendance (การเข้าเรียน)
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง student_preferences (ความต้องการของนักเรียน)
CREATE TABLE student_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preferred_school_1 VARCHAR(255),
  preferred_school_2 VARCHAR(255),
  pdpa_consent BOOLEAN DEFAULT FALSE,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง user_branches (เชื่อมโยงผู้ใช้กับสาขา)
CREATE TABLE user_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- สร้างตาราง revenue (รายได้)
CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- เพิ่มข้อมูลเริ่มต้น
INSERT INTO branches (name, address, phone, commission_percentage) VALUES
('สาขาสยาม', 'อาคารสยามสแควร์ ชั้น 3 กรุงเทพฯ', '021234567', 15.00),
('สาขารัชดา', 'อาคารฟอร์จูนทาวน์ ชั้น 2 กรุงเทพฯ', '021234568', 12.50),
('สาขาลาดพร้าว', 'เซ็นทรัลลาดพร้าว ชั้น 4 กรุงเทพฯ', '021234569', 18.00);

INSERT INTO courses (name, description, grade_level, total_sessions, price) VALUES
('คณิตศาสตร์ ม.3', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('วิทยาศาสตร์ ม.3', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('ภาษาอังกฤษ ม.3', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('คณิตศาสตร์ ม.6', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('วิทยาศาสตร์ ม.6', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('ภาษาอังกฤษ ม.6', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00);

-- เพิ่มผู้ใช้ admin (รหัสผ่าน: admin123456)
INSERT INTO users (email, phone, password, first_name, last_name, nickname, role) VALUES
('admin@example.com', '0812345678', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศักดิ์', 'ผู้ดูแล', 'แอดมิน', 'superadmin'),
('manager@example.com', '0823456789', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมชาย', 'ผู้จัดการ', 'ผู้จัดการ', 'admin'),
('teacher@example.com', '0834567890', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศรี', 'ครูสอน', 'ครูศรี', 'teacher');
\`\`\`

---

## 🏗️ **File Structure & Technical Implementation**

### Project Structure:
\`\`\`
app/
├── page.tsx (Login)
├── register/page.tsx
├── dashboard/page.tsx (Student)
├── teacher/page.tsx
├── admin/
│   ├── page.tsx (Dashboard)
│   ├── students/page.tsx
│   ├── courses/page.tsx
│   ├── branches/page.tsx (Superadmin only)
│   ├── revenue/page.tsx
│   └── reports/page.tsx
├── actions/auth.ts
└── globals.css

lib/
├── supabase/
│   ├── client.ts
│   └── server.ts
├── auth.ts
└── database.types.ts

components/ui/ (shadcn/ui components)
\`\`\`

### Key Technical Requirements:
1. **Authentication System:**
   - Login with phone number + password
   - Registration form with student + parent data
   - Session management with localStorage
   - Role-based routing and access control

2. **Database Integration:**
   - Supabase client setup (server & client)
   - TypeScript types generation
   - CRUD operations for all entities
   - Proper error handling

3. **Security Features:**
   - Password hashing with bcrypt (min 10 characters)
   - Input validation and sanitization
   - Role-based authorization
   - Session timeout handling

---

## 🎯 **Feature Requirements by Role**

### 🔐 **Authentication Pages:**
- **Login Page:** Phone number + password, test credentials display
- **Register Page:** Multi-step form (student info, father info, mother info, preferences, PDPA consent)

### 👨‍💼 **Superadmin Features:**
- Dashboard with overview statistics
- **Student Management:** View, Edit, Delete, Reset Password, Search/Filter
- **Course Management:** CRUD courses, manage schedules
- **Branch Management:** Edit branch info and commission percentages
- **Revenue Calculation:** Monthly reports with commission breakdown
- **Reports & Statistics:** Overall system statistics

### 👨‍🏫 **Teacher Features:**
- View personal teaching schedule
- **Attendance System:** Check-in students for each class
- Update session attendance counts
- View student progress

### 👨‍💼 **Admin Features:**
- Same as Superadmin but limited to assigned branches
- Cannot access branch management
- Revenue reports filtered by assigned branches

### 👩‍🎓 **Student Features:**
- Personal dashboard
- View enrolled courses
- View attendance history
- Profile information

---

## 🎨 **UI/UX Design Requirements**

### Design System:
- **Colors:** Blue primary, Green success, Red error, Gray neutrals
- **Typography:** Thai font support, proper hierarchy
- **Components:** shadcn/ui components throughout
- **Layout:** Responsive grid, mobile-first approach

### Key UI Components:
1. **Data Tables:** Sortable, searchable, paginated
2. **Modal Dialogs:** View, Edit, Delete confirmations
3. **Forms:** Validation, error states, loading states
4. **Cards:** Information display, statistics
5. **Navigation:** Role-based menu items
6. **Toast Notifications:** Success/error feedback

### Responsive Design:
- Mobile: Stack layout, collapsible navigation
- Tablet: Adaptive grid, touch-friendly controls
- Desktop: Full layout, hover states

---

## 📊 **Business Logic Requirements**

### Revenue Calculation:
- Monthly revenue reports by branch
- Commission percentage calculation per branch
- Gross revenue vs net revenue breakdown
- Historical revenue tracking

### Attendance System:
- Daily attendance tracking
- Session count updates
- Teacher assignment verification
- Attendance history reports

### Student Management:
- Complete CRUD operations
- Parent information management
- Preference tracking
- Password reset functionality

---

## 🚀 **Deployment & Environment**

### Environment Variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
\`\`\`

### Package Dependencies:
\`\`\`json
{
  "dependencies": {
    "next": "15.0.3",
    "react": "18.3.1",
    "typescript": "^5.6.3",
    "@supabase/supabase-js": "^2.45.4",
    "@supabase/ssr": "^0.5.1",
    "bcryptjs": "^2.4.3",
    "tailwindcss": "^3.4.17",
    "lucide-react": "^0.445.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  }
}
\`\`\`

### Build Commands:
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

---

## 🧪 **Test Data & Credentials**

### Test Accounts:
- **Superadmin:** 0812345678 / admin123456
- **Admin:** 0823456789 / admin123456  
- **Teacher:** 0834567890 / admin123456

### Sample Data:
- 3 branches with different commission rates
- 6 courses (Math/Science/English for M3/M6)
- Sample schedules and enrollments
- Revenue records for testing

---

## ✅ **Implementation Checklist**

### Phase 1 - Core Setup:
- [ ] Next.js 15 project setup
- [ ] Supabase integration
- [ ] Database schema creation
- [ ] Authentication system
- [ ] Basic routing structure

### Phase 2 - User Management:
- [ ] Login/Register pages
- [ ] Role-based access control
- [ ] Student CRUD operations
- [ ] Parent information management

### Phase 3 - Academic Management:
- [ ] Course management system
- [ ] Schedule management
- [ ] Enrollment system
- [ ] Attendance tracking

### Phase 4 - Business Features:
- [ ] Revenue calculation
- [ ] Commission percentage system
- [ ] Reports and statistics
- [ ] Branch management

### Phase 5 - Polish & Deploy:
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Performance optimization
- [ ] Deployment setup

---

## 🎯 **Final Implementation Notes**

สร้างระบบให้ครบถ้วนตามข้อกำหนดทั้งหมด โดยเน้น:

1. **Code Quality:** TypeScript strict mode, proper error handling
2. **User Experience:** Intuitive interface, fast loading, responsive design
3. **Security:** Proper authentication, input validation, role-based access
4. **Scalability:** Modular code structure, efficient database queries
5. **Maintainability:** Clear documentation, consistent naming conventions

**ผลลัพธ์ที่ต้องการ:** ระบบจัดการโรงเรียนติวที่ใช้งานได้จริง พร้อม deploy ไปยัง production environment ทันที

---

*📝 Copy prompt นี้ไปใช้กับ AI ตัวอื่นได้เลย จะได้ระบบที่ครบถ้วนเหมือนกันทุกประการ!*
