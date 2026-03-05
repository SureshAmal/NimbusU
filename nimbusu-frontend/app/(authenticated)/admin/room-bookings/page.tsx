"use client";

import { useEffect, useState } from "react";
import { usePageHeader } from "@/lib/page-header";
import { roomBookingsService } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { RoomBooking } from "@/lib/types";

export default function AdminRoomBookingsPage() {
    const { setHeader } = usePageHeader();
    const [bookings, setBookings] = useState<RoomBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState<Record<string, boolean>>({});

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data } = await roomBookingsService.list();
            setBookings(data.results ?? data ?? []);
        } catch (error) {
            toast.error("Failed to load room bookings");
        } finally {
            setLoading(false);
        };

        useEffect(() => {
            setHeader({
                title: "Room Bookings",
                subtitle: "Manage and approve room booking requests"
            });
            fetchBookings();
            return () => setHeader(null);
        }, [setHeader]);

        const handleApprove = async (id: string) => {
            setActioning(p => ({ ...p, [id]: true }));
            try {
                await roomBookingsService.approve(id, { status: "approved" });
                toast.success("Booking approved");
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "approved" } : b));
            } catch (error) {
                toast.error("Failed to approve booking");
            } finally {
                setActioning(p => ({ ...p, [id]: false }));
            }
        };

        const handleReject = async (id: string) => {
            setActioning(p => ({ ...p, [id]: true }));
            try {
                await roomBookingsService.approve(id, { status: "rejected" });
                toast.success("Booking rejected");
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
            } catch (error) {
                toast.error("Failed to reject booking");
            } finally {
                setActioning(p => ({ ...p, [id]: false }));
            }
        };

        if (loading) {
            return (
                <div className="space-y-4 max-w-6xl mx-auto">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
            );
        }

        return (
            <div className="max-w-6xl mx-auto pb-12 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Room Booking Requests</h1>

                {bookings.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground border rounded-xl border-dashed">
                        <Building className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No room booking requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map(booking => {
                            const start = new Date(booking.start_time);
                            const end = new Date(booking.end_time);
                            const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                            const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                            return (
                                <div key={booking.id} className="p-5 border rounded-xl bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{booking.room_name || booking.room}</h3>
                                            <Badge variant={booking.status === "approved" ? "default" : booking.status === "rejected" ? "destructive" : "secondary"}>
                                                {booking.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium">Requested by: {booking.booked_by_name || booking.booked_by}</p>
                                        <p className="text-sm text-muted-foreground break-words">Purpose: {booking.purpose}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{dateStr} • {timeStr}</span>
                                        </div>
                                    </div>

                                    {booking.status === "pending" && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                className="border-destructive text-destructive hover:bg-destructive/10"
                                                disabled={actioning[booking.id]}
                                                onClick={() => handleReject(booking.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                disabled={actioning[booking.id]}
                                                onClick={() => handleApprove(booking.id)}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}