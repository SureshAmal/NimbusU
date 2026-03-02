"use client";

import { useEffect, useState } from "react";
import {
    semestersService,
    coursesService,
    offeringsService,
    enrollmentsService,
} from "@/services/api";
import type { Semester, Course, CourseOffering } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Calendar, BookOpen, GraduationCap } from "lucide-react";

export default function AdminAcademicsPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [offerings, setOfferings] = useState<CourseOffering[]>([]);
    const [loading, setLoading] = useState(true);

    /* Create semester dialog */
    const [semDialog, setSemDialog] = useState(false);
    const [semForm, setSemForm] = useState({ name: "", academic_year: "", start_date: "", end_date: "", is_current: false });
    const [semSaving, setSemSaving] = useState(false);

    /* Create course dialog */
    const [courseDialog, setCourseDialog] = useState(false);
    const [courseForm, setCourseForm] = useState({ name: "", code: "", credits: 3, description: "" });
    const [courseSaving, setCourseSaving] = useState(false);

    async function fetchAll() {
        setLoading(true);
        try {
            const [semRes, courseRes, offRes] = await Promise.all([
                semestersService.list(),
                coursesService.list(),
                offeringsService.list(),
            ]);
            setSemesters(semRes.data.results ?? []);
            setCourses(courseRes.data.results ?? []);
            setOfferings(offRes.data.results ?? []);
        } catch {
            toast.error("Failed to load academic data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchAll(); }, []);

    async function createSemester(e: React.FormEvent) {
        e.preventDefault(); setSemSaving(true);
        try {
            await semestersService.create(semForm);
            toast.success("Semester created"); setSemDialog(false); fetchAll();
        } catch { toast.error("Failed to create semester"); }
        finally { setSemSaving(false); }
    }

    async function createCourse(e: React.FormEvent) {
        e.preventDefault(); setCourseSaving(true);
        try {
            await coursesService.create(courseForm as unknown as Parameters<typeof coursesService.create>[0]);
            toast.success("Course created"); setCourseDialog(false); fetchAll();
        } catch { toast.error("Failed to create course"); }
        finally { setCourseSaving(false); }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" style={{ borderRadius: "var(--radius-lg)" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Academic Management</h1>
                <p className="text-muted-foreground text-sm">Manage semesters, courses, and offerings</p>
            </div>

            <Tabs defaultValue="semesters">
                <TabsList>
                    <TabsTrigger value="semesters"><Calendar className="h-4 w-4 mr-1" /> Semesters</TabsTrigger>
                    <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-1" /> Courses</TabsTrigger>
                    <TabsTrigger value="offerings"><GraduationCap className="h-4 w-4 mr-1" /> Offerings</TabsTrigger>
                </TabsList>

                {/* Semesters Tab */}
                <TabsContent value="semesters" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setSemDialog(true)} style={{ borderRadius: "var(--radius)" }}><Plus className="h-4 w-4 mr-2" /> Add Semester</Button>
                    </div>
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Academic Year</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {semesters.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No semesters found.</TableCell></TableRow>
                                    ) : semesters.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell>{s.academic_year}</TableCell>
                                            <TableCell>{new Date(s.start_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(s.end_date).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge variant={s.is_current ? "default" : "secondary"}>{s.is_current ? "Current" : "Past"}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Dialog open={semDialog} onOpenChange={setSemDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Semester</DialogTitle></DialogHeader>
                            <form onSubmit={createSemester} className="space-y-4">
                                <div className="space-y-2"><Label>Name</Label><Input value={semForm.name} onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} placeholder="e.g. Fall 2026" required /></div>
                                <div className="space-y-2"><Label>Academic Year</Label><Input value={semForm.academic_year} onChange={(e) => setSemForm({ ...semForm, academic_year: e.target.value })} placeholder="e.g. 2025-2026" required /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={semForm.start_date} onChange={(e) => setSemForm({ ...semForm, start_date: e.target.value })} required /></div>
                                    <div className="space-y-2"><Label>End Date</Label><Input type="date" value={semForm.end_date} onChange={(e) => setSemForm({ ...semForm, end_date: e.target.value })} required /></div>
                                </div>
                                <DialogFooter><Button type="submit" disabled={semSaving}>{semSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setCourseDialog(true)} style={{ borderRadius: "var(--radius)" }}><Plus className="h-4 w-4 mr-2" /> Add Course</Button>
                    </div>
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Credits</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {courses.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No courses found.</TableCell></TableRow>
                                    ) : courses.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell><Badge variant="secondary">{c.code}</Badge></TableCell>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.department_name}</TableCell>
                                            <TableCell>{c.credits}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
                            <form onSubmit={createCourse} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2"><Label>Code</Label><Input value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} required /></div>
                                    <div className="space-y-2"><Label>Credits</Label><Input type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: +e.target.value })} required /></div>
                                </div>
                                <div className="space-y-2"><Label>Name</Label><Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required /></div>
                                <div className="space-y-2"><Label>Description</Label><Input value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
                                <DialogFooter><Button type="submit" disabled={courseSaving}>{courseSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Offerings Tab */}
                <TabsContent value="offerings" className="space-y-4">
                    <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Semester</TableHead><TableHead>Faculty</TableHead><TableHead>Section</TableHead><TableHead>Enrolled</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {offerings.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No offerings found.</TableCell></TableRow>
                                    ) : offerings.map((o) => (
                                        <TableRow key={o.id}>
                                            <TableCell className="font-medium">{o.course_name} <Badge variant="secondary" className="ml-1">{o.course_code}</Badge></TableCell>
                                            <TableCell>{o.semester_name}</TableCell>
                                            <TableCell className="text-muted-foreground">{o.faculty_name}</TableCell>
                                            <TableCell>{o.section}</TableCell>
                                            <TableCell>{o.enrolled_count}/{o.max_students}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
