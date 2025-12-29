import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  patient: { full_name: string } | null;
  staff: { full_name: string } | null;
  service: { name: string } | null;
}

interface Staff {
  id: string;
  full_name: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, view]);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from("staff")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name");
    setStaff(data || []);
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    let startDate: Date, endDate: Date;

    if (view === "day") {
      startDate = currentDate;
      endDate = currentDate;
    } else if (view === "week") {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        duration_minutes,
        notes,
        patient:patients(full_name),
        staff:staff(full_name),
        service:services(name)
      `)
      .gte("appointment_date", format(startDate, "yyyy-MM-dd"))
      .lte("appointment_date", format(endDate, "yyyy-MM-dd"))
      .order("appointment_time", { ascending: true });

    if (!error) {
      setAppointments(data || []);
    }
    setIsLoading(false);
  };

  const navigate = (direction: "prev" | "next") => {
    if (view === "day") {
      setCurrentDate(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const filteredAppointments = useMemo(() => {
    if (selectedStaff === "all") return appointments;
    return appointments.filter(apt => apt.staff?.full_name === staff.find(s => s.id === selectedStaff)?.full_name);
  }, [appointments, selectedStaff, staff]);

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter(apt => apt.appointment_date === format(date, "yyyy-MM-dd"));
  };

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
          {day}
        </div>
      ))}
      {monthDays.map(day => {
        const dayAppointments = getAppointmentsForDay(day);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, currentDate);

        return (
          <div
            key={day.toISOString()}
            className={`min-h-[100px] p-1 border rounded-lg ${
              isToday ? "bg-primary/10 border-primary" : "border-border"
            } ${!isCurrentMonth ? "opacity-40" : ""}`}
          >
            <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
              {format(day, "d")}
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map(apt => (
                <div
                  key={apt.id}
                  className={`text-xs p-1 rounded truncate ${statusColors[apt.status] || "bg-muted"}`}
                >
                  {apt.appointment_time.slice(0, 5)} - {apt.patient?.full_name || "N/A"}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground">+{dayAppointments.length - 3} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="overflow-auto">
      <div className="grid grid-cols-8 min-w-[800px]">
        <div className="border-b border-r p-2"></div>
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className={`border-b p-2 text-center ${isSameDay(day, new Date()) ? "bg-primary/10" : ""}`}
          >
            <div className="font-medium">{format(day, "EEE")}</div>
            <div className={`text-2xl ${isSameDay(day, new Date()) ? "text-primary" : ""}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
        {timeSlots.map(time => (
          <>
            <div key={time} className="border-r p-2 text-sm text-muted-foreground">
              {time}
            </div>
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsForDay(day).filter(
                apt => apt.appointment_time.startsWith(time.slice(0, 2))
              );
              return (
                <div key={`${day.toISOString()}-${time}`} className="border-b border-r p-1 min-h-[60px]">
                  {dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1 rounded mb-1 ${statusColors[apt.status] || "bg-muted"}`}
                    >
                      <div className="font-medium truncate">{apt.patient?.full_name}</div>
                      <div className="truncate">{apt.service?.name}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDay(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
          <p className="text-muted-foreground">{dayAppointments.length} appointments</p>
        </div>
        <div className="grid gap-3">
          {timeSlots.map(time => {
            const slotAppointments = dayAppointments.filter(
              apt => apt.appointment_time.startsWith(time.slice(0, 2))
            );
            return (
              <div key={time} className="flex gap-4">
                <div className="w-20 text-sm text-muted-foreground font-medium">{time}</div>
                <div className="flex-1 min-h-[60px] border-l pl-4">
                  {slotAppointments.length === 0 ? (
                    <div className="h-full border border-dashed rounded-lg" />
                  ) : (
                    <div className="space-y-2">
                      {slotAppointments.map(apt => (
                        <Card key={apt.id} className={statusColors[apt.status]}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{apt.patient?.full_name}</div>
                                <div className="text-sm">{apt.service?.name}</div>
                                <div className="text-sm flex items-center gap-2 mt-1">
                                  <User className="w-3 h-3" />
                                  {apt.staff?.full_name || "Unassigned"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {apt.appointment_time.slice(0, 5)}
                                </div>
                                <div className="text-xs">{apt.duration_minutes} min</div>
                                <Badge variant="outline" className="mt-1">{apt.status}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar & Scheduling</h1>
            <p className="text-muted-foreground">View and manage appointments</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={(v) => setView(v as any)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg">
              {view === "day" && format(currentDate, "MMMM d, yyyy")}
              {view === "week" && `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`}
              {view === "month" && format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading calendar...</div>
            ) : (
              <>
                {view === "month" && renderMonthView()}
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CalendarPage;
