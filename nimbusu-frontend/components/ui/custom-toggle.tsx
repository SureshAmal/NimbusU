"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
   CustomToggle — Accessible switch with checkmark
   ═══════════════════════════════════════════════════════════════════ */

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export function CustomToggle({ checked, onChange, label }: CustomToggleProps) {
    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
        }
    }

    return (
        <button
            role="switch"
            aria-checked={checked}
            aria-label={label}
            tabIndex={0}
            onClick={() => onChange(!checked)}
            onKeyDown={onKeyDown}
            className="relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
                borderRadius: "var(--radius-xl, 9999px)",
                background: checked ? "var(--primary)" : "var(--muted)",
                outlineColor: "var(--ring)",
            }}
        >
            {/* Sliding knob */}
            <motion.span
                layout
                initial={false}
                animate={{ x: checked ? 22 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-[3px] left-[3px] h-[22px] w-[22px] bg-white shadow-sm flex items-center justify-center"
                style={{
                    borderRadius: "var(--radius-lg, 9999px)",
                    boxShadow: "0 1px 3px oklch(0 0 0 / 20%)",
                }}
            >
                {checked && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Check className="h-3 w-3" style={{ color: "var(--primary)" }} />
                    </motion.div>
                )}
            </motion.span>
        </button>
    );
}
