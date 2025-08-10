-- Insert sample branches
INSERT INTO branches (id, name, address, phone, commission_percentage) VALUES
('branch-1', 'สาขาสยาม', 'อาคารสยามสแควร์ ชั้น 3 กรุงเทพฯ 10330', '021234567', 15.00),
('branch-2', 'สาขารัชดา', 'อาคารฟอร์จูนทาวน์ ชั้น 2 กรุงเทพฯ 10310', '021234568', 12.50),
('branch-3', 'สาขาลาดพร้าว', 'เซ็นทรัลลาดพร้าว ชั้น 4 กรุงเทพฯ 10230', '021234569', 18.00);

-- Insert sample users
INSERT INTO users (id, phone, password, first_name, last_name, nickname, role, email, birth_date, address, current_grade, branch_id) VALUES
('user-1', '0812345678', '$2b$10$hash1', 'สมศักดิ์', 'ผู้ดูแล', 'แอดมิน', 'admin', 'admin@example.com', '1980-01-01', '123 ถนนสุขุมวิท กรุงเทพฯ', NULL, 'branch-1'),
('user-2', '0823456789', '$2b$10$hash2', 'สมใส', 'นักเรียน', 'ใส', 'student', 'student@example.com', '2008-07-10', '321 ถนนพหลโยธิน กรุงเทพฯ', 'm3', 'branch-1'),
('user-3', '0834567890', '$2b$10$hash3', 'สมศรี', 'ครูสอน', 'ครูศรี', 'teacher', 'teacher@example.com', '1990-03-20', '789 ถนนลาดพร้าว กรุงเทพฯ', NULL, 'branch-1'),
('user-4', '0845678901', '$2b$10$hash4', 'สมชาย', 'ผู้จัดการ', 'ผู้จัดการ', 'superadmin', 'superadmin@example.com', '1985-05-15', '456 ถนนรัชดาภิเษก กรุงเทพฯ', NULL, NULL),
('user-5', '0856789012', '$2b$10$hash5', 'สมหมาย', 'นักเรียน', 'หมาย', 'student', 'student2@example.com', '2005-12-25', '654 ถนนเพชรบุรี กรุงเทพฯ', 'm6', 'branch-1'),
('user-6', '0867890123', '$2b$10$hash6', 'สมปอง', 'นักเรียน', 'ปอง', 'student', 'student3@example.com', '2007-09-15', '987 ถนนบางนา กรุงเทพฯ', 'm3', 'branch-1');

-- Insert sample courses
INSERT INTO courses (id, name, description, grade_level, total_sessions, price, branch_id, teacher_id) VALUES
('course-1', 'คณิตศาสตร์ ม.3', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00, 'branch-1', 'user-3'),
('course-2', 'วิทยาศาสตร์ ม.3', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00, 'branch-1', 'user-3'),
('course-3', 'ภาษาอังกฤษ ม.3', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3', 'm3', 30, 12000.00, 'branch-1', 'user-3'),
('course-4', 'คณิตศาสตร์ ม.6', 'หลักสูตรคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00, 'branch-1', 'user-3'),
('course-5', 'วิทยาศาสตร์ ม.6', 'หลักสูตรวิทยาศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00, 'branch-1', 'user-3'),
('course-6', 'ภาษาอังกฤษ ม.6', 'หลักสูตรภาษาอังกฤษสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6', 'm6', 30, 15000.00, 'branch-1', 'user-3');

-- Insert sample schedules
INSERT INTO schedules (id, course_id, branch_id, day_of_week, start_time, end_time) VALUES
('schedule-1', 'course-1', 'branch-1', 6, '09:00:00', '12:00:00'),
('schedule-2', 'course-2', 'branch-1', 0, '13:00:00', '16:00:00'),
('schedule-3', 'course-3', 'branch-1', 1, '16:00:00', '19:00:00'),
('schedule-4', 'course-4', 'branch-1', 6, '13:00:00', '16:00:00'),
('schedule-5', 'course-5', 'branch-1', 0, '09:00:00', '12:00:00'),
('schedule-6', 'course-6', 'branch-1', 1, '19:00:00', '22:00:00');

-- Insert sample enrollments
INSERT INTO enrollments (id, student_id, course_id, schedule_id, enrollment_date, status, payment_status, sessions_attended) VALUES
('enrollment-1', 'user-2', 'course-1', 'schedule-1', '2024-01-15', 'active', 'paid', 5),
('enrollment-2', 'user-6', 'course-1', 'schedule-1', '2024-01-16', 'active', 'paid', 3),
('enrollment-3', 'user-2', 'course-2', 'schedule-2', '2024-01-17', 'active', 'paid', 4),
('enrollment-4', 'user-5', 'course-4', 'schedule-4', '2024-01-18', 'active', 'paid', 8),
('enrollment-5', 'user-5', 'course-5', 'schedule-5', '2024-01-19', 'active', 'pending', 2);

-- Insert sample revenue
INSERT INTO revenue (id, branch_id, amount, date, description) VALUES
('revenue-1', 'branch-1', 50000.00, '2024-12-15', 'รายได้ประจำเดือน'),
('revenue-2', 'branch-2', 45000.00, '2024-12-15', 'รายได้ประจำเดือน'),
('revenue-3', 'branch-3', 48000.00, '2024-12-15', 'รายได้ประจำเดือน');

-- Insert sample parents
INSERT INTO parents (id, student_id, parent_type, first_name, last_name, occupation, workplace, phone, line_id, email) VALUES
('parent-1', 'user-2', 'father', 'สมชาติ', 'นักเรียน', 'พนักงานบริษัท', 'บริษัท ABC', '0856789012', 'father_line', 'father@example.com'),
('parent-2', 'user-2', 'mother', 'สมหญิง', 'นักเรียน', 'ข้าราชการ', 'กรมการศึกษา', '0867890123', 'mother_line', 'mother@example.com'),
('parent-3', 'user-5', 'father', 'สมพร', 'นักเรียน', 'ธุรกิจส่วนตัว', 'ร้านอาหาร', '0878901234', 'father2_line', 'father2@example.com'),
('parent-4', 'user-6', 'mother', 'สมจิตต์', 'นักเรียน', 'พยาบาล', 'โรงพยาบาล XYZ', '0889012345', 'mother3_line', 'mother3@example.com');

-- Insert sample student preferences
INSERT INTO student_preferences (id, student_id, preferred_school_1, preferred_school_2, pdpa_consent, branch_id) VALUES
('pref-1', 'user-2', 'จุฬาลงกรณ์มหาวิทยาลัย', 'มหาวิทยาลัยธรรมศาสตร์', TRUE, 'branch-1'),
('pref-2', 'user-5', 'มหาวิทยาลัยเกษตรศาสตร์', 'มหาวิทยาลัยมหิดล', TRUE, 'branch-1'),
('pref-3', 'user-6', 'มหาวิทยาลัยศิลปกรรมศาสตร์', 'มหาวิทยาลัยรามคำแหง', TRUE, 'branch-1');

-- Insert sample attendance
INSERT INTO attendance (id, enrollment_id, date, checked_in, checked_by, notes) VALUES
('attendance-1', 'enrollment-1', '2024-01-20', TRUE, 'user-3', 'เข้าเรียนตรงเวลา'),
('attendance-2', 'enrollment-1', '2024-01-27', TRUE, 'user-3', 'เข้าเรียนตรงเวลา'),
('attendance-3', 'enrollment-2', '2024-01-20', FALSE, 'user-3', 'ขาดเรียน'),
('attendance-4', 'enrollment-2', '2024-01-27', TRUE, 'user-3', 'เข้าเรียนสาย 15 นาที'),
('attendance-5', 'enrollment-3', '2024-01-21', TRUE, 'user-3', 'เข้าเรียนตรงเวลา');
