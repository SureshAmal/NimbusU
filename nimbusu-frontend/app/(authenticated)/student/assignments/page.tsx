"use client";

import { useEffect, useState } from "react";
import { assignmentsService } from "@/services/api";
import type { Assignment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";

export default function StudentAssignmentsPage() {
    const [items, setItems] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try { const { data } = await assignmentsService.list(); setItems(data.results ?? []); }
            catch { toast.error("Failed to load assignments"); }
            finally { setLoading(false); }
        }
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" style={{ borderRadius: "var(--radius-lg)" }} /></div>;

    const now = new Date();

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight">All Assignments</h1><p className="text-muted-foreground text-sm">Assignments across all your courses</p></div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className={items.length === 0 ? "py-12 text-center text-muted-foreground" : "p-0"}>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2"><ClipboardList className="h-8 w-8 opacity-40" /><p>No assignments found.</p></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Course</TableHead><TableHead>Type</TableHead><TableHead>Due Date</TableHead><TableHead>Max Marks</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {items.map((a) => {
                                    const due = new Date(a.due_date);
                                    const overdue = due < now;
                                    return (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-medium">{a.title}</TableCell>
                                            <TableCell className="text-muted-foreground">{a.course_name}</TableCell>
                                            <TableCell><Badge variant="secondary">{a.assignment_type}</Badge></TableCell>
                                            <TableCell><span style={{ color: overdue ? "var(--destructive)" : undefined }}>{due.toLocaleDateString()}</span></TableCell>
                                            <TableCell>{a.max_marks}</TableCell>
                                            <TableCell>{overdue ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="outline">Open</Badge>}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
