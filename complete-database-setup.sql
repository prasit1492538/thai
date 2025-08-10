-- ลบตารางเก่าทั้งหมด (ถ้ามี)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS student_preferences CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS user_branches CASCADE;
DROP TABLE IF EXISTS revenue CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- ลบ enum เก่า (ถ้ามี)
DROP TYPE IF EXISTS user_role CASCADE;

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
INSERT INTO branches (name, address, phone) VALUES
('สาขาสยาม', 'อาคารสยามสแควร์ ชั้น 3 กรุงเทพฯ', '021234567'),
('สาขารัชดา', 'อาคารฟอร์จูนทาวน์ ชั้น 2 กรุงเทพฯ', '021234568'),
('สาขาลาดพร้าว', 'เซ็นทรัลลาดพร้าว ชั้น 4 กรุงเทพฯ', '021234569');

INSERT INTO courses (name, description, grade_level, total_sessions, price) VALUES
('คณิตศาสตร์ ม.3', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('วิทยาศาสตร์ ม.3', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('ภาษาอังกฤษ ม.3', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('คณิตศาสตร์ ม.6', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('วิทยาศาสตร์ ม.6', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('ภาษาอังกฤษ ม.6', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00);

-- เพิ่มตารางเรียน
INSERT INTO schedules (course_id, branch_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM courses WHERE name = 'คณิตศาสตร์ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 6, '09:00:00', '12:00:00'),
((SELECT id FROM courses WHERE name = 'วิทยาศาสตร์ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 0, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'ภาษาอังกฤษ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 6, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'คณิตศาสตร์ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 6, '09:00:00', '12:00:00'),
((SELECT id FROM courses WHERE name = 'วิทยาศาสตร์ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 0, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'ภาษาอังกฤษ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว' LIMIT 1), 6, '13:00:00', '16:00:00');

-- เพิ่มผู้ใช้ admin (รหัสผ่าน: admin123456)
INSERT INTO users (email, phone, password, first_name, last_name, nickname, role) VALUES
('admin@example.com', '0812345678', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศักดิ์', 'ผู้ดูแล', 'แอดมิน', 'superadmin'),
('manager@example.com', '0823456789', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมชาย', 'ผู้จัดการ', 'ผู้จัดการ', 'admin'),
('teacher@example.com', '0834567890', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศรี', 'ครูสอน', 'ครูศรี', 'teacher');

-- เชื่อมโยงผู้ใช้กับสาขา
INSERT INTO user_branches (user_id, branch_id) VALUES
((SELECT id FROM users WHERE email = 'manager@example.com' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1)),
((SELECT id FROM users WHERE email = 'teacher@example.com' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1));

-- เพิ่มข้อมูลรายได้ตัวอย่าง
INSERT INTO revenue (branch_id, amount, date, description) VALUES
((SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 50000.00, CURRENT_DATE, 'รายได้ประจำเดือน'),
((SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 45000.00, CURRENT_DATE, 'รายได้ประจำเดือน'),
((SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว' LIMIT 1), 48000.00, CURRENT_DATE, 'รายได้ประจำเดือน');
