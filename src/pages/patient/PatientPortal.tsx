import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, FileText, User, Bell, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PatientAccount {
  id: string;
  patient_id: string;
  patient: {
    full_name: string;
    phone: string;
    email: string | null;
  };
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  service: { name: string } | null;
  staff: { full_name: string } | null;
}

interface TreatmentRecord {
  id: string;
  treatment_date: string;
  diagnosis: string | null;
  treatment_notes: string | null;
  procedures_performed: string[] | null;
  treated_by: { full_name: string } | null;
}

const PatientPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [patientAccount, setPatientAccount] = useState<PatientAccount | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentRecords, setTreatmentRecords] = useState<TreatmentRecord[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [requestType, setRequestType] = useState<"reschedule" | "cancel">("reschedule");
  const [requestReason, setRequestReason] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      await fetchPatientData(session.user.id);
    }
    setIsLoading(false);
  };

  const fetchPatientData = async (userId: string) => {
    // Get patient account
    const { data: account } = await supabase
      .from("patient_accounts")
      .select(`
        id,
        patient_id,
        patient:patients(full_name, phone, email)
      `)
      .eq("user_id", userId)
      .single();

    if (account) {
      setPatientAccount(account as any);
      await Promise.all([
        fetchAppointments(account.patient_id),
        fetchTreatmentRecords(account.patient_id),
      ]);
    }
  };

  const fetchAppointments = async (patientId: string) => {
    const { data } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        notes,
        service:services(name),
        staff:staff(full_name)
      `)
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false });

    setAppointments(data || []);
  };

  const fetchTreatmentRecords = async (patientId: string) => {
    const { data } = await supabase
      .from("treatment_records")
      .select(`
        id,
        treatment_date,
        diagnosis,
        treatment_notes,
        procedures_performed,
        treated_by:staff(full_name)
      `)
      .eq("patient_id", patientId)
      .order("treatment_date", { ascending: false });

    setTreatmentRecords(data || []);
  };

  const handleSubmitRequest = async () => {
    if (!selectedAppointment || !patientAccount) return;

    const { error } = await supabase.from("appointment_requests").insert({
      appointment_id: selectedAppointment.id,
      patient_account_id: patientAccount.id,
      request_type: requestType,
      requested_date: requestType === "reschedule" ? requestedDate : null,
      requested_time: requestType === "reschedule" ? requestedTime : null,
      reason: requestReason,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Your request has been submitted" });
      setRequestDialogOpen(false);
      setRequestReason("");
      setRequestedDate("");
      setRequestedTime("");
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.appointment_date) >= new Date() && apt.status !== "cancelled"
  );

  const pastAppointments = appointments.filter(
    apt => new Date(apt.appointment_date) < new Date() || apt.status === "cancelled"
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-purple-100 text-purple-800",
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="pt-32 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PublicLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <PublicLayout>
        <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <div className="container-custom px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Patient Portal</CardTitle>
                <CardDescription>
                  Sign in to view your appointments and medical records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/patient/login">Sign In</Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/patient/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (!patientAccount) {
    return (
      <PublicLayout>
        <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <div className="container-custom px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Account Not Linked</CardTitle>
                <CardDescription>
                  Your account is not linked to a patient record yet. Please contact the clinic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/contact">Contact Clinic</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container-custom px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {patientAccount.patient.full_name}
            </h1>
            <p className="text-muted-foreground">Manage your appointments and view your records</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{treatmentRecords.length}</p>
                    <p className="text-sm text-muted-foreground">Treatment Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pastAppointments.length}</p>
                    <p className="text-sm text-muted-foreground">Past Visits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="records">Medical Records</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No upcoming appointments</p>
                      <Button asChild className="mt-4">
                        <Link to="/book">Book an Appointment</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingAppointments.map(apt => (
                    <Card key={apt.id}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 h-fit">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{apt.service?.name || "Dental Appointment"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(apt.appointment_date), "EEEE, MMMM d, yyyy")} at {apt.appointment_time.slice(0, 5)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                With: {apt.staff?.full_name || "TBD"}
                              </p>
                              <Badge className={`mt-2 ${statusColors[apt.status]}`}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 md:flex-col">
                            <Dialog open={requestDialogOpen && selectedAppointment?.id === apt.id} onOpenChange={(open) => {
                              setRequestDialogOpen(open);
                              if (open) setSelectedAppointment(apt);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Request Change</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Request Appointment Change</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant={requestType === "reschedule" ? "default" : "outline"}
                                      onClick={() => setRequestType("reschedule")}
                                      className="flex-1"
                                    >
                                      Reschedule
                                    </Button>
                                    <Button
                                      variant={requestType === "cancel" ? "destructive" : "outline"}
                                      onClick={() => setRequestType("cancel")}
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                  </div>

                                  {requestType === "reschedule" && (
                                    <>
                                      <div>
                                        <Label>Preferred Date</Label>
                                        <Input
                                          type="date"
                                          value={requestedDate}
                                          onChange={(e) => setRequestedDate(e.target.value)}
                                          min={format(new Date(), "yyyy-MM-dd")}
                                        />
                                      </div>
                                      <div>
                                        <Label>Preferred Time</Label>
                                        <Input
                                          type="time"
                                          value={requestedTime}
                                          onChange={(e) => setRequestedTime(e.target.value)}
                                        />
                                      </div>
                                    </>
                                  )}

                                  <div>
                                    <Label>Reason</Label>
                                    <Textarea
                                      value={requestReason}
                                      onChange={(e) => setRequestReason(e.target.value)}
                                      placeholder="Please provide a reason for your request..."
                                      rows={3}
                                    />
                                  </div>

                                  <Button onClick={handleSubmitRequest} className="w-full">
                                    Submit Request
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {pastAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No past appointments found.
                    </CardContent>
                  </Card>
                ) : (
                  pastAppointments.map(apt => (
                    <Card key={apt.id}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{apt.service?.name || "Dental Appointment"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "MMMM d, yyyy")} at {apt.appointment_time.slice(0, 5)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              With: {apt.staff?.full_name || "N/A"}
                            </p>
                          </div>
                          <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="records">
              <div className="space-y-4">
                {treatmentRecords.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No medical records found.
                    </CardContent>
                  </Card>
                ) : (
                  treatmentRecords.map(record => (
                    <Card key={record.id}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">
                              {format(new Date(record.treatment_date), "MMMM d, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Treated by: {record.treated_by?.full_name || "N/A"}
                            </p>
                          </div>
                        </div>
                        {record.diagnosis && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Diagnosis:</p>
                            <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.procedures_performed && record.procedures_performed.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Procedures:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.procedures_performed.map((proc, idx) => (
                                <Badge key={idx} variant="secondary">{proc}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.treatment_notes && (
                          <div>
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-muted-foreground">{record.treatment_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PatientPortal;
