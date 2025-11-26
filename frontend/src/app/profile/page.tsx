
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OwnerAppLayout from "@/components/owner/OwnerAppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, KeyRound, Save, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateProfileAction, changePasswordAction, getUserProfile, deleteUserAccountAction } from './actions';
import type { UserDocument, ChangePasswordResult } from '@/lib/db';
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
import { Separator } from '@/components/ui/separator';


const profileSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "كلمة المرور الحالية مطلوبة." }),
  newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." }),
  confirmNewPassword: z.string().min(6, { message: "تأكيد كلمة المرور الجديدة مطلوب." }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "كلمتا المرور الجديدتان غير متطابقتين.",
  path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type UserProfileData = Omit<UserDocument, 'password_hash'>;

export function ProfilePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'loading' | 'success'>('confirm');


  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setError: setProfileError
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    setError: setPasswordError
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const storedId = localStorage.getItem('userId');
      if (storedId) {
        const userProfile = await getUserProfile(storedId);
        if (userProfile) {
          // التأكد من تعيين المعرف بشكل صحيح
          // في MongoDB، المعرف يأتي باسم _id وليس id
          userProfile.id = userProfile._id || storedId;
          setCurrentUser(userProfile);
          resetProfile({
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone || '',
          });
        } else {
          localStorage.clear();
          router.push('/login');
        }
      } else {
        toast({
          title: "غير مصرح به",
          description: "يجب تسجيل الدخول لعرض هذه الصفحة.",
          variant: "destructive"
        });
        router.push('/login');
      }
    };
    fetchUserData();
  }, [router, toast, resetProfile]);

  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentUser) return;
    setIsProfileLoading(true);
    const result = await updateProfileAction({ userId: currentUser.id, ...data });
    setIsProfileLoading(false);

    if (result.success && result.user) {
      toast({ title: "تم تحديث الملف الشخصي بنجاح" });
      const updatedUser = { ...currentUser, name: result.user.name, email: result.user.email, phone: result.user.phone };
      setCurrentUser(updatedUser);
      localStorage.setItem('userName', result.user.name);
      localStorage.setItem('userEmail', result.user.email);
    } else {
      toast({
        title: "فشل تحديث الملف الشخصي",
        description: result.message || "حدث خطأ ما.",
        variant: "destructive"
      });
       if (result.fieldErrors) {
        for (const [key, value] of Object.entries(result.fieldErrors)) {
          if(value) setProfileError(key as keyof ProfileFormValues, { type: 'server', message: value.join(', ')});
        }
      }
    }
  };

  const onPasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    if (!currentUser) return;
    setIsPasswordLoading(true);
    const result: ChangePasswordResult = await changePasswordAction({
      userId: currentUser.id,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setIsPasswordLoading(false);

    if (result.success) {
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      resetPassword();
    } else {
      toast({ title: "فشل تغيير كلمة المرور", description: result.message || "حدث خطأ ما.", variant: "destructive" });
      if (result.errorType === 'invalid_current_password') {
        setPasswordError('currentPassword', { type: 'server', message: result.message });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      console.error("لا يمكن حذف الحساب: المستخدم الحالي غير موجود");
      toast({
        title: "خطأ",
        description: "لا يمكن حذف الحساب: بيانات المستخدم غير متوفرة",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser.id) {
      console.error("لا يمكن حذف الحساب: معرف المستخدم غير موجود");
      toast({
        title: "خطأ",
        description: "لا يمكن حذف الحساب: معرف المستخدم غير متوفر",
        variant: "destructive"
      });
      return;
    }
    
    // استخدام _id بدلاً من id لأن MongoDB يستخدم _id
    const userId = currentUser._id || currentUser.id;
    console.log("جاري حذف حساب المستخدم بالمعرف:", userId);
    setDeleteStep('loading');
    const result = await deleteUserAccountAction(userId);
    if (result.success) {
      setDeleteStep('success');
      setTimeout(() => {
        toast({
          title: "تم تعطيل الحساب",
          description: "تم تعطيل حسابك مع الحفاظ على البيانات لمدة عام واحد. نأسف لمغادرتك.",
        });
        setIsDeleteDialogOpen(false);
        localStorage.clear();
        router.push('/');
      }, 2000);
    } else {
      toast({
        title: "فشل حذف الحساب",
        description: result.message || "حدث خطأ ما.",
        variant: "destructive",
      });
      setDeleteStep('confirm');
      setIsDeleteDialogOpen(false);
    }
  };

  const displayRole = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return 'مالك';
      case 'ENGINEER': return 'مهندس';
      case 'ADMIN': return 'مشرف';
      default: return role || '...';
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6 text-right">
      <div className="profile-header text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 pb-2 border-b-2 border-gray-200">
          الملف الشخصي
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Personal Info Card */}
        <Card className="bg-white/95 shadow-md border-gray-200/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                    <UserCircle className="h-7 w-7 text-app-gold"/>
                    المعلومات الشخصية
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="profileName">الاسم الكامل</Label>
                        <Input id="profileName" {...registerProfile("name")} className="bg-gray-50"/>
                        {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="profileEmail">البريد الإلكتروني</Label>
                        <Input id="profileEmail" type="email" {...registerProfile("email")} className="bg-gray-50" />
                        {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="profileRole">الدور الوظيفي</Label>
                        <Input id="profileRole" readOnly value={displayRole(currentUser.role)} className="bg-gray-200 cursor-not-allowed text-gray-600" />
                    </div>
                    <div>
                        <Label htmlFor="profilePhone">رقم الهاتف (اختياري)</Label>
                        <Input id="profilePhone" {...registerProfile("phone")} placeholder="أدخل رقم هاتفك مع المقدمة الدولية" className="bg-gray-50"/>
                        <p className="text-xs text-gray-500 mt-1">يُستخدم هذا الرقم لإعادة تعيين كلمة المرور.</p>
                        {profileErrors.phone && <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5" disabled={isProfileLoading}>
                        {isProfileLoading ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : <Save className="ms-2 h-5 w-5" />}
                        حفظ التغييرات
                    </Button>
                </form>
            </CardContent>
        </Card>
        
        {/* Change Password Card */}
        <Card className="bg-white/95 shadow-md border-gray-200/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                    <KeyRound className="h-7 w-7 text-app-gold"/>
                    تغيير كلمة المرور
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                        <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} className="bg-gray-50"/>
                        {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <Input id="newPassword" type="password" {...registerPassword("newPassword")} className="bg-gray-50"/>
                        {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="confirmNewPassword">تأكيد كلمة المرور</Label>
                        <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} className="bg-gray-50"/>
                        {passwordErrors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5" disabled={isPasswordLoading}>
                        {isPasswordLoading ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : <KeyRound className="ms-2 h-5 w-5" />}
                        تغيير كلمة المرور
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>

      {/* Danger Zone Section */}
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400 text-2xl font-bold">
            <AlertTriangle className="h-7 w-7"/>
            منطقة الخطر
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-500">
            الإجراءات التالية لا يمكن التراجع عنها. يرجى المتابعة بحذر.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="danger-action pt-4 border-t border-red-200">
                <h3 className="font-bold text-lg text-gray-800">حذف الحساب</h3>
                <p className="text-sm text-gray-600 mb-4">سيتم تعطيل حسابك فوراً، مع الحفاظ على بياناتك ومشاريعك لمدة عام واحد.</p>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="ml-2 h-4 w-4"/>
                        حذف الحساب
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl" className="sm:max-w-md">
                        {deleteStep === 'confirm' && currentUser && (
                            <>
                                <AlertDialogHeader className="text-center items-center space-y-4">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                        <Trash2 className="h-8 w-8 text-red-600" />
                                    </div>
                                    <AlertDialogTitle className="text-2xl font-bold text-gray-800">تأكيد حذف الحساب</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogDescription asChild>
                                    <div className="text-center text-base text-gray-600 space-y-4">
                                        <p>هل أنت متأكد تمامًا؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                                            سيتم تعطيل حسابك: <span className="font-bold">"{currentUser.name}"</span> مع الحفاظ على البيانات لمدة عام.
                                        </div>
                                        <p className="text-xs text-gray-500">يمكنك استعادة حسابك خلال سنة واحدة من تاريخ الحذف.</p>
                                    </div>
                                </AlertDialogDescription>
                                <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-4 pt-4">
                                    <Button onClick={handleDeleteAccount} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 font-bold py-2.5 px-6 rounded-lg">
                                        نعم، أحذف حسابي
                                    </Button>
                                    <AlertDialogCancel className="w-full sm:w-auto mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-800 border-none font-bold py-2.5 px-6 rounded-lg">إلغاء</AlertDialogCancel>
                                </AlertDialogFooter>
                            </>
                        )}
                        {deleteStep === 'loading' && (
                            <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
                                <div className="w-24 h-24 bg-amber-100 rounded-full animate-pulse"></div>
                                <h2 className="text-3xl font-bold text-amber-700">جاري الحذف...</h2>
                                <p className="text-lg text-gray-500">يتم حذف حسابك وبياناتك الآن...</p>
                                <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 w-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        {deleteStep === 'success' && (
                            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center ring-4 ring-green-200">
                                    <Check className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-green-700">تم تعطيل الحساب بنجاح</h2>
                                <p className="text-lg text-gray-500">تم تعطيل حسابك مع الحفاظ على البيانات لمدة عام. سيتم توجيهك الآن.</p>
                            </div>
                        )}
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <OwnerAppLayout>
      <ProfilePageContent />
    </OwnerAppLayout>
  );
}
