"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    switch (user.role) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "faculty":
        router.push("/faculty/dashboard");
        break;
      case "student":
        router.push("/student/dashboard");
        break;
      default:
        router.push("/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}
