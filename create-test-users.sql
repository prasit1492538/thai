-- ลบข้อมูลเก่า (ถ้ามี)
DELETE FROM user_branches;
DELETE FROM revenue;
DELETE FROM attendance;
DELETE FROM enrollments;
DELETE FROM schedules;
DELETE FROM student_preferences;
DELETE FROM parents;
DELETE FROM users;
DELETE FROM courses;
DELETE FROM branches;

-- เพิ่มข้อมูลสาขา
INSERT INTO branches (name, address, phone, commission_percentage) VALUES
('สาขาสยาม', 'อาคารสยามสแควร์ ชั้น 3 กรุงเทพฯ', '021234567', 15.00),
('สาขารัชดา', 'อาคารฟอร์จูนทาวน์ ชั้น 2 กรุงเทพฯ', '021234568', 12.50),
('สาขาลาดพร้าว', 'เซ็นทรัลลาดพร้าว ชั้น 4 กรุงเทพฯ', '021234569', 18.00);

-- เพิ่มหลักสูตร
INSERT INTO courses (name, description, grade_level, total_sessions, price) VALUES
('คณิตศาสตร์ ม.3', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('วิทยาศาสตร์ ม.3', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('ภาษาอังกฤษ ม.3', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00),
('คณิตศาสตร์ ม.6', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('วิทยาศาสตร์ ม.6', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00),
('ภาษาอังกฤษ ม.6', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00);

-- เพิ่มผู้ใช้ทดสอบ (รหัสผ่าน: admin123456)
INSERT INTO users (email, phone, password, first_name, last_name, nickname, role) VALUES
('admin@example.com', '0812345678', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศักดิ์', 'ผู้ดูแล', 'แอดมิน', 'superadmin'),
('manager@example.com', '0823456789', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมชาย', 'ผู้จัดการ', 'ผู้จัดการ', 'admin'),
('teacher@example.com', '0834567890', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมศรี', 'ครูสอน', 'ครูศรี', 'teacher'),
('student@example.com', '0845678901', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'สมใส', 'นักเรียน', 'ใส', 'student');

-- เชื่อมโยงผู้ใช้กับสาขา
INSERT INTO user_branches (user_id, branch_id) VALUES
((SELECT id FROM users WHERE email = 'manager@example.com' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1)),
((SELECT id FROM users WHERE email = 'teacher@example.com' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1));

-- เพิ่มตารางเรียน
INSERT INTO schedules (course_id, branch_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM courses WHERE name = 'คณิตศาสตร์ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 6, '09:00:00', '12:00:00'),
((SELECT id FROM courses WHERE name = 'วิทยาศาสตร์ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 0, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'ภาษาอังกฤษ ม.3' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 6, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'คณิตศาสตร์ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 6, '09:00:00', '12:00:00'),
((SELECT id FROM courses WHERE name = 'วิทยาศาสตร์ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 0, '13:00:00', '16:00:00'),
((SELECT id FROM courses WHERE name = 'ภาษาอังกฤษ ม.6' LIMIT 1), (SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว' LIMIT 1), 6, '13:00:00', '16:00:00');

-- เพิ่มข้อมูลรายได้ตัวอย่าง
INSERT INTO revenue (branch_id, amount, date, description) VALUES
((SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1), 50000.00, CURRENT_DATE, 'รายได้ประจำเดือน'),
((SELECT id FROM branches WHERE name = 'สาขารัชดา' LIMIT 1), 45000.00, CURRENT_DATE, 'รายได้ประจำเดือน'),
((SELECT id FROM branches WHERE name = 'สาขาลาดพร้าว' LIMIT 1), 48000.00, CURRENT_DATE, 'รายได้ประจำเดือน');

-- เพิ่มข้อมูลผู้ปกครองสำหรับนักเรียนทดสอบ
INSERT INTO parents (student_id, parent_type, first_name, last_name, occupation, workplace, phone, line_id, email) VALUES
((SELECT id FROM users WHERE email = 'student@example.com' LIMIT 1), 'father', 'สมชาติ', 'นักเรียน', 'พนักงานบริษัท', 'บริษัท ABC', '0856789012', 'father_line', 'father@example.com'),
((SELECT id FROM users WHERE email = 'student@example.com' LIMIT 1), 'mother', 'สมหญิง', 'นักเรียน', 'ข้าราชการ', 'กรมการศึกษา', '0867890123', 'mother_line', 'mother@example.com');

-- เพิ่มข้อมูลความต้องการของนักเรียน
INSERT INTO student_preferences (student_id, preferred_school_1, preferred_school_2, pdpa_consent, branch_id) VALUES
((SELECT id FROM users WHERE email = 'student@example.com' LIMIT 1), 'จุฬาลงกรณ์มหาวิทยาลัย', 'มหาวิทยาลัยธรรมศาสตร์', true, (SELECT id FROM branches WHERE name = 'สาขาสยาม' LIMIT 1));
