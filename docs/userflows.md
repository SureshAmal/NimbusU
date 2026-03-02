# NimbusU — User Flows

> Complete interaction flows for all three roles: **Admin**, **Faculty**, and **Student**.

---

## 1. Authentication (All Roles)

### 1.1 Login
```
Login Page → Enter email + password → POST /auth/login/ → Store JWT tokens
  ├─ Admin  → redirect to /admin/dashboard
  ├─ Faculty → redirect to /faculty/dashboard
  └─ Student → redirect to /student/dashboard
```

### 1.2 Register (Student Self-Registration)
```
Register Page → Fill form (name, email, password, role) → POST /auth/register/
  → Store JWT tokens → redirect to role-based dashboard
```

### 1.3 Logout
```
Any Page → Click logout → POST /auth/logout/ (blacklist refresh)
  → Clear tokens → redirect to /login
```

### 1.4 Change Password
```
Settings → Enter old + new password → POST /auth/password/change/ → Success toast
```

---

## 2. Admin Flows

### 2.1 Dashboard
```
/admin/dashboard
  ├─ Stats Cards: total users, active users, departments, courses
  ├─ Recent Activity: audit log feed
  ├─ Notification Stats: sent today / this week / delivery rate
  └─ Quick Actions: create user, create department, manage timetable
```

### 2.2 User Management
```
/admin/users
  ├─ Table: email, name, role, department, status, last login
  ├─ Filters: role, department, status + search bar
  ├─ Actions: Create, Edit (sheet), Deactivate, Reset Password
  └─ Click row → /admin/users/[id] → full profile + activity log

Create User:
  Dialog → Fill form → POST /users/ → refresh list

Reset Password:
  User row → action menu → Reset Password dialog → POST /users/{id}/reset-password/
```

### 2.3 Department Management
```
/admin/departments
  ├─ Grid of department cards (name, code, head, course count)
  ├─ Create Department dialog → POST /departments/
  ├─ Click card → /admin/departments/[id]
  │    ├─ Edit details
  │    ├─ Programs list → create/edit/archive
  │    └─ Courses list → view/edit
  └─ Delete → confirmation dialog → DELETE /departments/{id}/
```

### 2.4 Academic Management
```
/admin/academics
  ├─ Tab: Semesters | Courses | Offerings | Enrollments
  ├─ Semesters: list, create, set current
  ├─ Courses: list, create (name, code, dept, credits)
  ├─ Offerings: list, create (course + semester + faculty + section)
  └─ Enrollments: list by offering, add/remove students
```

### 2.5 Timetable Management
```
/admin/timetable
  ├─ Weekly grid view (Mon-Sat × time slots)
  ├─ Filter by: department, semester, room
  ├─ Create Entry: pick course offering → room → day → time
  ├─ Drag-to-reschedule (optional)
  ├─ Conflict Detection: GET /timetable/conflicts/ → highlight clashes
  └─ Room Management: /admin/timetable/rooms → CRUD rooms
```

### 2.6 Content Oversight
```
/admin/content
  ├─ All content list with filters (type, visibility, uploader)
  ├─ Content stats per item (views, downloads, bookmarks)
  └─ Tag management
```

### 2.7 Announcements
```
/admin/announcements
  ├─ List announcements (title, target, urgent flag, published date)
  ├─ Create: title, body, target type, schedule, urgent toggle
  └─ Edit / Delete existing
```

### 2.8 Audit Logs
```
/admin/audit-logs
  ├─ Filterable table: user, action, entity, date range
  └─ Export to CSV
```

---

## 3. Faculty Flows

### 3.1 Dashboard
```
/faculty/dashboard
  ├─ Today's Schedule: current day timetable entries
  ├─ Quick Stats: courses teaching, pending submissions, unread messages
  ├─ Recent Assignments: submissions waiting for grading
  └─ Announcements feed
```

### 3.2 My Courses
```
/faculty/courses → list of assigned course offerings (current semester)
  └─ Click course → /faculty/courses/[offering_id]
       ├─ Tab: Overview | Content | Assignments | Students | Attendance | Forum
       ├─ Overview: course info, enrolled count, schedule
       ├─ Content: folder tree + upload content
       ├─ Assignments: create / list / view submissions
       ├─ Students: enrolled student list
       ├─ Attendance: mark attendance (bulk), view reports
       └─ Forum: discussion threads
```

### 3.3 Content Management
```
Upload Content:
  Course page → Content tab → Upload button
    → Fill: title, type, description, file/URL, visibility, tags
    → POST /content/ → appears in folder

Organize:
  Create folders → drag content into folders
  Edit content metadata → PATCH /content/{id}/
```

### 3.4 Assignment & Grading
```
Create Assignment:
  Course → Assignments tab → New Assignment
    → Title, description, due date, max marks, type, publish toggle
    → POST /assignments/

View Submissions:
  Assignment → Submissions tab → list all submissions
    → Click submission → view file + text
    → Grade: enter marks, grade, feedback → POST /assignments/{id}/submissions/{sub_id}/grade/

Export Grades:
  Course → Assignments tab → Export → GET /assignments/export/{offering_id}/
    → Download CSV
```

### 3.5 Attendance
```
Mark Attendance:
  Course → Attendance tab → Select date → student checklist (present/absent/late)
    → POST /attendance/mark/ (bulk)

View Reports:
  Course → Attendance tab → report view → per-student attendance %
```

### 3.6 Timetable
```
/faculty/timetable → GET /timetable/me/
  → Weekly/daily view of teaching schedule with room info
```

### 3.7 Communication
```
/faculty/messages → inbox/sent → compose message to student
/faculty/announcements → create course-level announcement
Course → Forum tab → create discussion topic, reply to posts
```

---

## 4. Student Flows

### 4.1 Dashboard
```
/student/dashboard
  ├─ Today's Classes: timetable for today
  ├─ Upcoming Deadlines: assignments due soon
  ├─ Recent Content: newly uploaded materials
  ├─ Notifications: unread count + recent list
  └─ Attendance Summary: overall attendance %
```

### 4.2 My Courses
```
/student/courses → GET /academics/enrollments/me/ → list enrolled courses
  └─ Click course → /student/courses/[offering_id]
       ├─ Tab: Overview | Content | Assignments | Attendance | Forum
       ├─ Overview: course info, faculty, schedule
       ├─ Content: browse → download → auto-logs access
       ├─ Assignments: list → view details → submit work → view grade
       ├─ Attendance: personal attendance record
       └─ Forum: participate in discussions
```

### 4.3 Content Browsing
```
/student/content
  ├─ Browse all accessible content (filters: course, type, tags)
  ├─ Search bar → full-text search
  ├─ Click item → view details + download
  └─ Bookmark → GET /content/bookmarks/

/student/bookmarks → saved content list
```

### 4.4 Assignments
```
View Assignment:
  Course → Assignments tab → click assignment
    → Details: title, description, due date, attachments, max marks

Submit Work:
  Assignment detail → Submit tab
    → Upload file and/or enter text → POST /assignments/{id}/submit/

View Grade:
  Course → Assignments tab → assignment → My Submission
    → Shows: marks, grade, feedback, status
```

### 4.5 Timetable
```
/student/timetable → GET /timetable/me/
  → Weekly/daily view with class times, rooms, faculty
```

### 4.6 Attendance
```
/student/attendance → GET /attendance/me/
  → Overall summary + per-course breakdown
  → Click course → detailed records with dates
```

### 4.7 Notifications
```
/student/notifications → GET /notifications/
  ├─ List: title, message, type, timestamp, read/unread
  ├─ Click → mark as read (PATCH /notifications/{id}/read/)
  ├─ Mark All Read → POST /notifications/read-all/
  └─ Bell icon → badge with unread count (GET /notifications/unread-count/)
```

### 4.8 Messages
```
/student/messages → inbox/sent tabs
  ├─ Compose → select faculty → subject + body → POST /communications/messages/
  └─ Click message → view + auto-mark read
```

---

## 5. Shared Components

| Component | Usage |
|-----------|-------|
| **Sidebar** | Role-based navigation (collapses on mobile) |
| **Header** | User avatar, notifications bell, search, settings |
| **Data Table** | Paginated, sortable, filterable lists (users, content, etc.) |
| **Dialog/Sheet** | Create/edit forms overlay |
| **Toast** | Success/error notifications |
| **Calendar View** | Timetable weekly grid |
| **File Upload** | Drag & drop, progress indicator |
| **Markdown Editor** | Assignment descriptions, forum posts |
| **Stats Card** | Dashboard metric display |
| **Breadcrumbs** | Navigation path |

---

## 6. Page Map

| Route | Role | Page |
|-------|------|------|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/admin/dashboard` | Admin | Dashboard |
| `/admin/users` | Admin | User Management |
| `/admin/departments` | Admin | Departments |
| `/admin/academics` | Admin | Semesters, Courses, Offerings |
| `/admin/timetable` | Admin | Timetable Editor |
| `/admin/content` | Admin | Content Oversight |
| `/admin/announcements` | Admin | Announcements |
| `/admin/audit-logs` | Admin | Audit Logs |
| `/admin/notifications` | Admin | Notification Stats |
| `/faculty/dashboard` | Faculty | Dashboard |
| `/faculty/courses` | Faculty | My Courses |
| `/faculty/courses/[id]` | Faculty | Course Detail (tabs) |
| `/faculty/timetable` | Faculty | My Schedule |
| `/faculty/messages` | Faculty | Messages |
| `/faculty/announcements` | Faculty | My Announcements |
| `/student/dashboard` | Student | Dashboard |
| `/student/courses` | Student | My Courses |
| `/student/courses/[id]` | Student | Course Detail (tabs) |
| `/student/content` | Student | Content Browser |
| `/student/bookmarks` | Student | Bookmarks |
| `/student/timetable` | Student | My Schedule |
| `/student/attendance` | Student | Attendance Records |
| `/student/assignments` | Student | All Assignments |
| `/student/messages` | Student | Messages |
| `/student/notifications` | Student | Notifications |
| `/settings` | All | Profile & Preferences |
