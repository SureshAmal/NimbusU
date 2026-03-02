"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { CourseOffering } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookOpen, Users } from "lucide-react";

export default function FacultyCoursesPage() {
    const [offerings, setOfferings] = useState<CourseOffering[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await api.get("/academics/offerings/");
                setOfferings(data.results ?? []);
            } catch { toast.error("Failed to load courses"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" style={{ borderRadius: "var(--radius-lg)" }} />)}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">My Courses</h1><p className="text-muted-foreground text-sm">Courses you are teaching this semester</p></div>
            {offerings.length === 0 ? (
                <Card style={{ borderRadius: "var(--radius-lg)" }}><CardContent className="py-12 text-center text-muted-foreground">No courses assigned this semester.</CardContent></Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {offerings.map((o) => (
                        <Link key={o.id} href={`/faculty/courses/${o.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--primary)", borderRadius: "var(--radius)" }}>
                                            <BookOpen className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
                                        </div>
                                        <Badge variant="secondary">{o.course_code}</Badge>
                                    </div>
                                    <CardTitle className="text-base mt-2">{o.course_name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {o.enrolled_count}/{o.max_students}</span>
                                        <span>Section {o.section}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{o.semester_name}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
