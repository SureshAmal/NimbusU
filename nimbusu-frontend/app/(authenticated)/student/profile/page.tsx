"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { gradesService, enrollmentsService } from "@/services/api";
import { Enrollment, Grade } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, BookOpen, GraduationCap, TrendingUp, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfilePage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [gpaData, setGpaData] = useState<{ cgpa: number; scale: number; classification: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfileData() {
            setLoading(true);
            try {
                // Fetch enrollments, grades, and GPA in parallel
                const [enrRes, grRes, gpaRes] = await Promise.all([
                    enrollmentsService.mine(),
                    gradesService.me(),
                    gradesService.gpa()
                ]);

                if (enrRes.data?.results) {
                    setEnrollments(enrRes.data.results);
                }
                if (grRes.data) {
                    setGrades(grRes.data);
                }
                if (gpaRes.data?.status === "success" && gpaRes.data.data) {
                    setGpaData(gpaRes.data.data);
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
                toast.error("Failed to load academic records.");
            } finally {
                setLoading(false);
            }
        }
        
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const initials = `${user.first_name[0] || ""}${user.last_name[0] || ""}`.toUpperCase();

    // Calculate sum of credits from grades where is_pass is true
    const totalCreditsEarned = grades.filter(g => g.is_pass).reduce((sum, g) => sum + g.credits_earned, 0);

    // Filter current enrollments
    const activeEnrollments = enrollments.filter(e => e.status === "active");

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-4">
            {/* Header / Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card border rounded-xl p-6 shadow-sm">
                <Avatar className="h-24 w-24 border-4 border-muted">
                    <AvatarImage src={user.profile_picture || undefined} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left flex-1 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{user.first_name} {user.last_name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                        {user.student_profile?.student_id_number && (
                            <Badge variant="outline" className="font-mono">{user.student_profile.student_id_number}</Badge>
                        )}
                        <span>{user.email}</span>
                        {user.phone && (
                            <>
                                <span>•</span>
                                <span>{user.phone}</span>
                            </>
                        )}
                    </div>
                    
                    <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                        {user.program_name && (
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                {user.program_name}
                            </div>
                        )}
                        {user.department_name && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                {user.department_name}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Academic Standing Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {gpaData ? gpaData.cgpa.toFixed(2) : "N/A"}
                            {gpaData && <span className="text-sm font-normal text-muted-foreground"> / {gpaData.scale}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {gpaData?.classification || "No classification yet"}
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalCreditsEarned}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total successful credits
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Courses</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeEnrollments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active enrollments this semester
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Enrollments */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Current Enrollments</CardTitle>
                        <CardDescription>Courses you are currently taking</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {activeEnrollments.length > 0 ? (
                            <ul className="space-y-4">
                                {activeEnrollments.map((enr) => (
                                    <li key={enr.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{enr.course_name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{enr.status}</Badge>
                                                <span>Enrolled on {new Date(enr.enrolled_at).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                No active enrollments found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Grade History */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Completed Courses</CardTitle>
                        <CardDescription>Your recent academic history</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {grades.length > 0 ? (
                            <ul className="space-y-4">
                                {grades.map((grade) => (
                                    <li key={grade.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="font-medium text-sm truncate" title={grade.course_name}>
                                                {grade.course_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Semester {grade.semester_name || "N/A"} • {grade.credits_earned} Credits
                                            </p>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            <Badge variant={grade.is_pass ? "default" : "destructive"} className="text-sm font-bold min-w-[2.5rem] justify-center">
                                                {grade.grade_letter}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-1 text-center">
                                                {grade.is_pass ? "Pass" : "Fail"}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8">
                                No completed courses or grades yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
