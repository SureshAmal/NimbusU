"use client";

import { useEffect, useState } from "react";
import { departmentsService } from "@/services/api";
import type { Department } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, Loader2, Pencil, Trash2 } from "lucide-react";

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", code: "" });

    async function fetch() {
        setLoading(true);
        try {
            const { data } = await departmentsService.list();
            setDepartments(data.results ?? []);
        } catch { toast.error("Failed to load departments"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, []);

    function openCreate() { setEditId(null); setForm({ name: "", code: "" }); setDialogOpen(true); }
    function openEdit(d: Department) { setEditId(d.id); setForm({ name: d.name, code: d.code }); setDialogOpen(true); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true);
        try {
            if (editId) await departmentsService.update(editId, form);
            else await departmentsService.create(form);
            toast.success(editId ? "Department updated" : "Department created");
            setDialogOpen(false); fetch();
        } catch { toast.error("Failed to save department"); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this department?")) return;
        try { await departmentsService.delete(id); toast.success("Deleted"); fetch(); }
        catch { toast.error("Failed to delete"); }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground text-sm">Manage university departments</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} style={{ borderRadius: "var(--radius)" }}><Plus className="h-4 w-4 mr-2" /> Add Department</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editId ? "Edit" : "Create"} Department</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={10} /></div>
                            <DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" style={{ borderRadius: "var(--radius-lg)" }} />)}
                </div>
            ) : departments.length === 0 ? (
                <Card style={{ borderRadius: "var(--radius-lg)" }}><CardContent className="py-12 text-center text-muted-foreground">No departments yet. Create one to get started.</CardContent></Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {departments.map((d) => (
                        <Card key={d.id} style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--primary)", borderRadius: "var(--radius)" }}>
                                        <Building2 className="h-5 w-5" style={{ color: "var(--primary-foreground)" }} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{d.name}</CardTitle>
                                        <Badge variant="secondary" className="mt-1">{d.code}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Head: {d.head_name ?? "Not assigned"}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
