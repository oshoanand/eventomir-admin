"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  useAdminUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  AdminUser,
  CreateUserData,
} from "@/data/use-user"; // Updated import path based on previous context
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Search,
  Filter,
  ShieldAlert,
  UserCog,
  Shield,
  Headset,
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserManagementPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  // --- React Query Hooks ---
  const { data: users = [], isLoading, isError } = useAdminUsersQuery();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  // --- Local State ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // UI State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Form State
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "customer",
    status: "active",
  });

  const isAdmin = session?.user?.role === "administrator"; // Matches your specific string
  const currentUserId = session?.user?.id;

  // --- Derived State (Filtering) ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.role) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Email и роль обязательны для заполнения",
      });
      return;
    }

    // PASSWORD VALIDATION

    // - If Creating (no editingUser): Password is required.
    // - If Editing (editingUser exists): Password is optional, ONLY validate if user typed something.

    const isCreating = !editingUser;
    const isEditingButTypedPassword =
      editingUser && formData.password && formData.password.length > 0;

    if (isCreating || isEditingButTypedPassword) {
      // SAFE CHECK: Use "formData.password || ''" to satisfy TypeScript
      const password = formData.password || "";

      // Check Length
      if (password.length < 8) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Пароль должен содержать минимум 8 символов",
        });
        return;
      }

      // Check Uppercase
      if (!/[A-Z]/.test(password)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description:
            "Пароль должен содержать хотя бы одну заглавную букву (A-Z)",
        });
        return;
      }
    }

    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: formData,
        });
        toast({
          title: "Успешно",
          description: "Данные пользователя обновлены",
          className: "bg-green-600 text-white border-green-700",
        });
      } else {
        if (!formData.password) {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Пароль обязателен для нового пользователя",
          });
          return;
        }
        await createMutation.mutateAsync(formData);
        toast({
          title: "Успешно",
          description: "Новый пользователь создан",
          className: "bg-green-600 text-white border-green-700",
        });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить изменения",
      });
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.id === currentUserId) return;
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.email}?`))
      return;

    try {
      await deleteMutation.mutateAsync(user.id);
      toast({
        title: "Удалено",
        description: "Пользователь был удален из системы",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // --- Icons helper ---
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrator":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "support":
        return <Headset className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-slate-500" />;
    }
  };

  // --- Render ---

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500 gap-4">
        <ShieldAlert className="h-16 w-16" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Ошибка доступа</h2>
          <p className="text-muted-foreground">
            Не удалось загрузить пользователей. Проверьте права доступа.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground mt-1">
            Управление учетными записями, ролями и доступами.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Добавить
          </Button>
        )}
      </div>

      {/* --- Filters & Stats Toolbar --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или email..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Роль" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="administrator">Администраторы</SelectItem>
              <SelectItem value="support">Поддержка</SelectItem>
              <SelectItem value="customer">Заказчики</SelectItem>
              <SelectItem value="performer">Исполнители</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Найдено:{" "}
          <span className="font-medium text-foreground">
            {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* --- Main Data Table --- */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Дата регистрации
                  </TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Действия</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <UserCog className="h-10 w-10 opacity-20" />
                        <p>Пользователи не найдены.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border cursor-pointer">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                            />
                            <AvatarFallback>
                              {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium flex items-center gap-2">
                              {user.name || "Без имени"}
                              {user.id === currentUserId && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-4 px-1"
                                >
                                  Вы
                                </Badge>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 pr-3 font-normal ${
                            user.role === "administrator"
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                              : user.role === "support"
                                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
                                : "border-slate-200 text-slate-700"
                          }`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            user.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-green-600" : "bg-gray-500"}`}
                          />
                          {user.status === "active"
                            ? "Активен"
                            : "Заблокирован"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "ru-RU",
                            )
                          : "—"}
                      </TableCell>

                      {isAdmin && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Действия</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />{" "}
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
                                disabled={user.id === currentUserId}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- Enhanced Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="text-xl">
              {editingUser ? "Редактирование профиля" : "Новый пользователь"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Обновите информацию о пользователе и права доступа."
                : "Создайте нового пользователя для доступа к системе."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Имя пользователя</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email адрес</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingUser}
                  className={editingUser ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    editingUser
                      ? "•••••••• (оставьте пустым)"
                      : "Придумайте надежный пароль"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="role">Роль в системе</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Поддержка</SelectItem>
                    <SelectItem value="administrator">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="status">Статус аккаунта</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />{" "}
                        Активен
                      </span>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />{" "}
                        Заблокирован
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-gray-50/50 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingUser ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
