"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api";

interface NotificationPayload {
    id: string;
    title: string;
    message: string;
    notification_type: string;
    created_at: string;
}

export function useNotificationSocket(onNewNotification?: (notif: NotificationPayload) => void) {
    const handleNotification = useCallback(
        (notif: NotificationPayload) => {
            toast.info(notif.title, { description: notif.message });
            onNewNotification?.(notif);
        },
        [onNewNotification],
    );

    useEffect(() => {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        if (apiUrl.endsWith("/api/v1") || apiUrl.endsWith("/api/v1/")) {
            apiUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
        }

        const token = getAccessToken();
        if (!token) return;

        let cancelled = false;
        let socket: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        try {
            const urlObj = new URL(apiUrl);
            const wsProtocol = urlObj.protocol === "https:" ? "wss:" : "ws:";

            function connect() {
                if (cancelled) return;

                const currentToken = getAccessToken() ?? token;
                const wsUrl = `${wsProtocol}//${urlObj.host}/ws/notifications/?token=${encodeURIComponent(currentToken as string)}`;
                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    // If cleanup already ran while we were connecting, close now
                    if (cancelled && socket) {
                        socket.onclose = null;
                        socket.close();
                    }
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "new_notification") {
                            handleNotification(data.message);
                        }
                    } catch (e) {
                        console.error("Invalid websocket message", e);
                    }
                };

                socket.onclose = () => {
                    if (!cancelled) {
                        reconnectTimer = setTimeout(connect, 5000);
                    }
                };
            }

            connect();

            return () => {
                cancelled = true;
                if (reconnectTimer) clearTimeout(reconnectTimer);
                if (socket) {
                    // Only close if already open; if still CONNECTING, the onopen
                    // handler above will close it once the handshake completes.
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.onclose = null;
                        socket.close();
                    } else if (socket.readyState === WebSocket.CONNECTING) {
                        // Let the onopen handler deal with it — the `cancelled`
                        // flag is already set so reconnect won't fire.
                    } else {
                        socket.onclose = null;
                    }
                }
            };
        } catch (err) {
            console.error("Could not parse API URL for WebSockets", err);
        }
    }, [handleNotification]);
}
