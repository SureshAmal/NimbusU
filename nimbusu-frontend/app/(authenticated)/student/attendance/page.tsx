"use client";

import { useEffect, useState } from "react";
import { attendanceService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ScrollText } from "lucide-react";

export default function StudentAttendancePage() {
    const [records, setRecords] = useState<Array<{ id: string; date: string; status: string; course_name?: string; remarks?: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const { data } = await attendanceService.mine();
                setRecords(data.results ?? []);
            } catch { toast.error("Failed to load"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    const total = records.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1><p className="text-muted-foreground text-sm">Your overall attendance across all courses</p></div>
            <div className="grid gap-4 md:grid-cols-4">
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overall</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold" style={{ color: pct >= 75 ? "var(--primary)" : "var(--destructive)" }}>{pct}%</div></CardContent></Card>
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Present</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{present}</div></CardContent></Card>
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Absent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{total - present}</div></CardContent></Card>
                <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Classes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{total}</div></CardContent></Card>
            </div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className={records.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                    {records.length === 0 ? <div className="flex flex-col items-center gap-2"><ScrollText className="h-8 w-8 opacity-40" /><p>No attendance records yet.</p></div> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {records.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.status === "present" ? "default" : r.status === "late" ? "secondary" : "destructive"}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{r.remarks || "—"}</TableCell>
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
