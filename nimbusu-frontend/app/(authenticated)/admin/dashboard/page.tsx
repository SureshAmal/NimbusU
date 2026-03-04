"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { usePageHeader } from "@/lib/page-header";
import { adminService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  GraduationCap,
  Activity,
  BookOpen,
  Layers,
  FileText,
  TrendingUp,
  Clock,
  School,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/* ─── Colors ─────────────────────────────────────────────────────── */

const COLORS = {
  blue: "#6366f1",
  orange: "#f97316",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
};

const PIE_COLORS = [
  COLORS.blue,
  COLORS.emerald,
  COLORS.orange,
  COLORS.rose,
  COLORS.amber,
  COLORS.cyan,
  COLORS.purple,
  COLORS.pink,
];

const ROLE_COLORS: Record<string, string> = {
  admin: COLORS.rose,
  faculty: COLORS.blue,
  dean: COLORS.purple,
  head: COLORS.cyan,
  student: COLORS.emerald,
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  document: COLORS.blue,
  video: COLORS.rose,
  image: COLORS.amber,
  link: COLORS.cyan,
  assignment: COLORS.purple,
  other: COLORS.orange,
};

/* ─── Tooltip ────────────────────────────────────────────────────── */

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  fontSize: 12,
  background: "var(--popover)",
  color: "var(--popover-foreground)",
};

/* ─── Sub-components ─────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color?: string;
}

function StatCard({ label, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <div
      className="rounded-xl border p-5 space-y-3"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{
            borderRadius: "var(--radius)",
            background: color ? `${color}18` : "var(--muted)",
          }}
        >
          <Icon className="h-4 w-4" style={{ color: color || "var(--muted-foreground)" }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  email: string;
  action: string;
  entityType: string;
  time: string;
  index: number;
}

function ActivityItem({ email, action, entityType, time, index }: ActivityItemProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const diff = Date.now() - new Date(time).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) setTimeAgo("just now");
    else if (mins < 60) setTimeAgo(`${mins}m ago`);
    else {
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) setTimeAgo(`${hrs}h ago`);
      else {
        const days = Math.floor(hrs / 24);
        setTimeAgo(`${days}d ago`);
      }
    }
  }, [time]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
        style={{
          borderRadius: "var(--radius)",
          background: `${PIE_COLORS[index % PIE_COLORS.length]}18`,
        }}
      >
        <Activity
          className="h-4 w-4"
          style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate capitalize">
          {action.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {entityType} · {email}
        </p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
    </div>
  );
}

/* ─── Dashboard types ────────────────────────────────────────────── */

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_departments: number;
  total_courses: number;
  total_schools: number;
  total_offerings: number;
  total_enrollments: number;
  total_content: number;
  users_by_role: Array<{ role: string; count: number }>;
  content_by_type: Array<{ content_type: string; count: number }>;
  enrollments_by_department: Array<{ department: string; count: number }>;
  recent_activity: Array<{
    user__email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
  }>;
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { setHeader } = usePageHeader();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Set header title in navbar
  useEffect(() => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    setHeader({
      title: "Dashboard",
      subtitle: `Welcome back, ${user?.first_name ?? ""} · ${date}`,
    });
    return () => setHeader(null);
  }, [user?.first_name, setHeader]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await adminService.dashboardStats();
        setStats(data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) fetchStats();
  }, [authLoading]);

  // Computed chart data
  const roleData = useMemo(() => {
    if (!stats) return [];
    return stats.users_by_role.map((r) => ({
      name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
      value: r.count,
      color: ROLE_COLORS[r.role] || COLORS.orange,
    }));
  }, [stats]);

  const contentData = useMemo(() => {
    if (!stats) return [];
    return stats.content_by_type.map((c) => ({
      name: c.content_type.charAt(0).toUpperCase() + c.content_type.slice(1),
      count: c.count,
      color: CONTENT_TYPE_COLORS[c.content_type] || COLORS.orange,
    }));
  }, [stats]);

  const totalRoleUsers = roleData.reduce((s, r) => s + r.value, 0);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" style={{ borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-72" style={{ borderRadius: "var(--radius-lg)" }} />
          <Skeleton className="h-72" style={{ borderRadius: "var(--radius-lg)" }} />
          <Skeleton className="h-72" style={{ borderRadius: "var(--radius-lg)" }} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" style={{ borderRadius: "var(--radius-lg)" }} />
          <Skeleton className="h-64" style={{ borderRadius: "var(--radius-lg)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.total_users?.toLocaleString() ?? "0"}
          description={`${stats?.active_users ?? 0} active users in the system`}
          icon={Users}
          color={COLORS.blue}
        />
        <StatCard
          label="Active Users"
          value={stats?.active_users?.toLocaleString() ?? "0"}
          description={`${stats?.total_users ? Math.round(((stats.active_users ?? 0) / stats.total_users) * 100) : 0}% of all registered users`}
          icon={TrendingUp}
          color={COLORS.emerald}
        />
        <StatCard
          label="Departments"
          value={stats?.total_departments?.toLocaleString() ?? "0"}
          description={`Across ${stats?.total_schools ?? 0} schools`}
          icon={Building2}
          color={COLORS.orange}
        />
        <StatCard
          label="Courses"
          value={stats?.total_courses?.toLocaleString() ?? "0"}
          description={`${stats?.total_offerings ?? 0} active course offerings`}
          icon={GraduationCap}
          color={COLORS.purple}
        />
      </div>

      {/* ─── Charts Row ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Donut — Users by Role */}
        <div className="rounded-xl border p-5" style={{ borderRadius: "var(--radius-lg)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Users by Role</h3>
            <Badge variant="secondary" className="text-[10px]">
              {totalRoleUsers} total
            </Badge>
          </div>
          {roleData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "var(--popover-foreground)" }}
                    itemStyle={{ color: "var(--popover-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
                {roleData.map((r) => (
                  <span
                    key={r.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: r.color }}
                    />
                    {r.name}{" "}
                    <span className="font-medium text-foreground">
                      {totalRoleUsers > 0
                        ? `${((r.value / totalRoleUsers) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">
              No user data available.
            </p>
          )}
        </div>

        {/* Bar — Content by Type */}
        <div className="rounded-xl border p-5" style={{ borderRadius: "var(--radius-lg)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Content by Type</h3>
            <Badge variant="secondary" className="text-[10px]">
              {stats?.total_content ?? 0} items
            </Badge>
          </div>
          {contentData.length > 0 ? (
            <>
              {/* Stacked overview bar */}
              <div className="mb-4">
                <div className="flex w-full h-8 rounded-lg overflow-hidden">
                  {contentData.map((c) => {
                    const pct =
                      (stats?.total_content ?? 0) > 0
                        ? (c.count / (stats?.total_content ?? 1)) * 100
                        : 0;
                    return (
                      <div
                        key={c.name}
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: c.color,
                          minWidth: pct > 0 ? "4px" : "0",
                        }}
                        title={`${c.name}: ${c.count}`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {contentData.map((c) => (
                  <span
                    key={c.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: c.color }}
                    />
                    {c.name}
                    <span className="font-semibold text-foreground">{c.count}</span>
                  </span>
                ))}
              </div>

              {/* Detailed bar chart */}
              <ResponsiveContainer width="100%" height={140} className="mt-4">
                <BarChart data={contentData} barCategoryGap="25%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "var(--popover-foreground)" }}
                    itemStyle={{ color: "var(--popover-foreground)" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {contentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-sm text-muted-foreground h-48 flex items-center justify-center">
              No content uploaded yet.
            </p>
          )}
        </div>

        {/* Summary cards — Schools / Programs / Enrollments */}
        <div className="space-y-4">
          <div
            className="rounded-xl border p-5"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <h3 className="text-sm font-semibold mb-4">Academic Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${COLORS.purple}18`, borderRadius: "var(--radius)" }}
                >
                  <School className="h-5 w-5" style={{ color: COLORS.purple }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Schools</p>
                  <p className="text-xl font-bold">{stats?.total_schools ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${COLORS.cyan}18`, borderRadius: "var(--radius)" }}
                >
                  <Layers className="h-5 w-5" style={{ color: COLORS.cyan }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Course Offerings</p>
                  <p className="text-xl font-bold">{stats?.total_offerings ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${COLORS.emerald}18`, borderRadius: "var(--radius)" }}
                >
                  <BookOpen className="h-5 w-5" style={{ color: COLORS.emerald }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Total Enrollments</p>
                  <p className="text-xl font-bold">
                    {stats?.total_enrollments?.toLocaleString() ?? 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ background: `${COLORS.orange}18`, borderRadius: "var(--radius)" }}
                >
                  <FileText className="h-5 w-5" style={{ color: COLORS.orange }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Total Content</p>
                  <p className="text-xl font-bold">{stats?.total_content ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Enrollments by Department */}
        <div
          className="md:col-span-3 rounded-xl border p-5"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Enrollments by Department</h3>
              <p className="text-xs text-muted-foreground">
                Student distribution across departments
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {stats?.total_enrollments?.toLocaleString() ?? 0} total
            </Badge>
          </div>
          {(stats?.enrollments_by_department?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={stats?.enrollments_by_department}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "var(--popover-foreground)" }}
                  itemStyle={{ color: "var(--popover-foreground)" }}
                />
                <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground h-60 flex items-center justify-center">
              No enrollment data available.
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div
          className="md:col-span-2 rounded-xl border p-5"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: COLORS.blue }} />
              Recent Activity
            </h3>
            <Badge variant="secondary" className="text-[10px]">
              Audit Log
            </Badge>
          </div>
          {(stats?.recent_activity?.length ?? 0) > 0 ? (
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
              {stats?.recent_activity?.map((entry, i) => (
                <ActivityItem
                  key={`${entry.entity_id}-${i}`}
                  email={entry.user__email ?? "System"}
                  action={entry.action}
                  entityType={entry.entity_type}
                  time={entry.created_at}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No recent activity recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
