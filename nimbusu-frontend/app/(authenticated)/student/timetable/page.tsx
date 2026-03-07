"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { timetableService } from "@/services/api";
import { useTimetableSocket } from "@/hooks/useTimetableSocket";
import type { TimetableEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    ModernEventCalendar,
    CalendarEvent,
} from "@/components/application/modern-calendar";
import { format, parse, setDay, startOfWeek, addWeeks } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, User, Tag, Clock } from "lucide-react";

const SUBJECT_COLORS: Record<string, string> = {
    classroom: "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400",
    lab: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    tutorial: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
};

function generateEventsForEntry(
    entry: TimetableEntry,
    baseDate: Date,
    weeksBefore: number,
    weeksAfter: number,
): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const baseWeekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
    // date-fns setDay with { weekStartsOn: 1 } maps: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
    let targetDayIndex = entry.day_of_week; // Assuming 0=Mon, 1=Tue... 6=Sun in backend
    const dateFnsDayIndex = targetDayIndex === 6 ? 0 : targetDayIndex + 1;

    for (let i = -weeksBefore; i <= weeksAfter; i++) {
        const weekStart = addWeeks(baseWeekStart, i);
        const eventDate = setDay(weekStart, dateFnsDayIndex, { weekStartsOn: 1 });
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

export default function StudentTimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const fetchTimetable = useCallback(async () => {
        try {
            const { data } = await timetableService.mine();
            // @ts-ignore - Handle both array and paginated responses
            setEntries(Array.isArray(data) ? data : (data.results ?? []));
        } catch { toast.error("Failed to load timetable"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    useTimetableSocket(fetchTimetable);

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return entries;
        const q = searchQuery.toLowerCase();
        return entries.filter((e) =>
            e.course_name.toLowerCase().includes(q) ||
            e.faculty_name.toLowerCase().includes(q) ||
            e.course_code.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q)
        );
    }, [entries, searchQuery]);

    const calendarEvents = useMemo(() => {
        const today = new Date();
        const all: CalendarEvent[] = [];
        filteredEntries.forEach((entry) => {
            all.push(...generateEventsForEntry(entry, today, 10, 10));
        });
        return all;
    }, [filteredEntries]);

    if (loading) {
        return (
            <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px] space-y-4">
                <Skeleton className="h-12 w-full rounded-[var(--radius)]" />
                <Skeleton className="flex-1 w-full rounded-[var(--radius)]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px]">
            <div className="flex-1 min-h-0">
                <ModernEventCalendar
                    events={calendarEvents}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onEventClick={(event) => {
                        setSelectedEvent(event);
                        setSheetOpen(true);
                    }}
                />
            </div>

            <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                            {selectedEvent?.start && selectedEvent?.end && (
                                <>
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {format(selectedEvent.start, "hh:mm a")} - {format(selectedEvent.end, "hh:mm a")}
                                    </span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {!!selectedEvent?.extendedProps?.entry && (
                        <div className="mt-6 space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">{(selectedEvent.extendedProps.entry as TimetableEntry).location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Faculty</p>
                                        <p className="text-sm text-muted-foreground">{(selectedEvent.extendedProps.entry as TimetableEntry).faculty_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Type</p>
                                        <p className="text-sm text-muted-foreground uppercase">{String((selectedEvent.extendedProps.entry as TimetableEntry).subject_type)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
