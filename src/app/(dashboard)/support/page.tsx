"use client";

import { useEffect, useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { formatMobile } from "@/utils/utils";
import {
  Loader2,
  MessageSquare,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Types
interface SupportTicket {
  id: string;
  mobile: string;
  queryType: string;
  message: string;
  photo: string | null;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  adminReply: string | null;
  createdAt: string;
  postedBy?: {
    name: string | null;
  } | null;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState<string>("RESOLVED");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data
  const fetchTickets = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support/all`,
      );
      const data = await res.json();
      setTickets(data);
    } catch (e) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle Resolution
  const handleResolve = async () => {
    if (!selectedTicket) return;
    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedTicket.id,
            status: newStatus,
            adminReply: replyText,
            userMobile: selectedTicket.mobile,
          }),
        },
      );

      if (res.ok) {
        toast.success("Ticket updated & user notified!");
        setSelectedTicket(null); // Close modal
        fetchTickets(); // Refresh list
      } else {
        toast.error("Failed to update ticket");
      }
    } catch (e) {
      toast.error("Error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for Status Badge Color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Queries</h2>
          <p className="text-muted-foreground">
            Manage and resolve user issues.
          </p>
        </div>
        <Button onClick={fetchTickets} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>User Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No active queries found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadge(ticket.status)}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {ticket.postedBy?.name || "Unknown User"}
                        </span>

                        <span className="text-xs text-muted-foreground ">
                          {formatMobile(ticket.mobile)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.queryType}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {ticket.message}
                    </TableCell>
                    <TableCell>
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setReplyText(ticket.adminReply || ""); // Pre-fill if exists
                          setNewStatus(
                            ticket.status === "PENDING"
                              ? "RESOLVED"
                              : ticket.status,
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- DETAIL DIALOG --- */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Review user query and evidence.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="grid gap-6 py-4">
              {/* 1. User Info & Message */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <p className="font-semibold">{selectedTicket.mobile}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Query Type</Label>
                  <p className="font-semibold">{selectedTicket.queryType}</p>
                </div>
                <div className="col-span-2 bg-muted/50 p-3 rounded-lg">
                  <Label className="text-xs text-muted-foreground uppercase">
                    User Message
                  </Label>
                  <p className="text-sm mt-1">{selectedTicket.message}</p>
                </div>
              </div>

              {/* 2. Image Proof */}
              {selectedTicket.photo && (
                <div>
                  <Label className="mb-2 block">Attached Proof</Label>
                  <div className="relative h-48 w-full rounded-lg overflow-hidden border bg-black/5">
                    {/* Using standard img tag for external URLs if Next/Image config is tricky */}
                    <img
                      src={selectedTicket.photo}
                      alt="Proof"
                      className="h-full w-full object-contain"
                    />
                    <a
                      href={selectedTicket.photo}
                      target="_blank"
                      className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-black"
                    >
                      <ExternalLink className="h-3 w-3" /> Open Original
                    </a>
                  </div>
                </div>
              )}

              {/* 3. Admin Action Area */}
              <div className="space-y-4 border-t pt-4 mt-2">
                <div className="flex gap-4">
                  <div className="w-1/3 space-y-2">
                    <Label>Set Status</Label>
                    <Select
                      value={newStatus}
                      onValueChange={setNewStatus}
                      disabled={
                        selectedTicket.status === "RESOLVED" &&
                        !selectedTicket.adminReply
                      } // Just example logic
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-2/3 space-y-2">
                    <Label>Admin Reply (Sent to User)</Label>
                    <Textarea
                      placeholder="Type your resolution note here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
