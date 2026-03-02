"use client";

/* ═══════════════════════════════════════════════════════════════════
   CustomStepper — Number input with − / + buttons, keyboard accessible
   ═══════════════════════════════════════════════════════════════════ */

interface CustomStepperProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}

export function CustomStepper({ value, min, max, step = 1, onChange }: CustomStepperProps) {
    function decrement() {
        onChange(Math.max(min, value - step));
    }
    function increment() {
        onChange(Math.min(max, value + step));
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            increment();
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            decrement();
        } else if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
        } else if (e.key === "End") {
            e.preventDefault();
            onChange(max);
        }
    }

    return (
        <div
            className="inline-flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-offset-1"
            style={{
                borderRadius: "var(--radius, 8px)",
                border: "1px solid var(--border)",
                ringColor: "var(--ring)",
            }}
            role="spinbutton"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            tabIndex={0}
            onKeyDown={onKeyDown}
        >
            <button
                onClick={decrement}
                disabled={value <= min}
                tabIndex={-1}
                aria-label="Decrease"
                className="px-2.5 py-1 text-base font-bold transition-colors hover:bg-accent/50 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderRight: "1px solid var(--border)" }}
            >
                −
            </button>
            <span
                className="px-3 py-1 text-sm font-mono text-center min-w-[44px] select-none"
                style={{ background: "var(--muted)" }}
            >
                {value}
            </span>
            <button
                onClick={increment}
                disabled={value >= max}
                tabIndex={-1}
                aria-label="Increase"
                className="px-2.5 py-1 text-base font-bold transition-colors hover:bg-accent/50 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderLeft: "1px solid var(--border)" }}
            >
                +
            </button>
        </div>
    );
}
