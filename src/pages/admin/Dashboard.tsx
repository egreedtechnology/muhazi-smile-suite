import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  UserPlus,
  CalendarPlus,
  Receipt,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingAppointments: number;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient: { full_name: string; phone: string } | null;
  service: { name: string } | null;
  staff: { full_name: string } | null;
}

export default function Dashboard() {
  const { user, roles } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
  });
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

    // Fetch today's appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patient:patients(full_name, phone),
        service:services(name),
        staff:staff(full_name)
      `)
      .eq("appointment_date", today)
      .order("appointment_time");

    if (!appointmentsError && appointments) {
      setTodaysAppointments(appointments as unknown as Appointment[]);
      setStats((prev) => ({
        ...prev,
        todayAppointments: appointments.length,
      }));
    }

    // Fetch total patients
    const { count: patientsCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    // Fetch pending appointments
    const { count: pendingCount } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Fetch monthly revenue
    const { data: monthlyPayments } = await supabase
      .from("payments")
      .select("amount")
      .gte("payment_date", startOfMonth);

    const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      todayAppointments: appointments?.length || 0,
      totalPatients: patientsCount || 0,
      monthlyRevenue,
      pendingAppointments: pendingCount || 0,
    });

    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);
    
    fetchDashboardData();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/patients">
                <UserPlus className="w-4 h-4 mr-2" />
                New Patient
              </Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/admin/appointments">
                <CalendarPlus className="w-4 h-4 mr-2" />
                New Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-3xl font-bold">{stats.todayAppointments}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">{stats.totalPatients}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold">{stats.monthlyRevenue.toLocaleString()} RWF</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Appointments
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : todaysAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">
                          {appointment.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service?.name} • Dr. {appointment.staff?.full_name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(appointment.status)}
                      {appointment.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/appointments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Schedule Appointment</p>
                  <p className="text-sm text-muted-foreground">Book a new appointment</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/patients">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Register Patient</p>
                  <p className="text-sm text-muted-foreground">Add a new patient</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/invoices">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Create Invoice</p>
                  <p className="text-sm text-muted-foreground">Generate a new invoice</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
