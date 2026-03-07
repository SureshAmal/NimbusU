"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { usePageHeader } from "@/lib/page-header";
import { dailyQuestionsService } from "@/services/api";
import type {
  DailyQuestionAssignment,
  StudentDailyQuestionPerformance,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  CalendarDays,
  TimerReset,
  ArrowRight,
  WindArrowDown,
  MountainSnowIcon,
} from "lucide-react";

const COLORS = {
  pending: "#6b7280",
  assigned: "#2563eb",
  started: "#f59e0b",
  submitted: "#6366f1",
  graded: "#10b981",
  expired: "#ef4444",
};

const PANEL_STYLE = {
  borderRadius: "var(--radius-3xl)",
  borderColor: "var(--border)",
  background: "var(--card)",
  boxShadow: "var(--shadow-sm)",
} as const;

const INNER_PANEL_STYLE = {
  borderRadius: "var(--radius-2xl)",
  borderColor: "var(--border)",
} as const;

const SOFT_PANEL_STYLE = {
  borderRadius: "var(--radius-2xl)",
  background: "var(--muted)",
} as const;

const TINTED_PRIMARY_STYLE = {
  background: "color-mix(in oklch, var(--primary) 10%, var(--card))",
  borderColor: "color-mix(in oklch, var(--primary) 18%, var(--border))",
} as const;

const GRADIENT_PRIMARY_STYLE = {
  background:
    "linear-gradient(135deg, color-mix(in oklch, var(--primary) 82%, white 8%), color-mix(in oklch, var(--ring) 78%, black 6%))",
  color: "var(--primary-foreground)",
} as const;

const BAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--ring)",
];

export default function StudentDailyQuestionsPage() {
  const { user } = useAuth();
  const { setHeader } = usePageHeader();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<DailyQuestionAssignment[]>([]);
  const [performance, setPerformance] = useState<
    StudentDailyQuestionPerformance[]
  >([]);
  const [activeQuestion, setActiveQuestion] =
    useState<DailyQuestionAssignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setHeader({
      title: "Daily Questions",
      subtitle: "Practice and earn points",
    });
    return () => setHeader(null);
  }, [setHeader]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeQuestion?.started_at && activeQuestion.status === "started") {
      const startTime = new Date(activeQuestion.started_at).getTime();
      const endTime =
        startTime + (activeQuestion.time_limit_minutes || 30) * 60 * 1000;
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((endTime - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeQuestion]);

  async function loadData() {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        dailyQuestionsService.myAssignments(),
        dailyQuestionsService.performance(),
      ]);
      setAssignments(aRes.data.results ?? aRes.data ?? []);
      setPerformance(pRes.data.results ?? pRes.data ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  async function handleStart(assignment: DailyQuestionAssignment) {
    try {
      const res = await dailyQuestionsService.start(assignment.id);
      toast.success("Question started!");
      setSelectedOptions([]);
      setCodeAnswer("");
      setActiveQuestion({
        ...assignment,
        started_at: res.data.started_at,
        status: "started",
      });
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignment.id
            ? { ...a, status: "started", started_at: res.data.started_at }
            : a,
        ),
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to start");
    }
  }

  async function handleSubmit() {
    if (!activeQuestion) return;
    setSubmitting(true);
    try {
      const payload =
        activeQuestion.question_type === "programming"
          ? { code_answer: codeAnswer }
          : { selected_options: selectedOptions };

      const res = await dailyQuestionsService.submit(
        activeQuestion.id,
        payload,
      );
      toast.success(res.data.is_correct ? "Correct! 🎉" : "Submitted!");
      setActiveQuestion(null);
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to submit");
    }
    setSubmitting(false);
  }

  function getWindowStart(a: DailyQuestionAssignment) {
    const time = a.start_time || "00:00:00";
    return new Date(`${a.scheduled_date}T${time}`);
  }

  function getWindowEnd(a: DailyQuestionAssignment) {
    const time = a.end_time || "23:59:59";
    return new Date(`${a.scheduled_date}T${time}`);
  }

  function getEffectiveStatus(
    a: DailyQuestionAssignment,
  ): DailyQuestionAssignment["status"] {
    if (["graded", "submitted", "started", "expired"].includes(a.status)) {
      return a.status;
    }

    const now = Date.now();
    const startsAt = getWindowStart(a).getTime();
    const endsAt = getWindowEnd(a).getTime();

    if (!a.is_active || now > endsAt) return "expired";
    if (now < startsAt) return "pending";
    return "assigned";
  }

  const normalizedAssignments = useMemo(
    () => assignments.map((a) => ({ ...a, status: getEffectiveStatus(a) })),
    [assignments],
  );

  const totalPoints = normalizedAssignments
    .filter((a) => a.status === "graded")
    .reduce((sum, a) => sum + a.points_earned, 0);
  const currentStreak = performance[0]?.current_streak || 0;
  const longestStreak = performance[0]?.longest_streak || 0;
  const todayPending = normalizedAssignments.filter(
    (a) => a.status === "pending",
  ).length;
  const todayReady = normalizedAssignments.filter(
    (a) => a.status === "assigned",
  ).length;
  const todayStarted = normalizedAssignments.filter(
    (a) => a.status === "started",
  ).length;
  const totalSubmitted = performance.reduce(
    (sum, item) => sum + item.total_submitted,
    0,
  );
  const totalCorrect = performance.reduce(
    (sum, item) => sum + item.total_correct,
    0,
  );
  const totalAssigned = performance.reduce(
    (sum, item) => sum + item.total_assigned,
    0,
  );
  const totalTimeSeconds = performance.reduce(
    (sum, item) => sum + item.total_time_seconds,
    0,
  );
  const accuracyRate = totalSubmitted
    ? Math.round((totalCorrect / totalSubmitted) * 100)
    : 0;
  const completionRate = totalAssigned
    ? Math.round((totalSubmitted / totalAssigned) * 100)
    : 0;
  const averageSolveMinutes = totalSubmitted
    ? Math.max(1, Math.round(totalTimeSeconds / totalSubmitted / 60))
    : 0;
  const latestPerformance = performance[0] || null;
  const weeklyPerformance = [...performance].slice(0, 7).reverse();
  const weeklyChartData = useMemo(() => {
    if (weeklyPerformance.length === 0) return [];

    const valuesByDate = new Map(
      weeklyPerformance.map((item) => [item.date, item.total_points_earned]),
    );
    const anchorDate = new Date(weeklyPerformance[weeklyPerformance.length - 1].date);

    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(anchorDate);
      currentDate.setDate(anchorDate.getDate() - 6 + index);
      const key = format(currentDate, "yyyy-MM-dd");

      return {
        id: key,
        date: key,
        label: format(currentDate, "EEE"),
        points: valuesByDate.get(key) ?? 0,
      };
    });
  }, [weeklyPerformance]);
  const maxWeeklyPoints = Math.max(
    ...weeklyChartData.map((item) => item.points),
    1,
  );
  const recentAssignments = normalizedAssignments.slice(0, 6);
  const readyAssignments = normalizedAssignments
    .filter((item) => item.status === "assigned")
    .slice(0, 4);
  const studentName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : "Student";
  const studentInitials =
    `${user?.first_name?.[0] ?? "S"}${user?.last_name?.[0] ?? "T"}`.toUpperCase();
  const statusCounts = {
    graded: normalizedAssignments.filter((a) => a.status === "graded").length,
    assigned: normalizedAssignments.filter((a) => a.status === "assigned")
      .length,
    started: normalizedAssignments.filter((a) => a.status === "started").length,
    pending: normalizedAssignments.filter((a) => a.status === "pending").length,
  };

  function formatDuration(seconds?: number | null) {
    if (!seconds) return "—";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  }

  function formatQuestionDate(value: string) {
    return format(new Date(value), "dd MMM yyyy");
  }

  function toggleOption(optionId: number) {
    if (!activeQuestion) return;
    if (activeQuestion.question_type !== "mcq") {
      setSelectedOptions([optionId]);
      return;
    }
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }

  const canSubmit = activeQuestion
    ? activeQuestion.question_type === "programming"
      ? codeAnswer.trim().length > 0
      : selectedOptions.length > 0
    : false;

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col">
      <div className="grid w-full flex-1 gap-3 xl:min-h-[calc(100vh-8rem)] xl:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.65fr)_minmax(250px,0.95fr)] xl:items-stretch">
        <section className="border p-4 xl:flex xl:h-full xl:flex-col" style={PANEL_STYLE}>
          <div
            className="p-4"
            style={{ ...SOFT_PANEL_STYLE, ...TINTED_PRIMARY_STYLE }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center text-xl font-semibold shadow-sm"
                style={{
                  borderRadius: "var(--radius-3xl)",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {studentInitials}
              </div>
              <div>
                <p className="text-base font-semibold leading-tight">
                  {studentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Daily question performance
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge
                    className="border-0 hover:opacity-90"
                    style={{
                      background:
                        "color-mix(in oklch, var(--primary) 14%, transparent)",
                      color: "var(--primary)",
                    }}
                  >
                    {accuracyRate}% accuracy
                  </Badge>
                  <Badge variant="outline">{totalPoints} pts earned</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {[
              {
                label: "Current streak",
                value: `${currentStreak} days`,
                icon: Flame,
                color: "var(--chart-4)",
              },
              {
                label: "Longest streak",
                value: `${longestStreak} days`,
                icon: Trophy,
                color: "var(--chart-5)",
              },
              {
                label: "Completion",
                value: `${completionRate}%`,
                icon: Target,
                color: "var(--primary)",
              },
              {
                label: "Avg. solve time",
                value: averageSolveMinutes ? `${averageSolveMinutes} min` : "—",
                icon: TimerReset,
                color: "var(--chart-2)",
              },
            ].map((item) => (
              <div key={item.label} className="p-3" style={SOFT_PANEL_STYLE}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-none">
                      {item.value}
                    </p>
                  </div>
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-3 border-t pt-3 xl:flex-1"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Status summary</p>
              <Badge variant="outline">Today</Badge>
            </div>
            <div className="space-y-3 xl:flex xl:h-[calc(100%-2rem)] xl:flex-col xl:justify-evenly">
              {[
                {
                  label: "Ready",
                  value: statusCounts.assigned,
                  color: "var(--chart-1)",
                },
                {
                  label: "In progress",
                  value: statusCounts.started,
                  color: "var(--chart-5)",
                },
                {
                  label: "Completed",
                  value: statusCounts.graded,
                  color: "var(--primary)",
                },
                {
                  label: "Pending",
                  value: statusCounts.pending,
                  color: "var(--muted-foreground)",
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden bg-muted"
                    style={{ borderRadius: "var(--radius-xl)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: item.color,
                        borderRadius: "var(--radius-xl)",
                        width: `${Math.max((item.value / Math.max(normalizedAssignments.length, 1)) * 100, item.value ? 10 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-4 xl:flex xl:h-full xl:flex-col">
          <div className="border p-4 xl:flex xl:flex-col" style={PANEL_STYLE}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium">Performance overview</p>
                <h2 className="mt-1 text-2xl font-semibold leading-none">
                  {accuracyRate}%
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accuracy based on {totalSubmitted} submitted questions.
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1.5 text-sm"
                style={{
                  borderRadius: "var(--radius-xl)",
                  background:
                    "color-mix(in oklch, var(--primary) 10%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <TrendingUp className="h-4 w-4" />
                {latestPerformance?.total_correct
                  ? `+${latestPerformance.total_correct} correct recently`
                  : "Keep the streak going"}
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:flex-1 2xl:grid-cols-[minmax(0,1fr)_180px]">
              <div
                className="p-3 xl:flex xl:min-h-[260px] xl:flex-1 xl:flex-col"
                style={SOFT_PANEL_STYLE}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Last 7 days</p>
                    <p className="text-xs text-muted-foreground">
                      Points earned per day
                    </p>
                  </div>
                  <Badge variant="outline">{weeklyChartData.length}d</Badge>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-7 gap-2">
                  {weeklyChartData.length === 0 ? (
                    <div className="col-span-7 flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      No performance data yet.
                    </div>
                  ) : (
                    weeklyChartData.map((item, index) => {
                      const barHeight = Math.max(
                        item.points > 0
                          ? (item.points / maxWeeklyPoints) * 100
                          : 0,
                        item.points > 0 ? 12 : 0,
                      );

                      return (
                        <div
                          key={item.id}
                          className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2"
                        >
                          <div
                            className="relative flex h-full w-full items-end overflow-hidden border bg-background/60"
                            style={{
                              borderRadius: "var(--radius-2xl)",
                              borderColor: "color-mix(in oklch, var(--border) 75%, transparent)",
                            }}
                          >
                            <div
                              className="absolute inset-x-1 bottom-1 transition-all"
                              style={{
                                background: `linear-gradient(180deg, color-mix(in oklch, ${BAR_COLORS[index % BAR_COLORS.length]} 78%, white 10%), ${BAR_COLORS[index % BAR_COLORS.length]})`,
                                borderRadius: "var(--radius-xl)",
                                boxShadow: `0 10px 22px color-mix(in oklch, ${BAR_COLORS[index % BAR_COLORS.length]} 28%, transparent)`,
                                height: `${barHeight}%`,
                                opacity: item.points > 0 ? 1 : 0.25,
                              }}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium">{item.points}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.label}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid gap-3 xl:grid-rows-[1fr_auto]">
                <div className="p-3" style={SOFT_PANEL_STYLE}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Accuracy ring</p>
                    <Target
                      className="h-4 w-4"
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <div className="flex justify-center py-1">
                    <div
                      className="flex h-24 w-24 items-center justify-center"
                      style={{
                        borderRadius: "var(--radius-4xl)",
                        background: `conic-gradient(var(--primary) ${accuracyRate}%, color-mix(in oklch, var(--primary) 14%, transparent) ${accuracyRate}% 100%)`,
                      }}
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center bg-background text-base font-semibold"
                        style={{ borderRadius: "var(--radius-3xl)" }}
                      >
                        {accuracyRate}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3" style={SOFT_PANEL_STYLE}>
                  <p className="text-sm font-medium">This week</p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Assigned</span>
                      <span className="font-medium">{totalAssigned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium">{totalSubmitted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Correct</span>
                      <span className="font-medium">{totalCorrect}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg. pace</span>
                      <span className="font-medium">
                        {averageSolveMinutes
                          ? `${averageSolveMinutes} min`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:flex-1 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="border p-4 xl:flex xl:h-full xl:flex-col" style={PANEL_STYLE}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Question queue</p>
                  <p className="text-xs text-muted-foreground">
                    Pick up where you left off
                  </p>
                </div>
                <Badge variant="outline">
                  {normalizedAssignments.length} total
                </Badge>
              </div>

              {recentAssignments.length === 0 ? (
                <div
                  className="border border-dashed py-10 text-center text-muted-foreground xl:flex xl:flex-1 xl:items-center xl:justify-center"
                  style={INNER_PANEL_STYLE}
                >
                  <Brain className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>No questions assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3 xl:flex-1">
                  {recentAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between border p-3 transition-colors hover:bg-accent/20"
                      style={INNER_PANEL_STYLE}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center"
                          style={{
                            backgroundColor: `${COLORS[a.status as keyof typeof COLORS]}15`,
                            borderRadius: "var(--radius-2xl)",
                          }}
                        >
                          {a.status === "graded" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : a.status === "expired" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : a.status === "started" ? (
                            <Clock className="h-5 w-5 text-orange-500" />
                          ) : (
                            <Brain
                              className="h-5 w-5"
                              style={{
                                color: COLORS[a.status as keyof typeof COLORS],
                              }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium">
                            {a.question_title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize"
                            >
                              {a.status_display || a.status}
                            </Badge>
                            <span>{a.points} pts</span>
                            <span>{a.time_limit_minutes} min</span>
                            <span>{formatQuestionDate(a.scheduled_date)}</span>
                          </div>
                        </div>
                      </div>
                      {a.status === "assigned" && (
                        <Button size="sm" onClick={() => handleStart(a)}>
                          <Play className="mr-1 h-4 w-4" /> Start
                        </Button>
                      )}
                      {a.status === "started" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOptions([]);
                            setCodeAnswer("");
                            setActiveQuestion(a);
                          }}
                        >
                          Continue
                        </Button>
                      )}
                      {a.status === "pending" && (
                        <Button size="sm" variant="outline" disabled>
                          Scheduled
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border p-4 xl:flex xl:h-full xl:flex-col" style={PANEL_STYLE}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recent performance log</p>
                  <p className="text-xs text-muted-foreground">
                    Daily snapshots of your progress
                  </p>
                </div>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>

              {weeklyPerformance.length === 0 ? (
                <div
                  className="border border-dashed py-10 text-center text-muted-foreground xl:flex xl:flex-1 xl:items-center xl:justify-center"
                  style={INNER_PANEL_STYLE}
                >
                  No performance history available yet.
                </div>
              ) : (
                <div className="space-y-3 xl:flex-1 xl:overflow-auto xl:pr-1">
                  {weeklyPerformance.map((item) => (
                    <div
                      key={item.id}
                      className="border p-3"
                      style={INNER_PANEL_STYLE}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {format(new Date(item.date), "EEEE")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatQuestionDate(item.date)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {item.total_points_earned} pts
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Assigned
                          </p>
                          <p className="font-medium">{item.total_assigned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Submitted
                          </p>
                          <p className="font-medium">{item.total_submitted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Correct
                          </p>
                          <p className="font-medium">{item.total_correct}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {formatDuration(item.total_time_seconds)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 xl:flex xl:h-full xl:flex-col">
          <div className="border p-4" style={PANEL_STYLE}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Today&apos;s planner</p>
                <p className="text-xs text-muted-foreground">
                  See what needs attention first
                </p>
              </div>
              <Badge variant="outline">Live</Badge>
            </div>

            <div className="mt-4 grid gap-3">
              {[
                {
                  label: "Pending",
                  value: todayPending,
                  color: "var(--muted-foreground)",
                  icon: CalendarDays,
                },
                {
                  label: "Ready",
                  value: todayReady,
                  color: "var(--chart-1)",
                  icon: Play,
                },
                {
                  label: "In progress",
                  value: todayStarted,
                  color: "var(--chart-5)",
                  icon: Clock,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-3"
                  style={SOFT_PANEL_STYLE}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className="h-4 w-4"
                      style={{ color: item.color }}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-lg font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border p-4 xl:flex xl:flex-1 xl:flex-col" style={PANEL_STYLE}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ready to solve</p>
                <p className="text-xs text-muted-foreground">
                  Quick access to available questions
                </p>
              </div>
            </div>
            <div className="space-y-3 xl:flex-1">
              {readyAssignments.length === 0 ? (
                <div
                  className="border border-dashed py-8 text-center text-sm text-muted-foreground xl:flex xl:flex-1 xl:items-center xl:justify-center"
                  style={INNER_PANEL_STYLE}
                >
                  No ready questions at the moment.
                </div>
              ) : (
                readyAssignments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleStart(item)}
                    className="flex w-full items-center justify-between border p-3 text-left transition-colors hover:bg-accent/20"
                    style={INNER_PANEL_STYLE}
                  >
                    <div>
                      <p className="line-clamp-1 font-medium">
                        {item.question_title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.points} pts · {item.time_limit_minutes} min
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="border p-4" style={PANEL_STYLE}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Recent highlight</p>
              <Trophy className="h-4 w-4" style={{ color: "var(--chart-4)" }} />
            </div>
            <div
              className="p-4"
              style={{ ...INNER_PANEL_STYLE, ...GRADIENT_PRIMARY_STYLE }}
            >
              <p className="text-sm opacity-80">Best recent streak</p>
              <p className="mt-1 text-2xl font-semibold">
                {longestStreak} days
              </p>
              <p className="mt-2 text-sm opacity-90">
                {latestPerformance?.total_correct
                  ? `You solved ${latestPerformance.total_correct} questions correctly in your latest session.`
                  : "Solve a question today to start building momentum."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Question Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div
            className="bg-background border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              borderRadius: "var(--radius-xl)",
              borderColor: "var(--border)",
            }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {activeQuestion.question_title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {activeQuestion.points} points ·{" "}
                  {activeQuestion.time_limit_minutes} min
                </p>
              </div>
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 ${timeLeft < 60 ? "text-red-500" : ""}`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-4">
              <div
                className="p-3 bg-muted"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {activeQuestion.question_text}
                </p>
              </div>

              {activeQuestion.question_type === "programming" ? (
                <div className="space-y-2">
                  {activeQuestion.starter_code && (
                    <div
                      className="border bg-muted/40 p-3"
                      style={{
                        borderRadius: "var(--radius-lg)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-xs text-muted-foreground mb-2">
                        Starter code
                      </p>
                      <pre className="text-xs whitespace-pre-wrap overflow-auto">
                        {activeQuestion.starter_code}
                      </pre>
                    </div>
                  )}
                  <Label htmlFor="code-answer">Your solution</Label>
                  <Textarea
                    id="code-answer"
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    className="min-h-48 font-mono text-sm"
                    placeholder="Write your code here"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    {activeQuestion.question_type === "mcq"
                      ? "Select all correct options:"
                      : "Select one option:"}
                  </Label>
                  {activeQuestion.question_type === "single" ? (
                    <RadioGroup
                      onValueChange={(v) => setSelectedOptions([parseInt(v)])}
                      className="space-y-2"
                      value={selectedOptions[0]?.toString()}
                    >
                      {(activeQuestion.options || []).map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 p-3 border hover:bg-accent"
                          style={{
                            borderRadius: "var(--radius-lg)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <RadioGroupItem
                            value={opt.id.toString()}
                            id={`opt-${opt.id}`}
                          />
                          <Label
                            htmlFor={`opt-${opt.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {(activeQuestion.options || []).map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 p-3 border hover:bg-accent"
                          style={{
                            borderRadius: "var(--radius-lg)",
                            borderColor: "var(--border)",
                          }}
                        >
                          <Checkbox
                            id={`opt-${opt.id}`}
                            checked={selectedOptions.includes(opt.id)}
                            onCheckedChange={() => toggleOption(opt.id)}
                          />
                          <Label
                            htmlFor={`opt-${opt.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveQuestion(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit}
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
