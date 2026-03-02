"use client";

import { useEffect, useState } from "react";
import { auditLogsService } from "@/services/api";
import type { AuditLog } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, ScrollText } from "lucide-react";

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    async function fetch() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            const { data } = await auditLogsService.list(params);
            setLogs(data.results ?? []);
        } catch { toast.error("Failed to load audit logs"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, []);

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1><p className="text-muted-foreground text-sm">Track all administrative actions</p></div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="pt-4">
                    <form onSubmit={(e) => { e.preventDefault(); fetch(); }} className="flex gap-2">
                        <Input placeholder="Search by user, action..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button type="submit" variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
                    </form>
                </CardContent>
            </Card>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>IP</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found.</TableCell></TableRow>
                                ) : logs.map((l) => (
                                    <TableRow key={l.id}>
                                        <TableCell className="text-muted-foreground">{l.user_email}</TableCell>
                                        <TableCell><Badge variant="secondary">{l.action}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">{l.entity_type}:{l.entity_id?.slice(0, 8)}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{l.ip_address}</TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
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
