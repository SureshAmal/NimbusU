"use client";

import { useEffect, useState } from "react";
import { usePageHeader } from "@/lib/page-header";
import { roomBookingsService } from "@/services/api";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building, Plus, Clock, Loader2 } from "lucide-react";
import type { RoomBooking } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export default function FacultyRoomBookingsPage() {
    const { setHeader } = usePageHeader();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<RoomBooking[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formDialog, setFormDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        room: "",
        purpose: "",
        date: "",
        start_time: "",
        end_time: ""
    });

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [bRes, rRes] = await Promise.all([
                roomBookingsService.list(user?.id ? { booked_by: user.id } : {}), // Assume API supports filtering by users. Alternatively, fetch all and filter client side.
                api.get("/timetable/rooms/") // Assuming this endpoint exists, or we ask user to type room name.
            ]);

            // Adjust to filter by user on client side if API doesn't filter
            let allBookings = bRes.data.results ?? bRes.data ?? [];
            if (user?.id) {
                allBookings = allBookings.filter((b: any) => b.booked_by === user.id);
            }
            setBookings(allBookings);

            setRooms(rRes.data.results ?? rRes.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setHeader({
            title: "Room Bookings",
            subtitle: "Request rooms for extra classes or events"
        });
        if (user) fetchAll();
        return () => setHeader(null);
    }, [setHeader, user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Combine date and time
            const startTimeStr = `${form.date}T${form.start_time}:00Z`;
            const endTimeStr = `${form.date}T${form.end_time}:00Z`;

            await roomBookingsService.create({
                room: form.room,
                purpose: form.purpose,
                start_time: startTimeStr,
                end_time: endTimeStr,
                booked_by: user?.id
            });

            toast.success("Booking request submitted");
            setFormDialog(false);
            setForm({ room: "", purpose: "", date: "", start_time: "", end_time: "" });
            fetchAll();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to submit request");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex justify-end"><Skeleton className="h-10 w-32" /></div>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Booking Requests</h1>
                <Button onClick={() => setFormDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Request Room
                </Button>
            </div>

            {bookings.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border rounded-xl border-dashed bg-card/50">
                    <Building className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>You haven't requested any room bookings.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(booking => {
                        const start = new Date(booking.start_time);
                        const end = new Date(booking.end_time);
                        const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                        const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        return (
                            <div key={booking.id} className="p-4 border rounded-xl bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4" style={{
                                borderLeftColor: booking.status === 'approved' ? 'var(--emerald-500)' : booking.status === 'rejected' ? 'var(--rose-500)' : 'var(--amber-500)'
                            }}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{booking.room_name || booking.room}</h3>
                                        <Badge variant={booking.status === "approved" ? "default" : booking.status === "rejected" ? "destructive" : "secondary"}>
                                            {booking.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground break-words">{booking.purpose}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium pt-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{dateStr} • {timeStr}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={formDialog} onOpenChange={setFormDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Room Booking</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Room</Label>
                            {rooms.length > 0 ? (
                                <Select value={form.room} onValueChange={(v) => setForm(prev => ({ ...prev, room: v }))} required>
                                    <SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name || r.room_number || r.id}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={form.room}
                                    onChange={(e) => setForm(prev => ({ ...prev, room: e.target.value }))}
                                    placeholder="Enter Room ID or Name"
                                    required
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={form.start_time}
                                    onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={form.end_time}
                                    onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Purpose</Label>
                            <Input
                                value={form.purpose}
                                onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                                placeholder="e.g. Extra Class, Department Meeting"
                                required
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setFormDialog(false)} disabled={saving}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
