"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePageHeader } from "@/lib/page-header";
import { contentService } from "@/services/api";
import type { Content } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Eye,
  FileClock,
  FileText,
  FolderOpen,
  Layers3,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const CHART_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function isExpired(content: Content) {
  return Boolean(content.expires_at && new Date(content.expires_at) <= new Date());
}

function isScheduled(content: Content) {
  return Boolean(content.publish_at && new Date(content.publish_at) > new Date());
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function AdminContentDashboardPage() {
  const { setHeader } = usePageHeader();
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeader({
      title: "Content Dashboard",
      subtitle: "Monitor content health, publishing cadence, and engagement from one place.",
    });
    return () => setHeader(null);
  }, [setHeader]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await contentService.list({ page_size: "1000" });
        if (!cancelled) {
          setItems(data.results ?? []);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load content dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const published = items.filter((item) => item.is_published && !isExpired(item) && !isScheduled(item));
    const scheduled = items.filter((item) => isScheduled(item));
    const expired = items.filter((item) => isExpired(item));
    const drafts = items.filter((item) => !item.is_published);
    const folders = new Set(items.map((item) => item.folder).filter(Boolean));

    const totalViews = items.reduce((sum, item) => sum + (item.total_views ?? 0), 0);
    const totalDownloads = items.reduce((sum, item) => sum + (item.total_downloads ?? 0), 0);
    const unresolvedComments = items.reduce((sum, item) => sum + (item.comment_count ?? 0), 0);

    const topCourses = Object.values(
      items.reduce<Record<string, { name: string; items: number; views: number }>>((acc, item) => {
        const key = item.course_code || item.course_name || "General";
        if (!acc[key]) {
          acc[key] = { name: key, items: 0, views: 0 };
        }
        acc[key].items += 1;
        acc[key].views += item.total_views ?? 0;
        return acc;
      }, {}),
    )
      .sort((a, b) => b.items - a.items || b.views - a.views)
      .slice(0, 5);

    const topFolders = Object.values(
      items.reduce<Record<string, { name: string; items: number }>>((acc, item) => {
        const key = item.folder_name || "Unfiled";
        if (!acc[key]) {
          acc[key] = { name: key, items: 0 };
        }
        acc[key].items += 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b.items - a.items)
      .slice(0, 5);

    const needsAttention = items
      .filter((item) => !item.is_published || isExpired(item) || (item.total_views ?? 0) < 3)
      .sort((a, b) => (a.total_views ?? 0) - (b.total_views ?? 0))
      .slice(0, 6);

    const recentUpdates = [...items]
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
      .slice(0, 6);

    const publishDistribution = [
      { name: "Published", value: published.length },
      { name: "Scheduled", value: scheduled.length },
      { name: "Drafts", value: drafts.length },
      { name: "Expired", value: expired.length },
    ].filter((item) => item.value > 0);

    const engagementByCourse = topCourses.map((course) => ({
      name: course.name.length > 14 ? `${course.name.slice(0, 14)}…` : course.name,
      views: course.views,
      items: course.items,
    }));

    const folderDistribution = topFolders.map((folder) => ({
      name: folder.name.length > 14 ? `${folder.name.slice(0, 14)}…` : folder.name,
      items: folder.items,
    }));

    return {
      total: items.length,
      published: published.length,
      scheduled: scheduled.length,
      expired: expired.length,
      drafts: drafts.length,
      folderCount: folders.size,
      totalViews,
      totalDownloads,
      unresolvedComments,
      topCourses,
      topFolders,
      needsAttention,
      recentUpdates,
      publishDistribution,
      engagementByCourse,
      folderDistribution,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))
          : [
              {
                title: "Total content",
                value: metrics.total,
                description: `${metrics.published} live assets available now`,
                icon: Layers3,
              },
              {
                title: "Engagement",
                value: formatCompactNumber(metrics.totalViews),
                description: `${formatCompactNumber(metrics.totalDownloads)} downloads across the library`,
                icon: TrendingUp,
              },
              {
                title: "Publishing queue",
                value: metrics.scheduled,
                description: `${metrics.drafts} drafts still need publishing`,
                icon: CalendarClock,
              },
              {
                title: "Organisation",
                value: metrics.folderCount,
                description: `${metrics.expired} expired items need review`,
                icon: FolderOpen,
              },
            ].map((card) => (
              <Card key={card.title}>
                <CardHeader className="pb-1">
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription>{card.title}</CardDescription>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl">{card.value}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Publishing health</CardTitle>
                <CardDescription>Track live, scheduled, draft, and expired content states.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/content">
                  Open Content Manager <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {loading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="h-56 min-h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.publishDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={4}
                        >
                          {metrics.publishDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Published", value: metrics.published, tone: "default" as const },
                      { label: "Scheduled", value: metrics.scheduled, tone: "outline" as const },
                      { label: "Drafts", value: metrics.drafts, tone: "secondary" as const },
                      { label: "Expired", value: metrics.expired, tone: "destructive" as const },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">Content items in this state</p>
                        </div>
                        <Badge variant={item.tone}>{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Top content courses</h3>
                  </div>
                  {metrics.topCourses.length > 0 ? (
                    metrics.topCourses.map((course) => (
                      <div key={course.name} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.items} items</p>
                        </div>
                        <Badge variant="outline">{course.views} views</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No course-linked content yet.</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into the most common content management workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            <Button asChild className="justify-between">
              <Link href="/admin/content">
                Manage all content <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/admin/content">
                Review scheduled and drafts <CalendarClock className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/admin/content">
                Check low-engagement items <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/admin/content">
                Organize folders and metadata <FolderOpen className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Course engagement</CardTitle>
            <CardDescription>Views and content volume across the busiest courses.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : metrics.engagementByCourse.length > 0 ? (
              <div className="h-64 min-h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.engagementByCourse} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="views" radius={[8, 8, 0, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No course engagement data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Folder distribution</CardTitle>
            <CardDescription>Where the largest share of content is currently organized.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <>
                {metrics.folderDistribution.length > 0 ? (
                  <div className="h-64 min-h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.folderDistribution} layout="vertical" margin={{ top: 12, right: 8, left: 24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={90} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="items" radius={[0, 8, 8, 0]} fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No folder data yet.</div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Draft, expired, or low-engagement items worth reviewing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))
            ) : metrics.needsAttention.length > 0 ? (
              metrics.needsAttention.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.course_code || item.course_name || "General"} • Updated {formatDate(item.updated_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {!item.is_published && <Badge variant="secondary">Draft</Badge>}
                    {isScheduled(item) && <Badge variant="outline">Scheduled</Badge>}
                    {isExpired(item) && <Badge variant="destructive">Expired</Badge>}
                    {(item.total_views ?? 0) < 3 && <Badge variant="outline">Low views</Badge>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Everything looks healthy right now.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Recent updates</CardTitle>
            <CardDescription>Latest content changes across the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))
            ) : (
              metrics.recentUpdates.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.uploaded_by_name} • {formatDate(item.updated_at)}
                    </p>
                  </div>
                  <Badge variant="outline">{item.total_views ?? 0} views</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Dashboard insights</CardTitle>
          <CardDescription>Fast signals for what to fix next in the content experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 pt-4 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Review backlog</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {metrics.expired + metrics.drafts} items are either expired or still drafts.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sky-500">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">Engagement snapshot</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatCompactNumber(metrics.totalViews)} views and {formatCompactNumber(metrics.totalDownloads)} downloads across all content.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-semibold">Comment load</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {metrics.unresolvedComments} comment threads are currently attached to content items.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
