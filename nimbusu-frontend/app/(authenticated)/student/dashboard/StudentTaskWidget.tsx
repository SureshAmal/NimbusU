"use client";

import { useEffect, useState } from "react";
import { studentTasksService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import type { StudentTask } from "@/lib/types";

export default function StudentTaskWidget() {
    const [tasks, setTasks] = useState<StudentTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data } = await studentTasksService.list();
            setTasks(data.results ?? data ?? []);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        try {
            setAdding(true);
            const { data } = await studentTasksService.create({
                title: newTaskTitle.trim(),
                is_completed: false,
            });
            setTasks([data, ...tasks]);
            setNewTaskTitle("");
        } catch (err) {
            console.error("Failed to add task", err);
        } finally {
            setAdding(false);
        }
    };

    const toggleTask = async (task: StudentTask) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t => 
                t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
            );
            setTasks(updatedTasks);
            
            await studentTasksService.update(task.id, {
                is_completed: !task.is_completed
            });
        } catch (err) {
            console.error("Failed to update task", err);
            // Revert on error
            fetchTasks();
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            setTasks(tasks.filter(t => t.id !== taskId));
            await studentTasksService.delete(taskId);
        } catch (err) {
            console.error("Failed to delete task", err);
            fetchTasks(); // Revert
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border p-4 h-[350px] flex flex-col" style={{ borderRadius: "var(--radius-lg)" }}>
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-3 flex-1">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            </div>
        );
    }

    // Sort: incomplete first, then by creation date
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.is_completed === b.is_completed) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.is_completed ? 1 : -1;
    });

    return (
        <div className="rounded-xl border p-4 flex flex-col h-full bg-card" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-purple-500" /> My Tasks
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasks.filter(t => !t.is_completed).length} items
                </span>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4 relative items-center">
                <Input
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    disabled={adding}
                    className="h-9 text-sm pr-9"
                    style={{ borderRadius: "var(--radius)" }}
                />
                <Button 
                    type="submit" 
                    size="sm" 
                    disabled={adding || !newTaskTitle.trim()}
                    className="absolute right-0 h-9 rounded-l-none"
                    style={{ borderTopRightRadius: "var(--radius)", borderBottomRightRadius: "var(--radius)" }}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </form>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar min-h-[200px] max-h-[250px]">
                {sortedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-8 pb-4">
                        <ListTodo className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No tasks yet.</p>
                        <p className="text-xs">Add your first task above.</p>
                    </div>
                ) : (
                    sortedTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`flex items-start gap-3 p-2.5 rounded-lg border group transition-all duration-200 ${
                                task.is_completed ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background hover:border-primary/30 shadow-sm'
                            }`}
                        >
                            <Checkbox 
                                checked={task.is_completed} 
                                onCheckedChange={() => toggleTask(task)}
                                className="mt-0.5 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm tracking-tight ${task.is_completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                    {task.title}
                                </p>
                                {task.course_name && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5 inline-flex bg-muted px-1.5 py-0.5 rounded">
                                        {task.course_name}
                                    </p>
                                )}
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteTask(task.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
