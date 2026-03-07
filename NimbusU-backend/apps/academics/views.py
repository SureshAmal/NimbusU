"""Views for the academics app."""

import csv
from django.contrib.auth import get_user_model
from django.db import models
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsAdminOrFaculty
from apps.accounts.serializers import UserListSerializer

from .models import (
    AcademicEvent, Course, CourseOffering, CoursePrerequisite,
    Department, Enrollment, Grade, Program, School, Semester, StudentTask,
    DailyQuestion, DailyQuestionAssignment, DailyQuestionResponse,
    StudentDailyQuestionPerformance
)
from .serializers import (
    CourseOfferingSerializer,
    CoursePrerequisiteSerializer,
    CourseSerializer,
    DepartmentSerializer,
    EnrollmentSerializer,
    EnrollmentBulkCreateSerializer,
    GradeSerializer,
    ProgramSerializer,
    SchoolSerializer,
    SemesterSerializer,
    AcademicEventSerializer,
    StudentTaskSerializer,
    DailyQuestionSerializer,
    DailyQuestionListSerializer,
    DailyQuestionAssignmentSerializer,
    DailyQuestionAssignmentCreateSerializer,
    DailyQuestionAssignmentByBatchSerializer,
    DailyQuestionResponseSerializer,
    DailyQuestionSubmitSerializer,
    StudentDailyQuestionPerformanceSerializer,
)

User = get_user_model()


# ─── Schools ────────────────────────────────────────────────────────────


class SchoolListCreateView(generics.ListCreateAPIView):
    queryset = School.objects.select_related("dean").all()
    serializer_class = SchoolSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class SchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = School.objects.select_related("dean").all()
    serializer_class = SchoolSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


# ─── Departments ────────────────────────────────────────────────────────


class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.select_related("head", "school").all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.select_related("head", "school").all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


# ─── Programs ───────────────────────────────────────────────────────────


class ProgramListCreateView(generics.ListCreateAPIView):
    queryset = Program.objects.select_related("department").all()
    serializer_class = ProgramSerializer
    filterset_fields = ["department", "degree_type", "is_active"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class ProgramDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Program.objects.select_related("department").all()
    serializer_class = ProgramSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


# ─── Semesters ──────────────────────────────────────────────────────────


class SemesterListCreateView(generics.ListCreateAPIView):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class SemesterDetailView(generics.RetrieveUpdateAPIView):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CurrentSemesterView(APIView):
    """GET /api/v1/academics/semesters/current/"""

    @extend_schema(
        responses={200: SemesterSerializer},
        tags=["Semesters"],
    )
    def get(self, request):
        semester = Semester.objects.filter(is_current=True).first()
        if not semester:
            return Response(
                {"status": "error", "message": "No current semester set."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"status": "success", "data": SemesterSerializer(semester).data}
        )


# ─── Courses ────────────────────────────────────────────────────────────


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related("department").all()
    serializer_class = CourseSerializer
    filterset_fields = ["department", "is_active"]
    search_fields = ["name", "code"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related("department").all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


# ─── Course Offerings ───────────────────────────────────────────────────


class CourseOfferingListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseOfferingSerializer
    filterset_fields = ["course", "semester", "faculty"]

    def get_queryset(self):
        return CourseOffering.objects.select_related(
            "course", "semester", "faculty"
        ).all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CourseOfferingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CourseOfferingSerializer

    def get_queryset(self):
        return CourseOffering.objects.select_related(
            "course", "semester", "faculty"
        ).all()

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CourseOfferingStudentsView(generics.ListAPIView):
    """GET /api/v1/academics/offerings/{id}/students/"""

    serializer_class = UserListSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()
        offering_id = self.kwargs["pk"]
        student_ids = Enrollment.objects.filter(
            course_offering_id=offering_id, status="active"
        ).values_list("student_id", flat=True)
        return User.objects.filter(id__in=student_ids)


# ─── Enrollments ────────────────────────────────────────────────────────


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def create(self, request, *args, **kwargs):
        from .models import CoursePrerequisite, Grade
        
        student_id = request.data.get("student")
        offering_id = request.data.get("course_offering")
        
        if not student_id or not offering_id:
            return Response(
                {"detail": "student and course_offering are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        try:
            student = User.objects.select_related("student_profile__program").get(id=student_id)
            offering = CourseOffering.objects.select_related("course", "semester").get(id=offering_id)
        except (User.DoesNotExist, CourseOffering.DoesNotExist):
            return Response(
                {"detail": "Invalid student or course offering."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Check Prerequisites
        prereqs = CoursePrerequisite.objects.filter(course=offering.course)
        for req in prereqs:
            # Did the student pass this required course?
            passed = Grade.objects.filter(
                student=student,
                course_offering__course=req.required_course,
                grade_letter__in=["O", "A+", "A", "B+", "B", "C", "D"] # Passing grades
            ).exists()
            
            if not passed:
                return Response(
                    {
                        "detail": f"Missing prerequisite: {req.required_course.code}",
                        "code": "missing_prerequisite"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 2. Check Credit Limit
        if hasattr(student, 'student_profile') and student.student_profile.program:
            credit_limit = student.student_profile.program.credit_limit
            
            # Sum credits for current active enrollments in the SAME semester
            current_credits = sum(
                e.course_offering.course.credits
                for e in Enrollment.objects.filter(
                    student=student,
                    course_offering__semester=offering.semester,
                    status="active"
                ).select_related("course_offering__course")
            )
            
            if current_credits + offering.course.credits > credit_limit:
                return Response(
                    {
                        "detail": f"Credit limit exceeded. Max allowed is {credit_limit}, "
                                  f"current is {current_credits}, trying to add {offering.course.credits}.",
                        "code": "credit_limit_exceeded"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 3. Waitlist Logic
        # Calculate current active enrollments for this offering
        current_enrollments = Enrollment.objects.filter(
            course_offering=offering, status="active"
        ).count()
        
        enroll_status = "active"
        if current_enrollments >= offering.max_students:
            enroll_status = "waitlisted"
            
        # Create enrollment
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status=enroll_status)
        
        headers = self.get_success_headers(serializer.data)
        
        msg = "Enrolled successfully." if enroll_status == "active" else "Course full. Added to waitlist."
        resp_data = serializer.data
        resp_data["message"] = msg
        
        return Response(resp_data, status=status.HTTP_201_CREATED, headers=headers)


class EnrollmentDeleteView(generics.DestroyAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class MyEnrollmentsView(generics.ListAPIView):
    """GET /api/v1/enrollments/me/"""

    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course_offering__course")


class ExportEnrollmentsView(APIView):
    """GET /api/v1/enrollments/export/ — Export enrollments as CSV."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: serializers.CharField(help_text="CSV file content")},
        tags=["Academics"],
    )
    def get(self, request):
        if request.user.role == "student":
            enrollments = Enrollment.objects.filter(student=request.user)
        elif request.user.role in ("faculty", "dean", "head", "admin"):
            enrollments = Enrollment.objects.all()
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        enrollments = enrollments.select_related(
            "student",
            "course_offering__course",
            "course_offering__semester",
            "course_offering__faculty",
        )

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="enrollments_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Enrollment ID",
            "Student",
            "Student ID",
            "Course Code",
            "Course Name",
            "Semester",
            "Section",
            "Faculty",
            "Status",
            "Enrolled At",
        ])

        for enrollment in enrollments:
            writer.writerow([
                str(enrollment.id),
                enrollment.student.full_name,
                str(enrollment.student_id),
                enrollment.course_offering.course.code,
                enrollment.course_offering.course.name,
                enrollment.course_offering.semester.name,
                enrollment.course_offering.section,
                enrollment.course_offering.faculty.full_name,
                enrollment.status,
                enrollment.enrolled_at.isoformat(),
            ])

        return response


# ─── Academic Calendar ──────────────────────────────────────────────────


class AcademicEventListCreateView(generics.ListCreateAPIView):
    serializer_class = AcademicEventSerializer
    filterset_fields = ["event_type", "semester", "is_university_wide", "department"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        return AcademicEvent.objects.select_related(
            "semester", "department", "created_by"
        ).all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AcademicEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AcademicEventSerializer

    def get_queryset(self):
        return AcademicEvent.objects.select_related(
            "semester", "department", "created_by"
        ).all()

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


# ─── Course Prerequisites ──────────────────────────────────────────────


class CoursePrerequisiteListCreateView(generics.ListCreateAPIView):
    serializer_class = CoursePrerequisiteSerializer
    filterset_fields = ["course", "type"]

    def get_queryset(self):
        return CoursePrerequisite.objects.select_related(
            "course", "required_course"
        ).all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CoursePrerequisiteDeleteView(generics.DestroyAPIView):
    queryset = CoursePrerequisite.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


# ─── Grades ────────────────────────────────────────────────────────────


class GradeListCreateView(generics.ListCreateAPIView):
    """Admin/faculty: list/create grades. Filterable by course_offering, student."""

    serializer_class = GradeSerializer
    filterset_fields = ["course_offering", "student", "grade_letter"]

    def get_queryset(self):
        return Grade.objects.select_related(
            "student", "course_offering__course", "course_offering__semester",
        ).all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminOrFaculty()]
        return [permissions.IsAuthenticated()]


class GradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrFaculty]

    def get_queryset(self):
        return Grade.objects.select_related(
            "student", "course_offering__course", "course_offering__semester",
        ).all()


class MyGradesView(generics.ListAPIView):
    """GET /api/v1/academics/grades/me/ — student's own grades."""

    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Grade.objects.filter(
            student=self.request.user
        ).select_related(
            "course_offering__course", "course_offering__semester",
        )


class GPAView(APIView):
    """GET /api/v1/academics/grades/gpa/ — calculate GPA/CGPA.

    Query params: ?student_id=... (admin/faculty)
    Default: current user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student_id = request.query_params.get("student_id")
        user = request.user

        if student_id and user.role in ("admin", "faculty", "dean", "head"):
            target_id = student_id
        else:
            target_id = str(user.id)

        grades = Grade.objects.filter(
            student_id=target_id,
        ).select_related(
            "course_offering__course", "course_offering__semester",
        ).order_by("course_offering__semester__start_date")

        if not grades.exists():
            return Response({
                "status": "success",
                "data": {"cgpa": 0, "total_credits": 0, "semesters": []},
            })

        # Group by semester
        semester_map = {}
        for g in grades:
            sem_id = str(g.course_offering.semester_id)
            if sem_id not in semester_map:
                semester_map[sem_id] = {
                    "semester_name": g.course_offering.semester.name,
                    "grades": [],
                }
            credits = g.course_offering.course.credits
            semester_map[sem_id]["grades"].append({
                "course_code": g.course_offering.course.code,
                "course_name": g.course_offering.course.name,
                "grade": g.grade_letter,
                "grade_points": g.grade_points,
                "credits": credits,
            })

        semesters = []
        total_weighted = 0
        total_credits = 0

        for sem_data in semester_map.values():
            sem_weighted = 0
            sem_credits = 0
            for g in sem_data["grades"]:
                sem_weighted += g["grade_points"] * g["credits"]
                sem_credits += g["credits"]
            sgpa = round(sem_weighted / sem_credits, 2) if sem_credits else 0
            total_weighted += sem_weighted
            total_credits += sem_credits
            semesters.append({
                "semester_name": sem_data["semester_name"],
                "sgpa": sgpa,
                "credits": sem_credits,
                "courses": sem_data["grades"],
            })

        cgpa = round(total_weighted / total_credits, 2) if total_credits else 0

        return Response({
            "status": "success",
            "data": {
                "student_id": target_id,
                "cgpa": cgpa,
                "total_credits": total_credits,
                "semesters": semesters,
            },
        })


class EnrollmentBulkCreateView(generics.CreateAPIView):
    """POST /api/v1/academics/enrollments/bulk-create/"""
    
    serializer_class = EnrollmentBulkCreateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @extend_schema(
        request=EnrollmentBulkCreateSerializer,
        responses={201: inline_serializer("BulkEnrollmentResponse", {
            "status": serializers.CharField(),
            "message": serializers.CharField(),
        })},
        tags=["Academics"],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollments = serializer.save()
        
        return Response(
            {"status": "success", "message": f"{len(enrollments)} students successfully enrolled."}, 
            status=status.HTTP_201_CREATED
        )


class ExportGradesView(APIView):
    """GET /api/v1/academics/grades/export/ — Export grades as CSV."""
    
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: serializers.CharField(help_text="CSV file content")},
        tags=["Academics"],
    )
    def get(self, request):
        if request.user.role == "student":
            grades = Grade.objects.filter(student=request.user).select_related("course_offering__course", "course_offering__semester")
        elif request.user.role in ("faculty", "dean", "head", "admin"):
            grades = Grade.objects.select_related("student", "course_offering__course", "course_offering__semester").all()
            # Can add additional filtering here by faculty courses or department if needed
        else:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
            
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="grades_export.csv"'

        writer = csv.writer(response)
        writer.writerow(["Student", "Course Code", "Course Name", "Semester", "Grade", "Points", "Credits", "Pass"])

        for grade in grades:
            writer.writerow([
                grade.student.full_name,
                grade.course_offering.course.code,
                grade.course_offering.course.name,
                grade.course_offering.semester.name,
                grade.grade_letter,
                grade.grade_points,
                grade.credits_earned,
                "Yes" if grade.is_pass else "No",
            ])

        return response


# ─── Student Tasks ────────────────────────────────────────────────────────
class StudentTaskViewSet(generics.ListCreateAPIView):
    """GET /api/v1/academics/tasks/ and POST /api/v1/academics/tasks/"""
    serializer_class = StudentTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentTask.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class StudentTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET, PATCH, DELETE /api/v1/academics/tasks/<id>/"""
    serializer_class = StudentTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentTask.objects.filter(student=self.request.user)


# ─── Daily Questions ───────────────────────────────────────────────────────

class DailyQuestionListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/academics/daily-questions/"""
    serializer_class = DailyQuestionListSerializer
    filterset_fields = ["question_type", "difficulty", "scheduled_date", "is_active"]
    
    def get_queryset(self):
        qs = DailyQuestion.objects.select_related("created_by", "course_offering").all()
        
        # Students only see active questions scheduled for today or past
        if self.request.user.role == "student":
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            qs = qs.filter(is_active=True, scheduled_date__lte=today)
        return qs
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return DailyQuestionSerializer
        return DailyQuestionListSerializer
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminOrFaculty()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DailyQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/academics/daily-questions/<id>/"""
    serializer_class = DailyQuestionSerializer
    
    def get_queryset(self):
        return DailyQuestion.objects.select_related("created_by", "course_offering").all()
    
    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdminOrFaculty()]
        return [permissions.IsAuthenticated()]


class DailyQuestionAssignView(generics.CreateAPIView):
    """POST /api/v1/academics/daily-questions/<id>/assign/ - Assign question to students."""
    serializer_class = DailyQuestionAssignmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrFaculty]
    
    def create(self, request, *args, **kwargs):
        question_id = kwargs.get("pk")
        try:
            question = DailyQuestion.objects.get(id=question_id)
        except DailyQuestion.DoesNotExist:
            return Response(
                {"detail": "Question not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        student_ids = serializer.validated_data["student_ids"]
        batch = serializer.validated_data.get("batch", "")
        
        # Get students
        students = User.objects.filter(id__in=student_ids, role="student")
        
        # Create assignments
        assignments = []
        for student in students:
            # Get student's batch if not provided
            student_batch = batch
            if not student_batch and hasattr(student, 'student_profile'):
                student_batch = student.student_profile.batch or ""
            
            # Check if already assigned
            if not DailyQuestionAssignment.objects.filter(
                question=question, student=student
            ).exists():
                assignments.append(
                    DailyQuestionAssignment(
                        question=question,
                        student=student,
                        batch=student_batch,
                        status=DailyQuestionAssignment.Status.ASSIGNED
                    )
                )
        
        created = DailyQuestionAssignment.objects.bulk_create(assignments)
        
        # Create notification for assigned students
        from apps.communications.models import Notification
        notifications = [
            Notification(
                user=student,
                title="New Daily Question",
                message=f"You have been assigned a new question: {question.title}",
                notification_type="daily_question",
                link=f"/academics/daily-questions/{question.id}"
            )
            for student in students
        ]
        Notification.objects.bulk_create(notifications, ignore_conflicts=True)
        
        return Response(
            {"status": "success", "message": f"{len(created)} students assigned"},
            status=status.HTTP_201_CREATED
        )


class DailyQuestionAssignByBatchView(generics.CreateAPIView):
    """POST /api/v1/academics/daily-questions/assign-by-batch/ - Assign to students by batch."""
    serializer_class = DailyQuestionAssignmentByBatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrFaculty]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        question = serializer.validated_data["question"]
        batches = serializer.validated_data["batches"]
        course_offering = serializer.validated_data.get("course_offering")
        
        # Get students from these batches
        from apps.accounts.models import StudentProfile
        student_profiles = StudentProfile.objects.filter(batch__in=batches)
        if course_offering:
            # Also filter by enrolled students in the course
            enrolled_student_ids = Enrollment.objects.filter(
                course_offering=course_offering, status="active"
            ).values_list("student_id", flat=True)
            student_profiles = student_profiles.filter(user_id__in=enrolled_student_ids)
        
        students = User.objects.filter(
            id__in=student_profiles.values_list("user_id", flat=True),
            role="student"
        )
        
        # Create assignments
        assignments = []
        for profile in student_profiles:
            if not DailyQuestionAssignment.objects.filter(
                question=question, student_id=profile.user_id
            ).exists():
                assignments.append(
                    DailyQuestionAssignment(
                        question=question,
                        student_id=profile.user_id,
                        batch=profile.batch,
                        status=DailyQuestionAssignment.Status.ASSIGNED
                    )
                )
        
        created = DailyQuestionAssignment.objects.bulk_create(assignments)
        
        # Create notifications
        from apps.communications.models import Notification
        notifications = [
            Notification(
                user_id=profile.user_id,
                title="New Daily Question",
                message=f"You have been assigned: {question.title}",
                notification_type="daily_question",
                link=f"/academics/daily-questions/{question.id}"
            )
            for profile in student_profiles
        ]
        Notification.objects.bulk_create(notifications, ignore_conflicts=True)
        
        return Response(
            {"status": "success", "message": f"{len(created)} students from {len(batches)} batches assigned"},
            status=status.HTTP_201_CREATED
        )


class MyQuestionAssignmentsView(generics.ListAPIView):
    """GET /api/v1/academics/daily-questions/my-assignments/ - Student's assigned questions."""
    serializer_class = DailyQuestionAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        qs = DailyQuestionAssignment.objects.filter(
            student=self.request.user
        ).select_related("question")
        
        # Filter by status
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        
        # Filter: only pending/assigned if before start time
        from django.utils import timezone
        now = timezone.now()
        for assignment in qs:
            q = assignment.question
            if q.start_time and now.time() < q.start_time:
                # Question hasn't started yet
                assignment.status = DailyQuestionAssignment.Status.PENDING
                assignment.save(update_fields=["status"])
        
        return qs


class DailyQuestionStartView(APIView):
    """POST /api/v1/academics/daily-questions/<id>/start/ - Student starts a question."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            assignment = DailyQuestionAssignment.objects.get(
                id=pk, student=request.user
            )
        except DailyQuestionAssignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already started
        if assignment.status in [
            DailyQuestionAssignment.Status.SUBMITTED,
            DailyQuestionAssignment.Status.GRADED
        ]:
            return Response(
                {"detail": "Question already submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if within time window
        from django.utils import timezone
        now = timezone.now()
        
        if assignment.question.start_time and now.time() < assignment.question.start_time:
            return Response(
                {"detail": "Question is not available yet"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if assignment.question.end_time and now.time() > assignment.question.end_time:
            assignment.status = DailyQuestionAssignment.Status.EXPIRED
            assignment.save(update_fields=["status"])
            return Response(
                {"detail": "Question has expired"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Record start time
        assignment.status = DailyQuestionAssignment.Status.STARTED
        assignment.started_at = now
        assignment.save(update_fields=["status", "started_at"])
        
        return Response(
            {"status": "success", "started_at": now.isoformat()},
            status=status.HTTP_200_OK
        )


class DailyQuestionSubmitView(APIView):
    """POST /api/v1/academics/daily-questions/<id>/submit/ - Student submits answer."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        serializer = DailyQuestionSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            assignment = DailyQuestionAssignment.objects.get(
                id=serializer.validated_data["assignment_id"],
                student=request.user
            )
        except DailyQuestionAssignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if assignment.status not in [
            DailyQuestionAssignment.Status.STARTED,
            DailyQuestionAssignment.Status.ASSIGNED
        ]:
            return Response(
                {"detail": "Cannot submit - question not started or already submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check time limit
        from django.utils import timezone
        now = timezone.now()
        
        if assignment.started_at:
            time_diff = (now - assignment.started_at).total_seconds()
            time_limit_seconds = assignment.question.time_limit_minutes * 60
            
            if time_diff > time_limit_seconds:
                assignment.status = DailyQuestionAssignment.Status.EXPIRED
                assignment.save(update_fields=["status"])
                return Response(
                    {"detail": "Time limit exceeded"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            assignment.time_taken_seconds = int(time_diff)
        
        # Check answer
        question = assignment.question
        is_correct = False
        marks_obtained = 0
        
        if question.question_type in [DailyQuestion.QuestionType.MCQ, DailyQuestion.QuestionType.SINGLE]:
            selected = set(serializer.validated_data.get("selected_options", []))
            correct = set(question.correct_answer)
            is_correct = selected == correct
        elif question.question_type == DailyQuestion.QuestionType.PROGRAMMING:
            # For programming, we just store the code - needs manual grading
            is_correct = False
        
        if is_correct:
            marks_obtained = question.points
            assignment.points_earned = marks_obtained
            assignment.is_correct = True
        
        # Create response record
        response = DailyQuestionResponse.objects.create(
            assignment=assignment,
            selected_options=serializer.validated_data.get("selected_options"),
            code_answer=serializer.validated_data.get("code_answer", ""),
            is_correct=is_correct,
            marks_obtained=marks_obtained,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        )
        
        # Update assignment
        assignment.status = DailyQuestionAssignment.Status.SUBMITTED
        assignment.submitted_at = now
        assignment.save()
        
        return Response(
            {
                "status": "success",
                "is_correct": is_correct,
                "marks_obtained": marks_obtained,
                "time_taken": assignment.time_taken_seconds,
            },
            status=status.HTTP_200_OK
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class DailyQuestionGradingView(APIView):
    """POST /api/v1/academics/daily-questions/<id>/grade/ - Faculty grades a submission."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrFaculty]
    
    def post(self, request, pk):
        try:
            assignment = DailyQuestionAssignment.objects.get(id=pk)
        except DailyQuestionAssignment.DoesNotExist:
            return Response(
                {"detail": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        marks = request.data.get("marks", 0)
        is_correct = request.data.get("is_correct", False)
        notes = request.data.get("notes", "")
        
        assignment.points_earned = marks
        assignment.is_correct = is_correct
        assignment.status = DailyQuestionAssignment.Status.GRADED
        assignment.save()
        
        # Update response if exists
        if hasattr(assignment, "response"):
            assignment.response.marks_obtained = marks
            assignment.response.is_correct = is_correct
            assignment.response.is_manually_verified = True
            assignment.response.verified_by = request.user
            assignment.response.verification_notes = notes
            assignment.response.save()
        
        return Response(
            {"status": "success", "marks_obtained": marks},
            status=status.HTTP_200_OK
        )


class StudentQuestionPerformanceView(generics.ListAPIView):
    """GET /api/v1/academics/daily-questions/performance/ - View performance stats."""
    serializer_class = StudentDailyQuestionPerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        qs = StudentDailyQuestionPerformance.objects.filter(student=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        
        return qs.order_by("-date")


class FacultyQuestionStatsView(APIView):
    """GET /api/v1/academics/daily-questions/stats/ - Faculty view of all student performance."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrFaculty]
    
    def get(self, request):
        question_id = request.query_params.get("question_id")
        student_id = request.query_params.get("student_id")
        
        qs = DailyQuestionAssignment.objects.select_related(
            "question", "student"
        )
        
        if question_id:
            qs = qs.filter(question_id=question_id)
        
        if student_id:
            qs = qs.filter(student_id=student_id)
        
        total = qs.count()
        submitted = qs.filter(status__in=[
            DailyQuestionAssignment.Status.SUBMITTED,
            DailyQuestionAssignment.Status.GRADED
        ]).count()
        correct = qs.filter(is_correct=True).count()
        pending = qs.filter(status__in=[
            DailyQuestionAssignment.Status.PENDING,
            DailyQuestionAssignment.Status.ASSIGNED
        ]).count()
        
        avg_time = qs.exclude(
            time_taken_seconds__isnull=True
        ).aggregate(models.Avg("time_taken_seconds"))["time_taken_seconds__avg"] or 0
        
        return Response(
            {
                "total_assigned": total,
                "total_submitted": submitted,
                "total_correct": correct,
                "total_pending": pending,
                "average_time_seconds": round(avg_time, 2),
                "accuracy_rate": round(correct / submitted * 100, 2) if submitted else 0,
            }
        )
