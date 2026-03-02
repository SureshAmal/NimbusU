"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { CustomRange } from "@/components/ui/custom-range";
import { CustomStepper } from "@/components/ui/custom-stepper";
import { CustomToggle } from "@/components/ui/custom-toggle";
import {
    Search,
    X,
    Sun,
    Moon,
    Monitor,
    Copy,
    RotateCcw,
    Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   Color presets
   ═══════════════════════════════════════════════════════════════════ */

interface ColorPreset {
    name: string;
    dot: string;
    primary: string;
    primaryForeground: string;
    accent: string;
}

const COLOR_PRESETS: ColorPreset[] = [
    { name: "Indigo", dot: "#6366f1", primary: "oklch(0.585 0.233 277.117)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.928 0.032 264.052)" },
    { name: "Blue", dot: "#3b82f6", primary: "oklch(0.623 0.214 259.815)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.932 0.032 255.585)" },
    { name: "Violet", dot: "#8b5cf6", primary: "oklch(0.541 0.281 293.009)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.915 0.042 293.009)" },
    { name: "Rose", dot: "#f43f5e", primary: "oklch(0.645 0.246 16.439)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.935 0.035 16.439)" },
    { name: "Emerald", dot: "#10b981", primary: "oklch(0.696 0.17 162.48)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.935 0.035 162.48)" },
    { name: "Amber", dot: "#f59e0b", primary: "oklch(0.769 0.188 70.08)", primaryForeground: "oklch(0.21 0.006 285.885)", accent: "oklch(0.94 0.038 70.08)" },
    { name: "Cyan", dot: "#06b6d4", primary: "oklch(0.715 0.143 215.221)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.935 0.035 215.221)" },
    { name: "Slate", dot: "#64748b", primary: "oklch(0.551 0.027 264.364)", primaryForeground: "oklch(0.985 0.002 247.858)", accent: "oklch(0.928 0.006 264.364)" },
];

const FONT_OPTIONS: SelectOption[] = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Outfit", label: "Outfit" },
    { value: "Poppins", label: "Poppins" },
    { value: "system-ui", label: "System UI" },
    { value: "monospace", label: "Monospace" },
];

const PRESET_OPTIONS: SelectOption[] = COLOR_PRESETS.map((p) => ({
    value: p.name,
    label: p.name,
    dot: p.dot,
}));

/* ═══════════════════════════════════════════════════════════════════
   CSS helpers
   ═══════════════════════════════════════════════════════════════════ */

function getCss(v: string) {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

function setCss(v: string, val: string) {
    document.documentElement.style.setProperty(v, val);
}

function parseRem(val: string): number {
    const n = parseFloat(val);
    if (!n) return 0;
    if (val.includes("rem")) return Math.round(n * 16);
    return n;
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════════ */

export function SettingsPopup() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const [search, setSearch] = useState("");
    const [activePreset, setActivePreset] = useState("Indigo");
    const [font, setFont] = useState("Inter");
    const [fontSize, setFontSize] = useState(16);
    const [headingSize, setHeadingSize] = useState(24);
    const [spacing, setSpacing] = useState(4);
    const [animations, setAnimations] = useState(true);
    const [roundCorners, setRoundCorners] = useState(true);
    const [radius, setRadius] = useState(10);
    const [shadow, setShadow] = useState(50);
    const [blur, setBlur] = useState(8);
    const [transition, setTransition] = useState(250);
    const [copied, setCopied] = useState(false);

    useEffect(() => setMounted(true), []);

    // ── Keyboard shortcut: Ctrl+, ──
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === ",") {
                e.preventDefault();
                setOpen((v) => !v);
            }
            if (e.key === "Escape" && open) setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // ── Init from CSS ──
    useEffect(() => {
        if (!open) return;
        setFontSize(parseRem(getCss("--text-base")) || 16);
        setHeadingSize(parseRem(getCss("--text-2xl")) || 24);
        const r = parseFloat(getCss("--radius"));
        setRadius(r ? Math.round(r * 16) : 10);
        setBlur(parseInt(getCss("--blur-md")) || 8);
    }, [open]);

    // ── Apply changes ──
    function onFontChange(v: string) {
        setFont(v);
        setCss("--font-sans", v + ", sans-serif");
    }

    function onFontSizeChange(v: number) {
        setFontSize(v);
        setCss("--text-base", `${v / 16}rem`);
    }

    function onHeadingSizeChange(v: number) {
        setHeadingSize(v);
        setCss("--text-2xl", `${v / 16}rem`);
    }

    function onSpacingChange(v: number) {
        setSpacing(v);
        setCss("--spacing", `${v}px`);
    }

    function setAllRadii(px: number) {
        const rem = px / 16;
        setCss("--radius", `${rem}rem`);
        setCss("--radius-sm", `${Math.max(0, rem - 0.25)}rem`);
        setCss("--radius-md", `${Math.max(0, rem - 0.125)}rem`);
        setCss("--radius-lg", `${rem}rem`);
        setCss("--radius-xl", `${rem + 0.25}rem`);
        setCss("--radius-2xl", `${rem + 0.5}rem`);
        setCss("--radius-3xl", `${rem + 0.75}rem`);
        setCss("--radius-4xl", `${rem + 1}rem`);
    }

    function onRadiusChange(v: number) {
        setRadius(v);
        setAllRadii(v);
    }

    function onShadowChange(v: number) {
        setShadow(v);
        const a = v / 100;
        setCss("--shadow-sm", `0 1px 3px oklch(0 0 0 / ${(8 * a).toFixed(1)}%)`);
        setCss("--shadow-md", `0 4px 6px oklch(0 0 0 / ${(7 * a).toFixed(1)}%)`);
        setCss("--shadow-lg", `0 10px 15px oklch(0 0 0 / ${(8 * a).toFixed(1)}%)`);
    }

    function onBlurChange(v: number) {
        setBlur(v);
        setCss("--blur-sm", `${Math.max(2, v / 2)}px`);
        setCss("--blur-md", `${v}px`);
        setCss("--blur-lg", `${v * 2}px`);
    }

    function onTransitionChange(v: number) {
        setTransition(v);
        setCss("--transition-fast", `${Math.max(50, v / 2)}ms`);
        setCss("--transition-normal", `${v}ms`);
        setCss("--transition-slow", `${v * 1.5}ms`);
    }

    function onAnimationsChange(v: boolean) {
        setAnimations(v);
        if (!v) setCss("--transition-normal", "0ms");
        else setCss("--transition-normal", `${transition}ms`);
    }

    function onRoundCornersChange(v: boolean) {
        setRoundCorners(v);
        if (!v) {
            setRadius(0);
            setAllRadii(0);
        } else {
            setRadius(10);
            setAllRadii(10);
        }
    }

    function applyPreset(name: string) {
        const p = COLOR_PRESETS.find((x) => x.name === name);
        if (!p) return;
        setActivePreset(name);
        setCss("--primary", p.primary);
        setCss("--primary-foreground", p.primaryForeground);
        setCss("--accent", p.accent);
        setCss("--ring", p.primary);
        setCss("--sidebar-primary", p.primary);
        setCss("--sidebar-ring", p.primary);
    }

    function resetAll() {
        document.documentElement.removeAttribute("style");
        setActivePreset("Indigo");
        setFont("Inter");
        setOpen(false);
        setTimeout(() => setOpen(true), 50);
    }

    function copyConfig() {
        const vars = ["--primary", "--primary-foreground", "--accent", "--radius", "--text-base", "--text-2xl", "--blur-md", "--transition-normal"];
        const cfg: Record<string, string> = {};
        vars.forEach((v) => { cfg[v] = getCss(v); });
        navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // ── Search filter ──
    type SectionKey = "scheme" | "accent" | "font" | "fontSize" | "headingSize" | "spacing" | "animations" | "roundCorners" | "radius" | "shadow" | "blur" | "transition";
    const sectionLabels: Record<SectionKey, string[]> = {
        scheme: ["color scheme light dark system theme"],
        accent: ["accent color primary"],
        font: ["font family typeface"],
        fontSize: ["font size scale text"],
        headingSize: ["heading title size"],
        spacing: ["spacing padding margin gap"],
        animations: ["animations transitions motion"],
        roundCorners: ["round corners border"],
        radius: ["border radius rounding"],
        shadow: ["shadow depth intensity"],
        blur: ["backdrop blur glass"],
        transition: ["transition speed duration"],
    };

    function visible(key: SectionKey) {
        if (!search) return true;
        const q = search.toLowerCase();
        return sectionLabels[key].some((s) => s.includes(q));
    }

    if (!mounted || !open) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

            {/* Panel */}
            <div
                className="fixed z-[9999] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] max-h-[82vh] flex flex-col overflow-hidden"
                style={{
                    borderRadius: "var(--radius-xl, 16px)",
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 24px 64px oklch(0 0 0 / 30%)",
                }}
            >
                {/* ── Search header ── */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Select an option..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex items-center gap-1">
                        <button onClick={resetAll} className="p-1 rounded hover:bg-accent/50 text-muted-foreground" title="Reset"><RotateCcw className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-accent/50 text-muted-foreground"><X className="h-4 w-4" /></button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <style>{`
                  .settings-scroll::-webkit-scrollbar { width: 5px; }
                  .settings-scroll::-webkit-scrollbar-track { background: transparent; }
                  .settings-scroll::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 999px; }
                  .settings-scroll::-webkit-scrollbar-thumb:hover { background: var(--ring); }
                `}</style>
                <div className="flex-1 overflow-y-auto settings-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--primary) transparent' }}>
                    {/* Color Scheme */}
                    {visible("scheme") && (
                        <Row label="System Light / Dark Scheme" desc="Automatically adapt between light and dark color schemes">
                            <div className="flex gap-1">
                                {(["system", "light", "dark"] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setTheme(v)}
                                        tabIndex={0}
                                        role="radio"
                                        aria-checked={theme === v}
                                        aria-label={`${v} color scheme`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-1"
                                        style={{
                                            borderRadius: "var(--radius-lg, 9999px)",
                                            background: theme === v ? "var(--primary)" : "var(--muted)",
                                            color: theme === v ? "var(--primary-foreground)" : "var(--foreground)",
                                            outlineColor: "var(--ring)",
                                        }}
                                    >
                                        {v === "system" && <Monitor className="h-3 w-3" />}
                                        {v === "light" && <Sun className="h-3 w-3" />}
                                        {v === "dark" && <Moon className="h-3 w-3" />}
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </Row>
                    )}

                    {/* Accent Color — CustomSelect dropdown */}
                    {visible("accent") && (
                        <Row label="Accent Color" desc="Choose primary color for the interface">
                            <CustomSelect
                                value={activePreset}
                                options={PRESET_OPTIONS}
                                onChange={applyPreset}
                                placeholder="Choose color"
                            />
                        </Row>
                    )}

                    {/* Font — CustomSelect dropdown */}
                    {visible("font") && (
                        <Row label="Font" desc="System font applied to the entire UI">
                            <CustomSelect
                                value={font}
                                options={FONT_OPTIONS}
                                onChange={onFontChange}
                                placeholder="Choose font"
                            />
                        </Row>
                    )}

                    {/* Font Size — Stepper */}
                    {visible("fontSize") && (
                        <Row label="Font Size" desc="Determines the scale of the whole UI">
                            <CustomStepper value={fontSize} min={10} max={22} step={1} onChange={onFontSizeChange} />
                        </Row>
                    )}

                    {/* Heading Size — Stepper */}
                    {visible("headingSize") && (
                        <Row label="Heading Size" desc="Scale factor for headings and titles">
                            <CustomStepper value={headingSize} min={18} max={40} step={1} onChange={onHeadingSizeChange} />
                        </Row>
                    )}

                    {/* Spacing — Range */}
                    {visible("spacing") && (
                        <Row label="Spacing" desc="Controls padding, gaps, and margins">
                            <CustomRange value={spacing} min={3} max={5.5} step={0.1} onChange={onSpacingChange} />
                        </Row>
                    )}

                    {/* Animations — Toggle */}
                    {visible("animations") && (
                        <Row label="Animations" desc="Enable smooth transitions and hover effects">
                            <CustomToggle checked={animations} onChange={onAnimationsChange} />
                        </Row>
                    )}

                    {/* Round Corners — Toggle */}
                    {visible("roundCorners") && (
                        <Row label="Round Corners" desc="Apply rounding to buttons, inputs, cards">
                            <CustomToggle checked={roundCorners} onChange={onRoundCornersChange} />
                        </Row>
                    )}

                    {/* Border Radius — Range */}
                    {visible("radius") && (
                        <Row label="Border Radius" desc="Controls the rounding amount when enabled">
                            <CustomRange value={radius} min={0} max={20} step={1} onChange={onRadiusChange} />
                        </Row>
                    )}

                    {/* Shadow Intensity — Range */}
                    {visible("shadow") && (
                        <Row label="Shadow Intensity" desc="Depth of drop shadows on cards and popups">
                            <CustomRange value={shadow} min={0} max={100} step={5} onChange={onShadowChange} />
                        </Row>
                    )}

                    {/* Backdrop Blur — Range */}
                    {visible("blur") && (
                        <Row label="Backdrop Blur" desc="Blur on overlays and glass surfaces">
                            <CustomRange value={blur} min={0} max={32} step={2} onChange={onBlurChange} />
                        </Row>
                    )}

                    {/* Transition Speed — Range */}
                    {visible("transition") && (
                        <Row label="Transition Speed" desc="Duration of all UI animations">
                            <CustomRange value={transition} min={0} max={500} step={50} onChange={onTransitionChange} />
                        </Row>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-4 py-2 border-t text-xs text-muted-foreground text-center" style={{ borderColor: "var(--border)" }}>
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Up</kbd>{" "}
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Down</kbd> to navigate{" · "}
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to use{" · "}
                    <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Escape</kbd> to dismiss
                </div>
            </div>
        </>,
        document.body
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Row layout — label + description on left, control on right
   ═══════════════════════════════════════════════════════════════════ */

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-b gap-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}
