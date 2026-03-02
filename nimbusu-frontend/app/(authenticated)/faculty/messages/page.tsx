"use client";

import { useEffect, useState } from "react";
import { messagesService } from "@/services/api";
import type { Message } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mail, Inbox, Send } from "lucide-react";

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await messagesService.list();
                setMessages(data.results ?? []);
            } catch { toast.error("Failed to load messages"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Messages</h1><p className="text-muted-foreground text-sm">Your conversations</p></div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="pt-4">
                    {messages.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Mail className="h-8 w-8 opacity-40" />
                            <p>No messages yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((m) => (
                                <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" style={{ borderRadius: "var(--radius)" }}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{m.sender_name}</p>
                                            {!m.is_read && <Badge variant="default" className="h-5 text-xs">New</Badge>}
                                        </div>
                                        <p className="text-sm font-medium mt-0.5">{m.subject}</p>
                                        <p className="text-xs text-muted-foreground truncate">{m.body}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
