"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { contentService, offeringsService } from "@/services/api";
import type { Content, ContentFolder, CourseOffering } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableCard } from "@/components/application/table/table";
import { TablePaginationFooter, useClientPagination } from "@/components/application/table/table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentDetailSheet } from "@/components/application/content/content-detail-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Video,
  Link2,
  Image,
  File,
  Eye,
  Trash2,
  ExternalLink,
  Pencil,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  link: <Link2 className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  other: <File className="h-4 w-4" />,
};

const DEBOUNCE_MS = 400;

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value >= 10 || idx === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[idx]}`;
}

function getPublishState(content: Content) {
  if (!content.is_published) return { label: "Draft", variant: "secondary" as const };
  if (content.is_expired) return { label: "Expired", variant: "destructive" as const };
  if (content.is_scheduled) return { label: "Scheduled", variant: "outline" as const };
  return { label: "Published", variant: "default" as const };
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function AdminContentPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [folders, setFolders] = useState<ContentFolder[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ctxItem, setCtxItem] = useState<Content | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailContent, setDetailContent] = useState<Content | null>(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    content_type: Content["content_type"];
    visibility: Content["visibility"];
    external_url: string;
    folder: string;
    course_offering: string;
    is_published: boolean;
    publish_at: string;
    expires_at: string;
  }>({
    title: "",
    description: "",
    content_type: "document",
    visibility: "public",
    external_url: "",
    folder: "",
    course_offering: "",
    is_published: false,
    publish_at: "",
    expires_at: "",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchContent = useCallback(
    async (opts?: { showLoading?: boolean; searchOverride?: string }) => {
      if (opts?.showLoading) setInitialLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const params: Record<string, string> = {};
        params.page_size = "1000";
        const q = opts?.searchOverride ?? search;
        if (q) params.search = q;
        if (typeFilter !== "all") params.content_type = typeFilter;
        const { data } = await contentService.list(params);
        if (!controller.signal.aborted) setItems(data.results ?? []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) toast.error("Failed to load content");
      } finally {
        if (!controller.signal.aborted) setInitialLoading(false);
      }
    },
    [search, typeFilter],
  );

  useEffect(() => {
    fetchContent({ showLoading: true });
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      contentService.folders.list({ page_size: "1000" }),
      offeringsService.list({ page_size: "1000" }),
    ])
      .then(([foldersResponse, offeringsResponse]) => {
        if (cancelled) return;
        setFolders(foldersResponse.data.results ?? []);
        setOfferings(offeringsResponse.data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load content edit options");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchContent();
  }, [typeFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchContent({ searchOverride: val }),
      DEBOUNCE_MS,
    );
  };

  async function handleDelete(id: string) {
    setCtxItem(null);
    const prev = [...items];
    setItems((i) => i.filter((x) => x.id !== id));
    try {
      await contentService.delete(id);
      toast.success("Content deleted");
    } catch {
      setItems(prev);
      toast.error("Failed to delete");
    }
  }

  function openEdit(c: Content) {
    setCtxItem(null);
    setEditId(c.id);
    setForm({
      title: c.title,
      description: c.description || "",
      content_type: c.content_type,
      visibility: c.visibility,
      external_url: c.external_url || "",
      folder: c.folder || "",
      course_offering: c.course_offering || "",
      is_published: c.is_published,
      publish_at: toDateTimeLocalValue(c.publish_at),
      expires_at: toDateTimeLocalValue(c.expires_at),
    });
    setSheetOpen(true);
  }

  function openDetail(c: Content) {
    setCtxItem(null);
    setDetailContent(c);
  }
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPageSize,
  } = useClientPagination(items);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    try {
      await contentService.update(editId, {
        title: form.title,
        description: form.description,
        content_type: form.content_type,
        visibility: form.visibility,
        external_url: form.external_url.trim() || null,
        folder: form.folder || null,
        course_offering: form.course_offering || null,
        is_published: form.is_published,
        publish_at: toIsoOrNull(form.publish_at),
        expires_at: toIsoOrNull(form.expires_at),
      } as Partial<Content>);
      toast.success("Content updated");
      setSheetOpen(false);
      setEditId(null);
      fetchContent();
    } catch {
      toast.error("Failed to update content");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <ContextMenu
        onOpenChange={(open) => {
          if (!open) setCtxItem(null);
        }}
      >
        <ContextMenuTrigger asChild>
          <div className="w-full">
            <TableCard.Root>
              <div className="flex items-center gap-2 border-b border-secondary px-4 py-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Filter content..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-8 text-sm border-none shadow-none bg-transparent focus-visible:ring-0"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-28 sm:w-36 h-8 text-xs">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="link">Links</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {initialLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table aria-label="Content">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head isRowHeader>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Title
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Type
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Course
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Status
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Tracking
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Updated
                        </span>
                      </Table.Head>
                      <Table.Head>
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          Actions
                        </span>
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.length === 0 ? (
                      <Table.Row id="empty">
                        <Table.Cell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <File className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>No content found.</p>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      paginatedItems.map((c) => (
                        <Table.Row
                          key={c.id}
                          id={c.id}
                          onContextMenu={() => setCtxItem(c)}
                        >
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground shrink-0">
                                {TYPE_ICONS[c.content_type] ?? TYPE_ICONS.other}
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{c.title}</div>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                                  <span>{formatFileSize(c.file_size)}</span>
                                  {c.folder_name && <span>• Folder: {c.folder_name}</span>}
                                  {c.tags.length > 0 && <span>• {c.tags.length} tag{c.tags.length !== 1 ? "s" : ""}</span>}
                                </div>
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge variant="secondary">{c.content_type}</Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{c.course_code || "No course"}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {c.course_name || c.uploaded_by_name}
                                {c.semester_name ? ` • ${c.semester_name}` : ""}
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant={getPublishState(c).variant}>{getPublishState(c).label}</Badge>
                              <Badge variant="outline">{c.visibility}</Badge>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                              <Badge variant="outline">{c.total_views ?? 0} views</Badge>
                              <Badge variant="outline">{c.total_downloads ?? 0} downloads</Badge>
                              <Badge variant="outline">{c.bookmark_count ?? 0} bookmarks</Badge>
                              <Badge variant="outline">{c.comment_count ?? 0} comments</Badge>
                              <Badge variant="outline">v{c.version_count ?? 0}</Badge>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-muted-foreground">
                            <div className="text-sm">{new Date(c.updated_at).toLocaleDateString()}</div>
                            <div className="text-xs">Created {new Date(c.created_at).toLocaleDateString()}</div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex w-full items-center justify-start gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hidden sm:inline-flex h-8 w-8"
                                  onClick={() => openDetail(c)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View content details</span>
                                </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="hidden sm:inline-flex h-8 w-8"
                                onClick={() => openEdit(c)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit content</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="hidden sm:inline-flex h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(c.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete content</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  {c.external_url && (
                                    <DropdownMenuItem onClick={() => window.open(c.external_url!, "_blank") }>
                                      <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => openDetail(c)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEdit(c)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(c.id)}
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

              <TablePaginationFooter
                count={items.length}
                itemLabel="item"
                activeFiltersLabel={typeFilter !== "all" ? `Type: ${typeFilter}` : null}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </TableCard.Root>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {ctxItem ? (
            <>
              {ctxItem.external_url && (
                <ContextMenuItem
                  onClick={() => window.open(ctxItem.external_url!, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Open Link
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => openDetail(ctxItem)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Details
              </ContextMenuItem>
              <ContextMenuItem onClick={() => openEdit(ctxItem)}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit Details
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => handleDelete(ctxItem.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuItem disabled>
              Right-click a row for actions
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Details</DialogTitle>
            <DialogDescription>
              Update title, description, or visibility.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdate}
            className="flex flex-col gap-4 px-4 flex-1 mt-4"
          >
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={form.content_type}
                  onValueChange={(v) =>
                    setForm({ ...form, content_type: v as Content["content_type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) =>
                    setForm({ ...form, visibility: v as Content["visibility"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>External Link</Label>
              <Input
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                placeholder="https://example.com/resource"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Course Offering</Label>
                <Select
                  value={form.course_offering || "none"}
                  onValueChange={(value) =>
                    setForm({ ...form, course_offering: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No course</SelectItem>
                    {offerings.map((offering) => (
                      <SelectItem key={offering.id} value={offering.id}>
                        {offering.course_code} • {offering.semester_name} • {offering.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select
                  value={form.folder || "none"}
                  onValueChange={(value) =>
                    setForm({ ...form, folder: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Publish Status</Label>
                <Select
                  value={form.is_published ? "published" : "draft"}
                  onValueChange={(value) =>
                    setForm({ ...form, is_published: value === "published" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publish At</Label>
                <Input
                  type="datetime-local"
                  value={form.publish_at}
                  onChange={(e) => setForm({ ...form, publish_at: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="w-full mt-4">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Content
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ContentDetailSheet
        content={detailContent}
        open={Boolean(detailContent)}
        onOpenChange={(open) => {
          if (!open) setDetailContent(null);
        }}
        mode="admin"
      />
    </div>
  );
}
