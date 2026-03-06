"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, FileText, User as UserIcon } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { contentService } from "@/services/api";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<{ courses: any[]; content: any[]; users: any[] } | null>(null);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (!open) {
            setQuery("");
            setResults(null);
            return;
        }
    }, [open]);

    React.useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await contentService.search(query);
                if (res.data?.status === "success" && res.data?.data) {
                    setResults(res.data.data);
                } else {
                    setResults({ courses: [], content: [], users: [] });
                }
            } catch {
                // Handle error silently
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-muted/50 shadow-xs hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
            >
                <span className="hidden lg:inline-flex">Search NimbusU...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen} commandProps={{ shouldFilter: false }}>
                <CommandInput
                    placeholder="Search across courses, content, and users..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? (
                            <div className="flex items-center justify-center p-6 space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Searching...</span>
                            </div>
                        ) : query.trim() ? (
                            "No results found."
                        ) : (
                            "Type a command or search..."
                        )}
                    </CommandEmpty>

                    {!loading && results && (
                        <>
                            {results.courses.length > 0 && (
                                <CommandGroup heading="Courses">
                                    {results.courses.map((c) => (
                                        <CommandItem
                                            key={c.id}
                                            value={c.id}
                                            onSelect={() => runCommand(() => router.push(c.link))}
                                        >
                                            <BookOpen className="mr-2 h-4 w-4 text-primary" />
                                            <div className="flex flex-col">
                                                <span>{c.title}</span>
                                                <span className="text-xs text-muted-foreground">{c.subtitle}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                            {results.courses.length > 0 && results.content.length > 0 && <CommandSeparator />}

                            {results.content.length > 0 && (
                                <CommandGroup heading="Content">
                                    {results.content.map((c) => (
                                        <CommandItem
                                            key={c.id}
                                            value={c.id}
                                            onSelect={() => runCommand(() => router.push(c.link))}
                                        >
                                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                            <div className="flex flex-col">
                                                <span>{c.title}</span>
                                                <span className="text-xs text-muted-foreground">{c.subtitle}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                            {results.content.length > 0 && results.users.length > 0 && <CommandSeparator />}

                            {results.users.length > 0 && (
                                <CommandGroup heading="Users">
                                    {results.users.map((u) => (
                                        <CommandItem
                                            key={u.id}
                                            value={u.id}
                                            onSelect={() => runCommand(() => router.push(u.link))}
                                        >
                                            <UserIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                            <div className="flex flex-col">
                                                <span>{u.title}</span>
                                                <span className="text-xs text-muted-foreground">{u.subtitle}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
