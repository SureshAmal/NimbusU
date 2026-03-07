"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/api";

export function useTimetableSocket(onUpdate: () => void) {
    useEffect(() => {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        if (apiUrl.endsWith("/api/v1") || apiUrl.endsWith("/api/v1/")) {
            apiUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
        }
        
        const token = getAccessToken();

        try {
            const urlObj = new URL(apiUrl);
            const wsProtocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = token
                ? `${wsProtocol}//${urlObj.host}/ws/timetable/?token=${encodeURIComponent(token)}`
                : `${wsProtocol}//${urlObj.host}/ws/timetable/`;
            
            let socket: WebSocket;

            function connect() {
                socket = new WebSocket(wsUrl);

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "timetable_update") {
                            toast.info("Timetable updated dynamically", {
                                description: data.message || "A class schedule or announcement has changed.",
                            });
                            onUpdate();
                        }
                    } catch (e) {
                        console.error("Invalid websocket message", e);
                    }
                };

                socket.onclose = () => {
                    // Try to reconnect in 5 seconds
                    setTimeout(connect, 5000);
                };
            }

            connect();

            return () => {
                if (socket) {
                    socket.onclose = null; // Prevent reconnection
                    socket.close();
                }
            };
        } catch (err) {
            console.error("Could not parse API URL for WebSockets", err);
        }
    }, [onUpdate]);
}
