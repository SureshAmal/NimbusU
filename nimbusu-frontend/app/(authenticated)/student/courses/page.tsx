"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  announcementsService,
  assignmentsService,
  attendanceService,
  contentService,
  enrollmentsService,
  offeringsService,
} from "@/services/api";
import type {
  Announcement,
  Assignment,
  AttendanceRecord,
  Content,
  CourseOffering,
  Enrollment,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f97316",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableOfferings, setAvailableOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enrollingMap, setEnrollingMap] = useState<Record<string, boolean>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    present: number;
    absent: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [enrRes, offRes] = await Promise.all([
        enrollmentsService.mine(),
        offeringsService.list(),
      ]);
      setEnrollments(enrRes.data.results ?? enrRes.data ?? []);
      setAvailableOfferings(offRes.data.results ?? offRes.data ?? []);
    } catch (error) {
      toast.error("Failed to load course data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const enrolledOfferingIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_offering)),
    [enrollments],
  );

  const enrolledOfferings = useMemo(
    () => availableOfferings.filter((offering) => enrolledOfferingIds.has(offering.id)),
    [availableOfferings, enrolledOfferingIds],
  );

  const openOfferings = useMemo(
    () => availableOfferings.filter((offering) => !enrolledOfferingIds.has(offering.id)),
    [availableOfferings, enrolledOfferingIds],
  );

  useEffect(() => {
    if (!selectedId) {
      setAssignments([]);
      setAnnouncements([]);
      setContent([]);
      setAttendanceSummary(null);
      return;
    }

    async function fetchDetails() {
      setDetailLoading(true);

      try {
        const assignmentsRes = await assignmentsService.list({
          course_offering: selectedId,
        });
        setAssignments(assignmentsRes.data.results ?? assignmentsRes.data ?? []);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
        setAssignments([]);
      }

      try {
        const announcementsRes = await announcementsService.list({
          target_id: selectedId,
        });
        setAnnouncements(announcementsRes.data.results ?? announcementsRes.data ?? []);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setAnnouncements([]);
      }

      try {
        const contentRes = await contentService.list({
          course_offering: selectedId,
        });
        setContent(contentRes.data.results ?? contentRes.data ?? []);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setContent([]);
      }

      try {
        const attendanceRes = await attendanceService.myCourse(selectedId);
        const records: AttendanceRecord[] =
          attendanceRes.data.results ?? attendanceRes.data ?? [];
        const present = records.filter(
          (record) => record.status === "present" || record.status === "late",
        ).length;
        const absent = records.filter(
          (record) => record.status === "absent" || record.status === "excused",
        ).length;
        const total = records.length;

        setAttendanceSummary({
          present,
          absent,
          total,
          percentage: total ? Math.round((present / total) * 100) : 0,
        });
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceSummary(null);
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetails();
  }, [selectedId]);

  const selectedCourse = enrolledOfferings.find((offering) => offering.id === selectedId);
  const selectedEnrollment = enrollments.find(
    (enrollment) => enrollment.course_offering === selectedId,
  );

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const handleEnroll = async (offeringId: string) => {
    setEnrollingMap((prev) => ({ ...prev, [offeringId]: true }));
    try {
      const studentId = user?.id ?? enrollments[0]?.student;
      if (!studentId) {
        toast.error("Student profile not available");
        return;
      }

      await enrollmentsService.create({
        student: studentId,
        course_offering: offeringId,
      });
      toast.success("Successfully enrolled!");
      await fetchAll();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.message ||
        "Enrollment failed";

      toast.error(errorMessage, {
        icon: <ShieldAlert className="h-4 w-4 text-rose-500" />,
        duration: 5000,
      });
      console.error("Enrollment error:", error.response?.data);
    } finally {
      setEnrollingMap((prev) => ({ ...prev, [offeringId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="my-courses" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Courses</h2>
            <p className="text-sm text-muted-foreground">
              Review enrolled courses and join new ones.
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="enroll">Available Courses</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="my-courses" className="space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {enrolledOfferings.length} enrolled course{enrolledOfferings.length === 1 ? "" : "s"}
            </span>
            {selectedCourse && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/student/courses/${selectedCourse.id}`}>
                  Open course page <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {enrolledOfferings.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-40" />
              You aren&apos;t enrolled in any courses yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {enrolledOfferings.map((offering, idx) => {
                const enrollment = enrollments.find(
                  (item) => item.course_offering === offering.id,
                );

                return (
                  <div
                    key={offering.id}
                    onClick={() =>
                      setSelectedId(selectedId === offering.id ? null : offering.id)
                    }
                    className={`relative cursor-pointer border p-4 transition-all ${
                      selectedId === offering.id
                        ? "bg-accent/50 ring-2 ring-primary"
                        : "hover:border-border hover:bg-accent/30"
                    }`}
                    style={{ borderRadius: "var(--radius-lg)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center text-sm font-medium text-white"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                          borderRadius: "var(--radius)",
                        }}
                      >
                        {getInitials(offering.course_name || "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{offering.course_name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="h-5 text-[10px]">
                            {offering.course_code}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {offering.enrolled_count}/{offering.max_students}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {offering.faculty_name} · Section {offering.section}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {offering.semester_name}
                          {enrollment?.status ? ` · ${enrollment.status}` : ""}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          selectedId === offering.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedCourse && (
            <div className="mt-6 animate-in rounded-xl border bg-background slide-in-from-top-2">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="font-semibold">{selectedCourse.course_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.course_code} · Section {selectedCourse.section}
                    {selectedEnrollment?.enrolled_at
                      ? ` · Enrolled ${new Date(selectedEnrollment.enrolled_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center p-8">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b px-4">
                    <TabsTrigger value="overview" className="gap-1">
                      <BarChart3 className="h-3 w-3" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="gap-1">
                      <ClipboardList className="h-3 w-3" /> Assignments ({assignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="gap-1">
                      <CheckCircle className="h-3 w-3" /> Attendance
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-1">
                      <FolderOpen className="h-3 w-3" /> Content ({content.length})
                    </TabsTrigger>
                    <TabsTrigger value="announcements" className="gap-1">
                      <Bell className="h-3 w-3" /> Announcements ({announcements.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="m-0 p-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-lg border p-4 text-center">
                        <ClipboardList className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{assignments.length}</p>
                        <p className="text-xs text-muted-foreground">Assignments</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <FolderOpen className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{content.length}</p>
                        <p className="text-xs text-muted-foreground">Content Items</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <Bell className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{announcements.length}</p>
                        <p className="text-xs text-muted-foreground">Announcements</p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <CheckCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                        <p className="text-2xl font-bold">{attendanceSummary?.percentage ?? 0}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-3 font-medium">Course snapshot</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Faculty</span>
                            <span className="font-medium">{selectedCourse.faculty_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Semester</span>
                            <span className="font-medium">{selectedCourse.semester_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Section</span>
                            <span className="font-medium">{selectedCourse.section}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Seat usage</span>
                            <span className="font-medium">
                              {selectedCourse.enrolled_count}/{selectedCourse.max_students}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <h4 className="mb-3 font-medium">Attendance overview</h4>
                        {attendanceSummary ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Present</span>
                              <span className="font-medium">{attendanceSummary.present}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Absent</span>
                              <span className="font-medium">{attendanceSummary.absent}</span>
                            </div>
                            <Progress value={attendanceSummary.percentage} className="mt-2" />
                            <p className="text-center text-xs text-muted-foreground">
                              {attendanceSummary.percentage}% attendance rate
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No attendance data available.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="assignments" className="m-0">
                    <ScrollArea className="h-[450px]">
                      {assignments.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No assignments yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-3 hover:bg-accent/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                  <FileText className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{assignment.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> Due:{" "}
                                      {new Date(assignment.due_date).toLocaleDateString()}
                                    </span>
                                    <span>Max {assignment.max_marks}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  new Date(assignment.due_date) > new Date()
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {new Date(assignment.due_date) > new Date() ? "Open" : "Closed"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="attendance" className="m-0 p-6">
                    {attendanceSummary ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
                            <p className="text-2xl font-bold text-green-600">
                              {attendanceSummary.present}
                            </p>
                            <p className="text-xs text-green-600">Present</p>
                          </div>
                          <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/30">
                            <p className="text-2xl font-bold text-red-600">
                              {attendanceSummary.absent}
                            </p>
                            <p className="text-xs text-red-600">Absent</p>
                          </div>
                          <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-2xl font-bold">{attendanceSummary.total}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                        </div>
                        <Progress value={attendanceSummary.percentage} className="h-3" />
                        <p className="text-center text-sm text-muted-foreground">
                          Overall Attendance: {attendanceSummary.percentage}%
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No attendance data available
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="content" className="m-0">
                    <ScrollArea className="h-[450px]">
                      {content.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No content uploaded yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {content.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 hover:bg-accent/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{item.title}</p>
                                  <p className="text-xs capitalize text-muted-foreground">
                                    {item.content_type}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/student/courses/${selectedCourse.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="announcements" className="m-0">
                    <ScrollArea className="h-[350px]">
                      {announcements.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No announcements yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {announcements.map((announcement) => (
                            <div key={announcement.id} className="p-3 hover:bg-accent/30">
                              <div className="mb-1 flex items-center gap-2">
                                <p className="text-sm font-medium">{announcement.title}</p>
                                {announcement.is_urgent && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {announcement.body}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enroll" className="space-y-4 outline-none">
          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4 text-blue-500" />
              Enrollment Rules
            </h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>You can only enroll up to your program&apos;s credit limit.</li>
              <li>
                You must have passed all prerequisites to enroll in advanced courses.
              </li>
              <li>If a course is full, you will be placed on a waitlist.</li>
            </ul>
          </div>

          {openOfferings.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p>No more courses available to enroll in.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {openOfferings.map((offering, idx) => {
                const isFull = offering.enrolled_count >= offering.max_students;

                return (
                  <div
                    key={offering.id}
                    className="flex h-full flex-col justify-between border p-4"
                    style={{ borderRadius: "var(--radius-lg)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center text-sm font-medium text-white"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                          borderRadius: "var(--radius)",
                        }}
                      >
                        {getInitials(offering.course_name || "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-medium">
                            {offering.course_name}
                          </p>
                          <Badge variant="outline" className="shrink-0">
                            {offering.course_code}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {offering.faculty_name} · Section {offering.section}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {offering.semester_name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Seats</span>
                        <span>
                          {offering.enrolled_count} / {offering.max_students}
                        </span>
                      </div>
                      <Progress
                        value={
                          offering.max_students
                            ? (offering.enrolled_count / offering.max_students) * 100
                            : 0
                        }
                        className="h-2"
                      />
                      <Button
                        size="sm"
                        variant={isFull ? "outline" : "default"}
                        disabled={enrollingMap[offering.id]}
                        onClick={() => handleEnroll(offering.id)}
                      >
                        {enrollingMap[offering.id] ? (
                          "Enrolling..."
                        ) : isFull ? (
                          <>
                            <Clock className="mr-1 h-4 w-4" /> Join Waitlist
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 h-4 w-4" /> Enroll
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
