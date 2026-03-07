"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePageHeader } from "@/lib/page-header";
import {
  dailyQuestionsService,
  offeringsService,
} from "@/services/api";
import type { DailyQuestion, CourseOffering } from "@/lib/types";
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
  XCircle,
  Eye,
  Send,
} from "lucide-react";
import { format } from "date-fns";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice (Multiple Correct)" },
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
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#f43f5e",
};

export default function AdminDailyQuestionsPage() {
  const { user } = useAuth();
  const { setHeader } = usePageHeader();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewQuestion, setViewQuestion] = useState<DailyQuestion | null>(null);
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

  useEffect(() => {
    setHeader({
      title: "Daily Questions",
      subtitle: "Create and manage daily questions for students",
    });
    return () => setHeader(null);
  }, [setHeader]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, oRes] = await Promise.all([
        dailyQuestionsService.list(),
        offeringsService.list(),
      ]);
      setQuestions(qRes.data.results ?? qRes.data ?? []);
      setOfferings(oRes.data.results ?? oRes.data ?? []);
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

  async function handleSubmit() {
    if (!form.title || !form.question_text || !form.scheduled_date) {
      toast.error("Please fill required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        course_offering: form.course_offering || null,
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

  const filteredQuestions = questions.filter((q) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return q.is_active;
    if (activeTab === "inactive") return !q.is_active;
    return q.question_type === activeTab;
  });

  const stats = {
    total: questions.length,
    active: questions.filter((q) => q.is_active).length,
    mcq: questions.filter((q) => q.question_type === "mcq").length,
    single: questions.filter((q) => q.question_type === "single").length,
    programming: questions.filter((q) => q.question_type === "programming")
      .length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "var(--primary)" },
          { label: "Active", value: stats.active, color: COLORS.easy },
          { label: "MCQ", value: stats.mcq, color: COLORS.mcq },
          { label: "Single", value: stats.single, color: COLORS.single },
          {
            label: "Programming",
            value: stats.programming,
            color: COLORS.programming,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-lg border"
            style={{ borderRadius: "var(--radius)" }}
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="mcq">MCQ</TabsTrigger>
            <TabsTrigger value="single">Single</TabsTrigger>
            <TabsTrigger value="programming">Programming</TabsTrigger>
          </TabsList>
        </Tabs>
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
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No questions found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredQuestions.map((q) => (
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{q.title}</p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] shrink-0"
                      style={{
                        color: COLORS[q.difficulty as keyof typeof COLORS],
                      }}
                    >
                      {q.difficulty}
                    </Badge>
                    {!q.is_active && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {q.scheduled_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {q.time_limit_minutes}min
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {q.points}pts
                    </span>
                    {q.total_assignments !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {q.total_assignments} assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto px-4">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Question" : "New Question"}</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the question details"
                : "Create a new daily question"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Question title"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Type *</Label>
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
              <Label>Question Text *</Label>
              <textarea
                className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.question_text}
                onChange={(e) =>
                  setForm({ ...form, question_text: e.target.value })
                }
                placeholder="Enter your question..."
              />
            </div>

            {form.question_type !== "programming" && (
              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.correct_answer.includes(opt.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm({
                            ...form,
                            correct_answer: checked
                              ? [...form.correct_answer, opt.id]
                              : form.correct_answer.filter(
                                  (id) => id !== opt.id,
                                ),
                          });
                        }}
                        className="h-4 w-4"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const newOptions = [...form.options];
                          newOptions[idx] = { ...opt, text: e.target.value };
                          setForm({ ...form, options: newOptions });
                        }}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Check the correct answer(s)
                </p>
              </div>
            )}

            {form.question_type === "programming" && (
              <>
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select
                    value={form.language}
                    onValueChange={(v) => setForm({ ...form, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Starter Code</Label>
                  <textarea
                    className="min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    value={form.starter_code}
                    onChange={(e) =>
                      setForm({ ...form, starter_code: e.target.value })
                    }
                    placeholder="# Write your code here..."
                  />
                </div>
              </>
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
                <Label>Time Limit (min)</Label>
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
              <Label>Scheduled Date *</Label>
              <Input
                type="date"
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm({ ...form, scheduled_date: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Course (Optional)</Label>
              <Select
                value={form.course_offering}
                onValueChange={(v) => setForm({ ...form, course_offering: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {offerings.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.course_code} - {o.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active" className="text-sm font-normal">
                Active
              </Label>
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

      {/* View Question Dialog */}
      <Dialog open={!!viewQuestion} onOpenChange={() => setViewQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewQuestion?.title}</DialogTitle>
          </DialogHeader>
          {viewQuestion && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewQuestion.question_type}</Badge>
                <Badge variant="outline">{viewQuestion.difficulty}</Badge>
                <Badge variant="outline">{viewQuestion.points} pts</Badge>
                <Badge variant="outline">
                  {viewQuestion.time_limit_minutes} min
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm whitespace-pre-wrap">
                  {viewQuestion.question_text}
                </p>
              </div>
              {viewQuestion.options && viewQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Options:</p>
                  {viewQuestion.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded border ${
                        Array.isArray(viewQuestion.correct_answer)
                          ? (viewQuestion.correct_answer as number[]).includes(
                              opt.id,
                            )
                            ? "bg-green-50 border-green-500"
                            : ""
                          : ""
                      }`}
                    >
                      <span className="text-sm">{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {viewQuestion.starter_code && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Starter Code:</p>
                  <pre className="p-3 rounded bg-muted overflow-x-auto text-xs">
                    {viewQuestion.starter_code}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
