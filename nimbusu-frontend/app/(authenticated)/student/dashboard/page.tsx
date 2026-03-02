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
    FileText,
    Bell,
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

export default function StudentDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ttRes, enrRes, assRes] = await Promise.all([
                    api.get("/timetable/me/"),
                    api.get("/academics/enrollments/me/"),
                    api.get("/assignments/?ordering=-due_date"),
                ]);
                setTimetable(ttRes.data.results ?? ttRes.data ?? []);
                setEnrollments(enrRes.data.results ?? enrRes.data ?? []);
                setAssignments(assRes.data.results ?? assRes.data ?? []);
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" style={{ borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
            </div>
        );
    }

    const today = new Date().getDay();
    const todayClasses = timetable.filter((e) => e.day_of_week === today);

    const now = new Date();
    const upcoming = assignments.filter((a) => new Date(a.due_date) > now).slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontSize: "var(--text-2xl)" }}>
                    Hi, {user?.first_name}! 👋
                </h1>
                <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                    Here&apos;s what&apos;s happening today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Today's Classes" value={todayClasses.length} icon={Calendar} description="Scheduled for today" />
                <StatCard title="Enrolled Courses" value={enrollments.length} icon={BookOpen} description="Active enrollments" />
                <StatCard title="Upcoming Deadlines" value={upcoming.length} icon={ClipboardList} description="Assignments due" />
                <StatCard title="Notifications" value="—" icon={Bell} description="Unread" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Today's Schedule */}
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" style={{ color: "var(--primary)" }} />
                            Today&apos;s Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todayClasses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No classes today. Enjoy your day off!</p>
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
                                                <p className="text-sm text-muted-foreground">{entry.room_name} · {entry.faculty_name}</p>
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

                {/* Upcoming assignments */}
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" style={{ color: "var(--primary)" }} />
                            Upcoming Deadlines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No upcoming deadlines. You&apos;re all caught up!</p>
                        ) : (
                            <div className="space-y-3">
                                {upcoming.map((a) => (
                                    <div
                                        key={a.id}
                                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                                        style={{ borderColor: "var(--border)" }}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{a.title}</p>
                                            <p className="text-xs text-muted-foreground">{a.course_name}</p>
                                        </div>
                                        <span className="text-xs font-mono" style={{ color: "var(--destructive)" }}>
                                            {new Date(a.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
