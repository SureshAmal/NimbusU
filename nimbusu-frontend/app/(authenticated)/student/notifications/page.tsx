"use client";

import { useEffect, useState } from "react";
import { notificationsService } from "@/services/api";
import type { Notification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";

export default function StudentNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetch() {
        setLoading(true);
        try { const { data } = await notificationsService.list(); setNotifications(data.results ?? []); }
        catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, []);

    async function markAllRead() {
        try { await notificationsService.markAllRead(); toast.success("All marked as read"); fetch(); }
        catch { toast.error("Failed"); }
    }

    async function markRead(id: string) {
        try { await notificationsService.markRead(id); fetch(); }
        catch { /* ignore */ }
    }

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    const unread = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold tracking-tight">Notifications</h1><p className="text-muted-foreground text-sm">{unread} unread notification{unread !== 1 ? "s" : ""}</p></div>
                {unread > 0 && <Button variant="outline" onClick={markAllRead} style={{ borderRadius: "var(--radius)" }}><CheckCheck className="h-4 w-4 mr-2" /> Mark All Read</Button>}
            </div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="pt-4">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2"><Bell className="h-8 w-8 opacity-40" /><p>No notifications yet.</p></div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && markRead(n.id)}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${!n.is_read ? "bg-accent/50" : "hover:bg-accent/30"}`}
                                    style={{ borderRadius: "var(--radius)" }}
                                >
                                    <Bell className="h-4 w-4 mt-0.5 shrink-0" style={{ color: n.is_read ? "var(--muted-foreground)" : "var(--primary)" }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm ${!n.is_read ? "font-semibold" : ""}`}>{n.title}</p>
                                            {!n.is_read && <Badge variant="default" className="h-4 text-[10px] px-1.5">New</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
