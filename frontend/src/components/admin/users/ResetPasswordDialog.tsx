"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, X, Eye, EyeOff, Lock } from "lucide-react";
import { adminResetPasswordAction } from "@/app/admin/users/actions";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." }),
    confirmNewPassword: z.string().min(6, { message: "تأكيد كلمة المرور الجديدة مطلوب." }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "كلمتا المرور الجديدتان غير متطابقتين.",
    path: ["confirmNewPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string | null;
  adminUserId: string;
}

export default function ResetPasswordDialog({
  isOpen,
  onClose,
  userId,
  userName,
  adminUserId,
}: ResetPasswordDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    if (!userId) {
      toast({ 
        title: "خطأ", 
        description: "معرف المستخدم غير متوفر.", 
        variant: "destructive",
        className: "bg-red-100 border-red-400 text-red-700"
      });
      return;
    }
    
    setIsLoading(true);
    const result = await adminResetPasswordAction({ userId, newPassword: data.newPassword }, adminUserId);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "تم بنجاح!",
        description: result.message || `تم تحديث كلمة مرور المستخدم ${userName} بنجاح.`,
        variant: "default",
        className: "bg-green-100 border-green-400 text-green-700"
      });
      onClose();
    } else {
      toast({
        title: "خطأ",
        description: result.message || "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        className: "bg-red-100 border-red-400 text-red-700"
      });
      
      if (result.fieldErrors) {
        for (const [fieldName, fieldErrorMessages] of Object.entries(result.fieldErrors)) {
          if (fieldErrorMessages && fieldErrorMessages.length > 0) {
            setError(fieldName as keyof ResetPasswordFormValues, {
              type: "server",
              message: fieldErrorMessages.join(", "),
            });
          }
        }
      }
    }
  };

  const handleCloseDialog = () => {
    onClose();
  };

  if (!userId || !userName) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        className={cn(
          "sm:max-w-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800",
          "text-amber-900 dark:text-amber-100 p-8 rounded-2xl shadow-lg border border-amber-200 dark:border-amber-700",
          "text-right backdrop-blur-sm"
        )}
      >
        <DialogHeader className="mb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-amber-500 dark:bg-amber-600 rounded-full shadow-md animate-bounce">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              إعادة تعيين كلمة المرور
            </DialogTitle>
            <DialogDescription className="text-amber-700 dark:text-amber-300 text-center">
              للمستخدم: <span className="font-semibold underline decoration-amber-400">{userName}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="newPassword" className="text-sm font-medium text-amber-800 dark:text-amber-200">
              كلمة المرور الجديدة
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                placeholder="أدخل كلمة مرور قوية"
                className="pr-12 pl-4 bg-white dark:bg-amber-900 border-amber-300 dark:border-amber-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-500">
                <Lock className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-4 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
                aria-label={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-amber-800 dark:text-amber-200">
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmNewPassword")}
                placeholder="أعد إدخال كلمة المرور"
                className="pr-12 pl-4 bg-white dark:bg-amber-900 border-amber-300 dark:border-amber-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-500">
                <Lock className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-4 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
                aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <KeyRound className="ml-2 h-5 w-5" />
                  تعيين كلمة المرور
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              className="w-full sm:w-auto font-semibold py-2.5 px-6 rounded-lg border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/50 hover:text-amber-900 dark:hover:text-amber-200 transition-colors duration-300"
            >
              <X className="ml-2 h-5 w-5" />
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}