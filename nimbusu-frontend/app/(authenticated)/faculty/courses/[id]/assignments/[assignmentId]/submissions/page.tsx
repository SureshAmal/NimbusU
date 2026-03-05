"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageHeader } from "@/lib/page-header";
import { assignmentsService, rubricsService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Download, AlertTriangle, CheckCircle2, ChevronRight, File as FileIcon } from "lucide-react";
import type { Assignment, Submission, GradingRubric } from "@/lib/types";

export default function SubmissionsGradingPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const assignmentId = params.assignmentId as string;
    const { setHeader } = usePageHeader();

    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [rubric, setRubric] = useState<GradingRubric | null>(null);

    const [gradeDialog, setGradeDialog] = useState(false);
    const [gradeSub, setGradeSub] = useState<Submission | null>(null);
    const [gradeForm, setGradeForm] = useState({ marks_obtained: 0, grade: "", feedback: "" });
    const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
    const [grading, setGrading] = useState(false);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [assRes, subRes, rubRes] = await Promise.all([
                    assignmentsService.get(assignmentId),
                    assignmentsService.submissions(assignmentId),
                    rubricsService.list({ assignment: assignmentId })
                ]);

                const assignmentData = assRes.data;
                setAssignment(assignmentData);
                setSubmissions(subRes.data.results ?? subRes.data ?? []);

                const rubrics = rubRes.data.results ?? rubRes.data ?? [];
                if (rubrics.length > 0) {
                    setRubric(rubrics[0]);
                }
            } catch (error) {
                toast.error("Failed to load assignment data");
                console.error("error fetching submissions", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [assignmentId]);

    useEffect(() => {
        if (assignment) {
            setHeader({
                title: assignment.title,
                subtitle: "Submissions & Grading",
                backUrl: `/faculty/courses/${courseId}`
            });
        }
        return () => setHeader(null);
    }, [assignment, courseId, setHeader]);

    const openGradeDialog = (sub: Submission) => {
        setGradeSub(sub);
        setGradeForm({
            marks_obtained: sub.marks_obtained || 0,
            grade: sub.grade || "",
            feedback: sub.feedback || ""
        });

        // Reset rubric scores logic. In a real app we might fetch previously saved rubric scores.
        if (rubric && rubric.criteria) {
            const initialScores: Record<string, number> = {};
            // distribute existing marks equally or just 0 if not graded
            rubric.criteria.forEach(c => {
                initialScores[c.id] = sub.status === "graded" ? Math.min(c.max_points, (sub.marks_obtained || 0) / rubric.criteria!.length) : 0;
            });
            setRubricScores(initialScores);
        }

        setGradeDialog(true);
    };

    // Calculate sum of rubric scores
    useEffect(() => {
        if (rubric && Object.keys(rubricScores).length > 0) {
            const total = Object.values(rubricScores).reduce((sum, score) => sum + (Number(score) || 0), 0);
            // Optional: apply late penalty to this total if you want it live updated
            setGradeForm(prev => ({ ...prev, marks_obtained: Math.round(total * 100) / 100 }));
        }
    }, [rubricScores, rubric]);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradeSub || !assignment) return;
        setGrading(true);
        try {
            await assignmentsService.grade(assignment.id, gradeSub.id, {
                marks_obtained: gradeForm.marks_obtained,
                grade: gradeForm.grade || undefined,
                feedback: gradeForm.feedback || undefined
            });
            toast.success("Submission graded successfully");
            setGradeDialog(false);

            // Refresh submissions list
            const { data } = await assignmentsService.submissions(assignment.id);
            setSubmissions(data.results ?? data ?? []);
        } catch (error) {
            toast.error("Failed to submit grade");
        } finally {
            setGrading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
            </div>
        );
    }

    // Calculate Late Penalties UI Helper
    const calculateDaysLate = (sub: Submission) => {
        if (!assignment?.due_date) return 0;
        const subTime = new Date(sub.submitted_at).getTime();
        const dueTime = new Date(assignment.due_date).getTime();
        const diffDays = (subTime - dueTime) / (1000 * 60 * 60 * 24);
        return diffDays > 0 ? Math.ceil(diffDays) : 0;
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{assignment?.title}</h1>
                    <p className="text-sm text-muted-foreground">Manage and grade student submissions</p>
                </div>
            </div>

            {/* Assignment context / stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-xl bg-card">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Max Marks</p>
                    <p className="text-2xl font-bold">{assignment?.max_marks}</p>
                </div>
                <div className="p-4 border rounded-xl bg-card">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Submissions</p>
                    <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
                <div className="p-4 border rounded-xl bg-card">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Graded</p>
                    <p className="text-2xl font-bold text-emerald-500">
                        {submissions.filter(s => s.status === "graded").length}
                    </p>
                </div>
                <div className="p-4 border rounded-xl bg-card flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Type</p>
                    <Badge variant="secondary" className="w-fit">{assignment?.assignment_type}</Badge>
                </div>
            </div>

            {/* Submissions List */}
            <div className="border rounded-xl bg-card overflow-hidden">
                {submissions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <FileIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No submissions to display yet.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {submissions.map(sub => {
                            const daysLate = calculateDaysLate(sub);
                            const isLate = daysLate > 0;

                            return (
                                <div key={sub.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium truncate">{sub.student_name}</p>
                                            {isLate && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                                    {daysLate} day{daysLate !== 1 ? 's' : ''} late
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 px-4">
                                        <Badge variant={sub.status === "graded" ? "default" : "secondary"}>
                                            {sub.status}
                                        </Badge>
                                        <p className="text-xs font-semibold">
                                            {sub.marks_obtained !== null ? `${sub.marks_obtained} / ${assignment?.max_marks}` : "—"}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openGradeDialog(sub)}
                                        className="shrink-0 group"
                                    >
                                        {sub.status === "graded" ? "Edit Grade" : "Grade"}
                                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Grading Dialog */}
            <Dialog open={gradeDialog} onOpenChange={setGradeDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Grading {gradeSub?.student_name}</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Left Column: Submission Content */}
                        <div className="space-y-4">
                            <h3 className="font-semibold border-b pb-2">Submission Details</h3>

                            {gradeSub?.file && (
                                <div className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileIcon className="h-5 w-5 text-blue-500 shrink-0" />
                                        <p className="text-sm font-medium truncate">Attached File</p>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => window.open(gradeSub.file!, "_blank")}>
                                        <Download className="h-4 w-4 mr-2" /> View
                                    </Button>
                                </div>
                            )}

                            {gradeSub?.text_content ? (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Text Response</Label>
                                    <div className="text-sm bg-muted/40 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap border">
                                        {gradeSub.text_content}
                                    </div>
                                </div>
                            ) : !gradeSub?.file ? (
                                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                                    <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No content provided in this submission.</p>
                                </div>
                            ) : null}

                            {calculateDaysLate(gradeSub!) > 0 && (
                                <div className="p-3 border border-rose-200 bg-rose-50 rounded-lg text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Late Submission Notice</span>
                                    </div>
                                    <p className="text-xs">
                                        Submitted {calculateDaysLate(gradeSub!)} days late.
                                        {assignment?.penalty_per_day ? ` Penalty: ${assignment.penalty_per_day}% per day.` : ""}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Grading Forms */}
                        <div className="space-y-6">
                            <form id="grading-form" onSubmit={handleGradeSubmit} className="space-y-6">

                                {rubric ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                Rubric: {rubric.title}
                                            </h3>
                                            <p className="font-bold text-sm bg-muted px-2 py-1 rounded">
                                                {gradeForm.marks_obtained} / {assignment?.max_marks}
                                            </p>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                            {rubric.criteria?.map(c => (
                                                <div key={c.id} className="p-3 border rounded-lg space-y-2 bg-card">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium leading-none mb-1">{c.title}</p>
                                                            {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 pt-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={c.max_points}
                                                            step="0.5"
                                                            className="w-20 h-8"
                                                            value={rubricScores[c.id] || ""}
                                                            onChange={(e) => setRubricScores(prev => ({ ...prev, [c.id]: +e.target.value }))}
                                                        />
                                                        <span className="text-xs font-medium">/ {c.max_points} pts</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold border-b pb-2">Grade Assignment</h3>
                                        <div className="space-y-2">
                                            <Label>Marks Obtained (out of {assignment?.max_marks})</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={assignment?.max_marks}
                                                step="0.5"
                                                value={gradeForm.marks_obtained}
                                                onChange={(e) => setGradeForm(prev => ({ ...prev, marks_obtained: +e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Letter Grade (Optional)</Label>
                                    <Input
                                        value={gradeForm.grade}
                                        onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                                        placeholder="e.g. A, B+, Pass"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Feedback to Student</Label>
                                    <Textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                                        rows={4}
                                        placeholder="Great job on..."
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setGradeDialog(false)} disabled={grading}>Cancel</Button>
                        <Button type="submit" form="grading-form" disabled={grading}>
                            {grading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Grade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
