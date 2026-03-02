"use client";

import { useEffect, useState } from "react";
import { contentService } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Bookmark, Trash2, Download } from "lucide-react";

export default function StudentBookmarksPage() {
    const [bookmarks, setBookmarks] = useState<Array<{ id: string; content_title?: string; content_type?: string; created_at?: string; content?: string }>>([]);
    const [loading, setLoading] = useState(true);

    async function fetch() {
        setLoading(true);
        try {
            const { data } = await contentService.bookmarks.list();
            setBookmarks(data.results ?? data ?? []);
        } catch { toast.error("Failed to load bookmarks"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, []);

    async function handleRemove(id: string) {
        try { await contentService.bookmarks.remove(id); toast.success("Removed"); fetch(); }
        catch { toast.error("Failed"); }
    }

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1><p className="text-muted-foreground text-sm">Your saved content items</p></div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className={bookmarks.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                    {bookmarks.length === 0 ? (
                        <div className="flex flex-col items-center gap-2"><Bookmark className="h-8 w-8 opacity-40" /><p>No bookmarked content yet.</p></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Saved</TableHead><TableHead className="w-[80px]" /></TableRow></TableHeader>
                            <TableBody>
                                {bookmarks.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell className="font-medium">{b.content_title ?? "Content"}</TableCell>
                                        <TableCell><Badge variant="secondary">{b.content_type ?? "—"}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemove(b.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
