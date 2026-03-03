import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Video,
  VideoOff,
  Users,
  UserX,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string; // Tailwind bg color class for the dot
  extendedProps?: Record<string, unknown>;
};

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: (date?: Date) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filter: any) => void;
}

type ViewMode = "month" | "week" | "day";

export function EventCalendar({
  events,
  onEventClick,
  onDateClick,
  onAddEvent,
  searchQuery,
  onSearchChange,
  onFilterChange,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("week");

  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const title = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MMM dd")} - ${format(end, "MMM dd yyyy")}`;
    }
    return format(currentDate, "MMMM d, yyyy");
  };

  // Filter events for a specific day
  const getEventsForDay = (date: Date) => {
    return events
      .filter((e) => isSameDay(e.start, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  // ─── MONTH VIEW ─────────────────────────────────────────────────────────────
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="flex flex-col h-full rounded-(--radius) border border-border overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-border transition-colors cursor-default",
                  !isSameMonth(day, monthStart) &&
                    "bg-muted/30 text-muted-foreground/70",
                  (i + 1) % 7 === 0 && "border-r-0",
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px]  custom-scrollbar">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className="group flex flex-col gap-0.5 rounded-[calc(var(--radius)-2px)] p-1.5 text-xs overflow-hidden cursor-pointer bg-secondary border border-transparent hover:bg-accent-foreground hover:border-border transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            event.color || "bg-cyan-500",
                          )}
                        />
                        <div className="font-medium text-foreground truncate">
                          {event.title}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground pl-3.5">
                        {format(event.start, "HH:mm")} -{" "}
                        {format(event.end, "HH:mm")}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── WEEK VIEW ──────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, 6),
    });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-background rounded-[var(--radius)] border border-border overflow-hidden shadow-sm">
        <div className="flex border-b border-border">
          <div className="w-16 shrink-0 border-r border-border" />{" "}
          {/* Time column header placeholder */}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="flex-1 py-3 text-center border-r border-border last:border-r-0"
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    isToday(day) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {format(day, "dd EEE")}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex min-h-max">
            {/* Time labels axis */}
            <div className="w-16 shrink-0 border-r border-border bg-background z-20">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-24 relative border-b border-border last:border-b-0"
                >
                  <span className="absolute -top-2.5 left-2 text-[10px] font-medium text-muted-foreground bg-background px-1">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 relative border-r border-border last:border-r-0"
                  onClick={() => onDateClick?.(day)}
                >
                  {/* Grid Lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-24 border-b border-border/50 last:border-b-0 pointer-events-none"
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const startHour =
                      event.start.getHours() + event.start.getMinutes() / 60;
                    const endHour =
                      event.end.getHours() + event.end.getMinutes() / 60;
                    const duration = endHour - startHour;
                    const top = startHour * 96; // 96px per hour (h-24)
                    const height = duration * 96;

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className="absolute left-1.5 right-1.5 rounded-[var(--radius)] p-2.5 text-xs overflow-hidden cursor-pointer border border-border hover:bg-accent-foreground hover:shadow-md transition-all z-10 shadow-sm flex flex-col gap-1.5"
                        style={{
                          top: `${top + 1}px`,
                          height: `${Math.max(height - 2, 28)}px`,
                        }}
                      >
                        <div className="flex items-start gap-1.5">
                          <div className="pt-1">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full flex-shrink-0",
                                event.color || "bg-cyan-500",
                              )}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground line-clamp-2 leading-tight">
                              {event.title}
                            </span>
                            {height > 40 && (
                              <span className="text-[10px] text-muted-foreground mt-1">
                                {format(event.start, "HH:mm")} -{" "}
                                {format(event.end, "HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── DAY VIEW ───────────────────────────────────────────────────────────────
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-background rounded-[var(--radius)] border border-border overflow-hidden shadow-sm">
        <div className="flex border-b border-border py-3 items-center justify-center">
          <div className="font-medium text-foreground uppercase tracking-wider text-sm">
            {format(currentDate, "EEEE, MMMM d")}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="flex">
            <div className="w-20 shrink-0 border-r border-border bg-background z-20">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-28 relative border-b border-border last:border-b-0"
                >
                  <span className="absolute -top-2.5 right-3 text-[20px] font-medium text-muted-foreground bg-background px-1">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                        ? `${hour} AM`
                        : hour === 12
                          ? "12 PM"
                          : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex-1 relative"
              onClick={() => onDateClick?.(currentDate)}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-28 border-b border-border/50 last:border-b-0 pointer-events-none"
                />
              ))}
              {dayEvents.map((event) => {
                const startHour =
                  event.start.getHours() + event.start.getMinutes() / 60;
                const endHour =
                  event.end.getHours() + event.end.getMinutes() / 60;
                const duration = endHour - startHour;
                const top = startHour * 112; // 112px per hour (h-28)
                const height = duration * 112;

                return (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className="absolute left-3 right-6 rounded-[var(--radius)] p-3.5 text-sm overflow-hidden cursor-pointer border border-border hover:bg-accent-foreground hover:shadow-lg transition-all z-10 shadow-sm flex flex-col gap-2"
                    style={{
                      top: `${top + 1}px`,
                      height: `${Math.max(height - 2, 48)}px`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="pt-1.5">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            event.color || "bg-cyan-500",
                          )}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {event.title}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {format(event.start, "HH:mm")} -{" "}
                          {format(event.end, "HH:mm")}
                        </span>
                        {event.extendedProps &&
                          typeof event.extendedProps.description ===
                            "string" && (
                            <span className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {event.extendedProps.description}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between pb-2">
        {/* Left: Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in calendar..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-[260px] pl-9 h-9"
            />
          </div>

          <Select value={view} onValueChange={(v: ViewMode) => setView(v)}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Middle: Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-[var(--radius)] border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8 rounded-[calc(var(--radius)-2px)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8 rounded-[calc(var(--radius)-2px)]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleToday}
            className="h-9 px-4 hover:bg-accent"
          >
            Today
          </Button>

          <div className="flex items-center gap-2 px-4 h-9 border rounded-[var(--radius)] text-sm font-medium text-foreground/90">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {title()}
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 min-h-0 pb-4">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>
    </div>
  );
}
