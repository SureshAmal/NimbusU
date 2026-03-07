"use client";

import { useEffect, useState, useCallback } from "react";
import {
  semestersService,
  coursesService,
  offeringsService,
  usersService,
  enrollmentsService,
} from "@/services/api";
import type { Semester, Course, CourseOffering } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableCard } from "@/components/application/table/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Calendar,
  BookOpen,
  GraduationCap,
  Pencil,
  Search,
  Users,
  Trash2,
  Upload,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

export default function AdminAcademicsPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* Semester state */
  const [semSheet, setSemSheet] = useState(false);
  const [semForm, setSemForm] = useState({
    name: "",
    academic_year: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [semSaving, setSemSaving] = useState(false);
  const [semEditId, setSemEditId] = useState<string | null>(null);
  const [semCtx, setSemCtx] = useState<Semester | null>(null);

  /* Course state */
  const [courseSheet, setCourseSheet] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    credits: 3,
    description: "",
  });
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseEditId, setCourseEditId] = useState<string | null>(null);
  const [courseCtx, setCourseCtx] = useState<Course | null>(null);

  /* Offering state */
  const [faculty, setFaculty] = useState<
    { id: string; first_name: string; last_name: string }[]
  >([]);
  const [offeringSheet, setOfferingSheet] = useState(false);
  const [offeringForm, setOfferingForm] = useState({
    course: "",
    semester: "",
    faculty: "",
    section: "",
    max_students: 30,
  });
  const [offeringSaving, setOfferingSaving] = useState(false);
  const [offeringEditId, setOfferingEditId] = useState<string | null>(null);
  const [offeringCtx, setOfferingCtx] = useState<CourseOffering | null>(null);

  // Bulk Upload Enrollments logic
  const [enrollmentsUploadOpen, setEnrollmentsUploadOpen] = useState(false);
  const [enrollmentsUploadFile, setEnrollmentsUploadFile] =
    useState<File | null>(null);
  const [enrollmentsUploading, setEnrollmentsUploading] = useState(false);

  const fetchAll = useCallback(async (opts?: { showLoading?: boolean }) => {
    if (opts?.showLoading) setInitialLoading(true);
    try {
      const [semRes, courseRes, offRes, facRes] = await Promise.all([
        semestersService.list(),
        coursesService.list(),
        offeringsService.list(),
        usersService.list({ role: "faculty" }),
      ]);
      setSemesters(semRes.data.results ?? []);
      setCourses(courseRes.data.results ?? []);
      setOfferings(offRes.data.results ?? []);
      setFaculty(facRes.data.results ?? []);
    } catch {
      toast.error("Failed to load academic data");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll({ showLoading: true });
  }, []);

  // ── Semesters ──
  function openSemCreate() {
    setSemEditId(null);
    setSemForm({
      name: "",
      academic_year: "",
      start_date: "",
      end_date: "",
      is_current: false,
    });
    setSemSheet(true);
  }
  function openSemEdit(s: Semester) {
    setSemEditId(s.id);
    const sd = new Date(s.start_date).toISOString().split("T")[0];
    const ed = new Date(s.end_date).toISOString().split("T")[0];
    setSemForm({
      name: s.name,
      academic_year: s.academic_year,
      start_date: sd,
      end_date: ed,
      is_current: s.is_current,
    });
    setSemSheet(true);
  }
  async function handleSemSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSemSaving(true);
    try {
      if (semEditId) {
        await semestersService.update(semEditId, semForm);
        toast.success("Semester updated");
      } else {
        await semestersService.create(semForm);
        toast.success("Semester created");
      }
      setSemSheet(false);
      fetchAll();
    } catch {
      toast.error("Failed to save semester");
    } finally {
      setSemSaving(false);
    }
  }
  async function handleSemDelete(id: string) {
    const prev = [...semesters];
    setSemesters((s) => s.filter((x) => x.id !== id));
    try {
      await semestersService.delete(id);
      toast.success("Deleted");
    } catch {
      setSemesters(prev);
      toast.error("Failed to delete");
    }
  }

  // ── Courses ──
  function openCourseCreate() {
    setCourseEditId(null);
    setCourseForm({ name: "", code: "", credits: 3, description: "" });
    setCourseSheet(true);
  }
  function openCourseEdit(c: Course) {
    setCourseEditId(c.id);
    setCourseForm({
      name: c.name,
      code: c.code,
      credits: c.credits,
      description: c.description || "",
    });
    setCourseSheet(true);
  }
  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCourseSaving(true);
    try {
      if (courseEditId) {
        await coursesService.update(courseEditId, courseForm as Course);
        toast.success("Course updated");
      } else {
        await coursesService.create(courseForm as Omit<Course, "id">);
        toast.success("Course created");
      }
      setCourseSheet(false);
      fetchAll();
    } catch {
      toast.error("Failed to save course");
    } finally {
      setCourseSaving(false);
    }
  }
  async function handleCourseDelete(id: string) {
    const prev = [...courses];
    setCourses((c) => c.filter((x) => x.id !== id));
    try {
      await coursesService.delete(id);
      toast.success("Deleted");
    } catch {
      setCourses(prev);
      toast.error("Failed to delete");
    }
  }

  // ── Offerings ──
  function openOfferingCreate() {
    setOfferingEditId(null);
    setOfferingForm({
      course: "",
      semester: "",
      faculty: "",
      section: "",
      max_students: 30,
    });
    setOfferingSheet(true);
  }
  function openOfferingEdit(o: CourseOffering) {
    setOfferingEditId(o.id);
    setOfferingForm({
      course: o.course,
      semester: o.semester,
      faculty: o.faculty,
      section: o.section,
      max_students: o.max_students,
    });
    setOfferingSheet(true);
  }
  async function handleOfferingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOfferingSaving(true);
    try {
      if (offeringEditId) {
        await offeringsService.update(
          offeringEditId,
          offeringForm as CourseOffering,
        );
        toast.success("Offering updated");
      } else {
        await offeringsService.create(
          offeringForm as Omit<CourseOffering, "id">,
        );
        toast.success("Offering created");
      }
      setOfferingSheet(false);
      fetchAll();
    } catch {
      toast.error("Failed to save offering");
    } finally {
      setOfferingSaving(false);
    }
  }
  async function handleOfferingDelete(id: string) {
    const prev = [...offerings];
    setOfferings((o) => o.filter((x) => x.id !== id));
    try {
      await offeringsService.delete(id);
      toast.success("Deleted");
    } catch {
      setOfferings(prev);
      toast.error("Failed to delete");
    }
  }

  async function handleEnrollmentsBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollmentsUploadFile) return;
    setEnrollmentsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", enrollmentsUploadFile);
      await enrollmentsService.bulkCreate(formData);
      toast.success("Enrollments imported successfully");
      setEnrollmentsUploadOpen(false);
      setEnrollmentsUploadFile(null);
      fetchAll();
    } catch {
      toast.error("Failed to upload enrollments");
    } finally {
      setEnrollmentsUploading(false);
    }
  }

  async function handleExportEnrollments() {
    try {
      const { data } = await enrollmentsService.export();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `enrollments_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export enrollments");
    }
  }

  // Client-side search
  const q = search.toLowerCase();
  const filteredSemesters = semesters.filter(
    (s) =>
      !q || s.name.toLowerCase().includes(q) || s.academic_year.includes(q),
  );
  const filteredCourses = courses.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.department_name ?? "").toLowerCase().includes(q),
  );
  const filteredOfferings = offerings.filter(
    (o) =>
      !q ||
      o.course_name.toLowerCase().includes(q) ||
      o.course_code.toLowerCase().includes(q) ||
      o.faculty_name.toLowerCase().includes(q),
  );

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton
          className="h-64 w-full"
          style={{ borderRadius: "var(--radius-lg)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="semesters">
        <TabsList>
          <TabsTrigger value="semesters">
            <Calendar className="h-4 w-4 mr-1" /> Semesters
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-1" /> Courses
          </TabsTrigger>
          <TabsTrigger value="offerings">
            <GraduationCap className="h-4 w-4 mr-1" /> Offerings
          </TabsTrigger>
        </TabsList>

        {/* ── Semesters ─── */}
        <TabsContent value="semesters" className="space-y-4">
          <ContextMenu
            onOpenChange={(open) => {
              if (!open) setSemCtx(null);
            }}
          >
            <ContextMenuTrigger asChild>
              <div className="w-full">
                <TableCard.Root>
                  <div className="flex items-center gap-2 border-b border-secondary px-4 py-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Filter semesters..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-8 text-sm border-none shadow-none bg-transparent focus-visible:ring-0"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      onClick={openSemCreate}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Semester
                    </Button>
                  </div>

                  <Table aria-label="Semesters">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head isRowHeader>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Name
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Academic Year
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Start
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            End
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Status
                          </span>
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredSemesters.length === 0 ? (
                        <Table.Row id="empty-sem">
                          <Table.Cell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No semesters found.</p>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        filteredSemesters.map((s) => (
                          <Table.Row
                            key={s.id}
                            id={s.id}
                            onContextMenu={() => setSemCtx(s)}
                          >
                            <Table.Cell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-medium">{s.name}</span>
                              </div>
                            </Table.Cell>
                            <Table.Cell>{s.academic_year}</Table.Cell>
                            <Table.Cell className="text-muted-foreground">
                              {new Date(s.start_date).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell className="text-muted-foreground">
                              {new Date(s.end_date).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                variant={s.is_current ? "default" : "secondary"}
                              >
                                {s.is_current ? "Current" : "Past"}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>

                  <div className="border-t border-secondary px-4 py-2 text-xs text-muted-foreground">
                    {filteredSemesters.length} semester
                    {filteredSemesters.length !== 1 ? "s" : ""}
                  </div>
                </TableCard.Root>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {semCtx ? (
                <>
                  <ContextMenuItem onClick={() => openSemEdit(semCtx)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Semester
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleSemDelete(semCtx.id)}
                    className="text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </ContextMenuItem>
                </>
              ) : (
                <ContextMenuItem onClick={openSemCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Semester
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </TabsContent>

        {/* ── Courses ──── */}
        <TabsContent value="courses" className="space-y-4">
          <ContextMenu
            onOpenChange={(open) => {
              if (!open) setCourseCtx(null);
            }}
          >
            <ContextMenuTrigger asChild>
              <div className="w-full">
                <TableCard.Root>
                  <div className="flex items-center gap-2 border-b border-secondary px-4 py-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Filter courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-8 text-sm border-none shadow-none bg-transparent focus-visible:ring-0"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      onClick={openCourseCreate}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Course
                    </Button>
                  </div>

                  <Table aria-label="Courses">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head isRowHeader>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Code
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Name
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Department
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Credits
                          </span>
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredCourses.length === 0 ? (
                        <Table.Row id="empty-course">
                          <Table.Cell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No courses found.</p>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        filteredCourses.map((c) => (
                          <Table.Row
                            key={c.id}
                            id={c.id}
                            onContextMenu={() => setCourseCtx(c)}
                          >
                            <Table.Cell>
                              <Badge variant="secondary">{c.code}</Badge>
                            </Table.Cell>
                            <Table.Cell className="font-medium">
                              {c.name}
                            </Table.Cell>
                            <Table.Cell className="text-muted-foreground">
                              {c.department_name}
                            </Table.Cell>
                            <Table.Cell>{c.credits}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>

                  <div className="border-t border-secondary px-4 py-2 text-xs text-muted-foreground">
                    {filteredCourses.length} course
                    {filteredCourses.length !== 1 ? "s" : ""}
                  </div>
                </TableCard.Root>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {courseCtx ? (
                <>
                  <ContextMenuItem onClick={() => openCourseEdit(courseCtx)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Course
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleCourseDelete(courseCtx.id)}
                    className="text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </ContextMenuItem>
                </>
              ) : (
                <ContextMenuItem onClick={openCourseCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </TabsContent>

        {/* ── Offerings ──── */}
        <TabsContent value="offerings" className="space-y-4">
          <ContextMenu
            onOpenChange={(open) => {
              if (!open) setOfferingCtx(null);
            }}
          >
            <ContextMenuTrigger asChild>
              <div className="w-full">
                <TableCard.Root>
                  <div className="flex items-center gap-2 border-b border-secondary px-4 py-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Filter offerings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-8 text-sm border-none shadow-none bg-transparent focus-visible:ring-0"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      variant="outline"
                      onClick={handleExportEnrollments}
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      variant="outline"
                      onClick={() => {
                        setEnrollmentsUploadFile(null);
                        setEnrollmentsUploadOpen(true);
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" /> Bulk Enroll
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      onClick={openOfferingCreate}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Offering
                    </Button>
                  </div>

                  <Table aria-label="Offerings">
                    <Table.Header>
                      <Table.Row>
                        <Table.Head isRowHeader>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Course
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Semester
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Faculty
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Section
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Enrolled
                          </span>
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredOfferings.length === 0 ? (
                        <Table.Row id="empty-off">
                          <Table.Cell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p>No offerings found.</p>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        filteredOfferings.map((o) => (
                          <Table.Row
                            key={o.id}
                            id={o.id}
                            onContextMenu={() => setOfferingCtx(o)}
                          >
                            <Table.Cell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {o.course_name}
                                </span>
                                <Badge variant="secondary" className="ml-1">
                                  {o.course_code}
                                </Badge>
                              </div>
                            </Table.Cell>
                            <Table.Cell>{o.semester_name}</Table.Cell>
                            <Table.Cell className="text-muted-foreground">
                              {o.faculty_name}
                            </Table.Cell>
                            <Table.Cell>{o.section}</Table.Cell>
                            <Table.Cell>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {o.enrolled_count}/{o.max_students}
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>

                  <div className="border-t border-secondary px-4 py-2 text-xs text-muted-foreground">
                    {filteredOfferings.length} offering
                    {filteredOfferings.length !== 1 ? "s" : ""}
                  </div>
                </TableCard.Root>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {offeringCtx ? (
                <>
                  <ContextMenuItem
                    onClick={() => openOfferingEdit(offeringCtx)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Offering
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleOfferingDelete(offeringCtx.id)}
                    className="text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </ContextMenuItem>
                </>
              ) : (
                <ContextMenuItem onClick={openOfferingCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Offering
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </TabsContent>
      </Tabs>

      {/* Semester Sheet */}
      <Sheet open={semSheet} onOpenChange={setSemSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{semEditId ? "Edit" : "Create"} Semester</SheetTitle>
            <SheetDescription>
              {semEditId
                ? "Update semester details."
                : "Add a new academic semester."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSemSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={semForm.name}
                onChange={(e) =>
                  setSemForm({ ...semForm, name: e.target.value })
                }
                placeholder="e.g. Fall 2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                value={semForm.academic_year}
                onChange={(e) =>
                  setSemForm({ ...semForm, academic_year: e.target.value })
                }
                placeholder="e.g. 2025-2026"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={
                    semForm.start_date ? new Date(semForm.start_date) : null
                  }
                  setDate={(d) =>
                    setSemForm({
                      ...semForm,
                      start_date: d ? format(d, "yyyy-MM-dd") : "",
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={semForm.end_date ? new Date(semForm.end_date) : null}
                  setDate={(d) =>
                    setSemForm({
                      ...semForm,
                      end_date: d ? format(d, "yyyy-MM-dd") : "",
                    })
                  }
                />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={semSaving}>
                {semSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                {semEditId ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Course Sheet */}
      <Sheet open={courseSheet} onOpenChange={setCourseSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{courseEditId ? "Edit" : "Create"} Course</SheetTitle>
            <SheetDescription>
              {courseEditId ? "Update course details." : "Add a new course."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCourseSubmit} className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, credits: +e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
              />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={courseSaving}>
                {courseSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                {courseEditId ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Offering Sheet */}
      <Sheet open={offeringSheet} onOpenChange={setOfferingSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {offeringEditId ? "Edit" : "Create"} Offering
            </SheetTitle>
            <SheetDescription>
              {offeringEditId
                ? "Update offering details."
                : "Add a new course offering."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleOfferingSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={offeringForm.course}
                onValueChange={(v) =>
                  setOfferingForm({ ...offeringForm, course: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={offeringForm.semester}
                onValueChange={(v) =>
                  setOfferingForm({ ...offeringForm, semester: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Faculty</Label>
              <Select
                value={offeringForm.faculty}
                onValueChange={(v) =>
                  setOfferingForm({ ...offeringForm, faculty: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.first_name} {f.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Section</Label>
                <Input
                  value={offeringForm.section}
                  onChange={(e) =>
                    setOfferingForm({
                      ...offeringForm,
                      section: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={offeringForm.max_students}
                  onChange={(e) =>
                    setOfferingForm({
                      ...offeringForm,
                      max_students: +e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={offeringSaving}>
                {offeringSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                {offeringEditId ? "Update" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={enrollmentsUploadOpen}
        onOpenChange={setEnrollmentsUploadOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Enroll Students</DialogTitle>
            <DialogDescription>
              Upload a JSON or CSV file containing enrollment details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrollmentsBulkUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>File Upload</Label>
              <Input
                type="file"
                accept=".json,.csv"
                onChange={(e) =>
                  setEnrollmentsUploadFile(e.target.files?.[0] || null)
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEnrollmentsUploadOpen(false)}
                disabled={enrollmentsUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!enrollmentsUploadFile || enrollmentsUploading}
              >
                {enrollmentsUploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
