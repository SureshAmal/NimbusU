"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePageHeader } from "@/lib/page-header";
import {
  dailyQuestionsService,
  offeringsService,
  usersService,
} from "@/services/api";
import type { DailyQuestion, CourseOffering, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Brain,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Clock,
  Code,
  CheckCircle2,
  Eye,
  Send,
  BarChart3,
} from "lucide-react";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "single", label: "Single Choice" },
  { value: "programming", label: "Programming" },
];

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const COLORS = {
  mcq: "#6366f1",
  single: "#10b981",
  programming: "#f97316",
};

export default function FacultyDailyQuestionsPage() {
  const { user } = useAuth();
  const { setHeader } = usePageHeader();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    total_assigned: number;
    total_submitted: number;
    total_correct: number;
    average_time_seconds: number;
    accuracy_rate: number;
  } | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewQuestion, setViewQuestion] = useState<DailyQuestion | null>(null);
  const [selectedQuestion, setSelectedQuestion] =
    useState<DailyQuestion | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<DailyQuestion | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    question_type: "single",
    difficulty: "medium",
    question_text: "",
    options: [
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" },
    ],
    correct_answer: [] as number[],
    starter_code: "",
    language: "python",
    points: 1,
    time_limit_minutes: 30,
    scheduled_date: "",
    start_time: "",
    end_time: "",
    course_offering: "",
    is_active: true,
  });

  const [assignForm, setAssignForm] = useState({
    student_ids: [] as string[],
    batch: "",
  });

  useEffect(() => {
    setHeader({
      title: "Daily Questions",
      subtitle: "Create and manage questions for your students",
    });
    return () => setHeader(null);
  }, [setHeader]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, oRes, sRes] = await Promise.all([
        dailyQuestionsService.list(),
        offeringsService.list({ limit: "100" }),
        usersService.list({ role: "student" }),
      ]);
      setQuestions(qRes.data.results ?? qRes.data ?? []);
      setOfferings(oRes.data.results ?? oRes.data ?? []);
      setStudents((sRes.data.results ?? sRes.data ?? []).slice(0, 50));

      const statsRes = await dailyQuestionsService.stats();
      setStats(statsRes.data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  function openCreate() {
    setEditId(null);
    setForm({
      title: "",
      description: "",
      question_type: "single",
      difficulty: "medium",
      question_text: "",
      options: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
        { id: 4, text: "" },
      ],
      correct_answer: [],
      starter_code: "",
      language: "python",
      points: 1,
      time_limit_minutes: 30,
      scheduled_date: new Date().toISOString().split("T")[0],
      start_time: "",
      end_time: "",
      course_offering: "",
      is_active: true,
    });
    setSheetOpen(true);
  }

  function openEdit(q: DailyQuestion) {
    setEditId(q.id);
    setForm({
      title: q.title,
      description: q.description || "",
      question_type: q.question_type,
      difficulty: q.difficulty,
      question_text: q.question_text,
      options: q.options?.length
        ? q.options
        : [
            { id: 1, text: "" },
            { id: 2, text: "" },
            { id: 3, text: "" },
            { id: 4, text: "" },
          ],
      correct_answer: Array.isArray(q.correct_answer)
        ? (q.correct_answer as number[])
        : [],
      starter_code: q.starter_code || "",
      language: q.language || "python",
      points: q.points,
      time_limit_minutes: q.time_limit_minutes,
      scheduled_date: q.scheduled_date,
      start_time: q.start_time || "",
      end_time: q.end_time || "",
      course_offering: q.course_offering || "",
      is_active: q.is_active,
    });
    setSheetOpen(true);
  }

  function openAssign(q: DailyQuestion) {
    setSelectedQuestion(q);
    setAssignForm({ student_ids: [], batch: "" });
    setAssignSheetOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.question_text || !form.scheduled_date) {
      toast.error("Please fill required fields");
      return;
    }

    const normalizedOptions = form.options
      .map((option) => ({ ...option, text: option.text.trim() }))
      .filter((option) => option.text.length > 0);

    if (form.question_type !== "programming") {
      if (normalizedOptions.length < 2) {
        toast.error("Add at least two answer options");
        return;
      }

      if (form.correct_answer.length === 0) {
        toast.error("Select the correct answer");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        options: form.question_type === "programming" ? null : normalizedOptions,
        course_offering: form.course_offering || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        correct_answer:
          form.question_type === "programming"
            ? form.starter_code
            : form.correct_answer,
      };

      if (editId) {
        await dailyQuestionsService.update(editId, payload);
        toast.success("Question updated");
      } else {
        await dailyQuestionsService.create(payload);
        toast.success("Question created");
      }
      setSheetOpen(false);
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to save");
    }
    setSaving(false);
  }

  async function handleAssign() {
    if (!selectedQuestion || assignForm.student_ids.length === 0) {
      toast.error("Select at least one student");
      return;
    }

    setSaving(true);
    try {
      await dailyQuestionsService.assign(selectedQuestion.id, assignForm);
      toast.success("Students assigned");
      setAssignSheetOpen(false);
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to assign");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteQuestion) return;
    setDeleting(true);
    try {
      await dailyQuestionsService.delete(deleteQuestion.id);
      toast.success("Question deleted");
      setDeleteQuestion(null);
      loadData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">Assigned</p>
            <p className="text-xl font-bold">{stats.total_assigned}</p>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-xl font-bold">{stats.total_submitted}</p>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">Correct</p>
            <p className="text-xl font-bold text-green-600">
              {stats.total_correct}
            </p>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">Avg Time</p>
            <p className="text-xl font-bold">
              {Math.round(stats.average_time_seconds / 60)}m
            </p>
          </div>
          <div
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-xl font-bold">{stats.accuracy_rate}%</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} questions
        </p>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Question
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No questions yet</p>
          <Button variant="link" onClick={openCreate}>
            Create your first question
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/30 transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${COLORS[q.question_type as keyof typeof COLORS]}15`,
                  }}
                >
                  <Brain
                    className="h-5 w-5"
                    style={{
                      color: COLORS[q.question_type as keyof typeof COLORS],
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{q.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{q.scheduled_date}</span>
                    <span>{q.time_limit_minutes}min</span>
                    <span>{q.points}pts</span>
                    {q.total_assignments !== undefined && (
                      <Badge variant="outline" className="text-[10px]">
                        {q.total_assignments} assigned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openAssign(q)}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewQuestion(q)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(q)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteQuestion(q)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto px-4">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "New"} Question</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={form.question_type}
                  onValueChange={(v) => setForm({ ...form, question_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm({ ...form, difficulty: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Question *</Label>
              <textarea
                className="min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
                value={form.question_text}
                onChange={(e) =>
                  setForm({ ...form, question_text: e.target.value })
                }
              />
            </div>
            {form.question_type !== "programming" && (
              <div className="grid gap-2">
                <Label>Options (check correct)</Label>
                {form.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.correct_answer.includes(opt.id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          correct_answer: e.target.checked
                            ? [...form.correct_answer, opt.id]
                            : form.correct_answer.filter((id) => id !== opt.id),
                        })
                      }
                      className="h-4 w-4"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...form.options];
                        newOpts[idx] = { ...opt, text: e.target.value };
                        setForm({ ...form, options: newOpts });
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
            {form.question_type === "programming" && (
              <div className="grid gap-2">
                <Label>Starter Code</Label>
                <textarea
                  className="min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm font-mono"
                  value={form.starter_code}
                  onChange={(e) =>
                    setForm({ ...form, starter_code: e.target.value })
                  }
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={form.points}
                  onChange={(e) =>
                    setForm({ ...form, points: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Time (min)</Label>
                <Input
                  type="number"
                  value={form.time_limit_minutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time_limit_minutes: parseInt(e.target.value) || 30,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm({ ...form, scheduled_date: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignSheetOpen} onOpenChange={setAssignSheetOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto px-4">
          <DialogHeader>
            <DialogTitle>Assign to Students</DialogTitle>
            <DialogDescription>{selectedQuestion?.title}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Students</Label>
              <div className="max-h-[calc(100vh-19rem)] overflow-y-auto border rounded-md p-2 space-y-1">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignForm.student_ids.includes(s.id)}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          student_ids: e.target.checked
                            ? [...assignForm.student_ids, s.id]
                            : assignForm.student_ids.filter(
                                (id) => id !== s.id,
                              ),
                        })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      {s.first_name} {s.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.email}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {assignForm.student_ids.length} selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={saving || assignForm.student_ids.length === 0}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteQuestion}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteQuestion(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove
              {deleteQuestion ? ` “${deleteQuestion.title}”` : " this question"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Dialog */}
      <Dialog open={!!viewQuestion} onOpenChange={() => setViewQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewQuestion?.title}</DialogTitle>
          </DialogHeader>
          {viewQuestion && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewQuestion.question_type}</Badge>
                <Badge variant="outline">{viewQuestion.points} pts</Badge>
              </div>
              <div className="p-3 rounded-lg bg-muted text-sm">
                {viewQuestion.question_text}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
