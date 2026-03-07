"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { Message } from "@/lib/types";
import { getAccessToken } from "@/lib/api";

export function useChatSocket(onNewMessage: (msg: Message) => void) {
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
                const wsUrl = `${wsProtocol}//${urlObj.host}/ws/chat/?token=${encodeURIComponent(currentToken as string)}`;
                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    if (cancelled && socket) {
                        socket.onclose = null;
                        socket.close();
                    }
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "new_message") {
                            onNewMessage(data.message);
                            toast.info(`New message from ${data.message.sender_name}`, {
                                description: data.message.subject || "No subject",
                            });
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
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.onclose = null;
                        socket.close();
                    } else if (socket.readyState === WebSocket.CONNECTING) {
                        // Let onopen handler close it after handshake completes
                    } else {
                        socket.onclose = null;
                    }
                }
            };
        } catch (err) {
            console.error("Could not parse API URL for WebSockets", err);
        }
    }, [onNewMessage]);
}
