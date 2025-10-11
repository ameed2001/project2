"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UserPlus,
  X,
  Users as UsersIcon,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminCreateUserAction } from '@/app/admin/users/actions';
import type { SignupActionResponse } from '@/app/signup/actions';
import type { UserRole } from '@/lib/db';
import { cn } from '@/lib/utils';

const addUserSchema = z
  .object({
    name: z.string().min(3, { message: 'الاسم مطلوب (3 أحرف على الأقل).' }),
    email: z
      .string()
      .email({ message: 'البريد الإلكتروني غير صالح.' }),
    password: z
      .string()
      .min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'تأكيد كلمة المرور مطلوب.' }),
    role: z.enum(['ADMIN', 'ENGINEER', 'OWNER'], {
      required_error: 'يرجى اختيار الدور.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirmPassword'],
  });

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'مشرف' },
  { value: 'ENGINEER', label: 'مهندس' },
  { value: 'OWNER', label: 'مالك' },
];

export default function AddUserDialog({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  });

  const onSubmit: SubmitHandler<AddUserFormValues> = async (data) => {
    setIsLoading(true);
    const result: SignupActionResponse = await adminCreateUserAction(data);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'تم إضافة المستخدم',
        description: result.message || 'تم إنشاء حساب المستخدم بنجاح.',
      });
      reset();
      onUserAdded();
    } else {
      toast({
        title: 'خطأ في إضافة المستخدم',
        description:
          result.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });

      if (result.fieldErrors) {
        for (const [fieldName, fieldErrorMessages] of Object.entries(
          result.fieldErrors
        )) {
          if (fieldErrorMessages?.length) {
            setError(fieldName as keyof AddUserFormValues, {
              type: 'server',
              message: fieldErrorMessages.join(', '),
            });
          }
        }
      }
    }
  };

  const handleCloseDialog = () => {
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        className={cn(
          'sm:max-w-lg bg-white text-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out text-right'
        )}
      >
        <DialogHeader className="mb-6 flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <UsersIcon className="h-12 w-12 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-extrabold text-center">
            إضافة مستخدم جديد
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-1 text-sm text-center">
            الرجاء تعبئة البيانات التالية بدقة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* الاسم */}
          <div>
            <Label htmlFor="add-name" className="text-sm font-semibold">
              الاسم الكامل
            </Label>
            <div className="relative mt-1">
              <Input
                id="add-name"
                {...register('name')}
                placeholder="مثال: أحمد يوسف"
                className="pr-10 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <Label htmlFor="add-email" className="text-sm font-semibold">
              البريد الإلكتروني
            </Label>
            <div className="relative mt-1">
              <Input
                id="add-email"
                type="email"
                {...register('email')}
                placeholder="user@example.com"
                className="pr-10 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* كلمة المرور */}
          <div>
            <Label htmlFor="add-password" className="text-sm font-semibold">
              كلمة المرور
            </Label>
            <div className="relative mt-1">
              <Input
                id="add-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="********"
                className="pl-10 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <Label
              htmlFor="add-confirmPassword"
              className="text-sm font-semibold"
            >
              تأكيد كلمة المرور
            </Label>
            <div className="relative mt-1">
              <Input
                id="add-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="********"
                className="pl-10 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* الدور */}
          <div>
            <Label htmlFor="add-role" className="text-sm font-semibold">
              الدور
            </Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  dir="rtl"
                >
                  <SelectTrigger className="bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                    <SelectValue placeholder="اختر الدور المناسب" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* الأزرار */}
          <DialogFooter className="pt-6 flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <UsersIcon className="ml-2 h-5 w-5" />
                  إضافة المستخدم
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleCloseDialog}
              className="w-full sm:w-auto border border-gray-300 bg-white hover:bg-red-50 text-gray-800 font-bold py-2.5 rounded-xl transition-all duration-200"
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
