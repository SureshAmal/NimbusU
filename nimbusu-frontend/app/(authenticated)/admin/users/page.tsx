"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  usersService,
  schoolsService,
  departmentsService,
  programsService,
} from "@/services/api";
import type { User, School, Department, Program } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableCard } from "@/components/application/table/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  KeyRound,
  Loader2,
  Shield,
  GraduationCap,
  BookOpen,
  ToggleRight,
  ChevronDown,
  X,
  Pencil,
  Trash2,
  MoreHorizontal,
  Filter,
  Eye,
  EyeOff,
  Upload,
  Download,
} from "lucide-react";
import { format } from "date-fns";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="h-3 w-3" />,
  dean: <BookOpen className="h-3 w-3" />,
  head: <BookOpen className="h-3 w-3" />,
  faculty: <BookOpen className="h-3 w-3" />,
  student: <GraduationCap className="h-3 w-3" />,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-600 dark:text-red-400",
  dean: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  head: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  faculty: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  student: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const DEBOUNCE_MS = 400;

type BulkUploadUser = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
  phone?: string;
  student_profile?: Record<string, unknown>;
  faculty_profile?: Record<string, unknown>;
};

const BULK_IMPORT_TEMPLATE = [
  {
    email: "student1@example.com",
    password: "Password123",
    first_name: "Asha",
    last_name: "Patel",
    role: "student",
    department: "department-id-or-name",
    phone: "9876543210",
    student_id_number: "ENR-2026-001",
    register_no: "REG-2026-001",
    program: "program-id-or-name",
    current_semester: "1",
    admission_date: "2026-06-01",
    batch_year: "2026",
    batch: "A",
    division: "1",
  },
  {
    email: "faculty1@example.com",
    password: "Password123",
    first_name: "Ravi",
    last_name: "Sharma",
    role: "faculty",
    department: "department-id-or-name",
    phone: "9988776655",
    employee_id: "EMP-102",
    designation: "Assistant Professor",
    specialization: "Data Science",
    joining_date: "2024-07-01",
  },
];

function normalizeCsvHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseCsvRow(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsvRecords(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [] as Record<string, string>[];

  const headers = parseCsvRow(lines[0]).map(normalizeCsvHeader);
  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
}

function escapeCsvValue(value: unknown) {
  const normalized = value == null ? "" : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resolveEntityId<T extends { id: string }>(
  rawValue: string | undefined,
  items: T[],
  extractors: Array<(item: T) => string | undefined>,
) {
  if (!rawValue) return undefined;
  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) return undefined;

  const exact = items.find((item) => item.id === rawValue.trim());
  if (exact) return exact.id;

  const match = items.find((item) =>
    extractors.some((extractor) => extractor(item)?.trim().toLowerCase() === normalized),
  );
  return match?.id;
}

function exportableUsers(users: User[]) {
  return users.map((user) => ({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? "",
    school: user.school_name ?? "",
    department: user.department_name ?? "",
    status: user.is_active ? "active" : "inactive",
    student_id_number: user.student_profile?.student_id_number ?? "",
    roll_no: user.student_profile?.roll_no ?? "",
    register_no: user.student_profile?.register_no ?? "",
    program: user.program_name ?? "",
    current_semester: user.student_profile?.current_semester ?? "",
    admission_date: user.student_profile?.admission_date ?? "",
    batch_year: user.student_profile?.batch_year ?? "",
    batch: user.student_profile?.batch ?? "",
    division: user.student_profile?.division ?? "",
    employee_id: user.faculty_profile?.employee_id ?? "",
    designation: user.faculty_profile?.designation ?? "",
    specialization: user.faculty_profile?.specialization ?? "",
    joining_date: user.faculty_profile?.joining_date ?? "",
  }));
}

function resolveProfileImageUrl(profilePicture: string | null) {
  if (!profilePicture) return undefined;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("/api/v1", "")}${profilePicture}`;
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "PPP");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Reset password dialog
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [resetPwUserId, setResetPwUserId] = useState<string | null>(null);
  const [resetPwUserName, setResetPwUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);

  // Bulk Upload logic
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Lookup data for filters and form dropdowns
  const [schools, setSchools] = useState<School[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "student",
    password: "",
    phone: "",
    department: "" as string,
    _school: "" as string, // UI-only (not sent to API)
    student_profile: {
      student_id_number: "",
      register_no: "",
      current_semester: 1,
      batch: "",
      division: "",
      batch_year: new Date().getFullYear(),
      admission_date: new Date().toISOString().split("T")[0],
      program: "" as string,
    },
    faculty_profile: {
      employee_id: "",
      designation: "",
      specialization: "",
      joining_date: new Date().toISOString().split("T")[0],
    },
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const profileCacheRef = useRef<Map<string, User>>(new Map());

  // Load lookup data on mount
  useEffect(() => {
    schoolsService
      .list()
      .then((r) => setSchools(r.data.results ?? r.data ?? []))
      .catch(() => { });
    departmentsService
      .list()
      .then((r) => setAllDepartments(r.data.results ?? r.data ?? []))
      .catch(() => { });
    programsService
      .list()
      .then((r) => setAllPrograms(r.data.results ?? r.data ?? []))
      .catch(() => { });
  }, []);

  // Departments filtered by selected school (for filter toolbar)
  const filteredFilterDepartments = useMemo(() => {
    if (schoolFilter === "all") return allDepartments;
    return allDepartments.filter((d) => d.school === schoolFilter);
  }, [allDepartments, schoolFilter]);

  // Departments filtered by school selected in form
  const formDepartments = useMemo(() => {
    if (!form._school) return allDepartments;
    return allDepartments.filter((d) => d.school === form._school);
  }, [allDepartments, form._school]);

  // Programs filtered by department selected in form
  const formPrograms = useMemo(() => {
    if (!form.department) return allPrograms;
    return allPrograms.filter((p) => p.department === form.department);
  }, [allPrograms, form.department]);

  // Cross-reference: which user is dean of which school / head of which dept
  const deanOfSchoolMap = useMemo(() => {
    const m = new Map<string, string>();
    schools.forEach((s) => {
      if (s.dean) m.set(s.dean, s.name);
    });
    return m;
  }, [schools]);
  const headOfDeptMap = useMemo(() => {
    const m = new Map<string, string>();
    allDepartments.forEach((d) => {
      if (d.head) m.set(d.head, d.name);
    });
    return m;
  }, [allDepartments]);

  // Core fetch — silent by default (no skeleton after initial load)
  const fetchUsers = useCallback(
    async (opts?: { showLoading?: boolean; searchOverride?: string }) => {
      if (opts?.showLoading) setInitialLoading(true);

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params: Record<string, string> = {};
        params.page_size = "1000";
        const q = opts?.searchOverride ?? search;
        if (q) params.search = q;
        if (roleFilter !== "all") params.role = roleFilter;
        if (schoolFilter !== "all") params.department__school = schoolFilter;
        if (departmentFilter !== "all") params.department = departmentFilter;
        if (semesterFilter !== "all")
          params.student_profile__current_semester = semesterFilter;
        const { data } = await usersService.list(params);
        if (!controller.signal.aborted) {
          setUsers(data.results ?? []);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast.error("Failed to load users");
      } finally {
        if (!controller.signal.aborted) setInitialLoading(false);
      }
    },
    [search, roleFilter, schoolFilter, departmentFilter, semesterFilter],
  );

  // Initial load and filter resets
  useEffect(() => {
    setCurrentPage(1);
    fetchUsers({ showLoading: true });
  }, [
    roleFilter,
    statusFilter,
    schoolFilter,
    departmentFilter,
    semesterFilter,
  ]);

  // Reset department filter when school filter changes
  useEffect(() => {
    if (schoolFilter !== "all" && departmentFilter !== "all") {
      const valid = allDepartments.find(
        (d) => d.id === departmentFilter && d.school === schoolFilter,
      );
      if (!valid) setDepartmentFilter("all");
    }
  }, [schoolFilter, allDepartments, departmentFilter]);

  // Debounced search — calls backend API and resets page
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setCurrentPage(1);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchUsers({ searchOverride: value });
      }, DEBOUNCE_MS);
    },
    [fetchUsers],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (statusFilter === "active") result = result.filter((u) => u.is_active);
    if (statusFilter === "inactive")
      result = result.filter((u) => !u.is_active);
    return result;
  }, [users, statusFilter]);

  useEffect(() => {
    setSelectedUserIds((prev) => {
      const validIds = new Set(filteredUsers.map((user) => user.id));
      return new Set([...prev].filter((id) => validIds.has(id)));
    });
  }, [filteredUsers]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const selectedUsers = useMemo(
    () => filteredUsers.filter((user) => selectedUserIds.has(user.id)),
    [filteredUsers, selectedUserIds],
  );

  const allVisibleSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedUserIds.has(user.id));
  const someVisibleSelected =
    paginatedUsers.some((user) => selectedUserIds.has(user.id)) && !allVisibleSelected;

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const emptyForm = () => ({
    email: "",
    first_name: "",
    last_name: "",
    role: "student",
    password: "",
    phone: "",
    department: "" as string,
    _school: "" as string,
    student_profile: {
      student_id_number: "",
      register_no: "",
      current_semester: 1,
      batch: "",
      division: "",
      batch_year: new Date().getFullYear(),
      admission_date: new Date().toISOString().split("T")[0],
      program: "" as string,
    },
    faculty_profile: {
      employee_id: "",
      designation: "",
      specialization: "",
      joining_date: new Date().toISOString().split("T")[0],
    },
  });

  function openCreate() {
    setContextMenuUser(null);
    setEditId(null);
    setForm(emptyForm());
    setSheetOpen(true);
  }

  function openEdit(u: User) {
    setContextMenuUser(null);
    // Determine school from department
    const dept = allDepartments.find((d) => d.id === u.department);
    setEditId(u.id);
    setForm({
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      password: "",
      phone: u.phone || "",
      department: u.department || "",
      _school: dept?.school || "",
      student_profile: u.student_profile
        ? {
          student_id_number: u.student_profile.student_id_number || "",
          register_no: u.student_profile.register_no || "",
          current_semester: u.student_profile.current_semester || 1,
          batch: u.student_profile.batch || "",
          division: u.student_profile.division || "",
          batch_year:
            u.student_profile.batch_year || new Date().getFullYear(),
          admission_date:
            u.student_profile.admission_date ||
            new Date().toISOString().split("T")[0],
          program: u.student_profile.program || "",
        }
        : {
          student_id_number: "",
          register_no: "",
          current_semester: 1,
          batch: "",
          division: "",
          batch_year: new Date().getFullYear(),
          admission_date: new Date().toISOString().split("T")[0],
          program: "",
        },
      faculty_profile: u.faculty_profile
        ? {
          employee_id: u.faculty_profile.employee_id || "",
          designation: u.faculty_profile.designation || "",
          specialization: u.faculty_profile.specialization || "",
          joining_date:
            u.faculty_profile.joining_date ||
            new Date().toISOString().split("T")[0],
        }
        : {
          employee_id: "",
          designation: "",
          specialization: "",
          joining_date: new Date().toISOString().split("T")[0],
        },
    });
    setSheetOpen(true);
  }

  async function openProfile(user: User) {
    setContextMenuUser(null);
    const cachedUser = profileCacheRef.current.get(user.id);

    if (cachedUser) {
      setProfileUser(cachedUser);
      setProfileLoading(false);
      setProfileOpen(true);
      return;
    }

    setProfileUser(null);
    setProfileOpen(true);
    setProfileLoading(true);

    try {
      const { data } = await usersService.get(user.id);
      profileCacheRef.current.set(user.id, data);
      setProfileUser(data);
    } catch {
      toast.error("Failed to load user profile details");
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _school, ...submitData } = form;

      // Strip out irrelevant profiles based on selected role
      if (submitData.role !== "student") {
        delete (submitData as { student_profile?: unknown }).student_profile;
      }
      if (!["faculty", "dean", "head"].includes(submitData.role)) {
        delete (submitData as { faculty_profile?: unknown }).faculty_profile;
      }

      if (editId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = submitData;
        await usersService.update(
          editId,
          rest as unknown as Parameters<typeof usersService.update>[1],
        );
        toast.success("User updated successfully");
        profileCacheRef.current.delete(editId);
      } else {
        await usersService.create(
          submitData as unknown as Parameters<typeof usersService.create>[0],
        );
        toast.success("User created successfully");
      }
      setSheetOpen(false);
      setEditId(null);
      setForm(emptyForm());
      fetchUsers();
    } catch {
      toast.error(editId ? "Failed to update user" : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  function openResetPassword(user: User) {
    setContextMenuUser(null);
    setResetPwUserId(user.id);
    setResetPwUserName(`${user.first_name} ${user.last_name}`);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPw(false);
    setResetPwOpen(true);
  }

  async function handleDeleteUser(user: User) {
    setContextMenuUser(null);
    setDeleteUser(user);
  }

  async function confirmDeleteUser() {
    if (!deleteUser) return;
    setDeletingUser(true);

    try {
      await usersService.delete(deleteUser.id);
      profileCacheRef.current.delete(deleteUser.id);
      toast.success("User deleted successfully");
      setDeleteUser(null);
      fetchUsers({ showLoading: true });
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUser(false);
    }
  }

  async function handleResetPassword() {
    if (!resetPwUserId) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setResettingPw(true);
    try {
      await usersService.resetPassword(resetPwUserId, newPassword);
      toast.success("Password reset successfully");
      setResetPwOpen(false);
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResettingPw(false);
    }
  }

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkUploadFile) return;
    setBulkUploading(true);
    try {
      const extension = bulkUploadFile.name.split(".").pop()?.toLowerCase();
      const content = await bulkUploadFile.text();

      let rows: Record<string, string>[] = [];
      if (extension === "json") {
        const parsed = JSON.parse(content);
        const inputRows = Array.isArray(parsed) ? parsed : parsed?.users;
        if (!Array.isArray(inputRows)) {
          throw new Error("JSON must be an array or an object with a users array.");
        }
        rows = inputRows.map((row) =>
          Object.fromEntries(
            Object.entries(row as Record<string, unknown>).map(([key, value]) => [
              normalizeCsvHeader(key),
              value == null ? "" : String(value),
            ]),
          ),
        );
      } else {
        rows = parseCsvRecords(content);
      }

      if (rows.length === 0) {
        throw new Error("No valid rows were found in the selected file.");
      }

      const payloadUsers = rows.map<BulkUploadUser>((row, index) => {
        const role = (row.role || "student").trim().toLowerCase();
        const departmentId = resolveEntityId(
          row.department,
          allDepartments,
          [(department) => department.name],
        );
        const programId = resolveEntityId(
          row.program,
          allPrograms,
          [(program) => program.name, (program) => program.code],
        );

        if (!row.email || !row.password || !row.first_name || !row.last_name) {
          throw new Error(`Row ${index + 2} is missing one of: email, password, first_name, last_name.`);
        }

        const base: BulkUploadUser = {
          email: row.email,
          password: row.password,
          first_name: row.first_name,
          last_name: row.last_name,
          role,
        };

        if (departmentId) base.department = departmentId;
        if (row.phone) base.phone = row.phone;

        if (role === "student") {
          base.student_profile = {
            student_id_number: row.student_id_number || "",
            roll_no: row.roll_no || "",
            register_no: row.register_no || "",
            program: programId || row.program || "",
            current_semester: row.current_semester ? Number(row.current_semester) : 1,
            admission_date: row.admission_date || "",
            batch_year: row.batch_year ? Number(row.batch_year) : undefined,
            batch: row.batch || "",
            division: row.division || "",
          };
        }

        if (["faculty", "dean", "head"].includes(role)) {
          base.faculty_profile = {
            employee_id: row.employee_id || "",
            designation: row.designation || "",
            specialization: row.specialization || "",
            joining_date: row.joining_date || "",
            consultation_hours: row.consultation_hours || "",
          };
        }

        return base;
      });

      await usersService.bulkCreate({ users: payloadUsers });
      toast.success(`${payloadUsers.length} user${payloadUsers.length === 1 ? "" : "s"} imported successfully`);
      setBulkUploadOpen(false);
      setBulkUploadFile(null);
      fetchUsers({ showLoading: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload users";
      toast.error(message);
    } finally {
      setBulkUploading(false);
    }
  }

  function handleToggleUserSelection(userId: string, checked: boolean) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });
  }

  function handleToggleVisibleUsers(checked: boolean) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      paginatedUsers.forEach((user) => {
        if (checked) next.add(user.id);
        else next.delete(user.id);
      });
      return next;
    });
  }

  async function handleExportUsers(scope: "selected" | "filtered" | "template") {
    setExportingUsers(true);
    try {
      if (scope === "template") {
        downloadCsv("users-import-template.csv", BULK_IMPORT_TEMPLATE);
        toast.success("Import template downloaded");
        return;
      }

      const rows = scope === "selected" ? exportableUsers(selectedUsers) : exportableUsers(filteredUsers);
      if (rows.length === 0) {
        toast.error(scope === "selected" ? "Select at least one user to export" : "No users available to export");
        return;
      }

      downloadCsv(
        `users-${scope}-${new Date().toISOString().slice(0, 10)}.csv`,
        rows,
      );
      toast.success(`${rows.length} user${rows.length === 1 ? "" : "s"} exported successfully`);
    } finally {
      setExportingUsers(false);
    }
  }

  async function handleToggleActive(user: User) {
    // Optimistic update — flip locally first
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u,
      ),
    );

    try {
      if (user.is_active) {
        await usersService.delete(user.id);
        profileCacheRef.current.delete(user.id);
        toast.success("User deactivated");
      } else {
        await usersService.update(user.id, {
          is_active: true,
        } as unknown as Parameters<typeof usersService.update>[1]);
        profileCacheRef.current.delete(user.id);
        toast.success("User activated");
      }
    } catch {
      // Rollback on error
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: user.is_active } : u,
        ),
      );
      toast.error("Failed to toggle user status");
    }
  }

  function clearAllFilters() {
    setRoleFilter("all");
    setStatusFilter("all");
    setSchoolFilter("all");
    setDepartmentFilter("all");
    setSemesterFilter("all");
  }

  const activeFilters =
    (roleFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (schoolFilter !== "all" ? 1 : 0) +
    (departmentFilter !== "all" ? 1 : 0) +
    (semesterFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-0">
      <ContextMenu
        onOpenChange={(open) => {
          if (!open) setTimeout(() => setContextMenuUser(null), 200);
        }}
      >
        <ContextMenuTrigger asChild>
          <div className="w-full">
            <TableCard.Root>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary px-4 py-3">
                <Tabs
                  value={roleFilter}
                  onValueChange={setRoleFilter}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="h-9 w-full sm:w-auto flex overflow-x-auto bg-muted/50 no-scrollbar">
                    <TabsTrigger value="all" className="text-xs shrink-0">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="student" className="text-xs shrink-0">
                      Students
                    </TabsTrigger>
                    <TabsTrigger value="faculty" className="text-xs shrink-0">
                      Faculty
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="text-xs shrink-0">
                      Admins
                    </TabsTrigger>
                    <TabsTrigger value="dean" className="text-xs shrink-0">
                      Dean
                    </TabsTrigger>
                    <TabsTrigger value="head" className="text-xs shrink-0">
                      Head
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Filter users..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 h-9 text-sm border-none shadow-none bg-transparent focus-visible:ring-0"
                    />
                  </div>
                  {activeFilters > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs gap-1"
                      onClick={clearAllFilters}
                    >
                      <X className="h-3 w-3" /><span className="hidden sm:inline">Clear</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-9 gap-1 shrink-0"
                    variant="outline"
                    onClick={() => { setBulkUploadFile(null); setBulkUploadOpen(true); }}
                  >
                    <Upload className="h-3.5 w-3.5" /><span className="hidden sm:inline">Bulk Upload</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-1 shrink-0"
                    variant="outline"
                    onClick={() => handleExportUsers(selectedUsers.length > 0 ? "selected" : "filtered")}
                    disabled={exportingUsers || filteredUsers.length === 0}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {selectedUsers.length > 0 ? `Export Selected (${selectedUsers.length})` : "Export CSV"}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-1 shrink-0"
                    onClick={openCreate}
                  >
                    <UserPlus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Add User</span>
                  </Button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-secondary px-3 sm:px-4 py-2 bg-muted/30">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger className="h-8 w-full sm:w-40 text-xs">
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="h-8 w-[calc(50%-1rem)] sm:w-44 text-xs">
                    <SelectValue placeholder="All Depts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {filteredFilterDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {roleFilter === "student" && (
                  <Select
                    value={semesterFilter}
                    onValueChange={setSemesterFilter}
                  >
                    <SelectTrigger className="h-8 w-[calc(50%-1rem)] sm:w-36 text-xs">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                        <SelectItem key={s} value={s.toString()}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {activeFilters > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {activeFilters} filter{activeFilters !== 1 ? "s" : ""}{" "}
                    applied
                  </span>
                )}
              </div>

              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 18rem)" }}
              >
                {initialLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table aria-label="Users">
                    <Table.Header className="sticky top-0 z-10 bg-secondary/95 backdrop-blur shadow-sm">
                      <Table.Row>
                        <Table.Head className="w-12">
                          <Checkbox
                            checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                            onCheckedChange={(checked) => handleToggleVisibleUsers(checked === true)}
                            aria-label="Select all visible users"
                          />
                        </Table.Head>
                        <Table.Head isRowHeader>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Name
                          </span>
                        </Table.Head>
                        {roleFilter === "student" && (
                          <>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Enrollment No.
                              </span>
                            </Table.Head>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Register No.
                              </span>
                            </Table.Head>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Semester
                              </span>
                            </Table.Head>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Batch / Div
                              </span>
                            </Table.Head>
                          </>
                        )}
                        {roleFilter !== "student" && (
                          <>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Email
                              </span>
                            </Table.Head>
                            <Table.Head>
                              <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                                Phone
                              </span>
                            </Table.Head>
                          </>
                        )}
                        {roleFilter === "student" && (
                          <Table.Head>
                            <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                              Phone
                            </span>
                          </Table.Head>
                        )}
                        {roleFilter === "all" && (
                          <Table.Head>
                            <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                              Role
                            </span>
                          </Table.Head>
                        )}
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            School
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                            Department
                          </span>
                        </Table.Head>
                        <Table.Head>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-quaternary hover:text-foreground transition-colors cursor-pointer">
                                Status
                                {statusFilter !== "all" && (
                                  <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-4 w-4">
                                    {1}
                                  </span>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32">
                              <DropdownMenuItem
                                onClick={() => setStatusFilter("all")}
                                className={
                                  statusFilter === "all" ? "font-semibold" : ""
                                }
                              >
                                All
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setStatusFilter("active")}
                                className={
                                  statusFilter === "active"
                                    ? "font-semibold"
                                    : ""
                                }
                              >
                                Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setStatusFilter("inactive")}
                                className={
                                  statusFilter === "inactive"
                                    ? "font-semibold"
                                    : ""
                                }
                              >
                                Inactive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Table.Head>
                        <Table.Head>
                          <div className="flex w-full justify-start">
                            <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                              Actions
                            </span>
                          </div>
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {paginatedUsers.length === 0 ? (
                        <Table.Row id="empty">
                          <Table.Cell
                            colSpan={
                              roleFilter === "student"
                                ? 11
                                : roleFilter === "all"
                                  ? 9
                                  : 8
                            }
                            className="text-center py-8 text-muted-foreground"
                          >
                            No users found.
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        paginatedUsers.map((u) => (
                          <Table.Row
                            key={u.id}
                            id={u.id}
                            onContextMenu={() => setContextMenuUser(u)}
                            className={
                              deanOfSchoolMap.has(u.id)
                                ? "border-l-4 border-l-purple-500"
                                : headOfDeptMap.has(u.id)
                                  ? "border-l-4 border-l-teal-500"
                                  : ""
                            }
                          >
                            <Table.Cell>
                              <Checkbox
                                checked={selectedUserIds.has(u.id)}
                                onCheckedChange={(checked) => handleToggleUserSelection(u.id, checked === true)}
                                aria-label={`Select ${u.first_name} ${u.last_name}`}
                                onClick={(event) => event.stopPropagation()}
                              />
                            </Table.Cell>
                            <Table.Cell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 rounded-[calc(var(--radius)-2px)] border border-border">
                                  <AvatarImage
                                    src={resolveProfileImageUrl(u.profile_picture)}
                                    alt={u.first_name}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                    {u.first_name?.[0]}
                                    {u.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => openProfile(u)}
                                    className="text-sm font-medium leading-none flex items-center gap-1.5 hover:text-primary transition-colors"
                                    title={
                                      deanOfSchoolMap.has(u.id)
                                        ? `Dean of ${deanOfSchoolMap.get(u.id)}`
                                        : headOfDeptMap.has(u.id)
                                          ? `Head of ${headOfDeptMap.get(u.id)}`
                                          : "View profile"
                                    }
                                  >
                                    {u.first_name} {u.last_name}
                                  </button>
                                  {roleFilter === "student" && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {u.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Table.Cell>
                            {roleFilter === "student" && (
                              <>
                                <Table.Cell className="text-muted-foreground">
                                  {u.student_profile?.student_id_number || "—"}
                                </Table.Cell>
                                <Table.Cell className="text-muted-foreground">
                                  {u.student_profile?.register_no || "—"}
                                </Table.Cell>
                                <Table.Cell className="text-muted-foreground">
                                  Sem{" "}
                                  {u.student_profile?.current_semester || "—"}
                                </Table.Cell>
                                <Table.Cell className="text-muted-foreground">
                                  {u.student_profile?.batch || "—"} /{" "}
                                  {u.student_profile?.division || "—"}
                                </Table.Cell>
                                <Table.Cell className="text-muted-foreground">
                                  {u.phone || "—"}
                                </Table.Cell>
                              </>
                            )}
                            {roleFilter !== "student" && (
                              <>
                                <Table.Cell className="text-muted-foreground">
                                  {u.email}
                                </Table.Cell>
                                <Table.Cell className="text-muted-foreground">
                                  {u.phone || "—"}
                                </Table.Cell>
                              </>
                            )}
                            {roleFilter === "all" && (
                              <Table.Cell>
                                <Badge
                                  variant="secondary"
                                  className={ROLE_COLORS[u.role] ?? ""}
                                >
                                  {ROLE_ICONS[u.role]} {u.role}
                                </Badge>
                              </Table.Cell>
                            )}
                            <Table.Cell className="text-muted-foreground">
                              {u.school_name ?? "—"}
                            </Table.Cell>
                            <Table.Cell className="text-muted-foreground">
                              {u.department_name ?? "—"}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                variant={u.is_active ? "default" : "secondary"}
                              >
                                {u.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex w-full items-center justify-start gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hidden sm:inline-flex h-8 w-8"
                                  onClick={() => openEdit(u)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit user</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hidden sm:inline-flex h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteUser(u)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete user</span>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openProfile(u)}>
                                      <Eye className="mr-2 h-4 w-4" /> View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEdit(u)}>
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openResetPassword(u)}>
                                      <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(u)}>
                                      <ToggleRight className="mr-2 h-4 w-4" /> {u.is_active ? "Deactivate" : "Activate"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(u)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-secondary px-4 py-3 gap-4 text-xs text-muted-foreground bg-popover/50">
                <div className="flex items-center gap-3">
                  <span>
                    {filteredUsers.length} user
                    {filteredUsers.length !== 1 ? "s" : ""} total
                  </span>
                  {selectedUsers.length > 0 && (
                    <span>
                      • {selectedUsers.length} selected
                    </span>
                  )}
                  {activeFilters > 0 && (
                    <span>
                      • {activeFilters} filter{activeFilters !== 1 ? "s" : ""}{" "}
                      applied
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <span>Rows per page</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-17.5 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1 || totalPages === 0}
                      >
                        <span className="sr-only">Previous page</span>
                        <ChevronDown className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages || totalPages === 0}
                      >
                        <span className="sr-only">Next page</span>
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TableCard.Root>
          </div>
        </ContextMenuTrigger>
        {contextMenuUser && (
          <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={() => contextMenuUser && openEdit(contextMenuUser)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit User
            </ContextMenuItem>
            <ContextMenuItem onClick={() => contextMenuUser && openProfile(contextMenuUser)}>
              <Eye className="mr-2 h-4 w-4" /> View Profile
            </ContextMenuItem>
            <ContextMenuItem onClick={() => contextMenuUser && openResetPassword(contextMenuUser)}>
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => contextMenuUser && handleToggleActive(contextMenuUser)}
            >
              <ToggleRight className="mr-2 h-4 w-4" /> Toggle Active
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent forceMount className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              {editId
                ? "Update user details."
                : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 flex-1 overflow-y-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone No.</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="head">Faculty Head</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editId && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
            )}

            {/* School / Department / Program section */}
            <div className="border-t pt-4">
              <div className="col-span-2 text-sm font-semibold text-muted-foreground">
                School & Department
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Select
                  value={form._school || "none"}
                  onValueChange={(v) => {
                    const val = v === "none" ? "" : v;
                    setForm({
                      ...form,
                      _school: val,
                      department: "", // reset department when school changes
                      student_profile: { ...form.student_profile, program: "" }, // reset program
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                    {schools.length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No schools yet.
                      </div>
                    )}
                    <div className="border-t mt-1 pt-1 px-2 pb-1">
                      <a
                        href="/admin/schools"
                        target="_blank"
                        className="text-xs text-primary hover:underline"
                      >
                        + Add New School
                      </a>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department || "none"}
                  onValueChange={(v) => {
                    const val = v === "none" ? "" : v;
                    setForm({
                      ...form,
                      department: val,
                      student_profile: { ...form.student_profile, program: "" }, // reset program
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {formDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                    {formDepartments.length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No departments for this school.
                      </div>
                    )}
                    <div className="border-t mt-1 pt-1 px-2 pb-1">
                      <a
                        href="/admin/departments"
                        target="_blank"
                        className="text-xs text-primary hover:underline"
                      >
                        + Add New Department
                      </a>
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student Profile Fields */}
            {form.role === "student" && (
              <div className="flex flex-col gap-2 border-t pt-4">
                <div className="col-span-2 text-sm font-semibold text-muted-foreground">
                  Student Profile
                </div>
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select
                    value={form.student_profile.program || "none"}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        student_profile: {
                          ...form.student_profile,
                          program: v === "none" ? "" : v,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {formPrograms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enrollment No.</Label>
                  <Input
                    value={form.student_profile.student_id_number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        student_profile: {
                          ...form.student_profile,
                          student_id_number: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Register No.</Label>
                  <Input
                    value={form.student_profile.register_no}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        student_profile: {
                          ...form.student_profile,
                          register_no: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.student_profile.current_semester}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        student_profile: {
                          ...form.student_profile,
                          current_semester: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch / Division</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Batch"
                      value={form.student_profile.batch}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          student_profile: {
                            ...form.student_profile,
                            batch: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Div"
                      value={form.student_profile.division}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          student_profile: {
                            ...form.student_profile,
                            division: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Faculty Profile Fields (includes dean and head) */}
            {["faculty", "dean", "head"].includes(form.role) && (
              <div className="flex flex-col gap-3 r">
                <div className="col-span-2 text-sm font-semibold text-muted-foreground">
                  Faculty Profile
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input
                    value={form.faculty_profile.employee_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        faculty_profile: {
                          ...form.faculty_profile,
                          employee_id: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input
                    value={form.faculty_profile.designation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        faculty_profile: {
                          ...form.faculty_profile,
                          designation: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    value={form.faculty_profile.specialization}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        faculty_profile: {
                          ...form.faculty_profile,
                          specialization: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <DatePicker
                    date={form.faculty_profile.joining_date ? new Date(form.faculty_profile.joining_date) : null}
                    setDate={(d) =>
                      setForm({
                        ...form,
                        faculty_profile: {
                          ...form.faculty_profile,
                          joining_date: d ? format(d, "yyyy-MM-dd") : "",
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open) setProfileUser(null);
        }}
      >
        <DialogContent forceMount className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Complete profile details for the selected user.
            </DialogDescription>
          </DialogHeader>

          {profileLoading && !profileUser ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : profileUser ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center rounded-xl border bg-muted/20 p-4">
                <Avatar className="h-20 w-20 rounded-xl border border-border">
                  <AvatarImage
                    src={resolveProfileImageUrl(profileUser.profile_picture)}
                    alt={`${profileUser.first_name} ${profileUser.last_name}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {profileUser.first_name?.[0]}
                    {profileUser.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profileUser.first_name} {profileUser.last_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className={ROLE_COLORS[profileUser.role] ?? ""}>
                        {ROLE_ICONS[profileUser.role]} {profileUser.role}
                      </Badge>
                      <Badge variant={profileUser.is_active ? "default" : "secondary"}>
                        {profileUser.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Email:</span> {profileUser.email}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Phone:</span> {profileUser.phone || "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">School:</span> {profileUser.school_name || "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Department:</span> {profileUser.department_name || "—"}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Created:</span> {formatDisplayDate(profileUser.created_at)}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Last login:</span> {formatDisplayDate(profileUser.last_login)}
                    </div>
                  </div>
                </div>
              </div>

              {profileUser.student_profile && (
                <div className="rounded-xl border p-4 space-y-3">
                  <h4 className="font-semibold">Student Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Enrollment No:</span> {profileUser.student_profile.student_id_number || "—"}</div>
                    <div><span className="font-medium">Register No:</span> {profileUser.student_profile.register_no || "—"}</div>
                    <div><span className="font-medium">Roll No:</span> {profileUser.student_profile.roll_no || "—"}</div>
                    <div><span className="font-medium">Program:</span> {profileUser.program_name || "—"}</div>
                    <div><span className="font-medium">Semester:</span> {profileUser.student_profile.current_semester || "—"}</div>
                    <div><span className="font-medium">Admission Date:</span> {formatDisplayDate(profileUser.student_profile.admission_date)}</div>
                    <div><span className="font-medium">Batch Year:</span> {profileUser.student_profile.batch_year || "—"}</div>
                    <div><span className="font-medium">Batch / Division:</span> {profileUser.student_profile.batch || "—"} / {profileUser.student_profile.division || "—"}</div>
                  </div>
                </div>
              )}

              {profileUser.faculty_profile && (
                <div className="rounded-xl border p-4 space-y-3">
                  <h4 className="font-semibold">Faculty Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Employee ID:</span> {profileUser.faculty_profile.employee_id || "—"}</div>
                    <div><span className="font-medium">Designation:</span> {profileUser.faculty_profile.designation || "—"}</div>
                    <div><span className="font-medium">Specialization:</span> {profileUser.faculty_profile.specialization || "—"}</div>
                    <div><span className="font-medium">Joining Date:</span> {formatDisplayDate(profileUser.faculty_profile.joining_date)}</div>
                  </div>
                </div>
              )}

              {profileUser.preferences && (
                <div className="rounded-xl border p-4 space-y-3">
                  <h4 className="font-semibold">Preferences</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Theme:</span> {profileUser.preferences.theme || "—"}</div>
                    <div><span className="font-medium">Language:</span> {profileUser.preferences.language || "—"}</div>
                    <div><span className="font-medium">Timezone:</span> {profileUser.preferences.timezone || "—"}</div>
                    <div><span className="font-medium">Date Format:</span> {profileUser.preferences.date_format || "—"}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">No profile data available.</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open && !deletingUser) setDeleteUser(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteUser
                ? `This will permanently remove ${deleteUser.first_name} ${deleteUser.last_name}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} disabled={deletingUser}>
              {deletingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk import users</DialogTitle>
            <DialogDescription>
              Upload a CSV or JSON file with user records. Use the template to match the supported column names.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bulk-user-file">Import file</Label>
                <Input
                  id="bulk-user-file"
                  type="file"
                  accept=".csv,.json,application/json,text/csv"
                  onChange={(event) => setBulkUploadFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Required columns: email, password, first_name, last_name.</p>
                <p>Optional columns: role, department, phone, student_id_number, register_no, program, current_semester, employee_id, designation, joining_date.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
              <span>Need a sample file?</span>
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => handleExportUsers("template")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download template
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBulkUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkUploading || !bulkUploadFile}>
                {bulkUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import users
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold text-foreground">
                {resetPwUserName}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPw ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={
                resettingPw ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
            >
              {resettingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
