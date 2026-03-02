"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { SettingsPopup } from "@/components/settings-popup";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <AuthProvider>
                    {children}
                    <SettingsPopup />
                    <Toaster richColors position="top-right" />
                </AuthProvider>
            </TooltipProvider>
        </NextThemesProvider>
    );
}

