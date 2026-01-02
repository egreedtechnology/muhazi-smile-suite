import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Mail, 
  MailOpen, 
  Phone, 
  Trash2, 
  Eye,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export default function Messages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      setMessages(messages.map(m => 
        m.id === id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m
      ));
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
    if (!message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageToDelete);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      setMessages(messages.filter(m => m.id !== messageToDelete));
    }
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.phone.includes(searchQuery) ||
      (message.email && message.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "unread" && !message.is_read) ||
      (filterStatus === "read" && message.is_read);

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Contact form submissions from visitors
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
            <Button variant="outline" size="icon" onClick={fetchMessages}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All ({messages.length})
                </Button>
                <Button
                  variant={filterStatus === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("unread")}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filterStatus === "read" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("read")}
                >
                  Read ({messages.length - unreadCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              All Messages ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={!message.is_read ? "bg-primary/5" : ""}
                    >
                      <TableCell>
                        {message.is_read ? (
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Mail className="w-4 h-4 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={!message.is_read ? "font-semibold" : ""}>
                          {message.full_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`max-w-[200px] truncate ${!message.is_read ? "font-semibold" : ""}`}>
                          {message.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${message.phone}`} className="hover:text-primary">
                              {message.phone}
                            </a>
                          </div>
                          {message.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${message.email}`} className="hover:text-primary">
                                {message.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(message.created_at), "MMM d, yyyy")}
                          <br />
                          {format(new Date(message.created_at), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setMessageToDelete(message.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <p className="font-medium">{selectedMessage.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>
                    <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>
                    {selectedMessage.email ? (
                      <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                        {selectedMessage.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <p className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`tel:${selectedMessage.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
                {selectedMessage.email && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={`mailto:${selectedMessage.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
