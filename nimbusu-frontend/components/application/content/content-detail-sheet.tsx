"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { contentCommentsService, contentService, contentVersionsService } from "@/services/api";
import type { Content, ContentComment, ContentStats, ContentVersion } from "@/lib/types";
import { toast } from "sonner";
import {
  Bookmark,
  CalendarClock,
  Download,
  ExternalLink,
  Eye,
  FileClock,
  FolderOpen,
  GitBranch,
  MessageSquare,
  Tags,
  UserRound,
} from "lucide-react";

type ContentDetailSheetProps = {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "admin" | "student";
  onPreview?: (content: Content) => void;
  onBookmark?: (content: Content) => void;
};

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

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getPublishState(content: Content) {
  if (!content.is_published) return { label: "Draft", variant: "secondary" as const };
  if (content.is_expired) return { label: "Expired", variant: "destructive" as const };
  if (content.is_scheduled) return { label: "Scheduled", variant: "outline" as const };
  return { label: "Published", variant: "default" as const };
}

export function ContentDetailSheet({
  content,
  open,
  onOpenChange,
  mode = "student",
  onPreview,
  onBookmark,
}: ContentDetailSheetProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [comments, setComments] = useState<ContentComment[]>([]);

  useEffect(() => {
    if (!open || !content) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      contentService.stats(content.id),
      contentVersionsService.list(content.id),
      contentCommentsService.list(content.id),
    ])
      .then(([statsResponse, versionsResponse, commentsResponse]) => {
        if (cancelled) return;
        setStats((statsResponse.data?.data as ContentStats | undefined) ?? null);
        setVersions((versionsResponse.data?.results ?? []).slice().sort((a, b) => b.version_number - a.version_number));
        setComments((commentsResponse.data?.results ?? []).slice().sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)));
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load content details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, content]);

  const publishState = content ? getPublishState(content) : null;

  const statCards = useMemo(() => {
    if (!content) return [];
    return [
      {
        label: "Views",
        value: stats?.total_views ?? content.total_views ?? 0,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Downloads",
        value: stats?.total_downloads ?? content.total_downloads ?? 0,
        icon: <Download className="h-4 w-4" />,
      },
      {
        label: "Bookmarks",
        value: stats?.bookmarks ?? content.bookmark_count ?? 0,
        icon: <Bookmark className="h-4 w-4" />,
      },
      {
        label: "Comments",
        value: content.comment_count ?? comments.length,
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        label: "Versions",
        value: content.version_count ?? versions.length,
        icon: <GitBranch className="h-4 w-4" />,
      },
    ];
  }, [comments.length, content, stats, versions.length]);

  const resolvedComments = comments.filter((comment) => comment.is_resolved).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto" showCloseButton>
        {content ? (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{content.content_type}</Badge>
                    {publishState && <Badge variant={publishState.variant}>{publishState.label}</Badge>}
                    <Badge variant="outline">{content.visibility}</Badge>
                  </div>
                  <SheetTitle className="text-xl leading-tight">{content.title}</SheetTitle>
                  <SheetDescription>
                    {content.course_name || "General content"}
                    {content.course_code ? ` • ${content.course_code}` : ""}
                    {content.semester_name ? ` • ${content.semester_name}` : ""}
                  </SheetDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {content.external_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(content.external_url!, "_blank") }>
                      <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                    </Button>
                  )}
                  {content.file && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (onPreview ? onPreview(content) : window.open(content.file!, "_blank"))}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  )}
                  {mode === "student" && onBookmark && (
                    <Button size="sm" onClick={() => onBookmark(content)}>
                      <Bookmark className="mr-2 h-4 w-4" /> Bookmark
                    </Button>
                  )}
                </div>
              </div>
            </SheetHeader>

            <div className="p-4 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((card) => (
                  <div key={card.label} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium uppercase tracking-wide">{card.label}</span>
                      {card.icon}
                    </div>
                    <div className="mt-3 text-2xl font-semibold">{loading ? "…" : card.value}</div>
                  </div>
                ))}
              </div>

              <Tabs defaultValue="overview" className="gap-4">
                <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-5">
                  <section className="rounded-xl border p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold">Description</h3>
                      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                        {content.description || "No description provided yet."}
                      </p>
                    </div>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Uploaded by</p>
                            <p className="text-muted-foreground">{content.uploaded_by_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FolderOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Folder and size</p>
                            <p className="text-muted-foreground">
                              {content.folder_name || "Unfiled"} • {formatFileSize(content.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <Tags className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Tags</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {content.tags.length > 0 ? (
                                content.tags.map((tag) => (
                                  <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">No tags</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Created and updated</p>
                            <p className="text-muted-foreground">Created {formatDateTime(content.created_at)}</p>
                            <p className="text-muted-foreground">Updated {formatDateTime(content.updated_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FileClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Publish window</p>
                            <p className="text-muted-foreground">Starts {formatDateTime(content.publish_at)}</p>
                            <p className="text-muted-foreground">Ends {formatDateTime(content.expires_at)}</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                          <p>
                            {resolvedComments} of {content.comment_count ?? comments.length} comments are resolved.
                          </p>
                          <p className="mt-1">
                            Latest version: {versions[0] ? `v${versions[0].version_number}` : "No versions yet"}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="comments" className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                      No comments yet.
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{comment.author_name}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(comment.updated_at)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {comment.is_resolved && <Badge variant="default">Resolved</Badge>}
                            <Badge variant="outline">{comment.reply_count} repl{comment.reply_count === 1 ? "y" : "ies"}</Badge>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{comment.body}</p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="versions" className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                      No version history yet.
                    </div>
                  ) : (
                    versions.map((version) => (
                      <div key={version.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">Version {version.version_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {version.uploaded_by_name} • {formatDateTime(version.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline">{formatFileSize(version.file_size)}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {version.change_summary || "No change summary provided."}
                        </p>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">Select content to view details.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}