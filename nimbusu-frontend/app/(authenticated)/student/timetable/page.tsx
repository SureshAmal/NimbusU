"use client";

import { useEffect, useState } from "react";
import { timetableService } from "@/services/api";
import type { TimetableEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Clock } from "lucide-react";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await timetableService.mine();
                setEntries(Array.isArray(data) ? data : []);
            } catch { toast.error("Failed to load timetable"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[400px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    const byDay = DAYS.slice(1).map((day, i) => ({
        day,
        entries: entries.filter((e) => e.day_of_week === i + 1).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">My Timetable</h1><p className="text-muted-foreground text-sm">Your weekly class schedule</p></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {byDay.map(({ day, entries: dayEntries }) => (
                    <Card key={day} style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{day}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {dayEntries.length === 0 ? <p className="text-xs text-muted-foreground">No classes</p> : dayEntries.map((e) => (
                                <div key={e.id} className="flex items-center gap-3 border-l-3 pl-3 py-1" style={{ borderColor: "var(--primary)" }}>
                                    <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{e.course_name}</p>
                                        <p className="text-xs text-muted-foreground">{e.start_time} – {e.end_time} · {e.room_name} · {e.faculty_name}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
