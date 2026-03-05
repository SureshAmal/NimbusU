"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageHeader } from "@/lib/page-header";
import { assignmentsService, rubricsService, rubricCriteriaService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

interface RubricCriterion {
    title: string;
    description: string;
    max_points: number;
}

export default function NewAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { setHeader } = usePageHeader();

    const [saving, setSaving] = useState(false);

    // Assignment fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maxMarks, setMaxMarks] = useState(100);
    const [type, setType] = useState("assignment");
    const [isPublished, setIsPublished] = useState(true);

    // Late submission policies
    const [enableLatePolicy, setEnableLatePolicy] = useState(false);
    const [gracePeriod, setGracePeriod] = useState(0);
    const [penaltyPerDay, setPenaltyPerDay] = useState(0);
    const [maxPenalty, setMaxPenalty] = useState(0);

    // Rubric
    const [enableRubric, setEnableRubric] = useState(false);
    const [rubricTitle, setRubricTitle] = useState("Grading Rubric");
    const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
        { title: "", description: "", max_points: 0 }
    ]);

    useEffect(() => {
        setHeader({
            title: "New Assignment",
            backUrl: `/faculty/courses/${courseId}`
        });
        return () => setHeader(null);
    }, [courseId, setHeader]);

    const handleAddCriterion = () => {
        setRubricCriteria([...rubricCriteria, { title: "", description: "", max_points: 0 }]);
    };

    const handleRemoveCriterion = (index: number) => {
        setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    };

    const handleCriterionChange = (index: number, field: keyof RubricCriterion, value: string | number) => {
        const newCriteria = [...rubricCriteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setRubricCriteria(newCriteria);
    };

    const totalRubricPoints = rubricCriteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (enableRubric && totalRubricPoints !== maxMarks) {
            toast.error(`Rubric total points (${totalRubricPoints}) must equal assignment max marks (${maxMarks})`);
            return;
        }

        setSaving(true);
        try {
            // 1. Create Assignment
            const assignmentPayload: any = {
                title,
                description,
                due_date: dueDate,
                max_marks: maxMarks,
                assignment_type: type,
                is_published: isPublished,
                course_offering: courseId
            };

            if (enableLatePolicy) {
                assignmentPayload.grace_period_days = gracePeriod;
                assignmentPayload.penalty_per_day = penaltyPerDay;
                assignmentPayload.max_penalty_percentage = maxPenalty;
            }

            const assignRes = await assignmentsService.create(assignmentPayload);
            const assignmentId = assignRes.data.id;

            // 2. Create Rubric if enabled
            if (enableRubric && rubricCriteria.length > 0) {
                const rubricRes = await rubricsService.create({
                    assignment: assignmentId,
                    title: rubricTitle,
                    description: "Rubric for " + title,
                    total_points: totalRubricPoints
                });
                const rubricId = rubricRes.data.id;

                // 3. Create Rubric Criteria
                await Promise.all(rubricCriteria.map((c, index) =>
                    rubricCriteriaService.create({
                        rubric: rubricId,
                        title: c.title,
                        description: c.description,
                        max_points: c.max_points,
                        order: index
                    })
                ));
            }

            toast.success("Assignment created successfully");
            router.push(`/faculty/courses/${courseId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to create assignment");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Assignment</h1>
                    <p className="text-sm text-muted-foreground">Configure details, late policies, and grading rubrics.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 mb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">1</span>
                        Basic Details
                    </h2>

                    <div className="space-y-2">
                        <Label>Assignment Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Midterm Project" />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Instructions for the students..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Due Date & Time</Label>
                            <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Marks</Label>
                            <Input type="number" min={1} value={maxMarks} onChange={(e) => setMaxMarks(+e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Assignment Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="exam">Exam</SelectItem>
                                    <SelectItem value="project">Project</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Switch id="publish" checked={isPublished} onCheckedChange={setIsPublished} />
                        <Label htmlFor="publish" className="cursor-pointer">Publish immediately</Label>
                    </div>
                </div>

                {/* Late Policy */}
                <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">2</span>
                            Late Submission Policy
                        </h2>
                        <Switch checked={enableLatePolicy} onCheckedChange={setEnableLatePolicy} />
                    </div>

                    {enableLatePolicy ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label>Grace Period (Days)</Label>
                                <Input type="number" min={0} value={gracePeriod} onChange={(e) => setGracePeriod(+e.target.value)} />
                                <p className="text-[10px] text-muted-foreground">Days allowed without penalty</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Penalty per Day (%)</Label>
                                <Input type="number" min={0} max={100} value={penaltyPerDay} onChange={(e) => setPenaltyPerDay(+e.target.value)} />
                                <p className="text-[10px] text-muted-foreground">Deducted from earned marks</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Penalty (%)</Label>
                                <Input type="number" min={0} max={100} value={maxPenalty} onChange={(e) => setMaxPenalty(+e.target.value)} />
                                <p className="text-[10px] text-muted-foreground">Maximum possible deduction</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No penalties will be applied for late submissions.</p>
                    )}
                </div>

                {/* Grading Rubric */}
                <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">3</span>
                            Grading Rubric
                        </h2>
                        <Switch checked={enableRubric} onCheckedChange={setEnableRubric} />
                    </div>

                    {enableRubric ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Rubric Title</Label>
                                    <Input value={rubricTitle} onChange={(e) => setRubricTitle(e.target.value)} className="w-[300px]" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                                    <p className={`text-xl font-bold ${totalRubricPoints !== maxMarks ? "text-rose-500" : "text-emerald-500"}`}>
                                        {totalRubricPoints} / {maxMarks}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {rubricCriteria.map((criterion, index) => (
                                    <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/30">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-3">
                                                <div className="flex-1 space-y-1.5">
                                                    <Label className="text-xs">Criterion Title</Label>
                                                    <Input
                                                        value={criterion.title}
                                                        onChange={(e) => handleCriterionChange(index, "title", e.target.value)}
                                                        placeholder="e.g. Code Quality"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-24 space-y-1.5">
                                                    <Label className="text-xs">Points</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={criterion.max_points}
                                                        onChange={(e) => handleCriterionChange(index, "max_points", +e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Description</Label>
                                                <Input
                                                    value={criterion.description}
                                                    onChange={(e) => handleCriterionChange(index, "description", e.target.value)}
                                                    placeholder="What constitutes full marks?"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive mt-6 hover:bg-destructive/10"
                                            onClick={() => handleRemoveCriterion(index)}
                                            disabled={rubricCriteria.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button type="button" variant="outline" size="sm" onClick={handleAddCriterion} className="w-full border-dashed">
                                <Plus className="h-4 w-4 mr-2" /> Add Criterion
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Standard grading out of total marks will be used.</p>
                    )}
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={() => router.back()} disabled={saving}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={saving || (enableRubric && totalRubricPoints !== maxMarks)}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Assignment
                    </Button>
                </div>
            </form>
        </div>
    );
}
