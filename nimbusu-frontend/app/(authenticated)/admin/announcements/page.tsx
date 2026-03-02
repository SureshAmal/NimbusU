"use client";

import { useEffect, useState } from "react";
import { announcementsService } from "@/services/api";
import type { Announcement } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Megaphone, Loader2, Trash2, Pencil } from "lucide-react";

export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", body: "", is_urgent: false, target_type: "all" });

    async function fetch() {
        setLoading(true);
        try { const { data } = await announcementsService.list(); setItems(data.results ?? []); }
        catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, []);

    function openCreate() { setEditId(null); setForm({ title: "", body: "", is_urgent: false, target_type: "all" }); setDialogOpen(true); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setSaving(true);
        try {
            if (editId) await announcementsService.update(editId, form as unknown as Parameters<typeof announcementsService.update>[1]);
            else await announcementsService.create(form as unknown as Parameters<typeof announcementsService.create>[0]);
            toast.success(editId ? "Updated" : "Created"); setDialogOpen(false); fetch();
        } catch { toast.error("Failed"); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this announcement?")) return;
        try { await announcementsService.delete(id); toast.success("Deleted"); fetch(); }
        catch { toast.error("Failed"); }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground text-sm">Create and manage university-wide announcements</p>
                </div>
                <Button onClick={openCreate} style={{ borderRadius: "var(--radius)" }}><Plus className="h-4 w-4 mr-2" /> New Announcement</Button>
            </div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Target</TableHead><TableHead>Priority</TableHead><TableHead>Date</TableHead><TableHead className="w-[50px]" /></TableRow></TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No announcements.</TableCell></TableRow>
                                ) : items.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-medium flex items-center gap-2"><Megaphone className="h-4 w-4" style={{ color: "var(--primary)" }} />{a.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{a.created_by_name}</TableCell>
                                        <TableCell><Badge variant="secondary">{a.target_type}</Badge></TableCell>
                                        <TableCell>{a.is_urgent ? <Badge variant="destructive">Urgent</Badge> : <Badge variant="outline">Normal</Badge>}</TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Announcement</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                        <div className="space-y-2"><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={4} /></div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="urgent" checked={form.is_urgent} onCheckedChange={(v) => setForm({ ...form, is_urgent: !!v })} />
                            <Label htmlFor="urgent">Mark as urgent</Label>
                        </div>
                        <DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editId ? "Update" : "Publish"}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
