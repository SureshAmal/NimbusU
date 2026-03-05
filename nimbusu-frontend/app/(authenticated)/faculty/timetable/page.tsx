"use client";

import { useEffect, useState, useMemo } from "react";
import { timetableService, substituteFacultyService, classCancellationService } from "@/services/api";
import api from "@/lib/api";
import type { TimetableEntry, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    ModernEventCalendar,
    CalendarEvent,
} from "@/components/application/modern-calendar";
import { format, parse, setDay, startOfWeek, addWeeks } from "date-fns";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { MapPin, Users, Tag, Clock, UserPlus, CalendarX2, Loader2 } from "lucide-react";

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
                description: `${entry.location} • Batch ${entry.batch} • ${entry.subject_type_display}`,
                entry,
            },
        });
    }
    return events;
}

export default function FacultyTimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const [facultyList, setFacultyList] = useState<User[]>([]);

    // Substitute logic
    const [subDialog, setSubDialog] = useState(false);
    const [subSaving, setSubSaving] = useState(false);
    const [subForm, setSubForm] = useState({ substitute_faculty: "", reason: "" });

    // Cancel / Reschedule logic
    const [cancelDialog, setCancelDialog] = useState(false);
    const [cancelSaving, setCancelSaving] = useState(false);
    const [cancelForm, setCancelForm] = useState({ action: "cancelled", reason: "", new_date: "", new_start_time: "", new_end_time: "" });

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await timetableService.mine();
                // @ts-ignore
                setEntries(Array.isArray(data) ? data : (data.results ?? []));

                // Fetch faculty list for substitute selection
                const facRes = await api.get("/users/?role=faculty");
                setFacultyList(facRes.data.results ?? facRes.data ?? []);
            } catch { toast.error("Failed to load timetable"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return entries;
        const q = searchQuery.toLowerCase();
        return entries.filter((e) =>
            e.course_name.toLowerCase().includes(q) ||
            e.course_code.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.batch.toLowerCase().includes(q)
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

    const handleSubstitute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent?.extendedProps?.entry || !selectedEvent.start) return;
        setSubSaving(true);
        try {
            const entry = selectedEvent.extendedProps.entry as TimetableEntry;
            await substituteFacultyService.create({
                timetable_entry: entry.id,
                substitute_faculty: subForm.substitute_faculty,
                date: format(selectedEvent.start, "yyyy-MM-dd"),
                reason: subForm.reason
            });
            toast.success("Substitute assigned successfully");
            setSubDialog(false);
            setSheetOpen(false);
        } catch (error) {
            toast.error("Failed to assign substitute");
        } finally {
            setSubSaving(false);
        }
    };

    const handleCancellation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent?.extendedProps?.entry || !selectedEvent.start) return;
        setCancelSaving(true);
        try {
            const entry = selectedEvent.extendedProps.entry as TimetableEntry;
            const payload: any = {
                timetable_entry: entry.id,
                date: format(selectedEvent.start, "yyyy-MM-dd"),
                action: cancelForm.action,
                reason: cancelForm.reason
            };

            if (cancelForm.action === "rescheduled") {
                payload.new_date = cancelForm.new_date;
                payload.start_time = cancelForm.new_start_time;
                payload.end_time = cancelForm.new_end_time;
            }

            await classCancellationService.create(payload);
            toast.success(cancelForm.action === "cancelled" ? "Class cancelled" : "Class rescheduled");
            setCancelDialog(false);
            setSheetOpen(false);
        } catch (error) {
            toast.error("Failed to process request");
        } finally {
            setCancelSaving(false);
        }
    };

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

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle className="text-xl">{selectedEvent?.title}</SheetTitle>
                        <SheetDescription className="flex items-center gap-2 mt-1">
                            {selectedEvent?.start && selectedEvent?.end && (
                                <>
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {format(selectedEvent.start, "hh:mm a")} - {format(selectedEvent.end, "hh:mm a")}
                                    </span>
                                </>
                            )}
                        </SheetDescription>
                    </SheetHeader>

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
                                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Batch</p>
                                        <p className="text-sm text-muted-foreground">{(selectedEvent.extendedProps.entry as TimetableEntry).batch}</p>
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

                            <div className="grid grid-cols-2 gap-3 pt-6 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full flex-col h-auto py-3 gap-1"
                                    onClick={() => {
                                        setSubForm({ substitute_faculty: "", reason: "" });
                                        setSubDialog(true);
                                    }}
                                >
                                    <UserPlus className="h-5 w-5 mb-1" />
                                    <span className="text-xs">Assign Substitute</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full flex-col h-auto py-3 gap-1 border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
                                    onClick={() => {
                                        setCancelForm({ action: "cancelled", reason: "", new_date: "", new_start_time: "", new_end_time: "" });
                                        setCancelDialog(true);
                                    }}
                                >
                                    <CalendarX2 className="h-5 w-5 mb-1" />
                                    <span className="text-xs">Cancel / Reschedule</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Substitute Dialog */}
            <Dialog open={subDialog} onOpenChange={setSubDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Assign Substitute Faculty</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubstitute} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input value={selectedEvent?.start ? format(selectedEvent.start, "MMMM d, yyyy") : ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Substitute Faculty</Label>
                            <Select value={subForm.substitute_faculty} onValueChange={(v) => setSubForm(p => ({ ...p, substitute_faculty: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                                <SelectContent>
                                    {facultyList.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.first_name} {f.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input value={subForm.reason} onChange={(e) => setSubForm(p => ({ ...p, reason: e.target.value }))} required />
                        </div>
                        <DialogFooter className="mt-4 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setSubDialog(false)} disabled={subSaving}>Close</Button>
                            <Button type="submit" disabled={subSaving || !subForm.substitute_faculty}>
                                {subSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel/Reschedule Dialog */}
            <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Manage Class Session</DialogTitle></DialogHeader>
                    <form onSubmit={handleCancellation} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Original Date</Label>
                            <Input value={selectedEvent?.start ? format(selectedEvent.start, "MMMM d, yyyy") : ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Action</Label>
                            <Select value={cancelForm.action} onValueChange={(v) => setCancelForm(p => ({ ...p, action: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cancelled">Cancel Class</SelectItem>
                                    <SelectItem value="rescheduled">Reschedule (Makeup Class)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input value={cancelForm.reason} onChange={(e) => setCancelForm(p => ({ ...p, reason: e.target.value }))} required />
                        </div>

                        {cancelForm.action === "rescheduled" && (
                            <div className="p-4 border rounded-lg bg-accent/30 space-y-3 animate-in fade-in zoom-in-95">
                                <Label className="text-secondary-foreground">Makeup Details</Label>
                                <div className="space-y-2">
                                    <Label className="text-xs">New Date</Label>
                                    <Input type="date" value={cancelForm.new_date} onChange={(e) => setCancelForm(p => ({ ...p, new_date: e.target.value }))} required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Start Time</Label>
                                        <Input type="time" value={cancelForm.new_start_time} onChange={(e) => setCancelForm(p => ({ ...p, new_start_time: e.target.value }))} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">End Time</Label>
                                        <Input type="time" value={cancelForm.new_end_time} onChange={(e) => setCancelForm(p => ({ ...p, new_end_time: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setCancelDialog(false)} disabled={cancelSaving}>Close</Button>
                            <Button type="submit" disabled={cancelSaving}>
                                {cancelSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
