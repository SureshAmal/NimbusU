"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  timetableService,
  offeringsService,
  semestersService,
} from "@/services/api";
import type { TimetableEntry, CourseOffering, Semester, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ModernEventCalendar,
  CalendarEvent,
} from "@/components/application/modern-calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { parse, setDay, startOfWeek, addWeeks } from "date-fns";
import {
  Plus,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Trash2,
  Pencil,
  BookOpen,
  Save,
  X,
  Download,
  Upload,
} from "lucide-react";

const SUBJECT_COLORS: Record<string, string> = {
  classroom: "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400",
  lab: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  tutorial: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
};

const DAY_OPTIONS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const SUBJECT_TYPE_OPTIONS = [
  { value: "classroom", label: "Classroom" },
  { value: "lab", label: "Laboratory" },
  { value: "tutorial", label: "Tutorial" },
];

function generateEventsForEntry(
  entry: TimetableEntry,
  baseDate: Date,
  weeksBefore: number,
  weeksAfter: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const baseWeekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const dateFnsDayIndex = entry.day_of_week === 6 ? 0 : entry.day_of_week + 1;

  for (let i = -weeksBefore; i <= weeksAfter; i++) {
    const weekStart = addWeeks(baseWeekStart, i);
    const eventDate = setDay(weekStart, dateFnsDayIndex, {
      weekStartsOn: 1,
    });

    const start = parse(entry.start_time.substring(0, 5), "HH:mm", eventDate);
    const end = parse(entry.end_time.substring(0, 5), "HH:mm", eventDate);

    events.push({
      id: `${entry.id}-${eventDate.toISOString()}`,
      title: entry.course_name,
      start,
      end,
      color:
        SUBJECT_COLORS[entry.subject_type] ??
        "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
      extendedProps: {
        description: `${entry.location} • ${entry.faculty_name} • ${entry.subject_type_display}`,
        entry,
      },
    });
  }

  return events;
}

interface ConflictData {
  type: string;
  location?: string;
  faculty?: string;
  entry_a: TimetableEntry;
  entry_b: TimetableEntry;
}

export default function AdminTimetableManagePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetEditing, setSheetEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [advancedDetailsDialogOpen, setAdvancedDetailsDialogOpen] = useState(false);
  const [advancedDetails, setAdvancedDetails] = useState<any>(null);
  const [roomDetailsDialogOpen, setRoomDetailsDialogOpen] = useState(false);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conflictsDialogOpen, setConflictsDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<User[]>([]);
  const [weekViewOpen, setWeekViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    course_offering: "",
    batch: "",
    subject_type: "classroom" as "classroom" | "lab" | "tutorial",
    location: "",
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
    semester: "",
    is_active: true,
  });
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [timetableRes, offeringsRes, semestersRes] = await Promise.all([
        timetableService.list({ page_size: "1000" }),
        offeringsService.list({ page_size: "1000" }),
        semestersService.list(),
      ]);
      setEntries(timetableRes.data.results ?? []);
      setOfferings(offeringsRes.data.results ?? []);
      setSemesters(semestersRes.data.results ?? []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const uniqueBatches = useMemo(() => {
    const batches = new Set(entries.map((e) => e.batch).filter(Boolean));
    return Array.from(batches).sort();
  }, [entries]);

  useEffect(() => {
    if (!uniqueBatches.length) return;
    if (selectedBatch && !uniqueBatches.includes(selectedBatch)) {
      setSelectedBatch("");
    }
  }, [uniqueBatches, selectedBatch]);

  const resetForm = () => {
    const cur = semesters.find((s) => s.is_current);
    setForm({
      course_offering: "",
      batch: "",
      subject_type: "classroom",
      location: "",
      day_of_week: 0,
      start_time: "09:00",
      end_time: "10:00",
      semester: cur?.id || "",
      is_active: true,
    });
  };

  const populateFormFromEntry = (entry: TimetableEntry) => {
    setForm({
      course_offering: entry.course_offering,
      batch: entry.batch,
      subject_type: entry.subject_type,
      location: entry.location,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time.substring(0, 5),
      end_time: entry.end_time.substring(0, 5),
      semester: entry.semester,
      is_active: entry.is_active,
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    const entry = event.extendedProps?.entry as TimetableEntry;
    if (!entry) return;
    setSelectedEntry(entry);
    populateFormFromEntry(entry);
    setSheetEditing(false);
    setSheetOpen(true);
  };

  const openEntryDetails = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    populateFormFromEntry(entry);
    setSheetEditing(false);
    setSheetOpen(true);
  };

  const openEntryEditor = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    populateFormFromEntry(entry);
    setSheetEditing(true);
    setSheetOpen(true);
  };

  const openEntryDelete = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    populateFormFromEntry(entry);
    setDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    if (selectedBatch) {
      setForm((prev) => ({ ...prev, batch: selectedBatch }));
    }
    setCreateDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await timetableService.create(form as unknown as Parameters<typeof timetableService.create>[0]);
      toast.success("Timetable entry created");
      setCreateDialogOpen(false);
      fetchAll();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create entry");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    try {
      await timetableService.update(selectedEntry.id, form as unknown as Parameters<typeof timetableService.update>[1]);
      toast.success("Timetable entry updated");
      setSheetEditing(false);
      setSheetOpen(false);
      fetchAll();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    try {
      await timetableService.delete(selectedEntry.id);
      toast.success("Timetable entry deleted");
      setDeleteDialogOpen(false);
      setSheetOpen(false);
      setSelectedEntry(null);
      fetchAll();
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setSaving(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedBatch) {
      toast.error("Select a batch first");
      return;
    }

    setSaving(true);
    try {
      await timetableService.deleteBatch({
        batch: selectedBatch,
        semester: selectedSemester !== "all" ? selectedSemester : undefined,
      });
      toast.success(`Deleted timetable entries for batch ${selectedBatch}`);
      setBatchDeleteDialogOpen(false);
      setSheetOpen(false);
      setSelectedEntry(null);
      fetchAll();
    } catch {
      toast.error("Failed to delete batch timetable");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedBatch) params.batch = selectedBatch;
      if (selectedSemester !== "all") params.semester = selectedSemester;
      if (selectedSubjectType !== "all") params.subject_type = selectedSubjectType;

      const response = await timetableService.exportCsv(params);
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "timetable.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export timetable CSV");
    }
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      toast.error("Choose a CSV file first");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const response = await timetableService.importCsv(formData);
      const created = response.data?.created_count ?? 0;
      const updated = response.data?.updated_count ?? 0;
      const errors = response.data?.errors?.length ?? 0;

      toast.success(`CSV imported: ${created} created, ${updated} updated${errors ? `, ${errors} errors` : ""}`);
      setImportDialogOpen(false);
      setCsvFile(null);
      fetchAll();
    } catch {
      toast.error("Failed to import timetable CSV");
    } finally {
      setSaving(false);
    }
  };

  const checkConflicts = async () => {
    setLoadingConflicts(true);
    setConflictsDialogOpen(true);
    try {
      const res = await timetableService.conflicts();
      setConflicts(res.data.data || []);
    } catch {
      toast.error("Failed to load conflicts");
    } finally {
      setLoadingConflicts(false);
    }
  };

  const fetchEntryDetails = async () => {
    if (!selectedEntry) return;
    try {
      const { data } = await timetableService.get(selectedEntry.id);
      setAdvancedDetails(data);
      setAdvancedDetailsDialogOpen(true);
    } catch {
      toast.error("Failed to load full entry details using timetableService.get");
    }
  };

  const fetchRoomDetails = async () => {
    if (!selectedEntry?.location) return;
    try {
      const { data } = await timetableService.rooms.get(selectedEntry.location);
      setRoomDetails(data);
      setRoomDetailsDialogOpen(true);
    } catch {
      toast.error("Failed to load room details using timetableService.rooms.get");
    }
  };

  const scopeEntries = useMemo(() => {
    let scoped = entries;
    if (selectedSemester !== "all") scoped = scoped.filter((e) => e.semester === selectedSemester);
    if (selectedSubjectType !== "all") scoped = scoped.filter((e) => e.subject_type === selectedSubjectType);
    return scoped;
  }, [entries, selectedSemester, selectedSubjectType]);

  const batchCards = useMemo(() => {
    const grouped = new Map<string, TimetableEntry[]>();
    scopeEntries.forEach((entry) => {
      if (!grouped.has(entry.batch)) {
        grouped.set(entry.batch, []);
      }
      grouped.get(entry.batch)!.push(entry);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([batch, batchEntries]) => ({
        batch,
        entryCount: batchEntries.length,
        courseCount: new Set(batchEntries.map((entry) => entry.course_offering)).size,
        semesterNames: Array.from(new Set(batchEntries.map((entry) => entry.semester_name).filter(Boolean))).join(", "),
        divisions: Array.from(new Set(batchEntries.map((entry) => entry.division).filter(Boolean))),
      }));
  }, [scopeEntries]);

  const filteredEntries = useMemo(() => {
    let filtered = scopeEntries;
    if (selectedBatch) filtered = filtered.filter((e) => e.batch === selectedBatch);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.course_name.toLowerCase().includes(q) ||
          e.faculty_name.toLowerCase().includes(q) ||
          e.course_code.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.batch.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [scopeEntries, selectedBatch, searchQuery]);

  const calendarEvents = useMemo(() => {
    const today = new Date();
    const all: CalendarEvent[] = [];
    filteredEntries.forEach((entry) => {
      all.push(...generateEventsForEntry(entry, today, 10, 10));
    });
    return all;
  }, [filteredEntries]);

  const groupedCourses = useMemo(() => {
    const grouped = new Map<string, TimetableEntry[]>();

    filteredEntries.forEach((entry) => {
      const key = `${entry.course_offering}__${entry.course_code}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(entry);
    });

    return Array.from(grouped.values())
      .map((courseEntries) => ({
        key: `${courseEntries[0].course_offering}-${courseEntries[0].course_code}`,
        courseCode: courseEntries[0].course_code,
        courseName: courseEntries[0].course_name,
        facultyName: courseEntries[0].faculty_name,
        semesterName: courseEntries[0].semester_name,
        entries: courseEntries.slice().sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
          return a.start_time.localeCompare(b.start_time);
        }),
      }))
      .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }, [filteredEntries]);

  if (loading) {
    return (
      <div className="space-y-6 h-[800px] flex flex-col p-6">
        <Skeleton className="h-12 w-full rounded-[var(--radius)]" />
        <Skeleton className="flex-1 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  const renderFormFields = () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Course Offering *</Label>
        <Select value={form.course_offering} onValueChange={(v) => setForm({ ...form, course_offering: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {offerings.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.course_code} – {o.course_name} ({o.section})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Semester *</Label>
        <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.academic_year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Batch *</Label>
        <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. A1, B2, CS-2024" />
      </div>

      <div className="space-y-2">
        <Label>Subject Type *</Label>
        <Select value={form.subject_type} onValueChange={(v: "classroom" | "lab" | "tutorial") => setForm({ ...form, subject_type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location *</Label>
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Room 101, Lab B1" />
      </div>

      <div className="space-y-2">
        <Label>Day of Week *</Label>
        <Select value={form.day_of_week.toString()} onValueChange={(v) => setForm({ ...form, day_of_week: parseInt(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value.toString()}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Start Time *</Label>
        <TimePicker value={form.start_time} onChange={(v) => setForm({ ...form, start_time: v })} />
      </div>

      <div className="space-y-2">
        <Label>End Time *</Label>
        <TimePicker value={form.end_time} onChange={(v) => setForm({ ...form, end_time: v })} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold">Division batch timetable edit</h1>
          <p className="text-sm text-muted-foreground">Each division batch owns its own timetable. Pick the division batch first, then edit only that timetable.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-full sm:w-[160px] h-8 text-sm">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubjectType} onValueChange={setSelectedSubjectType}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[130px] h-8 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {SUBJECT_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-xs">{batchCards.length} batches</Badge>
        {selectedBatch ? (
          <Badge variant="outline" className="text-xs font-mono">Selected: {selectedBatch}</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Select a batch below</Badge>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setWeekViewOpen(true)} className="h-8 gap-1.5 text-xs" disabled={!selectedBatch || filteredEntries.length === 0}>
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Week View</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="h-8 gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={checkConflicts} className="h-8 gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Conflicts</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBatchDeleteDialogOpen(true)} className="h-8 gap-1.5 text-xs" disabled={!selectedBatch}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete Batch</span>
          </Button>
          <Button size="sm" onClick={openCreateDialog} className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Batch Entry</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedBatch("")} className="h-8 text-xs" disabled={!selectedBatch}>
            Clear Selection
          </Button>
        </div>
      </div>

      <div className="mt-3 flex-1 px-1 min-h-0 overflow-y-auto">
        <div className="mb-4 rounded-xl border bg-background">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">All division batches</h2>
              <p className="text-xs text-muted-foreground">Choose a division batch to open its timetable editor and week calendar.</p>
            </div>
            <Badge variant="secondary" className="text-xs">{batchCards.length} batches</Badge>
          </div>

          {batchCards.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No batches found for the selected semester and type filters.
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {batchCards.map((batchCard) => (
                <button
                  key={batchCard.batch}
                  type="button"
                  onClick={() => setSelectedBatch(batchCard.batch)}
                  className={`rounded-lg border p-4 text-left transition-colors hover:bg-muted/40 ${selectedBatch === batchCard.batch ? "border-primary bg-primary/5" : "bg-background"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Batch {batchCard.batch}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {batchCard.courseCount} course{batchCard.courseCount !== 1 ? "s" : ""} • {batchCard.entryCount} slot{batchCard.entryCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <Badge variant={selectedBatch === batchCard.batch ? "default" : "secondary"} className="font-mono">
                      {batchCard.batch}
                    </Badge>
                  </div>
                  {batchCard.semesterNames ? (
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div>{batchCard.semesterNames}</div>
                      <div>{batchCard.divisions.length ? `Division ${batchCard.divisions.join(", ")}` : "Division not mapped"}</div>
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-background">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Batch timetable</h2>
              <p className="text-xs text-muted-foreground">Manage the selected division batch timetable here. Click a division batch above to load its timetable.</p>
            </div>
            <Badge variant="secondary" className="text-xs">{filteredEntries.length} entries</Badge>
          </div>

          {!selectedBatch ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-40" />
              <p className="font-medium text-foreground">Select a batch first</p>
              <p>Choose any division batch from the list above to open its timetable.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-40" />
              <p className="font-medium text-foreground">No timetable entries found</p>
              <p>Create a new entry for batch {selectedBatch} or change the current filters.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {groupedCourses.map((course) => (
                <div key={course.key} className="rounded-lg border">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{course.courseCode}</span>
                        <span className="text-sm text-muted-foreground">{course.courseName}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {course.facultyName}
                        {course.semesterName ? ` • ${course.semesterName}` : ""}
                        {selectedBatch ? ` • Batch ${selectedBatch}` : ""}
                        {course.entries[0]?.division ? ` • Division ${course.entries[0].division}` : ""}
                      </div>
                    </div>
                    <Badge variant="outline">{course.entries.length} slot{course.entries.length !== 1 ? "s" : ""}</Badge>
                  </div>

                  <div className="divide-y">
                    {course.entries.map((entry) => (
                      <div
                        key={entry.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openEntryDetails(entry)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openEntryDetails(entry);
                          }
                        }}
                        className="flex w-full flex-col gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm">{entry.day_name}</span>
                            <Badge variant="outline" className="text-[10px]">{entry.subject_type_display}</Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{entry.start_time.substring(0, 5)} – {entry.end_time.substring(0, 5)}</span>
                            <span>{entry.location}</span>
                            <span>{entry.is_active ? "Active" : "Inactive"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:shrink-0">
                          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={(event) => {
                            event.stopPropagation();
                            openEntryEditor(entry);
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button type="button" variant="destructive" size="sm" className="h-8 gap-1.5" onClick={(event) => {
                            event.stopPropagation();
                            openEntryDelete(entry);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={weekViewOpen} onOpenChange={setWeekViewOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Batch week view</DialogTitle>
            <DialogDescription>
              Week calendar preview for batch {selectedBatch || "—"}. Use this popup to inspect the timetable without turning the whole page into a calendar editor.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] px-4 py-4">
            <ModernEventCalendar
              events={calendarEvents}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onEventClick={handleEventClick}
              onAddEvent={() => undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sheetOpen} onOpenChange={(open) => {
        if (!open) setSheetEditing(false);
        setSheetOpen(open);
      }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedEntry?.course_name}
              </DialogTitle>
              {!sheetEditing ? (
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSheetEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                  if (selectedEntry) populateFormFromEntry(selectedEntry);
                  setSheetEditing(false);
                }}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              )}
            </div>
            <DialogDescription>{selectedEntry?.course_code} • {selectedEntry?.subject_type_display}</DialogDescription>
          </DialogHeader>

          {selectedEntry && !sheetEditing && (
            <div className="space-y-6 py-4 px-3">
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Class Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Faculty</div>
                      <div className="font-medium">{selectedEntry.faculty_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 flex justify-between items-center pr-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Location</div>
                        <div className="font-medium">{selectedEntry.location}</div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={fetchRoomDetails}>Room Info</Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Schedule</div>
                      <div className="font-medium">{selectedEntry.day_name}</div>
                      <div className="text-sm text-muted-foreground">{selectedEntry.start_time.substring(0, 5)} – {selectedEntry.end_time.substring(0, 5)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">Academic Info</h3>
                {selectedEntry.department_name && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Department</span><span className="text-sm font-medium">{selectedEntry.department_name}</span></div>}
                {selectedEntry.program_name && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Program</span><span className="text-sm font-medium">{selectedEntry.program_name}</span></div>}
                <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Semester</span><span className="text-sm font-medium">{selectedEntry.semester_name || "N/A"}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Batch</span><Badge variant="secondary" className="font-mono">{selectedEntry.batch}</Badge></div>
                {selectedEntry.division && <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Division</span><Badge variant="outline" className="font-mono">{selectedEntry.division}</Badge></div>}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Additional Information</h3>
                <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Type</span><Badge variant="outline">{selectedEntry.subject_type_display}</Badge></div>
                <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Status</span><Badge variant={selectedEntry.is_active ? "default" : "secondary"}>{selectedEntry.is_active ? "Active" : "Inactive"}</Badge></div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={fetchEntryDetails}><BookOpen className="h-4 w-4" /> Entry Details</Button>
                <Button variant="secondary" className="flex-1 gap-2" onClick={async () => {
                  if (!selectedEntry) return;
                  setStudentsDialogOpen(true);
                  setStudentsLoading(true);
                  setStudentsList([]);
                  try {
                    const res = await offeringsService.students(selectedEntry.course_offering);
                    setStudentsList(res.data?.results ?? res.data ?? []);
                  } catch {
                    toast.error("Failed to load students");
                  } finally {
                    setStudentsLoading(false);
                  }
                }}><Users className="h-4 w-4" /> View Students</Button>
              </div>

              <Separator />

              <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete Entry
              </Button>
            </div>
          )}

          {selectedEntry && sheetEditing && (
            <div className="space-y-6 py-4 px-3">
              {renderFormFields()}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" disabled={saving} onClick={handleUpdate}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
              <Separator />
              <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete Entry
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Timetable Entry</DialogTitle>
            <DialogDescription>Add a new timetable entry{form.batch ? ` for batch ${form.batch}` : ""}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {renderFormFields()}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Timetable CSV</DialogTitle>
            <DialogDescription>Upload a CSV using readable offering columns like course code, academic year, semester name, and section. UUID columns from exported files also still work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Need a sample file?</p>
              <p className="mt-1 text-xs text-muted-foreground">Download the demo CSV and fill in values like `course_code`, `academic_year`, `semester_name`, and `section`. Import/export on this page applies to the selected batch.</p>
              <div className="mt-3">
                <a href="/timetable-batch-import-demo.csv" download className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground">Download Demo CSV</a>
              </div>
            </div>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">Tip: pick the batch first, then export that batch timetable for exact identifiers, or start from the demo template and edit the readable columns.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleImportCsv} disabled={saving || !csvFile}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Import CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timetable for Batch</DialogTitle>
            <DialogDescription>Delete timetable entries for batch {selectedBatch || "—"}{selectedSemester !== "all" ? ` in the selected semester` : " across all semesters"}. This batch-scoped action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="destructive" onClick={handleBatchDelete} disabled={saving || !selectedBatch}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete Batch Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timetable Entry</DialogTitle>
            <DialogDescription>Are you sure you want to delete this timetable entry? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conflictsDialogOpen} onOpenChange={setConflictsDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Timetable Conflicts</DialogTitle>
            <DialogDescription>Scheduling conflicts detected in the timetable</DialogDescription>
          </DialogHeader>
          {loadingConflicts ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : conflicts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No conflicts found!</p><p className="text-sm mt-1">All timetable entries are properly scheduled.</p></div>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="font-medium text-amber-900 dark:text-amber-100">{conflict.type === "location" ? `Location Conflict: ${conflict.location}` : `Faculty Conflict: ${conflict.faculty}`}</div>
                      <div className="grid gap-2 text-sm">
                        <div className="bg-background rounded p-2 border"><div className="font-medium">{conflict.entry_a.course_name}</div><div className="text-muted-foreground text-xs mt-1">{conflict.entry_a.day_name} • {conflict.entry_a.start_time} – {conflict.entry_a.end_time} • {conflict.entry_a.location}</div></div>
                        <div className="bg-background rounded p-2 border"><div className="font-medium">{conflict.entry_b.course_name}</div><div className="text-muted-foreground text-xs mt-1">{conflict.entry_b.day_name} • {conflict.entry_b.start_time} – {conflict.entry_b.end_time} • {conflict.entry_b.location}</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter><Button onClick={() => setConflictsDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Enrolled Students</DialogTitle>
            <DialogDescription>{selectedEntry?.course_name} • {selectedEntry?.batch}{selectedEntry?.semester_name ? ` • ${selectedEntry.semester_name}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {studentsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : studentsList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No students enrolled</p><p className="text-sm mt-1">No students are currently enrolled in this course offering.</p></div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium mb-3">{studentsList.length} student{studentsList.length !== 1 ? "s" : ""}</div>
                {studentsList.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">{(student.first_name?.[0] || student.email?.[0] || "?").toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                    </div>
                    {student.student_profile && <div className="flex items-center gap-1.5 shrink-0">{student.student_profile.batch_year && <Badge variant="secondary" className="text-[10px] font-mono">{student.student_profile.batch_year}</Badge>}{student.student_profile.current_semester && <Badge variant="outline" className="text-[10px]">Sem {student.student_profile.current_semester}</Badge>}{student.student_profile.division && <Badge variant="outline" className="text-[10px]">Div {student.student_profile.division}</Badge>}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setStudentsDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={advancedDetailsDialogOpen} onOpenChange={setAdvancedDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Raw Entry Details Output</DialogTitle></DialogHeader>
          <div className="border rounded-md p-4 bg-muted/50 font-mono text-xs overflow-auto max-h-[400px]"><pre>{JSON.stringify(advancedDetails, null, 2)}</pre></div>
        </DialogContent>
      </Dialog>

      <Dialog open={roomDetailsDialogOpen} onOpenChange={setRoomDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Room Details</DialogTitle></DialogHeader>
          <div className="border rounded-md p-4 bg-muted/50 font-mono text-xs overflow-auto max-h-[400px]"><pre>{JSON.stringify(roomDetails, null, 2)}</pre></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}