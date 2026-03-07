"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageHeader } from "@/lib/page-header";
import { assignmentsService, assignmentGroupsService } from "@/services/api";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Users, Plus, Trash2 } from "lucide-react";
import type { Assignment, AssignmentGroup, User } from "@/lib/types";

export default function AssignmentGroupsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const assignmentId = params.assignmentId as string;
    const { setHeader } = usePageHeader();

    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [groups, setGroups] = useState<AssignmentGroup[]>([]);
    const [students, setStudents] = useState<User[]>([]);

    const [groupDialog, setGroupDialog] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleteGroup, setDeleteGroup] = useState<AssignmentGroup | null>(null);
    const [deletingGroup, setDeletingGroup] = useState(false);

    const fetchAll = async () => {
        try {
            const [assRes, groupRes, studRes] = await Promise.all([
                assignmentsService.get(assignmentId),
                assignmentGroupsService.list({ assignment: assignmentId }),
                api.get(`/academics/offerings/${courseId}/students/`)
            ]);

            setAssignment(assRes.data);
            setGroups(groupRes.data.results ?? groupRes.data ?? []);

            const studData = studRes.data as User[] | { results?: User[], data?: User[] };
            setStudents(Array.isArray(studData) ? studData : (studData.results ?? studData.data ?? []));
        } catch (error) {
            toast.error("Failed to load assignment groups data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [assignmentId, courseId]);

    useEffect(() => {
        if (assignment) {
            setHeader({
                title: assignment.title,
                subtitle: "Manage Assignment Groups",
                backUrl: `/faculty/courses/${courseId}`
            });
        }
        return () => setHeader(null);
    }, [assignment, courseId, setHeader]);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            toast.error("Select at least one student");
            return;
        }
        setSaving(true);
        try {
            await assignmentGroupsService.create({
                assignment: assignmentId,
                name: groupName,
                members: selectedStudents
            });
            toast.success("Group created successfully");
            setGroupDialog(false);
            setGroupName("");
            setSelectedStudents([]);
            fetchAll();
        } catch (error) {
            toast.error("Failed to create group");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!deleteGroup) return;
        setDeletingGroup(true);
        try {
            await assignmentGroupsService.delete(deleteGroup.id);
            toast.success("Group deleted");
            setGroups(groups.filter(g => g.id !== deleteGroup.id));
            setDeleteGroup(null);
        } catch (error) {
            toast.error("Failed to delete group");
        } finally {
            setDeletingGroup(false);
        }
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            </div>
        );
    }

    // Helper to get assigned students
    const assignedStudentIds = new Set(groups.flatMap(g => g.members));

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Assignment Groups</h1>
                        <p className="text-sm text-muted-foreground">For: {assignment?.title}</p>
                    </div>
                </div>
                <Button onClick={() => setGroupDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Group
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground border rounded-xl border-dashed">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No groups created yet.</p>
                        <Button variant="link" onClick={() => setGroupDialog(true)}>Create the first group</Button>
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} className="p-5 border rounded-xl bg-card shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{group.name}</h3>
                                    <p className="text-sm text-muted-foreground">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteGroup(group)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 flex-grow overflow-y-auto max-h-[150px] pr-2">
                                {group.members.map(memberId => {
                                    const student = students.find(s => s.id === memberId);
                                    return (
                                        <div key={memberId} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                                {student?.first_name?.[0]}{student?.last_name?.[0]}
                                            </div>
                                            <span className="truncate flex-1">{student ? `${student.first_name} ${student.last_name}` : "Unknown User"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ungrouped Students */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Ungrouped Students ({students.filter(s => !assignedStudentIds.has(s.id)).length})</h3>
                <div className="flex flex-wrap gap-2">
                    {students.filter(s => !assignedStudentIds.has(s.id)).map(student => (
                        <div key={student.id} className="text-sm px-3 py-1.5 border rounded-full bg-muted/40 text-muted-foreground flex items-center gap-2">
                            <span>{student.first_name} {student.last_name}</span>
                        </div>
                    ))}
                    {students.filter(s => !assignedStudentIds.has(s.id)).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">All students are assigned to groups.</p>
                    )}
                </div>
            </div>

            {/* Create Group Dialog */}
            <Dialog open={groupDialog} onOpenChange={(open) => { setGroupDialog(open); if (!open) { setGroupName(""); setSelectedStudents([]); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateGroup} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Group Name</Label>
                            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} required placeholder="e.g. Group A, Frontend Team..." />
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center justify-between">
                                Select Members
                                <span className="text-xs font-normal text-muted-foreground">
                                    {selectedStudents.length} selected
                                </span>
                            </Label>
                            <div className="max-h-[300px] overflow-y-auto space-y-1 p-1 border rounded-md">
                                {students.map(student => {
                                    const isAssigned = assignedStudentIds.has(student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${isAssigned ? 'opacity-50' : 'hover:bg-accent'}`}
                                            onClick={() => !isAssigned && toggleStudent(student.id)}
                                        >
                                            <Checkbox
                                                id={`student-${student.id}`}
                                                checked={selectedStudents.includes(student.id)}
                                                disabled={isAssigned}
                                                onCheckedChange={() => !isAssigned && toggleStudent(student.id)}
                                            />
                                            <Label
                                                htmlFor={`student-${student.id}`}
                                                className={`text-sm cursor-pointer flex-1 flex justify-between ${isAssigned ? 'text-muted-foreground' : ''}`}
                                            >
                                                <span>{student.first_name} {student.last_name}</span>
                                                {isAssigned && <span className="text-xs">Already assigned</span>}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setGroupDialog(false)} disabled={saving}>Cancel</Button>
                            <Button type="submit" disabled={saving || selectedStudents.length === 0}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Group
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!deleteGroup}
                onOpenChange={(open) => {
                    if (!open && !deletingGroup) setDeleteGroup(null);
                }}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteGroup
                                ? `This will permanently remove the group “${deleteGroup.name}”.`
                                : "This will permanently remove this group."} This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingGroup}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGroup} disabled={deletingGroup}>
                            {deletingGroup && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete group
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
