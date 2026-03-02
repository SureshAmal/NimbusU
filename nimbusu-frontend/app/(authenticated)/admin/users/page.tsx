"use client";

import { useEffect, useState } from "react";
import { usersService } from "@/services/api";
import type { User } from "@/lib/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Plus,
    Search,
    MoreHorizontal,
    UserPlus,
    KeyRound,
    Loader2,
    Shield,
    GraduationCap,
    BookOpen,
} from "lucide-react";

const ROLE_ICONS: Record<string, React.ReactNode> = {
    admin: <Shield className="h-3 w-3" />,
    faculty: <BookOpen className="h-3 w-3" />,
    student: <GraduationCap className="h-3 w-3" />,
};

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-red-500/10 text-red-600 dark:text-red-400",
    faculty: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    student: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        role: "student",
        password: "",
    });

    async function fetchUsers() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (roleFilter !== "all") params.role = roleFilter;
            const { data } = await usersService.list(params);
            setUsers(data.results ?? []);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            await usersService.create(form as unknown as Parameters<typeof usersService.create>[0]);
            toast.success("User created successfully");
            setCreateOpen(false);
            setForm({ email: "", first_name: "", last_name: "", role: "student", password: "" });
            fetchUsers();
        } catch {
            toast.error("Failed to create user");
        } finally {
            setCreating(false);
        }
    }

    async function handleResetPassword(userId: string) {
        const newPw = "Reset@1234";
        try {
            await usersService.resetPassword(userId, newPw);
            toast.success(`Password reset to: ${newPw}`);
        } catch {
            toast.error("Failed to reset password");
        }
    }

    async function handleDelete(userId: string) {
        if (!confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await usersService.delete(userId);
            toast.success("User deactivated");
            fetchUsers();
        } catch {
            toast.error("Failed to deactivate user");
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        fetchUsers();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground text-sm">Manage all system users</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ borderRadius: "var(--radius)" }}>
                            <UserPlus className="h-4 w-4 mr-2" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Add a new user to the system.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="faculty">Faculty</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="pt-4">
                    <div className="flex gap-3">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <Button type="submit" variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
                        </form>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="All roles" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
                                ) : (
                                    users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={ROLE_COLORS[u.role] ?? ""}>
                                                    {ROLE_ICONS[u.role]} {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{u.department_name ?? "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.is_active ? "default" : "secondary"}>
                                                    {u.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleResetPassword(u.id)}>
                                                            <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(u.id)} className="text-destructive">
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
