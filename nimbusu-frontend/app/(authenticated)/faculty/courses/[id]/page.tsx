"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { assignmentsService, attendanceService, contentService } from "@/services/api";
import type { CourseOffering, Assignment, Content, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, ClipboardList, Users, FileText, Calendar, Plus, Loader2 } from "lucide-react";

export default function FacultyCourseDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [offering, setOffering] = useState<CourseOffering | null>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    /* Assignment creation */
    const [assignDialog, setAssignDialog] = useState(false);
    const [assignSaving, setAssignSaving] = useState(false);
    const [assignForm, setAssignForm] = useState({
        title: "", description: "", due_date: "", max_marks: 100, assignment_type: "assignment", is_published: true,
    });

    useEffect(() => {
        async function fetch() {
            try {
                const [offRes, studRes, assRes, contRes] = await Promise.all([
                    api.get(`/academics/offerings/${id}/`),
                    api.get(`/academics/offerings/${id}/students/`),
                    assignmentsService.list({ course_offering: id }),
                    contentService.list({ course_offering: id }),
                ]);
                setOffering(offRes.data);
                setStudents(studRes.data.data ?? studRes.data ?? []);
                setAssignments(assRes.data.results ?? []);
                setContent(contRes.data.results ?? []);
            } catch { toast.error("Failed to load course data"); }
            finally { setLoading(false); }
        }
        fetch();
    }, [id]);

    async function createAssignment(e: React.FormEvent) {
        e.preventDefault(); setAssignSaving(true);
        try {
            await assignmentsService.create({ ...assignForm, course_offering: id, max_marks: assignForm.max_marks } as unknown as Parameters<typeof assignmentsService.create>[0]);
            toast.success("Assignment created"); setAssignDialog(false);
            const { data } = await assignmentsService.list({ course_offering: id });
            setAssignments(data.results ?? []);
        } catch { toast.error("Failed to create"); }
        finally { setAssignSaving(false); }
    }

    if (loading) {
        return <div className="space-y-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-full" /><Skeleton className="h-[400px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{offering?.course_name}</h1>
                <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{offering?.course_code}</Badge>
                    <Badge variant="outline">Section {offering?.section}</Badge>
                    <Badge variant="outline">{offering?.semester_name}</Badge>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview"><BookOpen className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
                    <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Students</TabsTrigger>
                    <TabsTrigger value="assignments"><ClipboardList className="h-4 w-4 mr-1" /> Assignments</TabsTrigger>
                    <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" /> Content</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enrolled Students</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
                        </Card>
                        <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Assignments</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{assignments.length}</div></CardContent>
                        </Card>
                        <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Content Items</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{content.length}</div></CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="students">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No students enrolled.</TableCell></TableRow>
                                    ) : students.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                                            <TableCell className="text-muted-foreground">{s.email}</TableCell>
                                            <TableCell className="text-muted-foreground">{s.department_name ?? "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                    <div className="flex justify-end"><Button onClick={() => setAssignDialog(true)} style={{ borderRadius: "var(--radius)" }}><Plus className="h-4 w-4 mr-2" /> New Assignment</Button></div>
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Due Date</TableHead><TableHead>Marks</TableHead><TableHead>Submissions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {assignments.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assignments yet.</TableCell></TableRow>
                                    ) : assignments.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-medium">{a.title}</TableCell>
                                            <TableCell><Badge variant="secondary">{a.assignment_type}</Badge></TableCell>
                                            <TableCell>{new Date(a.due_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{a.max_marks}</TableCell>
                                            <TableCell>{a.submission_count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
                            <form onSubmit={createAssignment} className="space-y-4">
                                <div className="space-y-2"><Label>Title</Label><Input value={assignForm.title} onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })} required /></div>
                                <div className="space-y-2"><Label>Description</Label><Textarea value={assignForm.description} onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })} rows={3} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2"><Label>Due Date</Label><Input type="datetime-local" value={assignForm.due_date} onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })} required /></div>
                                    <div className="space-y-2"><Label>Max Marks</Label><Input type="number" value={assignForm.max_marks} onChange={(e) => setAssignForm({ ...assignForm, max_marks: +e.target.value })} required /></div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={assignForm.assignment_type} onValueChange={(v) => setAssignForm({ ...assignForm, assignment_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assignment">Assignment</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="project">Project</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter><Button type="submit" disabled={assignSaving}>{assignSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="content">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className={content.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                            {content.length === 0 ? "No content uploaded yet." : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Visibility</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {content.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.title}</TableCell>
                                                <TableCell><Badge variant="secondary">{c.content_type}</Badge></TableCell>
                                                <TableCell><Badge variant="outline">{c.visibility}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
