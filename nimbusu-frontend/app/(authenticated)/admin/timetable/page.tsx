"use client";

import { useEffect, useState } from "react";
import { timetableService } from "@/services/api";
import type { TimetableEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function AdminTimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await timetableService.list();
                setEntries(data.results ?? []);
            } catch { toast.error("Failed to load timetable"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[500px] w-full" style={{ borderRadius: "var(--radius-lg)" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Timetable Management</h1>
                <p className="text-muted-foreground text-sm">View and manage class schedules</p>
            </div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                                <th className="p-3 text-left font-medium text-muted-foreground w-20">Time</th>
                                {DAYS.slice(1).map((d) => (
                                    <th key={d} className="p-3 text-left font-medium text-muted-foreground">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((slot) => (
                                <tr key={slot} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                                    <td className="p-3 font-mono text-xs text-muted-foreground">{slot}</td>
                                    {DAYS.slice(1).map((_, dayIdx) => {
                                        const dayEntries = entries.filter(
                                            (e) => e.day_of_week === dayIdx + 1 && e.start_time?.startsWith(slot)
                                        );
                                        return (
                                            <td key={dayIdx} className="p-1">
                                                {dayEntries.map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className="p-2 rounded-md text-xs"
                                                        style={{
                                                            background: "var(--accent)",
                                                            borderRadius: "var(--radius)",
                                                            borderLeft: "3px solid var(--primary)",
                                                        }}
                                                    >
                                                        <p className="font-medium truncate">{entry.course_name}</p>
                                                        <p className="text-muted-foreground">{entry.room_name}</p>
                                                        <p className="text-muted-foreground">{entry.faculty_name}</p>
                                                    </div>
                                                ))}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
