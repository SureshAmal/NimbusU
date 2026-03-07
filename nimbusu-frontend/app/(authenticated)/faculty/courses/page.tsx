"use client";

import { useEffect, useState } from "react";
import { offeringsService, assignmentsService, announcementsService, contentService, attendanceService } from "@/services/api";
import type {
  CourseOffering,
  User,
  Assignment,
  Announcement,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  ClipboardList,
  FileText,
  X,
  ChevronDown,
  Calendar,
  Clock,
  Mail,
  BarChart3,
  GraduationCap,
  CheckCircle,
  Bell,
  FolderOpen,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f97316",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
];

export default function FacultyCoursesPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [content, setContent] = useState<
    { id: string; title: string; content_type: string }[]
  >([]);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    present: number;
    absent: number;
    total: number;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await offeringsService.list();
        setOfferings(data.results ?? data ?? []);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setStudents([]);
      setAssignments([]);
      setAnnouncements([]);
      setContent([]);
      setAttendanceSummary(null);
      return;
    }

    async function fetchDetails() {
      setDetailLoading(true);

      // Fetch each data source separately to handle individual failures
      try {
        const studentsRes = await offeringsService.students(selectedId);
        setStudents(studentsRes.data.results ?? studentsRes.data ?? []);
      } catch (e) {
        console.error("Failed to fetch students:", e);
      }

      try {
        const assignmentsRes = await assignmentsService.list({
          course_offering: selectedId,
        });
        setAssignments(
          assignmentsRes.data.results ?? assignmentsRes.data ?? [],
        );
      } catch (e) {
        console.error("Failed to fetch assignments:", e);
      }

      try {
        const announcementsRes = await announcementsService.list({
          course_offering: selectedId,
        });
        setAnnouncements(
          announcementsRes.data.results ?? announcementsRes.data ?? [],
        );
      } catch (e) {
        console.error("Failed to fetch announcements:", e);
      }

      try {
        const contentRes = await contentService.list({
          course_offering: selectedId,
        });
        setContent(contentRes.data.results ?? contentRes.data ?? []);
      } catch (e) {
        console.error("Failed to fetch content:", e);
      }

      // Attendance summary requires student-specific context, so it is skipped here.

      setDetailLoading(false);
    }
    fetchDetails();
  }, [selectedId]);

  const selectedCourse = offerings.find((o) => o.id === selectedId);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <span className="text-sm text-muted-foreground">
            {offerings.length} courses
          </span>
        </div>

        {offerings.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No courses assigned.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((o, idx) => (
              <div
                key={o.id}
                onClick={() => setSelectedId(selectedId === o.id ? null : o.id)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedId === o.id
                    ? "ring-2 ring-primary bg-accent/50"
                    : "hover:bg-accent/30 hover:border-border"
                }`}
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg shrink-0 text-white text-sm font-medium"
                    style={{
                      backgroundColor: COLORS[idx % COLORS.length],
                      borderRadius: "var(--radius)",
                    }}
                  >
                    {getInitials(o.course_name || "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {o.course_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {o.course_code}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {o.enrolled_count}/
                        {o.max_students}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Section {o.section} · {o.semester_name}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      selectedId === o.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedCourse && (
          <div className="mt-6 rounded-xl border bg-background animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{selectedCourse.course_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.course_code} · Section{" "}
                  {selectedCourse.section}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {detailLoading ? (
              <div className="p-8 flex justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b px-4">
                  <TabsTrigger value="overview" className="gap-1">
                    <BarChart3 className="h-3 w-3" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="students" className="gap-1">
                    <Users className="h-3 w-3" /> Students ({students.length})
                  </TabsTrigger>
                  <TabsTrigger value="assignments" className="gap-1">
                    <ClipboardList className="h-3 w-3" /> Assignments (
                    {assignments.length})
                  </TabsTrigger>
                  <TabsTrigger value="attendance" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Attendance
                  </TabsTrigger>
                  <TabsTrigger value="content" className="gap-1">
                    <FolderOpen className="h-3 w-3" /> Content ({content.length}
                    )
                  </TabsTrigger>
                  <TabsTrigger value="announcements" className="gap-1">
                    <Bell className="h-3 w-3" /> Announcements (
                    {announcements.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="m-0 p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-lg border text-center">
                      <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{students.length}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <ClipboardList className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{assignments.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Assignments
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <FolderOpen className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{content.length}</p>
                      <p className="text-xs text-muted-foreground">
                        Content Items
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <Bell className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">
                        {announcements.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Announcements
                      </p>
                    </div>
                  </div>
                  {attendanceSummary && (
                    <div className="mt-4 p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">Attendance Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Present</span>
                          <span className="font-medium">
                            {attendanceSummary.present}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Absent</span>
                          <span className="font-medium">
                            {attendanceSummary.absent}
                          </span>
                        </div>
                        <Progress
                          value={
                            (attendanceSummary.present /
                              attendanceSummary.total) *
                            100
                          }
                          className="mt-2"
                        />
                        <p className="text-xs text-center text-muted-foreground">
                          {Math.round(
                            (attendanceSummary.present /
                              attendanceSummary.total) *
                              100,
                          )}
                          % Attendance Rate
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="students" className="m-0">
                  <ScrollArea className="h-[450px]">
                    {students.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No students enrolled
                      </div>
                    ) : (
                      <div className="divide-y">
                        {students.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 hover:bg-accent/30"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(
                                    s.first_name + " " + s.last_name,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {s.first_name} {s.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {s.email}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`mailto:${s.email}`}
                              className="p-2 hover:bg-accent rounded-lg"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="assignments" className="m-0">
                  <ScrollArea className="h-[450px]">
                    {assignments.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No assignments yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {assignments.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 hover:bg-accent/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{a.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Due:{" "}
                                    {new Date(a.due_date).toLocaleDateString()}
                                  </span>
                                  <Separator
                                    orientation="vertical"
                                    className="h-3"
                                  />
                                  <span>{a.submission_count} submissions</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={a.is_published ? "default" : "secondary"}
                            >
                              {a.is_published ? "Published" : "Draft"}
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
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {attendanceSummary.present}
                          </p>
                          <p className="text-xs text-green-600">Present</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {attendanceSummary.absent}
                          </p>
                          <p className="text-xs text-red-600">Absent</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted text-center">
                          <p className="text-2xl font-bold">
                            {attendanceSummary.total}
                          </p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                      <Progress
                        value={
                          (attendanceSummary.present /
                            attendanceSummary.total) *
                          100
                        }
                        className="h-3"
                      />
                      <p className="text-center text-sm text-muted-foreground">
                        Overall Attendance:{" "}
                        {Math.round(
                          (attendanceSummary.present /
                            attendanceSummary.total) *
                            100,
                        )}
                        %
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
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No content uploaded yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {content.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-3 hover:bg-accent/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{c.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {c.content_type}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="announcements" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {announcements.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No announcements yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {announcements.map((a) => (
                          <div key={a.id} className="p-3 hover:bg-accent/30">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{a.title}</p>
                              {a.is_urgent && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px]"
                                >
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {a.description || a.body}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(a.created_at).toLocaleDateString()}
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
      </div>
    </>
  );
}
