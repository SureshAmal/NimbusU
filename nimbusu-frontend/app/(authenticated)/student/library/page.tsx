"use client";

import { useEffect, useState, useCallback } from "react";
import { contentService } from "@/services/api";
import type { ContentFolder, Content } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Folder,
  FileText,
  ArrowLeft,
  Search,
  Download,
  FolderOpen,
  Library,
} from "lucide-react";

export default function LibraryPage() {
  const [folders, setFolders] = useState<ContentFolder[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");

  const fetchLibrary = useCallback(async (folderId?: string) => {
    setLoading(true);
    try {
      const folderParams: Record<string, string> = { visibility: "public" };
      if (folderId) {
        folderParams.parent = folderId;
      } else {
        // Root level — only folders without parent
        folderParams.parent = "";
      }
      const [foldersRes, contentsRes] = await Promise.all([
        contentService.folders.list(folderParams),
        contentService.list(folderId ? { folder: folderId, visibility: "public" } : { visibility: "public" }),
      ]);
      setFolders(foldersRes.data.results ?? []);
      setContents(contentsRes.data.results ?? []);
    } catch {
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary(currentFolder ?? undefined);
  }, [currentFolder, fetchLibrary]);

  const openFolder = (folder: ContentFolder) => {
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolder(folder.id);
  };

  const goBack = () => {
    const prev = [...breadcrumb];
    prev.pop();
    setBreadcrumb(prev);
    setCurrentFolder(prev.length > 0 ? prev[prev.length - 1].id : null);
  };

  const goToRoot = () => {
    setBreadcrumb([]);
    setCurrentFolder(null);
  };

  const goToBreadcrumb = (index: number) => {
    const prev = breadcrumb.slice(0, index + 1);
    setBreadcrumb(prev);
    setCurrentFolder(prev[prev.length - 1]?.id ?? null);
  };

  const q = search.toLowerCase();
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(q),
  );
  const filteredContents = contents.filter(
    (c) =>
      (c.title ?? "").toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-32"
              style={{ borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6" />
            Resource Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse public course materials and documents.
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToRoot}
          className="text-xs"
          disabled={breadcrumb.length === 0}
        >
          <FolderOpen className="h-3.5 w-3.5 mr-1" />
          Root
        </Button>
        {breadcrumb.map((crumb, i) => (
          <div key={crumb.id} className="flex items-center gap-1">
            <span className="text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToBreadcrumb(i)}
              className="text-xs"
              disabled={i === breadcrumb.length - 1}
            >
              {crumb.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Search & Back */}
      <div className="flex items-center gap-2">
        {currentFolder && (
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
        )}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Folders Grid */}
      {filteredFolders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Folders
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredFolders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                onClick={() => openFolder(folder)}
                style={{
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--primary)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <Folder
                      className="h-5 w-5"
                      style={{ color: "var(--primary-foreground)" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {folder.visibility}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Contents */}
      {filteredContents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Files
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredContents.map((content) => (
              <Card
                key={content.id}
                className="transition-all hover:shadow-md"
                style={{
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--muted)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {content.title}
                      </p>
                      {content.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {content.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {content.content_type || "file"}
                        </Badge>
                        {content.file && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                          >
                            <a
                              href={content.file}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFolders.length === 0 && filteredContents.length === 0 && (
        <div className="py-20 text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">
            {search
              ? "No resources match your search."
              : "This folder is empty."}
          </p>
        </div>
      )}
    </div>
  );
}
