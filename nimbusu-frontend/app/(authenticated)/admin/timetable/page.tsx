"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { timetableService, semestersService } from "@/services/api";
import type { TimetableEntry, Semester } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModernEventCalendar, CalendarEvent } from "@/components/application/modern-calendar";
import { toast } from "sonner";
import { parse, setDay, startOfWeek, addWeeks } from "date-fns";
import { Pencil } from "lucide-react";

const SUBJECT_COLORS: Record<string, string> = {
  classroom: "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400",
  lab: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  tutorial: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
};

// A helper to generate instances of a timetable entry across weeks
function generateEventsForEntry(
  entry: TimetableEntry,
  baseDate: Date,
  weeksBefore: number,
  weeksAfter: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const baseWeekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday start

  // date-fns setDay with { weekStartsOn: 1 } maps: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  let targetDayIndex = entry.day_of_week; // Assuming 0=Mon, 1=Tue... 6=Sun in backend
  const dateFnsDayIndex = targetDayIndex === 6 ? 0 : targetDayIndex + 1;

  for (let i = -weeksBefore; i <= weeksAfter; i++) {
    const weekStart = addWeeks(baseWeekStart, i);
    const eventDate = setDay(weekStart, dateFnsDayIndex, {
      weekStartsOn: 1,
    });

    const startTimeStr = entry.start_time.substring(0, 5);
    const endTimeStr = entry.end_time.substring(0, 5);

    const start = parse(startTimeStr, "HH:mm", eventDate);
    const end = parse(endTimeStr, "HH:mm", eventDate);

    events.push({
      id: `${entry.id}-${eventDate.toISOString()}`,
      title: entry.course_name,
      start,
      end,
      color: SUBJECT_COLORS[entry.subject_type] ?? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
      extendedProps: {
        description: `${entry.location} • ${entry.faculty_name} • ${entry.subject_type_display}`,
        entry,
      },
    });
  }

  return events;
}

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [timetableRes, semestersRes] = await Promise.all([
        timetableService.list({ page_size: "1000" }),
        semestersService.list(),
      ]);
      setEntries(timetableRes.data.results ?? []);
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
    if (selectedBatch !== "all" && !uniqueBatches.includes(selectedBatch)) {
      setSelectedBatch("all");
    }
  }, [uniqueBatches, selectedBatch]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;
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
    if (selectedSemester !== "all")
      filtered = filtered.filter((e) => e.semester === selectedSemester);
    if (selectedBatch && selectedBatch !== "all")
      filtered = filtered.filter((e) => e.batch === selectedBatch);
    return filtered;
  }, [
    entries,
    searchQuery,
    selectedSemester,
    selectedBatch,
  ]);

  const divisionBatchCards = useMemo(() => {
    const grouped = new Map<string, { batch: string; divisions: string[]; count: number }>();

    filteredEntries.forEach((entry) => {
      if (!grouped.has(entry.batch)) {
        grouped.set(entry.batch, { batch: entry.batch, divisions: [], count: 0 });
      }
      const current = grouped.get(entry.batch)!;
      current.count += 1;
      if (entry.division && !current.divisions.includes(entry.division)) {
        current.divisions.push(entry.division);
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.batch.localeCompare(b.batch));
  }, [filteredEntries]);

  const calendarEvents = useMemo(() => {
    const today = new Date();
    const all: CalendarEvent[] = [];
    filteredEntries.forEach((entry) => {
      all.push(...generateEventsForEntry(entry, today, 10, 10));
    });
    return all;
  }, [filteredEntries]);

  // ── render ──

  if (loading) {
    return (
      <div className="space-y-6 h-[800px] flex flex-col p-6">
        <Skeleton className="h-12 w-full rounded-[var(--radius)]" />
        <Skeleton className="flex-1 w-full rounded-[var(--radius)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold">Division batch timetable view</h1>
          <p className="text-sm text-muted-foreground">See timetable ownership by division and batch. Editing stays on a separate page so this calendar remains view-only.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/timetable/manage">
            <Pencil className="h-4 w-4" />
            Open timetable edits
          </Link>
        </Button>
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

        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-[130px] h-8 text-sm">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {uniqueBatches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-xs">
          {filteredEntries.length}
        </Badge>
      </div>

      <div className="mb-3 grid gap-3 px-1 sm:grid-cols-2 xl:grid-cols-4">
        {divisionBatchCards.map((item) => (
          <div key={item.batch} className="rounded-lg border bg-background px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{item.batch}</div>
              <Badge variant="secondary" className="font-mono text-[10px]">{item.count} slots</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {item.divisions.length ? `Division ${item.divisions.join(", ")}` : "Division not mapped"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 px-1 min-h-0">
        <ModernEventCalendar
          events={calendarEvents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddEvent={() => undefined}
        />
      </div>
    </div>
  );
}
