import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

/* ─── Token helpers ───────────────────────────────────────────────── */

export function getAccessToken(): string | undefined {
    return Cookies.get("nimbusu_access");
}

export function getRefreshToken(): string | undefined {
    return Cookies.get("nimbusu_refresh");
}

export function setTokens(access: string, refresh: string) {
    Cookies.set("nimbusu_access", access, { expires: 1, sameSite: "Lax" });
    Cookies.set("nimbusu_refresh", refresh, { expires: 7, sameSite: "Lax" });
}

export function clearTokens() {
    Cookies.remove("nimbusu_access");
    Cookies.remove("nimbusu_refresh");
}

/* ─── Request interceptor — attach access token ───────────────────── */

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ─── Response interceptor — auto-refresh on 401 ─────────────────── */

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else if (token) p.resolve(token);
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });
                const newAccess = data.access;
                setTokens(newAccess, refreshToken);
                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
