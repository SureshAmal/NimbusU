"use client";

import { useEffect, useState } from "react";
import { contentService } from "@/services/api";
import type { Content } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, FileText, Video, Link2, Image, File } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
    document: <FileText className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    link: <Link2 className="h-4 w-4" />,
    image: <Image className="h-4 w-4" />,
    other: <File className="h-4 w-4" />,
};

export default function AdminContentPage() {
    const [items, setItems] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    async function fetch() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (typeFilter !== "all") params.content_type = typeFilter;
            const { data } = await contentService.list(params);
            setItems(data.results ?? []);
        } catch { toast.error("Failed to load content"); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetch(); }, [typeFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Oversight</h1>
                <p className="text-muted-foreground text-sm">Monitor all uploaded content across the platform</p>
            </div>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="pt-4">
                    <div className="flex gap-3">
                        <form onSubmit={(e) => { e.preventDefault(); fetch(); }} className="flex-1 flex gap-2">
                            <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <Button type="submit" variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
                        </form>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="document">Documents</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="link">Links</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card style={{ boxShadow: "var(--shadow-sm)", borderRadius: "var(--radius-lg)" }}>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Uploaded By</TableHead><TableHead>Visibility</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No content found.</TableCell></TableRow>
                                ) : items.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium flex items-center gap-2">{TYPE_ICONS[c.content_type]} {c.title}</TableCell>
                                        <TableCell><Badge variant="secondary">{c.content_type}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{c.uploaded_by_name}</TableCell>
                                        <TableCell><Badge variant="outline">{c.visibility}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
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
