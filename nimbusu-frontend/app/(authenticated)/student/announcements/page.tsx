"use client";

import { useEffect, useState } from "react";
import { announcementsService } from "@/services/api";
import type { Announcement } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

export default function StudentAnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try { const { data } = await announcementsService.list(); setItems(data.results ?? []); }
            catch { toast.error("Failed to load"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Announcements</h1><p className="text-muted-foreground text-sm">University and course announcements</p></div>
            {items.length === 0 ? (
                <Card style={{ borderRadius: "var(--radius-lg)" }}><CardContent className="py-12 text-center text-muted-foreground">No announcements yet.</CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {items.map((a) => (
                        <Card key={a.id} style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <Megaphone className="h-5 w-5 mt-0.5 shrink-0" style={{ color: a.is_urgent ? "var(--destructive)" : "var(--primary)" }} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{a.title}</h3>
                                            {a.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                                        <p className="text-xs text-muted-foreground mt-2">by {a.created_by_name} · {new Date(a.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
