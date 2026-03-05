"use client";

import { useEffect, useState } from "react";
import { notificationsService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Send, CheckCheck, AlertTriangle } from "lucide-react";

export default function AdminNotificationsPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await notificationsService.adminStats();
        setStats(data.data ?? data);
      } catch {
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sent
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats as Record<string, unknown>)?.total_sent?.toString() ??
                "—"}
            </div>
          </CardContent>
        </Card>
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                stats as Record<string, unknown>
              )?.total_delivered?.toString() ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats as Record<string, unknown>)?.total_failed?.toString() ??
                "—"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
