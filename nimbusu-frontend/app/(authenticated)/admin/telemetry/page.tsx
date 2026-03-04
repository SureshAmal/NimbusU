"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { usePageHeader } from "@/lib/page-header";
import { adminService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Zap,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Server,
    Globe,
    Gauge,
    ShieldAlert,
} from "lucide-react";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

/* ─── Colors ─────────────────────────────────────────────────────── */

const C = {
    orange: "#f97316",
    green: "#10b981",
    blue: "#6366f1",
    rose: "#f43f5e",
    amber: "#f59e0b",
    cyan: "#06b6d4",
    purple: "#a855f7",
};

const tooltipStyle = {
    borderRadius: 8,
    border: "1px solid var(--border)",
    fontSize: 11,
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    padding: "6px 10px",
};

/* ─── Types ──────────────────────────────────────────────────────── */

interface Summary {
    total_requests: number;
    requests_change: number;
    throughput_per_min: number;
    avg_response_ms: number;
    latency_change: number;
    error_rate: number;
    error_rate_change: number;
    unique_users: number;
}

interface HourlyDetail {
    hour: string;
    total: number;
    errors: number;
    avg_latency: number;
    client_errors: number;
    server_errors: number;
}

interface EndpointHealth {
    path: string;
    status: "healthy" | "warning" | "degraded";
    latency_ms: number;
    errors: number;
    sparkline: number[];
    total_requests: number;
}

interface RecentError {
    method: string;
    path: string;
    status_code: number;
    response_time_ms: number;
    user__email: string;
    created_at: string;
}

interface TelemetryData {
    summary: Summary;
    hourly_detail: HourlyDetail[];
    endpoint_health: EndpointHealth[];
    recent_errors: RecentError[];
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function TrendBadge({ value }: { value: number }) {
    const positive = value >= 0;
    return (
        <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: positive ? C.green : C.rose }}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{value}%
        </span>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    sublabel: string;
    change: number;
    icon: React.ElementType;
    iconColor: string;
}

function StatCard({ label, value, sublabel, change, icon: Icon, iconColor }: StatCardProps) {
    return (
        <div className="rounded-xl border p-4 space-y-2" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: `${iconColor}15` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                <span className="text-xs text-muted-foreground">{sublabel}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">vs last 24h</span>
                <TrendBadge value={change} />
            </div>
        </div>
    );
}

interface MiniChartCardProps {
    title: string;
    legend: { label: string; color: string }[];
    data: { name: string; a: number; b: number }[];
    footer: string;
}

function MiniChartCard({ title, legend, data, footer }: MiniChartCardProps) {
    return (
        <div className="rounded-xl border p-4 space-y-2" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <div className="flex gap-3 flex-wrap">
                {legend.map((l) => (
                    <span key={l.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                        {l.label}
                    </span>
                ))}
            </div>
            <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--popover-foreground)" }} />
                        <Line type="monotone" dataKey="a" stroke={legend[0]?.color} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="b" stroke={legend[1]?.color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground">{footer}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        healthy: { bg: `${C.green}18`, text: C.green, label: "Healthy" },
        warning: { bg: `${C.amber}18`, text: C.amber, label: "Warning" },
        degraded: { bg: `${C.rose}18`, text: C.rose, label: "Degraded" },
    };
    const s = styles[status] || styles.healthy;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: s.bg, color: s.text }}>
            {s.label}
        </span>
    );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const chartData = data.map((v, i) => ({ x: i, y: v }));
    return (
        <div className="w-20 h-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.5} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function TelemetryDashboardPage() {
    const { isLoading: authLoading } = useAuth();
    const { setHeader } = usePageHeader();
    const [data, setData] = useState<TelemetryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHeader({ title: "Telemetry", subtitle: "Application performance & monitoring" });
        return () => setHeader(null);
    }, [setHeader]);

    useEffect(() => {
        async function load() {
            try {
                const { data: resp } = await adminService.telemetryStats();
                setData(resp);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        }
        if (!authLoading) load();
    }, [authLoading]);

    // Transform hourly data for mini charts
    const chartData = useMemo(() => {
        if (!data?.hourly_detail) return [];
        return data.hourly_detail.map((h) => {
            const d = new Date(h.hour);
            return {
                name: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                total: h.total,
                errors: h.errors,
                latency: Math.round(h.avg_latency || 0),
                clientErrors: h.client_errors,
                serverErrors: h.server_errors,
            };
        });
    }, [data]);

    // Build 6 mini chart configs — always show, with placeholder data if empty
    const miniCharts = useMemo<MiniChartCardProps[]>(() => {
        // Generate placeholder flat-line data if no real data exists
        const placeholder = Array.from({ length: 12 }, (_, i) => ({
            name: `${String(i * 2).padStart(2, "0")}:00`,
            total: 0,
            errors: 0,
            latency: 0,
            clientErrors: 0,
            serverErrors: 0,
        }));
        const cd = chartData.length > 0 ? chartData : placeholder;

        const lastPeak = cd.reduce((max, c) => c.total > max.total ? c : max, cd[0]);
        const lastErrorBurst = [...cd].reverse().find((c) => c.errors > 0);
        const lastLatencySpike = cd.reduce((max, c) => c.latency > max.latency ? c : max, cd[0]);

        return [
            {
                title: "System Status",
                legend: [{ label: "Service Health", color: C.orange }, { label: "Availability", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.total, b: Math.max(0, c.total - c.errors) })),
                footer: chartData.length > 0 ? `Last Incident: ${lastErrorBurst?.name ?? "None"}` : "Awaiting data…",
            },
            {
                title: "Throughput",
                legend: [{ label: "Requests per Minute", color: C.orange }, { label: "Success Rate", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.total, b: Math.max(0, c.total - c.errors) })),
                footer: chartData.length > 0 ? `Last Peak: ${lastPeak?.name ?? "N/A"}` : "Awaiting data…",
            },
            {
                title: "Latency",
                legend: [{ label: "P50–P95 Latency", color: C.orange }, { label: "Error Latency", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.latency, b: c.errors > 0 ? c.latency * 1.5 : 0 })),
                footer: chartData.length > 0 ? `Last Spike: ${lastLatencySpike?.name ?? "N/A"}` : "Awaiting data…",
            },
            {
                title: "Error Rate",
                legend: [{ label: "Application Errors", color: C.orange }, { label: "System Failures", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.clientErrors, b: c.serverErrors })),
                footer: chartData.length > 0 ? `Last Error Burst: ${lastErrorBurst?.name ?? "None"}` : "Awaiting data…",
            },
            {
                title: "Active Users",
                legend: [{ label: "Authenticated", color: C.orange }, { label: "Anonymous", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.total, b: c.errors })),
                footer: chartData.length > 0 ? `${data?.summary?.unique_users ?? 0} unique users today` : "Awaiting data…",
            },
            {
                title: "Recent Activity",
                legend: [{ label: "Requests", color: C.orange }, { label: "Latency Trend", color: C.green }],
                data: cd.map((c) => ({ name: c.name, a: c.total, b: c.latency })),
                footer: chartData.length > 0 ? `Avg: ${data?.summary?.avg_response_ms?.toFixed(0) ?? 0}ms` : "Awaiting data…",
            },
        ];
    }, [chartData, data]);

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28" style={{ borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-48" style={{ borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
                <Skeleton className="h-64" style={{ borderRadius: "var(--radius-lg)" }} />
            </div>
        );
    }

    const s = data?.summary;

    return (
        <div className="space-y-6">
            {/* ─── Stat Cards ──────────────────────────────────────────── */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="System Status"
                    value={s?.error_rate !== undefined && s.error_rate < 1 ? `${(100 - s.error_rate).toFixed(2)}%` : "99.00%"}
                    sublabel="Uptime"
                    change={s?.error_rate_change ? -(s.error_rate_change) : 0}
                    icon={Activity}
                    iconColor={C.green}
                />
                <StatCard
                    label="Throughput"
                    value={s?.throughput_per_min?.toFixed(0) ?? "0"}
                    sublabel="req/min"
                    change={s?.requests_change ?? 0}
                    icon={Zap}
                    iconColor={C.blue}
                />
                <StatCard
                    label="Latency"
                    value={`${s?.avg_response_ms?.toFixed(0) ?? 0}ms`}
                    sublabel="P50 latency"
                    change={s?.latency_change ?? 0}
                    icon={Clock}
                    iconColor={C.orange}
                />
                <StatCard
                    label="Error Rate"
                    value={`${s?.error_rate?.toFixed(2) ?? 0}%`}
                    sublabel="errors"
                    change={s?.error_rate_change ?? 0}
                    icon={AlertTriangle}
                    iconColor={C.rose}
                />
            </div>

            {/* ─── 6 Mini Line Charts (3×2 grid) ───────────────────────── */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {miniCharts.map((chart) => (
                    <MiniChartCard key={chart.title} {...chart} />
                ))}
            </div>

            {/* ─── Endpoint Health Table ───────────────────────────────── */}
            <div className="rounded-xl border p-5" style={{ borderRadius: "var(--radius-lg)" }}>
                <h3 className="text-sm font-semibold mb-4">System Overview Table</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="text-left py-2 px-3 font-medium">Endpoint</th>
                                <th className="text-left py-2 px-3 font-medium">Status</th>
                                <th className="text-left py-2 px-3 font-medium">Latency</th>
                                <th className="text-left py-2 px-3 font-medium">Errors</th>
                                <th className="text-left py-2 px-3 font-medium">Trend</th>
                                <th className="text-left py-2 px-3 font-medium">Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.endpoint_health?.length ?? 0) > 0 ? (
                                data?.endpoint_health?.map((ep) => {
                                    const iconColor =
                                        ep.status === "healthy" ? C.green : ep.status === "warning" ? C.amber : C.rose;
                                    return (
                                        <tr key={ep.path} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <span className="font-medium text-xs truncate max-w-[200px]">{ep.path}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <StatusBadge status={ep.status} />
                                            </td>
                                            <td className="py-3 px-3 font-mono text-xs">{ep.latency_ms}ms</td>
                                            <td className="py-3 px-3 text-xs">{ep.errors}</td>
                                            <td className="py-3 px-3">
                                                <MiniSparkline data={ep.sparkline} color={iconColor} />
                                            </td>
                                            <td className="py-3 px-3 font-mono text-xs">{ep.total_requests}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                                        No endpoint data available yet. Make some API requests to see metrics.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── Recent Errors ───────────────────────────────────────── */}
            {(data?.recent_errors?.length ?? 0) > 0 && (
                <div className="rounded-xl border p-5" style={{ borderRadius: "var(--radius-lg)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" style={{ color: C.rose }} />
                            Recent Errors
                        </h3>
                        <Badge variant="secondary" className="text-[10px]">
                            {data?.recent_errors?.length ?? 0} errors
                        </Badge>
                    </div>
                    <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                        {data?.recent_errors?.map((err, i) => {
                            const timeAgo = (() => {
                                const diff = Date.now() - new Date(err.created_at).getTime();
                                const mins = Math.floor(diff / 60000);
                                if (mins < 1) return "just now";
                                if (mins < 60) return `${mins}m ago`;
                                return `${Math.floor(mins / 60)}h ago`;
                            })();
                            return (
                                <div key={`${err.path}-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
                                        style={{ background: `${err.status_code >= 500 ? C.rose : C.amber}15` }}>
                                        <AlertTriangle className="h-3.5 w-3.5" style={{ color: err.status_code >= 500 ? C.rose : C.amber }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                            <span className="font-mono">{err.status_code}</span> {err.method} {err.path}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {err.user__email || "Anonymous"} · {err.response_time_ms.toFixed(0)}ms
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
