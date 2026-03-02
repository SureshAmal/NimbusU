"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
    const { register } = useAuth();
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password_confirm: "",
        role: "student" as "student" | "faculty",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function update(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (form.password !== form.password_confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await register(form);
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, unknown> } })
                ?.response?.data;
            if (data && typeof data === "object") {
                const messages = Object.entries(data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                setError(messages || "Registration failed.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="flex min-h-svh items-center justify-center p-4"
            style={{ background: "var(--background)" }}
        >
            <Card className="mx-auto w-full max-w-md" style={{ boxShadow: "var(--shadow-xl)", borderRadius: "var(--radius-xl)" }}>
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--primary)" }}>
                        <GraduationCap className="h-7 w-7" style={{ color: "var(--primary-foreground)" }} />
                    </div>
                    <CardTitle style={{ fontSize: "var(--text-2xl)" }}>
                        Create Account
                    </CardTitle>
                    <CardDescription>Sign up for NimbusU</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div
                                className="whitespace-pre-line rounded-md p-3 text-sm"
                                style={{
                                    background: "oklch(0.577 0.245 27.325 / 10%)",
                                    color: "var(--destructive)",
                                    borderRadius: "var(--radius)",
                                }}
                            >
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    placeholder="John"
                                    value={form.first_name}
                                    onChange={(e) => update("first_name", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    value={form.last_name}
                                    onChange={(e) => update("last_name", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg_email">Email</Label>
                            <Input
                                id="reg_email"
                                type="email"
                                placeholder="you@university.edu"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={form.role}
                                onValueChange={(v) => update("role", v)}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg_password">Password</Label>
                            <Input
                                id="reg_password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirm">Confirm Password</Label>
                            <Input
                                id="password_confirm"
                                type="password"
                                placeholder="••••••••"
                                value={form.password_confirm}
                                onChange={(e) => update("password_confirm", e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            style={{ borderRadius: "var(--radius)" }}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium underline-offset-4 hover:underline"
                            style={{ color: "var(--primary)" }}
                        >
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
