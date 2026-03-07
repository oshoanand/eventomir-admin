"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  User,
  Ticket,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Data Hooks
import {
  useEventsQuery,
  useHostsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  type EventData,
} from "@/data/use-events";

// Initial state matching the new schema
const defaultFormState = {
  title: "",
  category: "",
  price: 0,
  date: "",
  time: "",
  city: "",
  address: "",
  imageUrl: "",
  description: "",
  totalTickets: 0,
  availableTickets: 0,
  status: "active",
  hostId: "none",
};

export default function AdminEventsPage() {
  const { toast } = useToast();

  // React Query Hooks
  const { data: events = [], isLoading: isEventsLoading } = useEventsQuery();
  const { data: hosts = [] } = useHostsQuery();

  const createMutation = useCreateEventMutation();
  const updateMutation = useUpdateEventMutation();
  const deleteMutation = useDeleteEventMutation();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState(defaultFormState);

  // Handlers
  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData(defaultFormState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: EventData) => {
    setEditingEvent(event);
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);
    setFormData({
      title: event.title,
      category: event.category,
      price: event.price,
      city: event.city,
      address: event.address || "",
      imageUrl: event.imageUrl,
      date: formattedDate,
      time: event.time || "",
      description: event.description || "",
      totalTickets: event.totalTickets || 0,
      availableTickets: event.availableTickets || 0,
      status: event.status || "active",
      hostId: event.hostId || "none",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        hostId: formData.hostId === "none" ? null : formData.hostId,
      };

      if (editingEvent) {
        await updateMutation.mutateAsync({
          id: editingEvent.id,
          data: payload,
        });
        toast({ title: "Событие обновлено" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Событие создано" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Событие удалено" });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка удаления" });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto pt-2 pb-10 max-w-7xl">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Управление событиями</CardTitle>
            <CardDescription>
              Добавляйте и редактируйте события для афиши.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить событие
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Организатор</TableHead>
                  <TableHead>Дата и Место</TableHead>
                  <TableHead>Билеты</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isEventsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Событий пока нет.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{event.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {event.category} | {event.price} ₽
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "active" ? "default" : "secondary"
                          }
                        >
                          {event.status === "active" ? "Активно" : event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.host ? (
                          <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <User className="h-4 w-4" /> {event.host.name}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Платформа
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />{" "}
                            {format(new Date(event.date), "dd MMM yyyy", {
                              locale: ru,
                            })}{" "}
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />{" "}
                            {event.city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          {event.availableTickets} / {event.totalTickets}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- CRUD DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Редактировать событие" : "Создать событие"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Название</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Например: Концерт Басты"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-2 p-3 bg-muted/50 rounded-lg border">
              <Label className="flex items-center gap-2 text-primary">
                <User className="h-4 w-4" /> Организатор
              </Label>
              <Select
                value={formData.hostId}
                onValueChange={(val) =>
                  setFormData({ ...formData, hostId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите организатора" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="none"
                    className="italic text-muted-foreground"
                  >
                    Платформа Eventomir
                  </SelectItem>
                  {hosts.map((host) => (
                    <SelectItem key={host.id} value={host.id}>
                      {host.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-2 p-3 bg-muted/50 rounded-lg border">
              <Label>Статус события</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активно (Опубликовано)</SelectItem>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Музыка, Мастер-класс..."
              />
            </div>

            <div className="space-y-2">
              <Label>Цена (₽)</Label>
              <Input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Дата</Label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Время (Отображаемое)</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Город</Label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Москва"
              />
            </div>

            <div className="space-y-2">
              <Label>Точный адрес</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="ул. Ленина 15"
              />
            </div>

            <div className="space-y-2">
              <Label>Всего билетов (Вместимость)</Label>
              <Input
                type="number"
                min="0"
                value={formData.totalTickets}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalTickets: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Доступно билетов</Label>
              <Input
                type="number"
                min="0"
                max={formData.totalTickets}
                value={formData.availableTickets}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableTickets: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Ссылка на обложку (URL)</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Подробности мероприятия..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Сохранение..."
                : editingEvent
                  ? "Сохранить изменения"
                  : "Создать событие"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
