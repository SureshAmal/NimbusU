"""
Comprehensive seed command — populates the entire NimbusU database.

Usage:
    uv run python manage.py seed_all
    uv run python manage.py seed_all --reset   # flush & recreate
"""

import random
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.academics.models import (
    Course,
    CourseOffering,
    CoursePrerequisite,
    DailyQuestion,
    DailyQuestionAssignment,
    DailyQuestionResponse,
    Department,
    Enrollment,
    Grade,
    Program,
    School,
    Semester,
    AcademicEvent,
    StudentDailyQuestionPerformance,
    StudentTask,
)
from apps.accounts.models import AuditLog, FacultyProfile, StudentProfile, UserPreferences
from apps.assignments.models import Assignment, AssignmentGroup, GradingRubric, RubricCriteria, Submission
from apps.communications.models import (
    Announcement,
    DiscussionForum,
    DiscussionPost,
    Message,
    Notification,
    NotificationPreference,
    WebhookEndpoint,
    WebhookDelivery,
)
from apps.content.models import Bookmark, Content, ContentFolder, ContentTag, ContentComment, ContentVersion, ContentAccessLog
from apps.telemetry.models import RequestLog, SiteSettings
from apps.timetable.models import AttendanceRecord, Room, TimetableEntry, TimetableSwapRequest, ClassCancellation, RoomBooking, SubstituteFaculty

User = get_user_model()

# ── Data constants ───────────────────────────────────────────────────

SCHOOLS = [
    ("SOET", "School of Engineering & Technology"),
    ("SOS", "School of Sciences"),
    ("SOC", "School of Commerce & Management"),
]

# (code, name, school_code)
DEPARTMENTS = [
    ("CS", "Computer Science", "SOET"),
    ("EC", "Electronics & Communication", "SOET"),
    ("ME", "Mechanical Engineering", "SOET"),
    ("CE", "Civil Engineering", "SOET"),
    ("MA", "Mathematics", "SOS"),
]

PROGRAMS = [
    ("BTECHCS", "B.Tech Computer Science", "CS", 4, "UG"),
    ("BTECHEC", "B.Tech Electronics", "EC", 4, "UG"),
    ("BTECHME", "B.Tech Mechanical", "ME", 4, "UG"),
    ("MTECHCS", "M.Tech Computer Science", "CS", 2, "PG"),
    ("MTECHEC", "M.Tech Electronics", "EC", 2, "PG"),
]

COURSES = [
    ("CS101", "Introduction to Programming", "CS", 4, "Basics of programming in C and Python."),
    ("CS201", "Data Structures & Algorithms", "CS", 4, "Arrays, linked lists, trees, graphs, sorting."),
    ("CS301", "Database Management Systems", "CS", 3, "Relational databases, SQL, normalization."),
    ("CS401", "Machine Learning", "CS", 4, "Supervised and unsupervised learning, neural networks."),
    ("CS302", "Operating Systems", "CS", 3, "Process management, memory, file systems."),
    ("CS402", "Computer Networks", "CS", 3, "TCP/IP, routing, application layer protocols."),
    ("EC201", "Digital Electronics", "EC", 4, "Combinational and sequential circuits."),
    ("EC301", "Signal Processing", "EC", 3, "Fourier transforms, filters, sampling."),
    ("ME201", "Thermodynamics", "ME", 4, "Laws of thermodynamics, heat engines."),
    ("MA101", "Engineering Mathematics I", "MA", 4, "Calculus, linear algebra, differential equations."),
]

FACULTY_DATA = [
    ("priya.sharma@nimbusu.edu", "Dr. Priya", "Sharma", "CS", "Professor", "AI & Machine Learning"),
    ("rajesh.kumar@nimbusu.edu", "Dr. Rajesh", "Kumar", "CS", "Associate Professor", "Databases"),
    ("anita.desai@nimbusu.edu", "Dr. Anita", "Desai", "EC", "Professor", "VLSI Design"),
    ("suresh.nair@nimbusu.edu", "Dr. Suresh", "Nair", "ME", "Assistant Professor", "Fluid Mechanics"),
    ("meena.iyer@nimbusu.edu", "Dr. Meena", "Iyer", "MA", "Professor", "Applied Mathematics"),
    ("arjun.reddy@nimbusu.edu", "Dr. Arjun", "Reddy", "CS", "Assistant Professor", "Computer Networks"),
    ("kavitha.bose@nimbusu.edu", "Dr. Kavitha", "Bose", "EC", "Professor", "Signal Processing"),
]

# (email, first, last, dept, program, semester, batch_year, batch, division, register_no)
STUDENT_DATA = [
    ("aarav.patel@nimbusu.edu", "Aarav", "Patel", "CS", "BTECHCS", 4, 2023, "A1", "A", "REG2023CS001"),
    ("diya.sharma@nimbusu.edu", "Diya", "Sharma", "CS", "BTECHCS", 4, 2023, "A1", "A", "REG2023CS002"),
    ("rohan.verma@nimbusu.edu", "Rohan", "Verma", "CS", "BTECHCS", 6, 2022, "A1", "A", "REG2022CS001"),
    ("ananya.singh@nimbusu.edu", "Ananya", "Singh", "CS", "BTECHCS", 6, 2022, "A2", "A", "REG2022CS002"),
    ("kiran.joshi@nimbusu.edu", "Kiran", "Joshi", "CS", "MTECHCS", 2, 2025, "B1", "B", "REG2025CS001"),
    ("sneha.gupta@nimbusu.edu", "Sneha", "Gupta", "EC", "BTECHEC", 4, 2023, "A1", "A", "REG2023EC001"),
    ("arjun.menon@nimbusu.edu", "Arjun", "Menon", "EC", "BTECHEC", 6, 2022, "A1", "A", "REG2022EC001"),
    ("priti.das@nimbusu.edu", "Priti", "Das", "ME", "BTECHME", 4, 2023, "A1", "A", "REG2023ME001"),
    ("vikram.lal@nimbusu.edu", "Vikram", "Lal", "CS", "BTECHCS", 2, 2024, "A1", "A", "REG2024CS001"),
    ("neha.kapoor@nimbusu.edu", "Neha", "Kapoor", "CS", "BTECHCS", 2, 2024, "A2", "A", "REG2024CS002"),
    ("amit.thakur@nimbusu.edu", "Amit", "Thakur", "EC", "BTECHEC", 2, 2024, "A1", "A", "REG2024EC001"),
    ("pooja.rao@nimbusu.edu", "Pooja", "Rao", "CS", "BTECHCS", 4, 2023, "A2", "B", "REG2023CS003"),
    ("rahul.saxena@nimbusu.edu", "Rahul", "Saxena", "CS", "MTECHCS", 2, 2025, "B1", "B", "REG2025CS002"),
    ("deepika.nair@nimbusu.edu", "Deepika", "Nair", "ME", "BTECHME", 6, 2022, "A1", "A", "REG2022ME001"),
    ("siddharth.jain@nimbusu.edu", "Siddharth", "Jain", "CS", "BTECHCS", 6, 2022, "A1", "B", "REG2022CS003"),
    # ── Additional students for richer data ──
    ("tanvi.mehta@nimbusu.edu", "Tanvi", "Mehta", "EC", "BTECHEC", 4, 2023, "A2", "A", "REG2023EC002"),
    ("dev.chauhan@nimbusu.edu", "Dev", "Chauhan", "ME", "BTECHME", 2, 2024, "A1", "A", "REG2024ME001"),
    ("ishita.roy@nimbusu.edu", "Ishita", "Roy", "CS", "BTECHCS", 4, 2023, "A2", "A", "REG2023CS004"),
    ("manish.kumar@nimbusu.edu", "Manish", "Kumar", "EC", "MTECHEC", 2, 2025, "B1", "B", "REG2025EC001"),
    ("riya.agarwal@nimbusu.edu", "Riya", "Agarwal", "CS", "BTECHCS", 2, 2024, "A1", "B", "REG2024CS003"),
]

ROOMS = [
    ("Room 101", "Main Block", 60, "classroom"),
    ("Room 102", "Main Block", 60, "classroom"),
    ("Room 201", "Main Block", 120, "classroom"),
    ("CS Lab 1", "IT Block", 40, "lab"),
    ("CS Lab 2", "IT Block", 40, "lab"),
    ("EC Lab 1", "Electronics Block", 30, "lab"),
    ("Physics Lab", "Science Block", 35, "lab"),
    ("Seminar Hall", "Admin Block", 200, "auditorium"),
    ("Conference Room A", "Admin Block", 20, "conference"),
]

ANNOUNCEMENTS = [
    ("Mid-Semester Examination Schedule", "Mid-semester exams will be held from March 15-22, 2026. Detailed timetable is published on the portal.", False, "all"),
    ("Library Extended Hours During Exams", "Library will remain open until 11 PM during the examination period.", False, "all"),
    ("Annual Tech Fest — Technovista 2026", "Register for Technovista 2026 before March 5! Events include hackathon, paper presentation, and robotics.", True, "all"),
    ("Campus Maintenance — Water Supply Disruption", "Water supply will be disrupted on March 8 from 6 AM to 12 PM for maintenance work.", True, "all"),
    ("Scholarship Application Deadline", "Last date for merit scholarship applications is March 10, 2026.", False, "all"),
    ("Workshop on Cloud Computing", "AWS Cloud workshop on March 12 at Seminar Hall. Registration open for CS and EC students.", False, "department"),
    ("Sports Day Registration Open", "Annual Sports Day on March 25. Register with PE department by March 15.", False, "all"),
    ("Guest Lecture: AI in Healthcare", "Dr. Rajan Mehta from AIIMS will deliver a guest lecture on March 18 in Seminar Hall.", False, "department"),
]

CONTENT_ITEMS = [
    ("Introduction to Python — Lecture Notes", "document", "Comprehensive notes covering Python basics, data types, control structures."),
    ("Data Structures — Trees & Graphs Video", "video", "Recorded lecture on tree traversal and graph algorithms."),
    ("DBMS ER Diagram Reference", "image", "Entity-relationship diagram for the university management system project."),
    ("Machine Learning — Andrew Ng Course", "link", "Link to Stanford's free ML course on Coursera."),
    ("Operating Systems — Process Scheduling PDF", "document", "Notes on FCFS, SJF, Round Robin, and Priority scheduling."),
    ("Digital Electronics Lab Manual", "document", "Lab experiments for combinational and sequential circuits."),
    ("Signal Processing MATLAB Examples", "document", "MATLAB scripts for Fourier transforms and filter design."),
    ("Engineering Math Formulae Cheat Sheet", "document", "Quick reference for calculus and linear algebra formulas."),
    ("Computer Networks — TCP/IP Explained", "video", "Animated explanation of the TCP/IP protocol stack."),
    ("Database Normalization Tutorial", "link", "Interactive tutorial on 1NF, 2NF, 3NF, and BCNF."),
]

TAGS = ["python", "algorithms", "database", "machine-learning", "networking", "mathematics", "electronics", "lab", "exam-prep", "notes"]


class Command(BaseCommand):
    help = "Seed the entire NimbusU database with realistic test data"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete ALL data and recreate")

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write(self.style.WARNING("Flushing all seed data..."))
            self._flush()

        self.stdout.write(self.style.HTTP_INFO("\n🌱 Seeding NimbusU database...\n"))

        schools = self._seed_schools()
        depts = self._seed_departments(schools)
        programs = self._seed_programs(depts)
        semester = self._seed_semesters()
        courses = self._seed_courses(depts)
        self._seed_prerequisites(courses)
        admin = self._seed_admin(depts)
        faculty_users = self._seed_faculty(depts)
        student_users = self._seed_students(depts, programs)
        offerings = self._seed_offerings(courses, semester, faculty_users)
        self._seed_enrollments(student_users, offerings)
        rooms = self._seed_rooms()
        self._seed_timetable(offerings, semester)
        self._seed_room_bookings(rooms, admin, faculty_users, student_users)
        self._seed_swap_requests(offerings, faculty_users)
        self._seed_substitute_faculty(offerings, faculty_users, admin)
        self._seed_class_cancellations(offerings, student_users)
        self._seed_academic_calendar(semester, admin, depts)
        self._seed_assignments(offerings, faculty_users, student_users)
        self._seed_assignment_metadata(offerings, student_users)
        self._seed_grades(student_users, offerings)
        self._seed_student_tasks(student_users, offerings)
        self._seed_daily_questions(offerings, faculty_users, student_users)
        self._seed_announcements(admin, faculty_users, offerings)
        self._seed_forums(offerings, faculty_users, student_users)
        self._seed_content(offerings, faculty_users, student_users)
        self._seed_content_engagement(student_users)
        self._seed_messages(faculty_users, student_users)
        self._seed_notifications(student_users)
        self._seed_notification_preferences(admin, faculty_users, student_users)
        self._seed_user_preferences(admin, faculty_users, student_users)
        self._seed_webhooks(admin)
        self._seed_telemetry(admin, faculty_users, student_users)
        self._seed_audit_logs(admin, faculty_users)

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 55))
        self.stdout.write(self.style.SUCCESS("✅ Seed complete! Login credentials:"))
        self.stdout.write(self.style.SUCCESS("=" * 55))
        self.stdout.write(f"  {'admin':10s} → admin@nimbusu.edu / Admin@1234")
        for fd in FACULTY_DATA:
            self.stdout.write(f"  {'faculty':10s} → {fd[0]} / Faculty@1234")
        for sd in STUDENT_DATA[:3]:
            self.stdout.write(f"  {'student':10s} → {sd[0]} / Student@1234")
        self.stdout.write(f"  ... and {len(STUDENT_DATA)-3} more students (password: Student@1234)")
        self.stdout.write("")

    def _flush(self):
        """Remove all seeded data in reverse-dependency order."""
        models = [
            RequestLog, SiteSettings,
            WebhookDelivery, WebhookEndpoint,
            NotificationPreference, Notification, DiscussionPost, DiscussionForum, Message, Announcement,
            ClassCancellation, TimetableSwapRequest, SubstituteFaculty, RoomBooking, AttendanceRecord, TimetableEntry, Room,
            Bookmark, ContentAccessLog, ContentComment, ContentVersion, Content, ContentTag, ContentFolder,
            DailyQuestionResponse, DailyQuestionAssignment, StudentDailyQuestionPerformance, DailyQuestion,
            AssignmentGroup, RubricCriteria, GradingRubric, Submission, Assignment,
            Grade, StudentTask, Enrollment, CourseOffering, CoursePrerequisite, Course, AcademicEvent, Semester, Program,
            UserPreferences, AuditLog, StudentProfile, FacultyProfile,
        ]
        for m in models:
            count = m.objects.all().delete()[0]
            if count:
                self.stdout.write(f"  🗑  Deleted {count} {m.__name__} records")
        # Delete all seed users (including admin)
        seed_emails = (
            [f[0] for f in FACULTY_DATA]
            + [s[0] for s in STUDENT_DATA]
            + ["admin@nimbusu.edu"]
        )
        User.objects.filter(email__in=seed_emails).delete()
        Department.objects.all().delete()
        School.objects.all().delete()

    # ── Schools ──────────────────────────────────────────────────────
    def _seed_schools(self):
        schools = {}
        for code, name in SCHOOLS:
            school, created = School.objects.get_or_create(code=code, defaults={"name": name})
            schools[code] = school
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ School: {name}"))
        return schools

    # ── Departments ─────────────────────────────────────────────────
    def _seed_departments(self, schools):
        depts = {}
        for code, name, school_code in DEPARTMENTS:
            dept, created = Department.objects.get_or_create(
                code=code, defaults={"name": name, "school": schools.get(school_code)},
            )
            # Update school link if dept already exists but has no school
            if not created and not dept.school and school_code in schools:
                dept.school = schools[school_code]
                dept.save(update_fields=["school"])
            depts[code] = dept
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Department: {name} ({school_code})"))
        return depts

    # ── Programs ────────────────────────────────────────────────────
    def _seed_programs(self, depts):
        programs = {}
        for code, name, dept_code, dur, deg in PROGRAMS:
            prog, created = Program.objects.get_or_create(
                code=code,
                defaults={"name": name, "department": depts[dept_code], "duration_years": dur, "degree_type": deg},
            )
            programs[code] = prog
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Program: {name}"))
        return programs

    # ── Semesters ───────────────────────────────────────────────────
    def _seed_semesters(self):
        semesters = [
            ("Fall 2025", "2025-2026", "2025-08-01", "2025-12-15", False),
            ("Spring 2026", "2025-2026", "2026-01-10", "2026-05-15", True),
        ]
        current = None
        for name, ay, sd, ed, is_curr in semesters:
            sem, created = Semester.objects.get_or_create(
                name=name,
                defaults={"academic_year": ay, "start_date": sd, "end_date": ed, "is_current": is_curr},
            )
            if is_curr:
                current = sem
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Semester: {name}"))
        return current

    # ── Courses ─────────────────────────────────────────────────────
    def _seed_courses(self, depts):
        courses = {}
        for code, name, dept_code, credits, desc in COURSES:
            course, created = Course.objects.get_or_create(
                code=code,
                defaults={"name": name, "department": depts[dept_code], "credits": credits, "description": desc},
            )
            courses[code] = course
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Course: {code} — {name}"))
        return courses

    # ── Course Prerequisites ───────────────────────────────────────
    def _seed_prerequisites(self, courses):
        relationships = [
            ("CS201", "CS101", CoursePrerequisite.Type.PREREQUISITE, "C"),
            ("CS301", "CS201", CoursePrerequisite.Type.PREREQUISITE, "C"),
            ("CS302", "CS201", CoursePrerequisite.Type.PREREQUISITE, "C"),
            ("CS401", "CS301", CoursePrerequisite.Type.PREREQUISITE, "B"),
            ("CS402", "CS302", CoursePrerequisite.Type.COREQUISITE, ""),
            ("EC301", "EC201", CoursePrerequisite.Type.PREREQUISITE, "C"),
        ]
        count = 0
        for course_code, required_code, rel_type, min_grade in relationships:
            course = courses.get(course_code)
            required = courses.get(required_code)
            if not course or not required:
                continue
            _, created = CoursePrerequisite.objects.get_or_create(
                course=course,
                required_course=required,
                defaults={"type": rel_type, "min_grade": min_grade},
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Course prerequisites: {count}"))

    # ── Admin ───────────────────────────────────────────────────────
    def _seed_admin(self, depts):
        admin, created = User.objects.get_or_create(
            email="admin@nimbusu.edu",
            defaults={
                "first_name": "System", "last_name": "Admin", "role": "admin",
                "is_staff": True, "is_superuser": True, "department": depts["CS"],
                "phone": "+91-9000000001",
            },
        )
        if created:
            admin.set_password("Admin@1234")
            admin.save()
            self.stdout.write(self.style.SUCCESS("  ✅ Admin: admin@nimbusu.edu"))
        return admin

    # ── Faculty ─────────────────────────────────────────────────────
    def _seed_faculty(self, depts):
        faculty_users = []
        for email, first, last, dept_code, designation, spec in FACULTY_DATA:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first, "last_name": last, "role": "faculty",
                    "department": depts[dept_code], "phone": f"+91-9{random.randint(100000000, 999999999)}",
                },
            )
            if created:
                user.set_password("Faculty@1234")
                user.save()
                FacultyProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "employee_id": f"FAC{random.randint(1000, 9999)}",
                        "designation": designation,
                        "specialization": spec,
                        "joining_date": date(2020, random.randint(1, 12), random.randint(1, 28)),
                    },
                )
                self.stdout.write(self.style.SUCCESS(f"  ✅ Faculty: {first} {last}"))
            faculty_users.append(user)
        return faculty_users

    # ── Students ────────────────────────────────────────────────────
    def _seed_students(self, depts, programs):
        student_users = []
        for i, (email, first, last, dept_code, prog_code, sem, batch_year, batch, division, register_no) in enumerate(STUDENT_DATA):
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first, "last_name": last, "role": "student",
                    "department": depts[dept_code], "phone": f"+91-9{random.randint(100000000, 999999999)}",
                },
            )
            if created:
                user.set_password("Student@1234")
                user.save()
                StudentProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "student_id_number": f"NU{batch_year}{i+1:04d}",
                        "register_no": register_no,
                        "program": programs.get(prog_code),
                        "current_semester": sem,
                        "admission_date": date(batch_year, 8, 1),
                        "batch_year": batch_year,
                        "batch": batch,
                        "division": division,
                    },
                )
                self.stdout.write(self.style.SUCCESS(f"  ✅ Student: {first} {last} (Batch {batch}, Div {division})"))
            student_users.append(user)
        return student_users

    # ── Offerings ───────────────────────────────────────────────────
    def _seed_offerings(self, courses, semester, faculty_users):
        offerings = {}
        cs_faculty = [f for f in faculty_users if f.department and f.department.code == "CS"]
        ec_faculty = [f for f in faculty_users if f.department and f.department.code == "EC"]
        me_faculty = [f for f in faculty_users if f.department and f.department.code == "ME"]
        ma_faculty = [f for f in faculty_users if f.department and f.department.code == "MA"]

        faculty_map = {"CS": cs_faculty, "EC": ec_faculty, "ME": me_faculty, "MA": ma_faculty}

        for code, course in courses.items():
            dept_code = course.department.code
            pool = faculty_map.get(dept_code, cs_faculty)
            fac = pool[hash(code) % len(pool)] if pool else faculty_users[0]
            offering, created = CourseOffering.objects.get_or_create(
                course=course, semester=semester, section="A",
                defaults={"faculty": fac, "max_students": 60},
            )
            offerings[code] = offering
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Offering: {code} by {fac.first_name} {fac.last_name}"))
        return offerings

    # ── Enrollments ─────────────────────────────────────────────────
    def _seed_enrollments(self, student_users, offerings):
        count = 0
        cs_courses = ["CS101", "CS201", "CS301", "CS401", "CS302", "CS402"]
        ec_courses = ["EC201", "EC301"]
        me_courses = ["ME201"]
        general = ["MA101"]

        for stu in student_users:
            dept_code = stu.department.code if stu.department else "CS"
            if dept_code == "CS":
                course_pool = cs_courses + general
            elif dept_code == "EC":
                course_pool = ec_courses + general
            else:
                course_pool = me_courses + general

            # Enroll in 3-5 courses
            chosen = random.sample([c for c in course_pool if c in offerings], min(4, len(course_pool)))
            for code in chosen:
                _, created = Enrollment.objects.get_or_create(
                    student=stu, course_offering=offerings[code], defaults={"status": "active"},
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Enrollments: {count} created"))

    # ── Rooms ───────────────────────────────────────────────────────
    def _seed_rooms(self):
        rooms = {}
        for name, building, cap, rtype in ROOMS:
            room, created = Room.objects.get_or_create(
                name=name, defaults={"building": building, "capacity": cap, "room_type": rtype},
            )
            rooms[name] = room
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Room: {building} — {name}"))
        return rooms

    # ── Timetable ───────────────────────────────────────────────────
    def _seed_timetable(self, offerings, semester):
        """Seed a **conflict-free** timetable.

        Constraints enforced by design:
          • No two entries share the same (location, day, time-overlap).
          • No faculty teaches two entries that overlap on the same day.
          • Each course gets 2–3 weekly sessions (lecture + lab/tutorial).
          • Entries span Monday (0) through Saturday (5).

        Faculty-to-course mapping (from _seed_offerings, deterministic):
          CS101  → Dr. Priya Sharma  (CS[0])   CS201 → Dr. Arjun Reddy (CS[2])
          CS301  → Dr. Rajesh Kumar   (CS[1])   CS401 → Dr. Priya Sharma (CS[0])
          CS302  → Dr. Arjun Reddy    (CS[2])   CS402 → Dr. Rajesh Kumar (CS[1])
          EC201  → Dr. Kavitha Bose   (EC[1])   EC301 → Dr. Anita Desai  (EC[0])
          ME201  → Dr. Suresh Nair    (ME[0])   MA101 → Dr. Meena Iyer   (MA[0])
        """
        TimetableEntry.objects.all().delete()

        # ── Locations ────────────────────────────────────────────────
        # 5 classrooms, 4 labs, 3 tutorial rooms — used as string keys
        CR = [
            "Main Block Floor 1 Room 101",   # CR0
            "Main Block Floor 1 Room 102",   # CR1
            "Main Block Floor 2 Room 201",   # CR2
            "Main Block Floor 2 Room 202",   # CR3
            "Academic Block Room 301",       # CR4
        ]
        LB = [
            "IT Block CS Lab 1",             # LB0
            "IT Block CS Lab 2",             # LB1
            "Electronics Block EC Lab 1",    # LB2
            "Science Block Physics Lab",     # LB3
        ]
        TU = [
            "Tutorial Block Room T1",        # TU0
            "Tutorial Block Room T2",        # TU1
            "Main Block Floor 1 Room 105",   # TU2
        ]

        # ── Time slots ──────────────────────────────────────────────
        # Classrooms: 1-hour slots
        C1 = (time(9, 0), time(10, 0))
        C2 = (time(10, 0), time(11, 0))
        C3 = (time(11, 15), time(12, 15))
        C4 = (time(14, 0), time(15, 0))
        C5 = (time(15, 0), time(16, 0))
        # Labs: 2-hour slots
        L1 = (time(9, 0), time(11, 0))
        L2 = (time(11, 15), time(13, 15))
        L3 = (time(14, 0), time(16, 0))
        # Tutorials: 1-hour late-afternoon
        T1 = (time(16, 15), time(17, 15))

        # ── Schedule ────────────────────────────────────────────────
        # Format: (course_code, day, batch, subject_type, (start, end), location)
        #
        # Verified by hand: no (location, day, slot) or (faculty, day, slot) duplicates.

        SCHEDULE = [
            # ═══════════ MONDAY (0) ═══════════
            # Slot C1: Priya→CS101@CR0,  Rajesh→CS301@CR1
            ("CS101", 0, "A1", "classroom", C1, CR[0]),
            ("CS301", 0, "A1", "classroom", C1, CR[1]),
            # Slot C2: Priya→CS401@CR2,  Rajesh→CS402@CR3
            ("CS401", 0, "A1", "classroom", C2, CR[2]),
            ("CS402", 0, "A1", "classroom", C2, CR[3]),
            # Slot C3: Anita→EC301@CR4,  Meena→MA101@CR0
            ("EC301", 0, "A1", "classroom", C3, CR[4]),
            ("MA101", 0, "A1", "classroom", C3, CR[0]),
            # Slot C4: Kavitha→EC201@CR1, Suresh→ME201@CR2
            ("EC201", 0, "A1", "classroom", C4, CR[1]),
            ("ME201", 0, "A1", "classroom", C4, CR[2]),
            # Slot T1: Arjun→CS201 tutorial@TU0
            ("CS201", 0, "A1", "tutorial",  T1, TU[0]),

            # ═══════════ TUESDAY (1) ═══════════
            # Slot C1: Arjun→CS201@CR0,  Kavitha→EC201@CR1
            ("CS201", 1, "A1", "classroom", C1, CR[0]),
            ("EC201", 1, "A2", "classroom", C1, CR[1]),
            # Slot C2: Priya→CS101@CR2,  Anita→EC301@CR3
            ("CS101", 1, "A2", "classroom", C2, CR[2]),
            ("EC301", 1, "A1", "classroom", C2, CR[3]),
            # Slot C3: Rajesh→CS301@CR0,  Meena→MA101@CR4
            ("CS301", 1, "A2", "classroom", C3, CR[0]),
            ("MA101", 1, "A2", "classroom", C3, CR[4]),
            # Slot L3: Arjun→CS302 lab@LB0, Suresh→ME201 lab@LB3
            ("CS302", 1, "A1", "lab",       L3, LB[0]),
            ("ME201", 1, "A1", "lab",       L3, LB[3]),
            # Slot T1: Priya→CS401 tutorial@TU1
            ("CS401", 1, "A1", "tutorial",  T1, TU[1]),

            # ═══════════ WEDNESDAY (2) ═══════════
            # Slot L1: Priya→CS101 lab@LB0, Kavitha→EC201 lab@LB2
            ("CS101", 2, "A1", "lab",       L1, LB[0]),
            ("EC201", 2, "A1", "lab",       L1, LB[2]),
            # Slot C3: Arjun→CS302@CR0,  Rajesh→CS402@CR1
            ("CS302", 2, "A1", "classroom", C3, CR[0]),
            ("CS402", 2, "A1", "classroom", C3, CR[1]),
            # Slot C4: Priya→CS401@CR2,  Meena→MA101@CR3
            ("CS401", 2, "A2", "classroom", C4, CR[2]),
            ("MA101", 2, "B1", "classroom", C4, CR[3]),
            # Slot C5: Suresh→ME201@CR4, Anita→EC301@CR0
            ("ME201", 2, "A1", "classroom", C5, CR[4]),
            ("EC301", 2, "A1", "classroom", C5, CR[0]),
            # Slot T1: Rajesh→CS301 tutorial@TU0
            ("CS301", 2, "A1", "tutorial",  T1, TU[0]),

            # ═══════════ THURSDAY (3) ═══════════
            # Slot L1: Arjun→CS201 lab@LB0, Anita→EC301 lab@LB2
            ("CS201", 3, "A1", "lab",       L1, LB[0]),
            ("EC301", 3, "A1", "lab",       L1, LB[2]),
            # Slot C3: Priya→CS101@CR0,  Rajesh→CS301@CR1
            ("CS101", 3, "B1", "classroom", C3, CR[0]),
            ("CS301", 3, "B1", "classroom", C3, CR[1]),
            # Slot C4: Arjun→CS302@CR2,  Kavitha→EC201@CR3
            ("CS302", 3, "A2", "classroom", C4, CR[2]),
            ("EC201", 3, "A1", "classroom", C4, CR[3]),
            # Slot C5: Priya→CS401@CR4,  Meena→MA101@CR0
            ("CS401", 3, "A1", "classroom", C5, CR[4]),
            ("MA101", 3, "A1", "classroom", C5, CR[0]),
            # Slot T1: Rajesh→CS402 tutorial@TU2
            ("CS402", 3, "A1", "tutorial",  T1, TU[2]),

            # ═══════════ FRIDAY (4) ═══════════
            # Slot C1: Rajesh→CS402@CR0,  Suresh→ME201@CR1
            ("CS402", 4, "B1", "classroom", C1, CR[0]),
            ("ME201", 4, "A1", "classroom", C1, CR[1]),
            # Slot L1: Priya→CS401 lab@LB1, Kavitha→EC201 lab@LB2
            ("CS401", 4, "B1", "lab",       L1, LB[1]),
            ("EC201", 4, "A2", "lab",       L1, LB[2]),
            # Slot C3: Arjun→CS201@CR2,  Meena→MA101@CR3
            ("CS201", 4, "A2", "classroom", C3, CR[2]),
            ("MA101", 4, "A1", "classroom", C3, CR[3]),
            # Slot C4: Priya→CS101@CR4,  Rajesh→CS301@CR0
            ("CS101", 4, "A1", "classroom", C4, CR[4]),
            ("CS301", 4, "A1", "classroom", C4, CR[0]),
            # Slot T1: Arjun→CS302 tutorial@TU0
            ("CS302", 4, "A1", "tutorial",  T1, TU[0]),

            # ═══════════ SATURDAY (5) ═══════════
            # Slot L1: Rajesh→CS301 lab@LB1, Arjun→CS201 lab@LB0
            ("CS301", 5, "A1", "lab",       L1, LB[1]),
            ("CS201", 5, "B1", "lab",       L1, LB[0]),
            # Slot C3: Priya→CS101@CR0,  Kavitha→EC201@CR1
            ("CS101", 5, "A2", "classroom", C3, CR[0]),
            ("EC201", 5, "A1", "classroom", C3, CR[1]),
            # Slot L3: Rajesh→CS402 lab@LB1, Suresh→ME201 lab@LB3
            ("CS402", 5, "A1", "lab",       L3, LB[1]),
            ("ME201", 5, "A1", "lab",       L3, LB[3]),
            # Slot T1: Meena→MA101 tutorial@TU1
            ("MA101", 5, "A2", "tutorial",  T1, TU[1]),
        ]

        count = 0
        for code, day, batch, stype, (start_t, end_t), location in SCHEDULE:
            offering = offerings.get(code)
            if not offering:
                continue
            TimetableEntry.objects.create(
                course_offering=offering,
                batch=batch,
                subject_type=stype,
                location=location,
                day_of_week=day,
                start_time=start_t,
                end_time=end_t,
                semester=semester,
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Timetable entries: {count}"))

    # ── Swap Requests ───────────────────────────────────────────────
    def _seed_swap_requests(self, offerings, faculty_users):
        """Seed sample timetable swap requests between faculty."""
        TimetableSwapRequest.objects.all().delete()

        # Find two entries owned by different faculty to create a swap
        cs101_entries = TimetableEntry.objects.filter(
            course_offering=offerings.get("CS101")
        ).order_by("day_of_week")
        cs301_entries = TimetableEntry.objects.filter(
            course_offering=offerings.get("CS301")
        ).order_by("day_of_week")

        count = 0
        if cs101_entries.exists() and cs301_entries.exists():
            # Pending swap: Priya (CS101) wants to swap with Rajesh (CS301)
            req_entry = cs101_entries.first()
            tgt_entry = cs301_entries.first()
            if req_entry and tgt_entry:
                requester = req_entry.course_offering.faculty
                target = tgt_entry.course_offering.faculty
                if requester != target:
                    TimetableSwapRequest.objects.create(
                        requester=requester,
                        target_faculty=target,
                        requester_entry=req_entry,
                        target_entry=tgt_entry,
                        message="Hi, could we swap our Monday morning slots? I have a faculty meeting at 9 AM.",
                        status="pending",
                    )
                    count += 1

        # A second swap using different courses
        cs401_entries = TimetableEntry.objects.filter(
            course_offering=offerings.get("CS401")
        ).order_by("day_of_week")
        cs402_entries = TimetableEntry.objects.filter(
            course_offering=offerings.get("CS402")
        ).order_by("day_of_week")

        if cs401_entries.exists() and cs402_entries.exists():
            req_entry = cs401_entries.first()
            tgt_entry = cs402_entries.first()
            if req_entry and tgt_entry:
                requester = req_entry.course_offering.faculty
                target = tgt_entry.course_offering.faculty
                if requester != target:
                    TimetableSwapRequest.objects.create(
                        requester=requester,
                        target_faculty=target,
                        requester_entry=req_entry,
                        target_entry=tgt_entry,
                        message="Would you mind switching our Wednesday slots? The lab equipment I need is only available in the afternoon.",
                        status="pending",
                    )
                    count += 1

        self.stdout.write(self.style.SUCCESS(f"  ✅ Swap requests: {count}"))

    # ── Class Cancellations ─────────────────────────────────────────
    def _seed_class_cancellations(self, offerings, student_users):
        count = 0
        cs401_entries = TimetableEntry.objects.filter(
            course_offering=offerings.get("CS401")
        ).order_by("day_of_week")

        if cs401_entries.exists():
            entry = cs401_entries.first()
            # 1. Cancel a class
            ClassCancellation.objects.create(
                timetable_entry=entry,
                original_date=date(2026, 3, 10),
                action="cancelled",
                reason="Faculty attending a conference",
                cancelled_by=entry.course_offering.faculty,
            )
            count += 1

            # 2. Reschedule a class
            if cs401_entries.count() > 1:
                entry2 = cs401_entries.last()
                ClassCancellation.objects.create(
                    timetable_entry=entry2,
                    original_date=date(2026, 3, 12),
                    action="rescheduled",
                    reason="Doctor appointment",
                    new_date=date(2026, 3, 13),
                    new_start_time=time(16, 15),
                    new_end_time=time(17, 15),
                    new_location="Seminar Hall",
                    cancelled_by=entry2.course_offering.faculty,
                )
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Class Cancellations: {count}"))

    # ── Room Bookings ──────────────────────────────────────────────
    def _seed_room_bookings(self, rooms, admin, faculty_users, student_users):
        booking_data = [
            ("Seminar Hall", faculty_users[0], date(2026, 3, 18), time(14, 0), time(16, 0), "AI in Healthcare guest lecture", "approved", admin),
            ("Conference Room A", faculty_users[1], date(2026, 3, 11), time(11, 0), time(12, 0), "Database curriculum review meeting", "approved", admin),
            ("CS Lab 1", student_users[0], date(2026, 3, 20), time(16, 0), time(18, 0), "Hackathon practice session", "pending", None),
        ]
        count = 0
        for room_name, booked_by, day, start_t, end_t, purpose, status, approved_by in booking_data:
            room = rooms.get(room_name)
            if not room:
                continue
            _, created = RoomBooking.objects.get_or_create(
                room=room,
                date=day,
                start_time=start_t,
                defaults={
                    "end_time": end_t,
                    "booked_by": booked_by,
                    "purpose": purpose,
                    "status": status,
                    "approved_by": approved_by,
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Room bookings: {count}"))

    # ── Substitute Faculty ─────────────────────────────────────────
    def _seed_substitute_faculty(self, offerings, faculty_users, admin):
        count = 0
        replacements = [
            ("CS401", date(2026, 3, 13), faculty_users[1], "Covering due to external workshop"),
            ("EC201", date(2026, 3, 14), faculty_users[2], "Faculty medical leave"),
        ]
        for course_code, target_date, substitute, reason in replacements:
            offering = offerings.get(course_code)
            entry = TimetableEntry.objects.filter(course_offering=offering).first() if offering else None
            if not entry:
                continue
            _, created = SubstituteFaculty.objects.get_or_create(
                timetable_entry=entry,
                date=target_date,
                defaults={
                    "substitute": substitute,
                    "reason": reason,
                    "assigned_by": admin,
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Substitute faculty assignments: {count}"))

    # ── Academic Calendar ───────────────────────────────────────────
    def _seed_academic_calendar(self, semester, admin, depts):
        events = [
            ("Holi Holiday", "Festival of colors", "holiday", date(2026, 3, 4), date(2026, 3, 4), True, None),
            ("Mid-Semester Exams", "Spring 2026 Mid-sems", "exam", date(2026, 3, 15), date(2026, 3, 22), True, None),
            ("Tech Symposium", "Annual tech fest", "event", date(2026, 4, 10), date(2026, 4, 12), False, depts.get("CS")),
            ("Course Registration Deadline", "Last day to add/drop", "deadline", date(2026, 1, 25), date(2026, 1, 25), True, None),
        ]
        count = 0
        for title, desc, etype, start, end, is_uni, dept in events:
            _, created = AcademicEvent.objects.get_or_create(
                title=title, semester=semester,
                defaults={
                    "description": desc, "event_type": etype,
                    "start_date": start, "end_date": end,
                    "is_university_wide": is_uni, "department": dept,
                    "created_by": admin,
                }
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Academic Events: {count}"))

    # ── Assignments ─────────────────────────────────────────────────
    def _seed_assignments(self, offerings, faculty_users, student_users):
        now = timezone.now()
        assignment_data = [
            ("Array Sorting Implementation", "assignment", "CS201", 100, 14),
            ("SQL Query Practice", "assignment", "CS301", 50, 10),
            ("Linear Regression Project", "project", "CS401", 200, 30),
            ("Quiz 1 — Data Structures", "quiz", "CS201", 25, -5),  # past due
            ("Mid-Sem Exam — DBMS", "exam", "CS301", 100, -2),
            ("Python Basics Assignment", "assignment", "CS101", 50, 21),
            ("OS Process Scheduling Report", "assignment", "CS302", 75, 7),
            ("Network Packet Analysis", "project", "CS402", 150, 25),
            ("Digital Logic Quiz", "quiz", "EC201", 30, 3),
            ("Heat Engine Analysis", "assignment", "ME201", 60, 12),
        ]
        a_count = 0
        s_count = 0
        for title, atype, course_code, max_marks, days_offset in assignment_data:
            offering = offerings.get(course_code)
            if not offering:
                continue
            assignment, created = Assignment.objects.get_or_create(
                title=title, course_offering=offering,
                defaults={
                    "description": f"Complete the {title.lower()} as per instructions.",
                    "created_by": offering.faculty,
                    "due_date": now + timedelta(days=days_offset),
                    "max_marks": Decimal(str(max_marks)),
                    "assignment_type": atype,
                    "is_published": True,
                },
            )
            if created:
                a_count += 1
                # Create some submissions for past-due assignments
                if days_offset < 0:
                    enrolled = Enrollment.objects.filter(course_offering=offering).select_related("student")[:5]
                    for enr in enrolled:
                        _, sub_created = Submission.objects.get_or_create(
                            assignment=assignment, student=enr.student,
                            defaults={
                                "text_content": f"Solution submitted by {enr.student.first_name}.",
                                "marks_obtained": Decimal(str(random.randint(int(max_marks * 0.5), max_marks))),
                                "grade": random.choice(["A", "A+", "B+", "B", "A"]),
                                "feedback": "Good work!",
                                "graded_by": offering.faculty,
                                "graded_at": now - timedelta(days=abs(days_offset) - 1),
                                "status": "graded",
                            },
                        )
                        if sub_created:
                            s_count += 1

        self.stdout.write(self.style.SUCCESS(f"  ✅ Assignments: {a_count}, Submissions: {s_count}"))

    # ── Assignment Metadata ────────────────────────────────────────
    def _seed_assignment_metadata(self, offerings, student_users):
        rubric_count = 0
        criteria_count = 0
        group_count = 0

        rubric_templates = {
            "Linear Regression Project": [
                ("Problem Understanding", "Clear formulation of the ML problem.", Decimal("40.00")),
                ("Model Implementation", "Correct implementation and experimentation.", Decimal("100.00")),
                ("Evaluation & Insights", "Analysis of results and improvements.", Decimal("60.00")),
            ],
            "Network Packet Analysis": [
                ("Capture Quality", "Representative packet captures collected.", Decimal("40.00")),
                ("Protocol Analysis", "Correct interpretation of network traffic.", Decimal("70.00")),
                ("Reporting", "Concise findings with screenshots.", Decimal("40.00")),
            ],
        }

        for title, criteria in rubric_templates.items():
            assignment = Assignment.objects.filter(title=title).select_related("created_by").first()
            if not assignment:
                continue
            rubric, created = GradingRubric.objects.get_or_create(
                assignment=assignment,
                defaults={"created_by": assignment.created_by},
            )
            if created:
                rubric_count += 1
            for order, (name, description, marks) in enumerate(criteria, start=1):
                _, criterion_created = RubricCriteria.objects.get_or_create(
                    rubric=rubric,
                    name=name,
                    defaults={
                        "description": description,
                        "max_marks": marks,
                        "order": order,
                    },
                )
                if criterion_created:
                    criteria_count += 1

        group_assignments = Assignment.objects.filter(assignment_type="project").select_related("course_offering")
        for assignment in group_assignments:
            enrollments = list(
                Enrollment.objects.filter(course_offering=assignment.course_offering).select_related("student")[:6]
            )
            if len(enrollments) < 3:
                continue
            for idx, members in enumerate((enrollments[:3], enrollments[3:6]), start=1):
                if not members:
                    continue
                group, created = AssignmentGroup.objects.get_or_create(
                    assignment=assignment,
                    name=f"Team {idx}",
                )
                group.members.set([member.student for member in members])
                if created:
                    group_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"  ✅ Assignment metadata: {rubric_count} rubrics, {criteria_count} criteria, {group_count} groups"
            )
        )

    # ── Grades ─────────────────────────────────────────────────────
    def _seed_grades(self, student_users, offerings):
        grade_scale = ["O", "A+", "A", "B+", "B", "C"]
        target_courses = ["CS101", "CS201", "EC201", "MA101"]
        count = 0
        for course_code in target_courses:
            offering = offerings.get(course_code)
            if not offering:
                continue
            enrollments = Enrollment.objects.filter(course_offering=offering).select_related("student")[:5]
            for idx, enrollment in enumerate(enrollments):
                letter = grade_scale[(idx + len(course_code)) % len(grade_scale)]
                _, created = Grade.objects.get_or_create(
                    student=enrollment.student,
                    course_offering=offering,
                    defaults={
                        "grade_letter": letter,
                        "credits_earned": offering.course.credits if letter not in {"F", "W", "I"} else 0,
                        "remarks": "Published from seed data",
                        "published_at": timezone.now() - timedelta(days=7),
                    },
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Grades: {count}"))

    # ── Student Tasks ──────────────────────────────────────────────
    def _seed_student_tasks(self, student_users, offerings):
        task_templates = [
            ("Revise DSA recursion patterns", "Practice at least 10 recursion problems before the quiz.", "CS201", 2, False),
            ("Prepare DBMS normalization notes", "Summarize 1NF to BCNF with examples.", "CS301", 4, False),
            ("Complete ML dataset cleanup", "Finalize data preprocessing notebook for mini-project.", "CS401", 1, True),
            ("Review attendance shortage", "Meet mentor if attendance drops below threshold.", None, 5, False),
        ]
        count = 0
        for idx, student in enumerate(student_users[:8]):
            for title, description, course_code, days_ahead, completed in task_templates[:2 + (idx % 2)]:
                course_offering = offerings.get(course_code) if course_code else None
                _, created = StudentTask.objects.get_or_create(
                    student=student,
                    title=title,
                    defaults={
                        "description": description,
                        "course_offering": course_offering,
                        "due_date": timezone.now() + timedelta(days=days_ahead + idx % 3),
                        "is_completed": completed and idx % 3 == 0,
                    },
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Student tasks: {count}"))

    # ── Daily Questions ────────────────────────────────────────────
    def _seed_daily_questions(self, offerings, faculty_users, student_users):
        today = timezone.localdate()
        question_templates = [
            {
                "title": "Python List Comprehension Warm-up",
                "course": "CS101",
                "question_type": DailyQuestion.QuestionType.SINGLE,
                "difficulty": DailyQuestion.DifficultyLevel.EASY,
                "points": 5,
                "time_limit": 10,
                "offset": 0,
                "start": time(9, 0),
                "end": time(18, 0),
                "question_text": "Which expression creates a list of squares from 1 to 5 in Python?",
                "options": [
                    {"id": 1, "text": "[x*x for x in range(1, 6)]"},
                    {"id": 2, "text": "list(x^2 for x in 1..5)"},
                    {"id": 3, "text": "square(range(1, 6))"},
                ],
                "correct_answer": 1,
            },
            {
                "title": "Complexity of Binary Search",
                "course": "CS201",
                "question_type": DailyQuestion.QuestionType.SINGLE,
                "difficulty": DailyQuestion.DifficultyLevel.EASY,
                "points": 5,
                "time_limit": 8,
                "offset": -1,
                "start": time(10, 0),
                "end": time(17, 0),
                "question_text": "What is the time complexity of binary search on a sorted array?",
                "options": [
                    {"id": 1, "text": "O(log n)"},
                    {"id": 2, "text": "O(n)"},
                    {"id": 3, "text": "O(n log n)"},
                    {"id": 4, "text": "O(1)"},
                ],
                "correct_answer": 1,
            },
            {
                "title": "Normalization Check",
                "course": "CS301",
                "question_type": DailyQuestion.QuestionType.MCQ,
                "difficulty": DailyQuestion.DifficultyLevel.MEDIUM,
                "points": 8,
                "time_limit": 12,
                "offset": -2,
                "start": time(9, 30),
                "end": time(17, 30),
                "question_text": "Which of the following statements about 3NF are correct?",
                "options": [
                    {"id": 1, "text": "Every non-key attribute depends only on the key."},
                    {"id": 2, "text": "Transitive dependencies are eliminated."},
                    {"id": 3, "text": "It always removes all anomalies without any tradeoff."},
                    {"id": 4, "text": "A table in BCNF is always in 3NF."},
                ],
                "correct_answer": [1, 2, 4],
            },
            {
                "title": "Linear Regression Gradient Step",
                "course": "CS401",
                "question_type": DailyQuestion.QuestionType.PROGRAMMING,
                "difficulty": DailyQuestion.DifficultyLevel.MEDIUM,
                "points": 15,
                "time_limit": 20,
                "offset": 1,
                "start": time(8, 0),
                "end": time(20, 0),
                "question_text": "Write a function `gradient_step(w, grad, lr)` that returns the updated parameter after one gradient descent step.",
                "correct_answer": "return w - lr * grad",
                "test_cases": [
                    {"input": "w=10, grad=2, lr=0.1", "expected_output": "9.8"},
                    {"input": "w=-1, grad=-4, lr=0.5", "expected_output": "1.0"},
                ],
                "starter_code": "def gradient_step(w, grad, lr):\n    # TODO: implement\n    pass\n",
                "language": "python",
            },
            {
                "title": "Deadlock Conditions",
                "course": "CS302",
                "question_type": DailyQuestion.QuestionType.MCQ,
                "difficulty": DailyQuestion.DifficultyLevel.MEDIUM,
                "points": 10,
                "time_limit": 15,
                "offset": 0,
                "start": time(13, 0),
                "end": time(22, 0),
                "question_text": "Select the Coffman conditions required for deadlock.",
                "options": [
                    {"id": 1, "text": "Mutual exclusion"},
                    {"id": 2, "text": "Preemption"},
                    {"id": 3, "text": "Hold and wait"},
                    {"id": 4, "text": "Circular wait"},
                ],
                "correct_answer": [1, 3, 4],
            },
            {
                "title": "HTTP vs TCP",
                "course": "CS402",
                "question_type": DailyQuestion.QuestionType.SINGLE,
                "difficulty": DailyQuestion.DifficultyLevel.EASY,
                "points": 5,
                "time_limit": 8,
                "offset": -3,
                "start": time(9, 0),
                "end": time(16, 0),
                "question_text": "HTTP is primarily an application layer protocol built on top of which transport protocol?",
                "options": [
                    {"id": 1, "text": "UDP"},
                    {"id": 2, "text": "TCP"},
                    {"id": 3, "text": "IP"},
                ],
                "correct_answer": 2,
            },
            {
                "title": "K-map Reduction",
                "course": "EC201",
                "question_type": DailyQuestion.QuestionType.SINGLE,
                "difficulty": DailyQuestion.DifficultyLevel.MEDIUM,
                "points": 6,
                "time_limit": 10,
                "offset": 2,
                "start": time(9, 0),
                "end": time(17, 0),
                "question_text": "What is the primary purpose of a Karnaugh map?",
                "options": [
                    {"id": 1, "text": "To simplify boolean expressions"},
                    {"id": 2, "text": "To design flip-flops"},
                    {"id": 3, "text": "To count clock cycles"},
                ],
                "correct_answer": 1,
            },
            {
                "title": "Fourier Transform Concept",
                "course": "EC301",
                "question_type": DailyQuestion.QuestionType.SINGLE,
                "difficulty": DailyQuestion.DifficultyLevel.MEDIUM,
                "points": 7,
                "time_limit": 9,
                "offset": -1,
                "start": time(11, 0),
                "end": time(18, 0),
                "question_text": "The Fourier transform converts a signal from which domain to which domain?",
                "options": [
                    {"id": 1, "text": "Frequency to time"},
                    {"id": 2, "text": "Time to frequency"},
                    {"id": 3, "text": "Analog to digital"},
                ],
                "correct_answer": 2,
            },
        ]

        q_count = 0
        assignment_count = 0
        response_count = 0

        for template in question_templates:
            offering = offerings.get(template["course"])
            if not offering:
                continue
            question, created = DailyQuestion.objects.get_or_create(
                title=template["title"],
                course_offering=offering,
                defaults={
                    "description": f"Daily practice question for {offering.course.name}",
                    "question_type": template["question_type"],
                    "difficulty": template["difficulty"],
                    "question_text": template["question_text"],
                    "options": template.get("options"),
                    "correct_answer": template["correct_answer"],
                    "test_cases": template.get("test_cases"),
                    "starter_code": template.get("starter_code"),
                    "language": template.get("language"),
                    "points": template["points"],
                    "time_limit_minutes": template["time_limit"],
                    "scheduled_date": today + timedelta(days=template["offset"]),
                    "start_time": template["start"],
                    "end_time": template["end"],
                    "is_active": True,
                    "created_by": offering.faculty,
                },
            )
            if created:
                q_count += 1

            enrollments = list(
                Enrollment.objects.filter(course_offering=offering).select_related("student")[:6]
            )
            for index, enrollment in enumerate(enrollments):
                batch = getattr(enrollment.student.student_profile, "batch", None)
                status = DailyQuestionAssignment.Status.ASSIGNED
                started_at = None
                submitted_at = None
                time_taken_seconds = None
                is_correct = False
                points_earned = 0

                if template["offset"] > 0:
                    status = DailyQuestionAssignment.Status.PENDING
                elif template["offset"] == 0:
                    status = [
                        DailyQuestionAssignment.Status.ASSIGNED,
                        DailyQuestionAssignment.Status.STARTED,
                        DailyQuestionAssignment.Status.SUBMITTED,
                    ][index % 3]
                else:
                    status = [
                        DailyQuestionAssignment.Status.GRADED,
                        DailyQuestionAssignment.Status.SUBMITTED,
                        DailyQuestionAssignment.Status.EXPIRED,
                    ][index % 3]

                if status in {
                    DailyQuestionAssignment.Status.STARTED,
                    DailyQuestionAssignment.Status.SUBMITTED,
                    DailyQuestionAssignment.Status.GRADED,
                }:
                    started_at = timezone.now() - timedelta(days=max(abs(template["offset"]), 0), minutes=question.time_limit_minutes + 5)
                    time_taken_seconds = random.randint(90, question.time_limit_minutes * 60)

                if status in {
                    DailyQuestionAssignment.Status.SUBMITTED,
                    DailyQuestionAssignment.Status.GRADED,
                }:
                    submitted_at = (started_at or timezone.now()) + timedelta(seconds=time_taken_seconds or 180)
                    is_correct = index % 2 == 0
                    points_earned = question.points if is_correct else max(0, question.points // 2)

                assignment, assignment_created = DailyQuestionAssignment.objects.get_or_create(
                    question=question,
                    student=enrollment.student,
                    defaults={
                        "batch": batch,
                        "status": status,
                        "started_at": started_at,
                        "submitted_at": submitted_at,
                        "time_taken_seconds": time_taken_seconds,
                        "points_earned": points_earned,
                        "is_correct": is_correct,
                    },
                )
                if assignment_created:
                    assignment_count += 1

                if status in {
                    DailyQuestionAssignment.Status.SUBMITTED,
                    DailyQuestionAssignment.Status.GRADED,
                }:
                    response_defaults = {
                        "is_correct": is_correct,
                        "marks_obtained": Decimal(str(points_earned)),
                        "ip_address": f"192.168.10.{10 + index}",
                        "user_agent": "NimbusU Seed Browser",
                        "submitted_at": submitted_at or timezone.now(),
                    }
                    if question.question_type == DailyQuestion.QuestionType.PROGRAMMING:
                        response_defaults["code_answer"] = "def gradient_step(w, grad, lr):\n    return w - lr * grad\n"
                        response_defaults["output_result"] = "All test cases passed" if is_correct else "1 test case failed"
                    else:
                        selected = question.correct_answer if is_correct else ([question.options[0]["id"]] if question.question_type == DailyQuestion.QuestionType.MCQ else [question.options[-1]["id"]])
                        if question.question_type == DailyQuestion.QuestionType.SINGLE:
                            selected = [question.correct_answer if is_correct else question.options[-1]["id"]]
                        response_defaults["selected_options"] = selected

                    _, response_created = DailyQuestionResponse.objects.get_or_create(
                        assignment=assignment,
                        defaults=response_defaults,
                    )
                    if response_created:
                        response_count += 1

        self._seed_daily_question_performance(student_users)
        self.stdout.write(
            self.style.SUCCESS(
                f"  ✅ Daily questions: {q_count}, assignments: {assignment_count}, responses: {response_count}"
            )
        )

    def _seed_daily_question_performance(self, student_users):
        perf_count = 0
        for student in student_users:
            assignments = list(
                DailyQuestionAssignment.objects.filter(student=student)
                .select_related("question")
                .order_by("question__scheduled_date")
            )
            if not assignments:
                continue

            by_date = {}
            for assignment in assignments:
                day = assignment.question.scheduled_date
                bucket = by_date.setdefault(
                    day,
                    {
                        "total_assigned": 0,
                        "total_submitted": 0,
                        "total_correct": 0,
                        "total_points_earned": 0,
                        "total_time_seconds": 0,
                    },
                )
                bucket["total_assigned"] += 1
                if assignment.status in {
                    DailyQuestionAssignment.Status.SUBMITTED,
                    DailyQuestionAssignment.Status.GRADED,
                }:
                    bucket["total_submitted"] += 1
                if assignment.is_correct:
                    bucket["total_correct"] += 1
                bucket["total_points_earned"] += assignment.points_earned
                bucket["total_time_seconds"] += assignment.time_taken_seconds or 0

            current_streak = 0
            longest_streak = 0
            for day in sorted(by_date.keys()):
                metrics = by_date[day]
                current_streak = current_streak + 1 if metrics["total_correct"] > 0 else 0
                longest_streak = max(longest_streak, current_streak)
                _, created = StudentDailyQuestionPerformance.objects.update_or_create(
                    student=student,
                    date=day,
                    defaults={
                        **metrics,
                        "current_streak": current_streak,
                        "longest_streak": longest_streak,
                    },
                )
                if created:
                    perf_count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Daily question performance rows: {perf_count}"))

    # ── Announcements ───────────────────────────────────────────────
    def _seed_announcements(self, admin, faculty_users, offerings):
        count = 0
        for i, (title, body, urgent, target) in enumerate(ANNOUNCEMENTS):
            author = admin if i < 5 else random.choice(faculty_users)
            _, created = Announcement.objects.get_or_create(
                title=title,
                defaults={
                    "body": body, "created_by": author, "target_type": target,
                    "is_urgent": urgent, "is_published": True,
                },
            )
            if created:
                count += 1

        course_targets = [
            ("CS201", "DSA Lab This Week", "Please complete the graph traversal worksheet before Saturday lab.", False),
            ("CS301", "DBMS Project Milestone", "ER diagram review will happen in next class. Upload draft before Monday.", True),
            ("EC201", "Logic Design Quiz Reminder", "Quiz on Karnaugh maps will be conducted during Thursday session.", False),
        ]
        for course_code, title, body, urgent in course_targets:
            offering = offerings.get(course_code)
            if not offering:
                continue
            _, created = Announcement.objects.get_or_create(
                title=title,
                target_id=offering.id,
                defaults={
                    "body": body,
                    "created_by": offering.faculty,
                    "target_type": Announcement.TargetType.COURSE,
                    "is_urgent": urgent,
                    "is_published": True,
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Announcements: {count}"))

    # ── Forums ─────────────────────────────────────────────────────
    def _seed_forums(self, offerings, faculty_users, student_users):
        forum_specs = [
            ("CS201", "Week 5 Doubt Clearing Forum"),
            ("CS301", "Mini Project Discussion"),
            ("CS401", "Model Evaluation Q&A"),
        ]
        forum_count = 0
        post_count = 0
        for course_code, title in forum_specs:
            offering = offerings.get(course_code)
            if not offering:
                continue
            forum, created = DiscussionForum.objects.get_or_create(
                title=title,
                course_offering=offering,
                defaults={"created_by": offering.faculty, "is_active": True},
            )
            if created:
                forum_count += 1

            sample_students = list(
                Enrollment.objects.filter(course_offering=offering).select_related("student")[:3]
            )
            if not sample_students:
                continue
            starter, starter_created = DiscussionPost.objects.get_or_create(
                forum=forum,
                author=sample_students[0].student,
                body="Can someone share a good approach to prepare for this week's topic?",
                parent=None,
            )
            if starter_created:
                post_count += 1
            _, reply_created = DiscussionPost.objects.get_or_create(
                forum=forum,
                author=offering.faculty,
                parent=starter,
                body="Start with the lecture slides, then solve the practice sheet uploaded in course content.",
            )
            if reply_created:
                post_count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Forums: {forum_count}, Posts: {post_count}"))

    # ── Content ─────────────────────────────────────────────────────
    def _seed_content(self, offerings, faculty_users, student_users):
        # Tags
        tag_objs = {}
        for t in TAGS:
            tag, _ = ContentTag.objects.get_or_create(name=t)
            tag_objs[t] = tag

        # Folder
        folder, _ = ContentFolder.objects.get_or_create(
            name="Course Materials",
            defaults={"created_by": faculty_users[0], "visibility": "public"},
        )

        cs_offering = offerings.get("CS201") or list(offerings.values())[0]
        count = 0
        for title, ctype, desc in CONTENT_ITEMS:
            uploader = random.choice(faculty_users)
            content, created = Content.objects.get_or_create(
                title=title,
                defaults={
                    "description": desc,
                    "content_type": ctype,
                    "uploaded_by": uploader,
                    "folder": folder,
                    "course_offering": cs_offering,
                    "visibility": "course",
                    "is_published": True,
                    "external_url": "https://example.com/resource" if ctype == "link" else None,
                },
            )
            if created:
                content.tags.set(random.sample(list(tag_objs.values()), min(3, len(tag_objs))))
                
                # Add versions
                ContentVersion.objects.create(
                    content=content, version_number=1,
                    change_summary="Initial upload", uploaded_by=uploader,
                )
                if random.choice([True, False]):
                    ContentVersion.objects.create(
                        content=content, version_number=2,
                        change_summary="Updated typos", uploaded_by=uploader,
                    )
                
                # Add comments if there are students
                if student_users:
                    stu = random.choice(student_users)
                    c1 = ContentComment.objects.create(
                        content=content, author=stu, body="Thanks for sharing this!"
                    )
                    ContentComment.objects.create(
                        content=content, author=uploader, parent=c1, body="You're welcome. Let me know if you have questions."
                    )
                
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Content items: {count}, Tags: {len(tag_objs)}"))

    # ── Content Engagement ─────────────────────────────────────────
    def _seed_content_engagement(self, student_users):
        contents = list(Content.objects.all()[:8])
        bookmark_count = 0
        log_count = 0
        for idx, student in enumerate(student_users[:6]):
            for content in contents[idx % 3: idx % 3 + 2]:
                _, bookmark_created = Bookmark.objects.get_or_create(user=student, content=content)
                if bookmark_created:
                    bookmark_count += 1
                _, log_created = ContentAccessLog.objects.get_or_create(
                    content=content,
                    user=student,
                    action=ContentAccessLog.Action.VIEWED,
                    defaults={"duration_seconds": random.randint(45, 420)},
                )
                if log_created:
                    log_count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Content engagement: {bookmark_count} bookmarks, {log_count} access logs"))

    # ── Messages ────────────────────────────────────────────────────
    def _seed_messages(self, faculty_users, student_users):
        messages_data = [
            (0, 0, "Doubt in Assignment 1", "Sir, I have a doubt regarding the sorting algorithm implementation."),
            (0, 1, "Re: Doubt in Assignment 1", "Please refer to the lecture notes on merge sort."),
            (1, 0, "Lab Schedule Change", "The lab session for Tuesday has been moved to Thursday."),
            (2, 0, "Project Team Formation", "Please form teams of 3 for the ML project by this Friday."),
            (3, 0, "Grade Query", "Ma'am, my quiz marks seem incorrect. Can you verify?"),
        ]
        count = 0
        for fi, si, subject, body in messages_data:
            fac = faculty_users[fi % len(faculty_users)]
            stu = student_users[si % len(student_users)]
            if fi % 2 == 0:
                sender, receiver = stu, fac
            else:
                sender, receiver = fac, stu
            _, created = Message.objects.get_or_create(
                sender=sender, receiver=receiver, subject=subject,
                defaults={"body": body, "is_read": random.choice([True, False])},
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Messages: {count}"))

    # ── Notifications ───────────────────────────────────────────────
    def _seed_notifications(self, student_users):
        notif_data = [
            ("New Assignment Posted", "A new assignment has been posted for CS201.", "assignment"),
            ("Exam Schedule Updated", "Mid-semester exam schedule has been published.", "timetable"),
            ("Grade Published", "Your quiz 1 grade has been published.", "grade"),
            ("New Announcement", "Check the latest campus announcement.", "announcement"),
            ("Message Received", "You have a new message from Dr. Priya Sharma.", "message"),
        ]
        count = 0
        for stu in student_users[:5]:
            for title, msg, ntype in notif_data:
                _, created = Notification.objects.get_or_create(
                    user=stu, title=title,
                    defaults={
                        "message": msg, "notification_type": ntype,
                        "channel": "in_app", "is_read": random.choice([True, False]),
                        "status": "delivered",
                    },
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Notifications: {count}"))

    # ── Notification Preferences ───────────────────────────────────
    def _seed_notification_preferences(self, admin, faculty_users, student_users):
        count = 0
        users = [admin] + faculty_users[:3] + student_users[:6]
        for user in users:
            for notification_type in [
                Notification.NotificationType.ANNOUNCEMENT,
                Notification.NotificationType.ASSIGNMENT,
                Notification.NotificationType.GRADE,
                Notification.NotificationType.MESSAGE,
            ]:
                _, created = NotificationPreference.objects.get_or_create(
                    user=user,
                    notification_type=notification_type,
                    defaults={
                        "email_enabled": notification_type != Notification.NotificationType.MESSAGE,
                        "push_enabled": True,
                        "in_app_enabled": True,
                    },
                )
                if created:
                    count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Notification preferences: {count}"))

    # ── User Preferences ───────────────────────────────────────────
    def _seed_user_preferences(self, admin, faculty_users, student_users):
        count = 0
        users = [admin] + faculty_users + student_users
        for idx, user in enumerate(users):
            _, created = UserPreferences.objects.get_or_create(
                user=user,
                defaults={
                    "theme": ["system", "light", "dark"][idx % 3],
                    "calendar_view": ["week", "month", "day"][idx % 3],
                    "compact_sidebar": idx % 2 == 0,
                    "language": "en",
                    "timezone": "asia_kolkata",
                    "date_format": "dd_mm_yyyy",
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ User preferences: {count}"))

    # ── Webhooks ────────────────────────────────────────────────────
    def _seed_webhooks(self, admin):
        endpoint, created = WebhookEndpoint.objects.get_or_create(
            name="Library System Integration",
            url="https://library.nimbusu.edu/api/webhooks/users",
            owner=admin,
            defaults={
                "events": ["user.created", "user.updated", "enrollment.created"],
                "is_active": True,
                "secret": "simulated_secret_key_123",
            }
        )
        if created:
            WebhookDelivery.objects.create(
                endpoint=endpoint,
                event_type="user.created",
                payload={"user_id": "123", "email": "test@nimbusu.edu"},
                status="success",
                response_status_code=200,
                response_body='{"ok": true}',
                attempts=1,
                delivered_at=timezone.now(),
            )
            self.stdout.write(self.style.SUCCESS("  ✅ Webhooks: 1 endpoint, 1 delivery log"))

    # ── Telemetry ──────────────────────────────────────────────────
    def _seed_telemetry(self, admin, faculty_users, student_users):
        settings_obj = SiteSettings.load()
        settings_obj.institution_name = "NimbusU University"
        settings_obj.support_email = "support@nimbusu.edu"
        settings_obj.academic_year = "2025-2026"
        settings_obj.enable_student_registration = True
        settings_obj.enable_file_uploads = True
        settings_obj.enable_forum_discussions = True
        settings_obj.save()

        request_specs = [
            ("GET", "/api/v1/academics/offerings/", 200),
            ("GET", "/api/v1/academics/daily-questions/my-assignments/", 200),
            ("POST", "/api/v1/academics/daily-questions/", 201),
            ("GET", "/api/v1/communications/forums/", 200),
            ("GET", "/api/v1/attendance/summary/", 200),
            ("POST", "/api/v1/auth/token/", 200),
        ]
        users = [admin] + faculty_users[:3] + student_users[:6]
        count = 0
        for idx, (method, path, status_code) in enumerate(request_specs * 3):
            _, created = RequestLog.objects.get_or_create(
                method=method,
                path=path,
                user=users[idx % len(users)],
                status_code=status_code,
                defaults={
                    "response_time_ms": random.uniform(45, 380),
                    "ip_address": f"10.10.0.{idx + 10}",
                    "user_agent": "NimbusU Seed Agent/1.0",
                },
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Telemetry: site settings + {count} request logs"))

    # ── Audit Logs ──────────────────────────────────────────────────
    def _seed_audit_logs(self, admin, faculty_users):
        actions = [
            ("LOGIN", "User", "User logged in successfully"),
            ("CREATE_USER", "User", "Created new student account"),
            ("UPDATE_COURSE", "Course", "Updated course syllabus"),
            ("DELETE_ANNOUNCEMENT", "Announcement", "Removed expired announcement"),
            ("RESET_PASSWORD", "User", "Admin reset user password"),
            ("PUBLISH_ASSIGNMENT", "Assignment", "Published new assignment"),
            ("GRADE_SUBMISSION", "Submission", "Graded student submission"),
            ("LOGIN", "User", "User logged in successfully"),
            ("UPDATE_TIMETABLE", "TimetableEntry", "Modified timetable slot"),
            ("UPLOAD_CONTENT", "Content", "Uploaded course material"),
            ("CREATE_ANNOUNCEMENT", "Announcement", "Created urgent announcement"),
            ("EXPORT_GRADES", "Assignment", "Exported grades for CS201"),
            ("LOGIN_FAILED", "User", "Failed login attempt"),
            ("DEACTIVATE_USER", "User", "Deactivated student account"),
            ("CREATE_ENROLLMENT", "Enrollment", "Enrolled student in course"),
        ]
        ips = ["192.168.1.10", "192.168.1.25", "10.0.0.5", "172.16.0.100", "192.168.0.1"]
        count = 0
        users = [admin] + faculty_users
        for action, entity_type, detail in actions:
            user = random.choice(users)
            _, created = AuditLog.objects.get_or_create(
                user=user, action=action, entity_type=entity_type,
                defaults={"details": {"description": detail}, "ip_address": random.choice(ips)},
            )
            if created:
                count += 1
        self.stdout.write(self.style.SUCCESS(f"  ✅ Audit logs: {count}"))
