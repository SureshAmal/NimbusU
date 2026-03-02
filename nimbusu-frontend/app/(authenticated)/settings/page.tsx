"use client";

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm mt-2">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono" style={{ borderColor: "var(--border)" }}>
                    Ctrl + ,
                </kbd>{" "}
                to open the settings panel from anywhere.
            </p>
        </div>
    );
}
