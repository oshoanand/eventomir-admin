"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";

// Import the custom hooks
import {
  usePartnershipRequests,
  useApprovePartnership,
  useRejectPartnership,
} from "@/data/use-partner";

export default function AdminPartnersPage() {
  const { toast } = useToast();

  // Data Hook
  const { data: requests, isLoading, error } = usePartnershipRequests();

  // Mutation Hooks
  const approveMutation = useApprovePartnership();
  const rejectMutation = useRejectPartnership();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () =>
        toast({ title: "Успех", description: "Заявка одобрена." }),
      onError: (err) =>
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: err.message,
        }),
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id, {
      onSuccess: () =>
        toast({ title: "Успех", description: "Заявка отклонена." }),
      onError: (err) =>
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: err.message,
        }),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Ожидает
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Одобрен
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Отклонен
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Ошибка загрузки данных: {error.message}
      </div>
    );
  }

  const requestsList = Array.isArray(requests) ? requests : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявки на партнерство</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            Загрузка...
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Дата</TableHead>
                  <TableHead>Имя / Компания</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ресурс</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsList.length > 0 ? (
                  requestsList.map((req) => {
                    // Check if this specific row is currently loading
                    const isApproving =
                      approveMutation.isPending &&
                      approveMutation.variables === req.id;
                    const isRejecting =
                      rejectMutation.isPending &&
                      rejectMutation.variables === req.id;
                    const isRowDisabled =
                      isApproving || isRejecting || req.status !== "PENDING";

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {req.name}
                        </TableCell>
                        <TableCell>{req.email}</TableCell>
                        <TableCell>
                          <a
                            href={req.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {req.website}
                          </a>
                        </TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-right">
                          {req.status === "PENDING" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                onClick={() => handleApprove(req.id)}
                                disabled={isRowDisabled}
                              >
                                {isApproving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Одобрить
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => handleReject(req.id)}
                                disabled={isRowDisabled}
                              >
                                {isRejecting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-1" />
                                )}
                                Отклонить
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Новых заявок пока нет.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
