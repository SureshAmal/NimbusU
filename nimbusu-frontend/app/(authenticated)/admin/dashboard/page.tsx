"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  GraduationCap,
  Bell,
  FileText,
  BarChart3,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card
      style={{
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className="h-4 w-4"
          style={{ color: "var(--muted-foreground)" }}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-28"
              style={{ borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontSize: "var(--text-2xl)" }}
        >
          Welcome back, {user?.first_name}
        </h1>
        <p
          className="text-muted-foreground"
          style={{ fontSize: "var(--text-sm)" }}
        >
          Here&apos;s an overview of your university system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="—"
          icon={Users}
          description="Active system users"
        />
        <StatCard
          title="Departments"
          value="—"
          icon={Building2}
          description="Active departments"
        />
        <StatCard
          title="Courses"
          value="—"
          icon={GraduationCap}
          description="Offered this semester"
        />
        <StatCard
          title="Notifications"
          value="—"
          icon={Bell}
          description="Sent today"
        />
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3
                className="h-5 w-5"
                style={{ color: "var(--primary)" }}
              />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will appear here once the system is populated with
              data.
            </p>
          </CardContent>
        </Card>
        <Card
          style={{
            boxShadow: "var(--shadow-sm)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText
                className="h-5 w-5"
                style={{ color: "var(--primary)" }}
              />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate to user management, academics,
              timetable, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
