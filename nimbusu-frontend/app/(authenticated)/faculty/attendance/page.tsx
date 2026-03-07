"use client";

import { useEffect, useState, useCallback } from "react";
import { attendanceService, timetableService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Users,
} from "lucide-react";

interface TimetableEntry {
  id: string;
  course_name?: string;
  course_code?: string;
  batch?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

interface StudentEnrollment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function FacultyAttendancePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load faculty's timetable entries
  useEffect(() => {
    async function load() {
      try {
        const { data } = await timetableService.mine();
        const list = (data as any).results ?? (Array.isArray(data) ? data : []);
        setEntries(list);
      } catch {
        toast.error("Failed to load timetable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When a timetable entry is selected, load enrolled students
  useEffect(() => {
    if (!selectedEntry) return;
    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const entry = entries.find((e) => e.id === selectedEntry);
        if (!entry) return;
        // We need to find the course offering for this entry
        // The timetable entry response should include course_offering_id
        const entryData = entry as any;
        const offeringId = entryData.course_offering || entryData.course_offering_id;
        if (offeringId) {
          const { data } = await (await import("@/services/api")).offeringsService.students(offeringId);
          const studentList = data?.results ?? data?.data ?? data ?? [];
          setStudents(Array.isArray(studentList) ? studentList : []);
          // Initialize all students as "present" by default
          const initial: Record<string, string> = {};
          (Array.isArray(studentList) ? studentList : []).forEach((s: any) => {
            initial[s.id] = "present";
          });
          setStatuses(initial);
        }
      } catch {
        toast.error("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [selectedEntry, entries]);

  const setStudentStatus = (studentId: string, status: string) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllAs = (status: string) => {
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setStatuses(updated);
  };

  const handleSubmit = async () => {
    if (!selectedEntry || !date) {
      toast.error("Select a class and date");
      return;
    }
    setSubmitting(true);
    try {
      const records = Object.entries(statuses).map(([student_id, status]) => ({
        student_id,
        status,
      }));
      await attendanceService.markBulk({
        timetable_entry_id: selectedEntry,
        date,
        records,
      });
      toast.success(`Attendance marked for ${records.length} students`);
    } catch {
      toast.error("Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "excused":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px]" style={{ borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Select a class session and mark attendance for enrolled students.
        </p>
      </div>

      {/* Selection Controls */}
      <Card style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Class Session</Label>
              <Select value={selectedEntry} onValueChange={setSelectedEntry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {entries.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.course_name || e.course_code || "Class"} — {e.batch || "All"}{" "}
                      ({e.start_time} – {e.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAs("present")}
                  disabled={students.length === 0}
                >
                  All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAs("absent")}
                  disabled={students.length === 0}
                >
                  All Absent
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Roster */}
      {selectedEntry && (
        <Card style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Student Roster ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No students enrolled in this course.
              </p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(statuses[student.id] || "present")}
                      <div>
                        <p className="text-sm font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {["present", "absent", "late", "excused"].map((s) => (
                        <Button
                          key={s}
                          variant={statuses[student.id] === s ? "default" : "outline"}
                          size="sm"
                          className="text-xs capitalize"
                          onClick={() => setStudentStatus(student.id, s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {selectedEntry && students.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Attendance
          </Button>
        </div>
      )}
    </div>
  );
}
