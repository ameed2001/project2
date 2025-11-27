"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { Loader2, HardHat, Eye, EyeOff, ArrowLeft, UserPlus, Mail } from 'lucide-react';
import { engineerSignupUserAction, type SignupActionResponse } from './actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const engineerSignupSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6, { message: "تأكيد كلمة المرور مطلوب." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type EngineerSignupFormValues = z.infer<typeof engineerSignupSchema>;

export default function EngineerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPendingApprovalMessage, setShowPendingApprovalMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<EngineerSignupFormValues>({
    resolver: zodResolver(engineerSignupSchema),
  });

  const onSubmit: SubmitHandler<EngineerSignupFormValues> = async (data) => {
    setIsLoading(true);
    setShowPendingApprovalMessage(false);
    const result: SignupActionResponse = await engineerSignupUserAction(data);
    setIsLoading(false);

    if (result.success) {
      reset();
      if (result.isPendingApproval) {
        toast({
          title: "تم التسجيل بنجاح",
          description: "حسابك كمهندس قيد المراجعة. يرجى مراجعة الملاحظة الظاهرة.",
          variant: "default",
        });
        setShowPendingApprovalMessage(true);
      } else {
        toast({
          title: "تم إنشاء الحساب",
          description: result.message || "تم إنشاء حساب المهندس بنجاح!",
          variant: "default",
        });
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          router.push('/login');
        }
      }
    } else {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: result.message || "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      if (result.fieldErrors) {
        for (const [fieldName, fieldErrorMessages] of Object.entries(result.fieldErrors)) {
          if (fieldErrorMessages && fieldErrorMessages.length > 0) {
            setError(fieldName as keyof EngineerSignupFormValues, {
              type: "server",
              message: fieldErrorMessages.join(", "),
            });
          }
        }
      }
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-250px)] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">

          <div className="p-8 md:p-12 text-right flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <HardHat className="mx-auto h-12 w-12 text-app-gold mb-3" />
                <h1 className="text-3xl font-bold text-app-red">إنشاء حساب مهندس</h1>
                <p className="text-gray-600 mt-1">انضم إلينا للوصول إلى أدوات هندسية متكاملة.</p>
              </div>

              {showPendingApprovalMessage ? (
                <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 text-blue-700">
                  <AlertTitle className="font-semibold">حسابك قيد المراجعة</AlertTitle>
                  <AlertDescription>
                    شكرًا على تسجيلك كمهندس. سيتم مراجعة حسابك من قبل مدير المنصة لتفعيله.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative mt-1">
                      <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="name" {...register("name")} className="pr-10" placeholder="مثال: علي محمد" />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input id="email" type="email" {...register("email")} className="pr-10" placeholder="engineer@example.com" />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="pl-10" placeholder="********" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} className="pl-10" placeholder="********" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="ml-2 h-5 w-5" />إنشاء حساب مهندس</>}
                  </Button>
                </form>
              )}

              <div className="text-center text-sm text-gray-600 mt-6 space-y-2">
                <p>
                  لديك حساب بالفعل؟{' '}
                  <Link href="/login" className="font-semibold text-app-gold hover:underline">
                    تسجيل الدخول
                  </Link>
                </p>
                <p>
                  هل أنت مالك مشروع؟{' '}
                  <Link href="/owner-signup" className="font-semibold text-blue-600 hover:underline">
                    إنشاء حساب مالك
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex relative items-center justify-center p-12 bg-slate-900 text-white">
            <div className="absolute inset-0">
              <Image
                src="/signup-bg.jpg"
                alt="خلفية هندسية"
                fill
                className="object-cover opacity-10"
                data-ai-hint="engineering blueprint"
              />
            </div>
            <div className="relative z-10 text-right">
              <h2 className="text-4xl font-bold mb-4">أدواتك الهندسية في مكان واحد</h2>
              <p className="text-gray-300 mb-8 max-w-md">
                قم بإدارة مشاريعك، وحساب الكميات بدقة، والتواصل مع المالكين بكل سهولة من خلال لوحة تحكم متكاملة.
              </p>
              <Button variant="outline" asChild className="bg-transparent border-app-gold text-app-gold hover:bg-app-gold hover:text-slate-900">
                <Link href="/">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  العودة إلى الرئيسية
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
