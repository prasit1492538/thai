-- เพิ่มฟิลด์ commission_percentage ในตาราง branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 15.00;

-- อัพเดทเปอร์เซ็นต์ของแต่ละสาขา
UPDATE branches SET commission_percentage = 15.00 WHERE name = 'สาขาสยาม';
UPDATE branches SET commission_percentage = 12.50 WHERE name = 'สาขารัชดา';
UPDATE branches SET commission_percentage = 18.00 WHERE name = 'สาขาลาดพร้าว';

-- เพิ่มข้อมูลตัวอย่างการลงทะเบียนเรียน
INSERT INTO enrollments (student_id, course_id, schedule_id, sessions_attended) VALUES
((SELECT id FROM users WHERE role = 'student' LIMIT 1), 
 (SELECT id FROM courses WHERE name = 'คณิตศาสตร์ ม.3' LIMIT 1),
 (SELECT id FROM schedules LIMIT 1),
 5);
