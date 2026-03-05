"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    children: React.ReactNode;
    width?: string;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
}

export function CustomModal({ open, onOpenChange, title, children, width = "540px", actions, footer }: CustomModalProps) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // ── Keyboard Navigation & Focus Trap ──
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!panelRef.current) return;
        if (e.defaultPrevented) return;

        if (e.key === "Escape") {
            e.preventDefault();
            onOpenChange(false);
            return;
        }

        const focusableElements = Array.from(
            panelRef.current.querySelectorAll(
                'input:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]):not([disabled])'
            )
        ) as HTMLElement[];

        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement as HTMLElement;
        const currentIndex = focusableElements.indexOf(active);

        // Tab Trap
        if (e.key === "Tab") {
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        }

        // Arrow Up/Down navigation within the modal
        if (e.key === "ArrowDown") {
            // Prevent scrolling
            e.preventDefault();
            const next = currentIndex >= 0 ? focusableElements[(currentIndex + 1) % focusableElements.length] : first;
            next.focus();
            next.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = currentIndex >= 0 ? focusableElements[(currentIndex - 1 + focusableElements.length) % focusableElements.length] : last;
            prev.focus();
            prev.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    };

    // Auto-focus the first element when modal opens
    useEffect(() => {
        if (open && panelRef.current) {
            const firstTabbable = panelRef.current.querySelector(
                'input:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]):not([disabled])'
            ) as HTMLElement;
            if (firstTabbable) {
                // Focus with a tiny delay to ensure paint
                setTimeout(() => firstTabbable.focus(), 10);
            }
        }
    }, [open]);

    // Cleanup scroll lock
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />

                    {/* Panel */}
                    <motion.div
                        ref={panelRef as React.Ref<HTMLDivElement>}
                        onKeyDown={handleKeyDown}
                        initial={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        className="fixed z-[9999] left-1/2 top-1/2 flex flex-col overflow-hidden outline-none"
                        style={{
                            width: "calc(100vw - 2rem)",
                            maxWidth: width,
                            maxHeight: "90vh",
                            borderRadius: "var(--radius-xl, 16px)",
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 24px 64px oklch(0 0 0 / 30%)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                            <div className="flex-1 flex items-center gap-2">
                                {title}
                            </div>
                            <div className="flex items-center gap-1">
                                {actions}
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="p-1 rounded transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="border-t" style={{ borderColor: "var(--border)" }}>
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
