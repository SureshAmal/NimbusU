"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import api, { clearTokens, getAccessToken, setTokens } from "@/lib/api";
import type { Tokens, User } from "@/lib/types";

/* ─── Context shape ───────────────────────────────────────────────── */

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: "student" | "faculty";
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ─── Provider ────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    /* Fetch current user on mount if token exists */
    const refreshUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/users/me/");
            setUser(data);
        } catch {
            setUser(null);
            clearTokens();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    /* Login */
    const login = useCallback(
        async (email: string, password: string) => {
            const { data: tokens } = await api.post<Tokens>("/auth/login/", {
                email,
                password,
            });
            setTokens(tokens.access, tokens.refresh);
            const { data: userData } = await api.get<User>("/users/me/");
            setUser(userData);
            redirectByRole(userData.role, router);
        },
        [router]
    );

    /* Register */
    const register = useCallback(
        async (formData: RegisterData) => {
            const { data } = await api.post("/auth/register/", formData);
            setTokens(data.data.tokens.access, data.data.tokens.refresh);
            setUser(data.data.user);
            redirectByRole(data.data.user.role, router);
        },
        [router]
    );

    /* Logout */
    const logout = useCallback(async () => {
        try {
            const refreshToken =
                typeof document !== "undefined"
                    ? document.cookie
                        .split("; ")
                        .find((c) => c.startsWith("nimbusu_refresh="))
                        ?.split("=")[1]
                    : undefined;
            if (refreshToken) {
                await api.post("/auth/logout/", { refresh: refreshToken });
            }
        } catch {
            /* ignore */
        }
        clearTokens();
        setUser(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{ user, isLoading, login, register, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ─── Hook ────────────────────────────────────────────────────────── */

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function redirectByRole(
    role: string,
    router: ReturnType<typeof useRouter>
) {
    switch (role) {
        case "admin":
            router.push("/admin/dashboard");
            break;
        case "faculty":
            router.push("/faculty/dashboard");
            break;
        case "student":
            router.push("/student/dashboard");
            break;
        default:
            router.push("/");
    }
}
