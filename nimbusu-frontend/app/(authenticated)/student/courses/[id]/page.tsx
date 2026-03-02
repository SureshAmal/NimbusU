"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { assignmentsService, contentService, attendanceService } from "@/services/api";
import type { CourseOffering, Assignment, Content } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, ClipboardList, FileText, ScrollText, Download } from "lucide-react";

export default function StudentCourseDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [offering, setOffering] = useState<CourseOffering | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [attendance, setAttendance] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const [offRes, assRes, contRes, attRes] = await Promise.all([
                    api.get(`/academics/offerings/${id}/`),
                    assignmentsService.list({ course_offering: id }),
                    contentService.list({ course_offering: id }),
                    attendanceService.myCourse(id).catch(() => ({ data: { results: [] } })),
                ]);
                setOffering(offRes.data);
                setAssignments(assRes.data.results ?? []);
                setContent(contRes.data.results ?? []);
                setAttendance(attRes.data.results ?? []);
            } catch { toast.error("Failed to load course data"); }
            finally { setLoading(false); }
        }
        fetch();
    }, [id]);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-[400px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    const present = (attendance as Array<{ status: string }>).filter((a) => a.status === "present" || a.status === "late").length;
    const total = attendance.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{offering?.course_name}</h1>
                <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{offering?.course_code}</Badge>
                    <Badge variant="outline">{offering?.faculty_name}</Badge>
                    <Badge variant="outline">{offering?.semester_name}</Badge>
                </div>
            </div>

            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" /> Content</TabsTrigger>
                    <TabsTrigger value="assignments"><ClipboardList className="h-4 w-4 mr-1" /> Assignments</TabsTrigger>
                    <TabsTrigger value="attendance"><ScrollText className="h-4 w-4 mr-1" /> Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className={content.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                            {content.length === 0 ? "No content available for this course." : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="w-[50px]" /></TableRow></TableHeader>
                                    <TableBody>
                                        {content.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.title}</TableCell>
                                                <TableCell><Badge variant="secondary">{c.content_type}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{c.file && <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className={assignments.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                            {assignments.length === 0 ? "No assignments yet." : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Due Date</TableHead><TableHead>Max Marks</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {assignments.map((a) => {
                                            const overdue = new Date(a.due_date) < new Date();
                                            return (
                                                <TableRow key={a.id}>
                                                    <TableCell className="font-medium">{a.title}</TableCell>
                                                    <TableCell><Badge variant="secondary">{a.assignment_type}</Badge></TableCell>
                                                    <TableCell><span style={{ color: overdue ? "var(--destructive)" : undefined }}>{new Date(a.due_date).toLocaleDateString()}</span></TableCell>
                                                    <TableCell>{a.max_marks}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardHeader><CardTitle className="text-lg">Attendance Summary</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold" style={{ color: pct >= 75 ? "var(--primary)" : "var(--destructive)" }}>{pct}%</div>
                                    <p className="text-sm text-muted-foreground">Attendance</p>
                                </div>
                                <div className="text-center"><div className="text-xl font-bold">{present}</div><p className="text-sm text-muted-foreground">Present</p></div>
                                <div className="text-center"><div className="text-xl font-bold">{total - present}</div><p className="text-sm text-muted-foreground">Absent</p></div>
                                <div className="text-center"><div className="text-xl font-bold">{total}</div><p className="text-sm text-muted-foreground">Total</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
