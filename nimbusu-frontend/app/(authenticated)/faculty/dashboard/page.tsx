"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    Calendar,
    ClipboardList,
    Clock,
} from "lucide-react";
import type { TimetableEntry, Enrollment, Assignment } from "@/lib/types";

function StatCard({
    title,
    value,
    icon: Icon,
    description,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
}) {
    return (
        <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function FacultyDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await api.get("/timetable/me/");
                setTimetable(data.results ?? data ?? []);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading) fetchData();
    }, [authLoading]);

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" style={{ borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
            </div>
        );
    }

    const today = new Date().getDay();
    const todayClasses = timetable.filter((e) => e.day_of_week === today);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontSize: "var(--text-2xl)" }}>
                    Welcome, {user?.first_name}
                </h1>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    Your teaching overview for today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Today's Classes" value={todayClasses.length} icon={Calendar} description="Scheduled for today" />
                <StatCard title="Total Courses" value={new Set(timetable.map((e) => e.course_offering)).size} icon={BookOpen} description="This semester" />
                <StatCard title="Pending Grades" value="—" icon={ClipboardList} description="Submissions to review" />
            </div>

            {/* Today's Schedule */}
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" style={{ color: "var(--primary)" }} />
                        Today&apos;s Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {todayClasses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
                    ) : (
                        <div className="space-y-3">
                            {todayClasses
                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                .map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between border-l-4 pl-4 py-2"
                                        style={{ borderColor: "var(--primary)", borderRadius: "var(--radius-sm)" }}
                                    >
                                        <div>
                                            <p className="font-medium">{entry.course_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {entry.room_name}
                                            </p>
                                        </div>
                                        <span className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
                                            {entry.start_time} – {entry.end_time}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
