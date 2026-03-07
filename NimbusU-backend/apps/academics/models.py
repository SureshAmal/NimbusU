import uuid

from django.conf import settings
from django.db import models

from apps.common.models import SoftDeleteModel


class School(models.Model):
    """Academic school or faculty (e.g. Faculty of Engineering and Technology)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True)
    dean = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headed_schools",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "schools"
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Department(models.Model):
    """Academic department."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True)
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="departments"
    )
    head = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headed_departments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Program(models.Model):
    """Academic program (e.g. B.Tech Computer Science)."""

    class DegreeType(models.TextChoices):
        UG = "UG", "Undergraduate"
        PG = "PG", "Postgraduate"
        PHD = "PhD", "Doctorate"
        DIPLOMA = "Diploma", "Diploma"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="programs"
    )
    duration_years = models.IntegerField()
    degree_type = models.CharField(max_length=50, choices=DegreeType.choices)
    credit_limit = models.IntegerField(
        default=24, help_text="Max credits a student can take per semester",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "programs"
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Semester(models.Model):
    """Academic semester / term."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        db_table = "semesters"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


class Course(SoftDeleteModel):
    """A course offered by a department."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="courses"
    )
    credits = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "courses"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class CourseOffering(models.Model):
    """An instance of a course in a specific semester, taught by a faculty member."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="offerings"
    )
    semester = models.ForeignKey(
        Semester, on_delete=models.CASCADE, related_name="offerings"
    )
    faculty = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teaching_offerings",
    )
    section = models.CharField(max_length=10, default="A")
    max_students = models.IntegerField(default=60)

    class Meta:
        db_table = "course_offerings"
        unique_together = ["course", "semester", "section"]
        ordering = ["-semester__start_date", "course__code"]

    def __str__(self):
        return f"{self.course.code} - {self.section} ({self.semester.name})"


class Enrollment(models.Model):
    """Student enrollment in a course offering."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        DROPPED = "dropped", "Dropped"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course_offering = models.ForeignKey(
        CourseOffering, on_delete=models.CASCADE, related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )

    class Meta:
        db_table = "enrollments"
        unique_together = ["student", "course_offering"]

    def __str__(self):
        return f"{self.student} → {self.course_offering}"


class AcademicEvent(models.Model):
    """University-wide academic calendar events (holidays, exams, etc.)."""

    class EventType(models.TextChoices):
        HOLIDAY = "holiday", "Holiday"
        EXAM = "exam", "Examination Period"
        REGISTRATION = "registration", "Registration Period"
        CLASSES_START = "classes_start", "Classes Start"
        CLASSES_END = "classes_end", "Classes End"
        BREAK = "break", "Break"
        EVENT = "event", "Event"
        DEADLINE = "deadline", "Deadline"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default="")
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="academic_events",
    )
    is_university_wide = models.BooleanField(
        default=True, help_text="Applies to the entire university"
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="academic_events",
        help_text="If not university-wide, specific department",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "academic_events"
        ordering = ["start_date"]

    def __str__(self):
        return f"{self.title} ({self.start_date} – {self.end_date})"


class CoursePrerequisite(models.Model):
    """Defines prerequisite or corequisite relationships between courses."""

    class Type(models.TextChoices):
        PREREQUISITE = "prerequisite", "Prerequisite"
        COREQUISITE = "corequisite", "Co-requisite"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="prerequisites",
        help_text="The course that has the prerequisite",
    )
    required_course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="is_prerequisite_for",
        help_text="The course that must be completed first",
    )
    type = models.CharField(
        max_length=20, choices=Type.choices, default=Type.PREREQUISITE,
    )
    min_grade = models.CharField(
        max_length=5, blank=True, default="",
        help_text="Minimum grade required (e.g. 'C'), blank = just pass",
    )

    class Meta:
        db_table = "course_prerequisites"
        unique_together = ["course", "required_course"]

    def __str__(self):
        return f"{self.required_course.code} → {self.course.code} ({self.get_type_display()})"


class Grade(models.Model):
    """Final grade for a student in a course offering — used for GPA/CGPA."""

    class GradeLetter(models.TextChoices):
        O = "O", "Outstanding (10)"
        A_PLUS = "A+", "Excellent (9)"
        A = "A", "Very Good (8)"
        B_PLUS = "B+", "Good (7)"
        B = "B", "Above Average (6)"
        C = "C", "Average (5)"
        D = "D", "Below Average (4)"
        F = "F", "Fail (0)"
        W = "W", "Withdrawn"
        I = "I", "Incomplete"

    GRADE_POINT_MAP = {
        "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6,
        "C": 5, "D": 4, "F": 0, "W": 0, "I": 0,
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="grades",
    )
    course_offering = models.ForeignKey(
        CourseOffering, on_delete=models.CASCADE, related_name="grades",
    )
    grade_letter = models.CharField(max_length=5, choices=GradeLetter.choices)
    credits_earned = models.IntegerField(
        default=0, help_text="Credits earned (0 if failed/withdrawn)",
    )
    remarks = models.CharField(max_length=200, blank=True, default="")
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "grades"
        unique_together = ["student", "course_offering"]
        ordering = ["-course_offering__semester__start_date"]

    @property
    def grade_points(self):
        return self.GRADE_POINT_MAP.get(self.grade_letter, 0)

    @property
    def is_pass(self):
        return self.grade_letter not in ("F", "W", "I")

    def __str__(self):
        return f"{self.student} → {self.course_offering} = {self.grade_letter}"


class StudentTask(models.Model):
    """Personal task tracking for a student, optionally tied to a course."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_tasks",
        help_text="Optional course offering this task is related to.",
    )
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default="")
    due_date = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "student_tasks"
        ordering = ["is_completed", "due_date", "-created_at"]

    def __str__(self):
        return f"{self.title} (Student: {self.student})"


class DailyQuestion(models.Model):
    """Daily question created by faculty - MCQ, Single Choice, or Programming."""

    class QuestionType(models.TextChoices):
        MCQ = "mcq", "Multiple Choice (Multiple Correct)"
        SINGLE = "single", "Single Choice"
        PROGRAMMING = "programming", "Programming"

    class DifficultyLevel(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, default="")
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)
    difficulty = models.CharField(
        max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.MEDIUM
    )
    
    # Question content
    question_text = models.TextField()
    options = models.JSONField(
        null=True, blank=True,
        help_text="For MCQ/Single: array of {id, text} objects"
    )
    correct_answer = models.JSONField(
        help_text="For MCQ: array of option ids, for Single: single option id, for Programming: expected output"
    )
    test_cases = models.JSONField(
        null=True, blank=True,
        help_text="For Programming: array of {input, expected_output}"
    )
    starter_code = models.TextField(
        null=True, blank=True,
        help_text="Optional starter code for programming questions"
    )
    language = models.CharField(
        max_length=50, null=True, blank=True,
        help_text="Programming language (python, java, c++, etc.)"
    )
    
    # Points and timing
    points = models.IntegerField(default=1)
    time_limit_minutes = models.IntegerField(
        default=30, help_text="Time limit in minutes for solving"
    )
    
    # Scheduling
    scheduled_date = models.DateField(
        help_text="Date when question should be available"
    )
    start_time = models.TimeField(
        null=True, blank=True,
        help_text="Specific start time (optional)"
    )
    end_time = models.TimeField(
        null=True, blank=True,
        help_text="Specific end time (optional)"
    )
    is_active = models.BooleanField(default=True)
    
    # Metadata
    course_offering = models.ForeignKey(
        CourseOffering,
        on_delete=models.CASCADE,
        related_name="daily_questions",
        null=True, blank=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_questions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "daily_questions"
        ordering = ["-scheduled_date", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.question_type}) - {self.scheduled_date}"


class DailyQuestionAssignment(models.Model):
    """Assignment of daily question to specific students (can be from different batches)."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ASSIGNED = "assigned", "Assigned"
        STARTED = "started", "Started"
        SUBMITTED = "submitted", "Submitted"
        GRADED = "graded", "Graded"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        DailyQuestion,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="question_assignments",
    )
    
    # Batch info for tracking
    batch = models.CharField(
        max_length=50, null=True, blank=True,
        help_text="Student's batch when assigned"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    
    # Timing (anti-cheat)
    assigned_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.IntegerField(
        null=True, blank=True,
        help_text="Time taken in seconds from start to submit"
    )
    
    # Points
    points_earned = models.IntegerField(default=0)
    is_correct = models.BooleanField(default=False)
    
    # Validity
    is_valid = models.BooleanField(
        default=True,
        help_text="If false, submission was flagged as cheating"
    )
    invalid_reason = models.CharField(
        max_length=500, null=True, blank=True
    )

    class Meta:
        db_table = "daily_question_assignments"
        unique_together = ["question", "student"]
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.question.title} -> {self.student.full_name} ({self.status})"


class DailyQuestionResponse(models.Model):
    """Student's response to a daily question."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.OneToOneField(
        DailyQuestionAssignment,
        on_delete=models.CASCADE,
        related_name="response",
    )
    
    # Response content
    selected_options = models.JSONField(
        null=True, blank=True,
        help_text="For MCQ/Single: array of selected option ids"
    )
    code_answer = models.TextField(
        null=True, blank=True,
        help_text="For Programming: student's code submission"
    )
    output_result = models.TextField(
        null=True, blank=True,
        help_text="Actual output from running code"
    )
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    
    # Anti-cheat: IP and device info
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Verification
    is_manually_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="verified_responses",
    )
    verification_notes = models.TextField(null=True, blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "daily_question_responses"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Response by {self.assignment.student.full_name} for {self.assignment.question.title}"


class StudentDailyQuestionPerformance(models.Model):
    """Aggregated performance tracking for student's daily questions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dq_performance",
    )
    
    # Time period
    date = models.DateField()
    
    # Stats
    total_assigned = models.IntegerField(default=0)
    total_submitted = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    total_points_earned = models.IntegerField(default=0)
    total_time_seconds = models.IntegerField(default=0)
    
    # Streaks
    current_streak = models.IntegerField(
        default=0,
        help_text="Consecutive days of correct submissions"
    )
    longest_streak = models.IntegerField(default=0)
    
    class Meta:
        db_table = "student_dq_performance"
        unique_together = ["student", "date"]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.student.full_name} - {self.date} - {self.total_points_earned} pts"
