"""
Management command to seed initial users (admin, faculty, student).

Usage:
    uv run python manage.py seed_users
    uv run python manage.py seed_users --reset    # delete & recreate
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.academics.models import Department, Program, Semester, Course, CourseOffering, Enrollment

User = get_user_model()

USERS = [
    {
        "email": "admin@nimbusu.edu",
        "password": "Admin@1234",
        "first_name": "System",
        "last_name": "Admin",
        "role": "admin",
        "phone": "+91-9000000001",
    },
    {
        "email": "faculty@nimbusu.edu",
        "password": "Faculty@1234",
        "first_name": "Dr. Priya",
        "last_name": "Sharma",
        "role": "faculty",
        "phone": "+91-9000000002",
    },
    {
        "email": "student@nimbusu.edu",
        "password": "Student@1234",
        "first_name": "Aarav",
        "last_name": "Patel",
        "role": "student",
        "phone": "+91-9000000003",
    },
]


class Command(BaseCommand):
    help = "Seed initial users and sample academic data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing seed users before recreating",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            emails = [u["email"] for u in USERS]
            deleted, _ = User.objects.filter(email__in=emails).delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing seed users."))

        created_users = []
        for user_data in USERS:
            email = user_data["email"]
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"  ⏭  {email} already exists, skipping.")
                created_users.append(User.objects.get(email=email))
                continue

            password = user_data.pop("password")
            if user_data["role"] == "admin":
                user = User.objects.create_superuser(password=password, **user_data)
            else:
                user = User.objects.create_user(password=password, **user_data)
            user_data["password"] = password  # restore for re-runs
            created_users.append(user)
            self.stdout.write(self.style.SUCCESS(
                f"  ✅ Created {user.role}: {user.email} (password: {password})"
            ))

        # ── Seed sample academic data ─────────────────────────────────
        self._seed_academics(created_users)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("Seed complete! Login credentials:"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        for u in USERS:
            self.stdout.write(f"  {u['role']:8s} → {u['email']} / {u['password']}")
        self.stdout.write("")

    def _seed_academics(self, users):
        """Create a department, program, semester, course, offering, and enrollment."""
        admin = next((u for u in users if u.role == "admin"), None)
        faculty = next((u for u in users if u.role == "faculty"), None)
        student = next((u for u in users if u.role == "student"), None)

        # Department
        dept, created = Department.objects.get_or_create(
            code="CS",
            defaults={"name": "Computer Science", "head": faculty},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  ✅ Created department: {dept.name}"))

        # Assign department to users
        for u in users:
            if not u.department:
                u.department = dept
                u.save(update_fields=["department"])

        # Program
        program, created = Program.objects.get_or_create(
            code="BTECHCS",
            defaults={
                "name": "B.Tech Computer Science",
                "department": dept,
                "duration_years": 4,
                "degree_type": "UG",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  ✅ Created program: {program.name}"))

        # Semester
        semester, created = Semester.objects.get_or_create(
            name="Spring 2026",
            defaults={
                "academic_year": "2025-2026",
                "start_date": "2026-01-10",
                "end_date": "2026-05-15",
                "is_current": True,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  ✅ Created semester: {semester.name}"))

        # Courses
        courses_data = [
            {"code": "CS201", "name": "Data Structures & Algorithms", "credits": 4},
            {"code": "CS301", "name": "Database Management Systems", "credits": 3},
            {"code": "CS401", "name": "Machine Learning", "credits": 4},
        ]
        for cd in courses_data:
            course, created = Course.objects.get_or_create(
                code=cd["code"],
                defaults={
                    "name": cd["name"],
                    "department": dept,
                    "credits": cd["credits"],
                    "description": f"Introduction to {cd['name']}.",
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✅ Created course: {course.name}"))

            # Offering
            if faculty:
                offering, created = CourseOffering.objects.get_or_create(
                    course=course,
                    semester=semester,
                    defaults={
                        "faculty": faculty,
                        "section": "A",
                        "max_students": 60,
                    },
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(
                        f"  ✅ Created offering: {course.code}-{semester.name}"
                    ))

                # Enroll student
                if student:
                    enrollment, created = Enrollment.objects.get_or_create(
                        student=student,
                        course_offering=offering,
                        defaults={"status": "active"},
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(
                            f"  ✅ Enrolled {student.email} in {course.code}"
                        ))
