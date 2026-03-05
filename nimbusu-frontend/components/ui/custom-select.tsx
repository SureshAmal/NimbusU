"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
   CustomSelect — Accessible dropdown with keyboard navigation
   ═══════════════════════════════════════════════════════════════════ */

export interface SelectOption {
    value: string;
    label: string;
    dot?: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CustomSelect({ value, options, onChange, placeholder }: CustomSelectProps) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [focusIdx, setFocusIdx] = useState(-1);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const selected = options.find((o) => o.value === value);

    // Sync focus index when opening
    useEffect(() => {
        if (open) {
            const idx = options.findIndex((o) => o.value === value);
            const timer = setTimeout(() => setFocusIdx(idx >= 0 ? idx : 0), 0);
            return () => clearTimeout(timer);
        }
    }, [open, options, value]);

    // Scroll focused item into view
    useEffect(() => {
        if (open && focusIdx >= 0 && itemRefs.current[focusIdx]) {
            itemRefs.current[focusIdx]?.scrollIntoView({ block: "nearest" });
        }
    }, [focusIdx, open]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function onClick(e: MouseEvent) {
            if (
                triggerRef.current?.contains(e.target as Node) ||
                listRef.current?.contains(e.target as Node)
            ) return;
            setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    // Keyboard handling
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!open) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(true);
                }
                return; // Let Arrow keys bubble up to the popup navigation handler when closed
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setFocusIdx((prev) => Math.min(prev + 1, options.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setFocusIdx((prev) => Math.max(prev - 1, 0));
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (focusIdx >= 0 && focusIdx < options.length) {
                        onChange(options[focusIdx].value);
                        setOpen(false);
                        triggerRef.current?.focus();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    e.stopPropagation(); // Prevent modal from closing
                    setOpen(false);
                    triggerRef.current?.focus();
                    break;
                case "Tab":
                    setOpen(false);
                    break;
                case "Home":
                    e.preventDefault();
                    setFocusIdx(0);
                    break;
                case "End":
                    e.preventDefault();
                    setFocusIdx(options.length - 1);
                    break;
            }
        },
        [open, focusIdx, options, onChange]
    );

    // Position dropdown below trigger, or above if no space
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, direction: "down" as "up" | "down", ready: false });

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownMaxHeight = 240; // Max height defined in the style

        // Check if there is enough space below
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        let direction: "up" | "down" = "down";
        let top = rect.bottom + 4;

        if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
            direction = "up";
            // We'll calculate the actual top position during rendering using bottom constraint,
            // or we can set top to a rough estimate for absolute positioning.
            // Using a specific `bottom` style is safer for "up" direction, so `top` here is unused in that case.
            top = rect.top - 4; // Used to anchor the bottom of the dropdown
        }

        setPos({
            top,
            left: rect.right - Math.max(rect.width, 190),
            width: Math.max(rect.width, 190),
            direction,
            ready: true
        });
    }, []);

    useEffect(() => {
        if (open) {
            updatePosition();
            // Recalculate position on resize/scroll could go here
        } else {
            setPos(p => ({ ...p, ready: false }));
        }
    }, [open, updatePosition]);

    return (
        <>
            {/* Trigger */}
            <button
                ref={triggerRef}
                onClick={() => setOpen(!open)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={placeholder || "Select"}
                tabIndex={0}
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                    borderRadius: "var(--radius-lg, 999px)",
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    minWidth: "100px",
                    outlineColor: "var(--ring)",
                }}
            >
                {selected?.dot && (
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: selected.dot }} />
                )}
                <span className="flex-1 text-left truncate">{selected?.label || placeholder || "Select..."}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>

            {/* Dropdown — single scrollable container, no double scroll */}
            {createPortal(
                <AnimatePresence>
                    {open && pos.ready && (
                        <motion.div
                            ref={listRef as React.Ref<HTMLDivElement>}
                            role="listbox"
                            aria-activedescendant={focusIdx >= 0 ? `select-opt-${focusIdx}` : undefined}
                            onKeyDown={onKeyDown}
                            className="fixed z-[10001] py-1 select-dropdown"
                            initial={{ opacity: 0, y: pos.direction === "down" ? -10 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2 }}
                            style={{
                                ...(pos.direction === "down"
                                    ? { top: pos.top }
                                    : { bottom: window.innerHeight - pos.top }),
                                left: pos.left,
                                width: pos.width,
                                maxHeight: "240px",
                                overflowY: "auto",
                                borderRadius: "var(--radius-xl, 12px)",
                                background: "var(--popover)",
                                border: "1px solid var(--border)",
                                boxShadow: pos.direction === "down"
                                    ? "0 8px 32px oklch(0 0 0 / 30%)"
                                    : "0 -8px 32px oklch(0 0 0 / 30%)",
                                scrollbarWidth: "thin",
                                scrollbarColor: "var(--primary) transparent",
                            }}
                        >
                            {options.map((opt, i) => {
                                const active = opt.value === value;
                                const focused = i === focusIdx;
                                return (
                                    <motion.button
                                        key={opt.value}
                                        ref={(el) => { itemRefs.current[i] = el; }}
                                        id={`select-opt-${i}`}
                                        role="option"
                                        aria-selected={active}
                                        tabIndex={-1}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            triggerRef.current?.focus();
                                        }}
                                        onMouseEnter={() => setFocusIdx(i)}
                                        onMouseLeave={() => { if (!active) setFocusIdx(-1); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm outline-none overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02, duration: 0.15 }}
                                        style={{
                                            background: focused || active ? "oklch(from var(--primary) l c h / 15%)" : "transparent",
                                            color: "var(--popover-foreground)",
                                        }}
                                    >
                                        {/* Color dot */}
                                        {opt.dot && (
                                            <span
                                                className="h-4 w-4 rounded-full shrink-0"
                                                style={{
                                                    background: opt.dot,
                                                    boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 10%)",
                                                }}
                                            />
                                        )}
                                        {/* Icon */}
                                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                        {/* Label */}
                                        <span className="flex-1 text-left" style={{ fontFamily: opt.dot ? undefined : opt.value }}>
                                            {opt.label}
                                        </span>
                                        {/* Radio circle */}
                                        <span
                                            className="h-[16px] w-[16px] rounded-full border-2 flex items-center justify-center shrink-0"
                                            style={{
                                                borderColor: active ? "var(--primary)" : "var(--border)",
                                            }}
                                        >
                                            {active && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="h-[8px] w-[8px] rounded-full"
                                                    style={{ background: "var(--primary)" }}
                                                />
                                            )}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
