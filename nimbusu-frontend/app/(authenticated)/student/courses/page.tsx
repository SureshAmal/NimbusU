"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { enrollmentsService } from "@/services/api";
import type { Enrollment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

export default function StudentCoursesPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await enrollmentsService.mine();
                setEnrollments(data.results ?? []);
            } catch { toast.error("Failed to load courses"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" style={{ borderRadius: "var(--radius-lg)" }} />)}</div></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">My Courses</h1><p className="text-muted-foreground text-sm">Your enrolled courses this semester</p></div>
            {enrollments.length === 0 ? (
                <Card style={{ borderRadius: "var(--radius-lg)" }}><CardContent className="py-12 text-center text-muted-foreground">No enrollments found.</CardContent></Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((e) => (
                        <Link key={e.id} href={`/student/courses/${e.course_offering}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                                <CardHeader className="pb-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--primary)", borderRadius: "var(--radius)" }}>
                                        <BookOpen className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
                                    </div>
                                    <CardTitle className="text-base mt-2">{e.course_name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={e.status === "active" ? "default" : "secondary"}>{e.status}</Badge>
                                        <span className="text-xs text-muted-foreground">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
