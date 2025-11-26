"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Trash2,
  Edit,
  UserPlus,
  KeyRound,
  UserCheck,
  Search,
  AlertTriangle,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type UserDocument as User,
  deleteUser as dbDeleteUser,
  getUsers,
  suspendUser,
  approveEngineer,
} from "@/lib/db";
import AddUserDialog from "@/components/admin/users/AddUserDialog";
import ResetPasswordDialog from "@/components/admin/users/ResetPasswordDialog";
import EditUserDialog from "@/components/admin/users/EditUserDialog";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsersState] = useState<Omit<User, 'password_hash'>[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFetching, setIsFetching] = useState(true);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<Omit<User, 'password_hash'> | null>(null);

  const [userToDelete, setUserToDelete] = useState<Omit<User, 'password_hash'> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "loading" | "success">(
    "confirm"
  );

  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setAdminUserId(id);
    }
  }, []);

  const refreshUsersFromDb = async () => {
    setIsFetching(true);
    try {
      const usersResponse = await getUsers();
      if (usersResponse.success && usersResponse.users) {
        setUsersState(usersResponse.users ? [...usersResponse.users] : []);
        setTotalUsersCount(usersResponse.users.length);
      } else {
        setUsersState([]);
        setTotalUsersCount(0);
        toast({
          title: "خطأ",
          description: usersResponse.message || "فشل تحميل المستخدمين.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUsersState([]);
      setTotalUsersCount(0);
      toast({
        title: "خطأ فادح",
        description: "حدث خطأ أثناء جلب المستخدمين.",
        variant: "destructive",
      });
      console.error("Error fetching users:", error);
    }
    setIsFetching(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)) &&
        (roleFilter === "all" || user.role === roleFilter) &&
        (statusFilter === "all" || user.status === statusFilter)
    );
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleOpenDeleteDialog = (user: Omit<User, 'password_hash'>) => {
    setUserToDelete(user);
    setDeleteStep("confirm");
    setIsDeleteDialogOpen(true);
  };

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setDeleteStep("loading");

    const result = await dbDeleteUser(userToDelete.id);
    if (result.success) {
      setDeleteStep("success");
      setTimeout(() => {
        setIsDeleteDialogOpen(false);
        refreshUsersFromDb();
      }, 2000);
    } else {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
      setIsDeleteDialogOpen(false);
    }
  }

  const handleOpenResetPasswordDialog = (userId: string, userName: string) => {
    setSelectedUserForPasswordReset({ id: userId, name: userName });
    setIsResetPasswordDialogOpen(true);
  };

  const handleOpenEditUserDialog = (user: Omit<User, 'password_hash'>) => {
    setSelectedUserForEdit(user);
    setIsEditUserDialogOpen(true);
  };

  const handleApproveEngineer = async (userId: string, userName: string) => {
    if (!adminUserId) return;
    const result = await approveEngineer(adminUserId, userId);
    if (result.success) {
      refreshUsersFromDb();
      toast({
        title: "تمت الموافقة على المهندس",
        description: `تم تفعيل حساب المهندس ${userName} وجعله نشطاً.`,
        variant: "default",
      });
    } else {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  };

  const handleSuspendUser = async (userId: string, userName: string) => {
    if (!adminUserId) return;
    const result = await suspendUser(adminUserId, userId);
    if (result.success) {
      refreshUsersFromDb();
      toast({ title: "تم التعامل مع المستخدم", description: `${result.message}`, variant: "default" });
    } else {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  };

  const handleRestoreUser = async (userId: string, userName: string) => {
    if (!adminUserId) return;

    // استيراد دالة استعادة المستخدم
    const { restoreUserAction } = await import('./actions');

    const result = await restoreUserAction({ userId }, adminUserId);
    if (result.success) {
      refreshUsersFromDb();
      toast({ 
        title: "تم استعادة الحساب", 
        description: `تم استعادة حساب ${userName} بنجاح.`,
        variant: "default" 
      });
    } else {
      toast({ title: "خطأ", description: result.message || "فشل استعادة الحساب", variant: "destructive" });
    }
  };

  useEffect(() => {
    refreshUsersFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserAddedOrUpdated = () => {
    refreshUsersFromDb();
    setIsAddUserDialogOpen(false);
    setIsEditUserDialogOpen(false);
  };

  return (
    <>
      <Card className="bg-white/95 shadow-xl w-full" dir="rtl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-app-red">إدارة المستخدمين</CardTitle>
          <CardDescription className="text-gray-600">
            عرض، بحث، وتعديل حسابات المستخدمين في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-right">
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-gray-50">
            <div className="relative flex-grow w-full sm:w-auto">
              <Input
                type="search"
                placeholder="ابحث بالاسم، البريد الإلكتروني..."
                value={searchTerm}
                onChange={handleSearch}
                className="pr-10 bg-white focus:border-app-gold"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter} dir="rtl">
              <SelectTrigger className="w-full sm:w-auto bg-white focus:border-app-gold text-right">
                <SelectValue placeholder="تصفية حسب الدور..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="ENGINEER">مهندس</SelectItem>
                <SelectItem value="OWNER">مالك</SelectItem>
                <SelectItem value="ADMIN">مشرف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter} dir="rtl">
              <SelectTrigger className="w-full sm:w-auto bg-white focus:border-app-gold text-right">
                <SelectValue placeholder="تصفية حسب الحالة..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ACTIVE">نشط</SelectItem>
                <SelectItem value="PENDING_APPROVAL">بانتظار الموافقة</SelectItem>
                <SelectItem value="SUSPENDED">معلق</SelectItem>
                <SelectItem value="DELETED">محذوف</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsAddUserDialogOpen(true)}
              variant="default"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              إضافة مستخدم جديد
            </Button>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center h-64 space-x-3" dir="ltr">
              <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
              <p className="text-lg">جاري تحميل المستخدمين...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-right font-semibold text-gray-700">الاسم</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">الدور</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.role === "ENGINEER"
                              ? "مهندس"
                              : user.role === "OWNER"
                              ? "مالك"
                              : user.role === "ADMIN"
                              ? "مشرف"
                              : "مستخدم عام"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : user.status === "PENDING_APPROVAL"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : user.status === "SUSPENDED"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.status === "ACTIVE"
                                ? "نشط"
                                : user.status === "PENDING_APPROVAL"
                                ? "بانتظار الموافقة"
                                : user.status === "SUSPENDED"
                                ? "معلق"
                                : "محذوف"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center space-x-1 space-x-reverse">
                            {user.role === "ENGINEER" && user.status === "PENDING_APPROVAL" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-100"
                                title="موافقة على المهندس"
                                onClick={() => handleApproveEngineer(user.id, user.name)}
                              >
                                <UserCheck className="h-5 w-5" />
                                <span className="sr-only">موافقة</span>
                              </Button>
                            )}
                            {user.role !== "ADMIN" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={
                                  user.status === "SUSPENDED"
                                    ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                                    : "text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                                }
                                title={user.status === "SUSPENDED" ? "إلغاء تعليق المستخدم" : "تعليق المستخدم"}
                                onClick={() => handleSuspendUser(user.id, user.name)}
                              >
                                <AlertTriangle className="h-5 w-5" />
                                <span className="sr-only">{user.status === "SUSPENDED" ? "إلغاء تعليق" : "تعليق"}</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                              title="تعديل"
                              onClick={() => handleOpenEditUserDialog(user)}
                            >
                              <Edit className="h-5 w-5" />
                              <span className="sr-only">تعديل</span>
                            </Button>
                            {user.role !== "ADMIN" && (
                              user.status === "DELETED" ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                                  title="استعادة الحساب"
                                  onClick={() => handleRestoreUser(user.id, user.name)}
                                >
                                  <RefreshCw className="h-5 w-5" />
                                  <span className="sr-only">استعادة</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                  title="حذف"
                                  onClick={() => handleOpenDeleteDialog(user)}
                                >
                                  <Trash2 className="h-5 w-5" />
                                  <span className="sr-only">حذف</span>
                                </Button>
                              )
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                              title="إعادة تعيين كلمة المرور"
                              onClick={() => handleOpenResetPasswordDialog(user.id, user.name)}
                              disabled={user.role === "ADMIN"}
                            >
                              <KeyRound className="h-5 w-5" />
                              <span className="sr-only">إعادة تعيين كلمة المرور</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          لا يوجد مستخدمون يطابقون معايير البحث أو التصفية.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredUsers.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  يتم عرض {filteredUsers.length} من إجمالي {totalUsersCount} مستخدم.
                </p>
              )}
              {totalUsersCount === 0 && !isFetching && (
                <p className="text-center text-gray-500 py-10">لا يوجد مستخدمون في النظام حالياً.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl" className="sm:max-w-md">
          {deleteStep === "confirm" && userToDelete && (
            <>
              <AlertDialogHeader className="text-center items-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-gray-800">تأكيد الحذف</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription asChild>
                <div className="text-center text-base text-gray-600 space-y-4">
                  <p>هل أنت متأكد أنك تريد حذف هذا المستخدم؟</p>
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                    سيتم حذف المستخدم: <span className="font-bold">"{userToDelete.name}"</span>
                  </div>
                  <p className="text-xs text-gray-500">لا يمكن التراجع عن هذا الإجراء.</p>
                </div>
              </AlertDialogDescription>
              <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-4 pt-4">
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleDeleteUser();
                  }}
                  className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 font-bold py-2.5 px-6 rounded-lg"
                >
                  حذف نهائي
                </Button>
                <AlertDialogCancel className="w-full sm:w-auto mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-800 border-none font-bold py-2.5 px-6 rounded-lg">
                  إلغاء
                </AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
          {deleteStep === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
              <div className="w-24 h-24 bg-amber-100 rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold text-amber-700">جاري الحذف...</h2>
              <p className="text-lg text-gray-500">يتم حذف المستخدم الآن...</p>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-full animate-pulse"></div>
              </div>
            </div>
          )}
          {deleteStep === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center ring-4 ring-green-200">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-700">تم الحذف بنجاح</h2>
              <p className="text-lg text-gray-500">تم حذف المستخدم بنجاح من النظام.</p>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onUserAdded={handleUserAddedOrUpdated}
      />
      {selectedUserForPasswordReset && adminUserId && (
        <ResetPasswordDialog
          isOpen={isResetPasswordDialogOpen}
          onClose={() => {
            setIsResetPasswordDialogOpen(false);
            setSelectedUserForPasswordReset(null);
          }}
          userId={selectedUserForPasswordReset.id}
          userName={selectedUserForPasswordReset.name}
          adminUserId={adminUserId}
        />
      )}
      {selectedUserForEdit && adminUserId && (
        <EditUserDialog
          isOpen={isEditUserDialogOpen}
          onClose={() => {
            setIsEditUserDialogOpen(false);
            setSelectedUserForEdit(null);
          }}
          onUserUpdated={handleUserAddedOrUpdated}
          user={selectedUserForEdit}
          adminUserId={adminUserId}
        />
      )}
    </>
  );
}