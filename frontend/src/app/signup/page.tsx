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

import { Loader2, HardHat, Eye, EyeOff, ArrowLeft, UserPlus, Mail, CheckCircle } from 'lucide-react';
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
      <div className="min-h-[calc(100vh-250px)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white border border-slate-200">

          <div className="bg-slate-50 p-8 md:p-12 text-right flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-app-red/10 rounded-full mb-4">
                <HardHat className="h-8 w-8 text-app-red" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">إنشاء حساب مهندس</h1>
              <p className="text-slate-600 mt-3 text-lg">انضم إلينا للوصول إلى أدوات هندسية متكاملة.</p>
            </div>

            {showPendingApprovalMessage ? (
              <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 text-blue-700">
                <AlertTitle className="font-semibold">حسابك قيد المراجعة</AlertTitle>
                <AlertDescription>
                  شكرًا على تسجيلك كمهندس. سيتم مراجعة حسابك من قبل مدير المنصة لتفعيله.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">الاسم الكامل</Label>
                  <div className="relative mt-2">
                    <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input id="name" {...register("name")} className="pr-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="مثال: علي محمد" />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700 font-medium">البريد الإلكتروني</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input id="email" type="email" {...register("email")} className="pr-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="engineer@example.com" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-700 font-medium">كلمة المرور</Label>
                  <div className="relative mt-2">
                    <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="pl-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="********" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 flex items-center px-3 text-slate-500 hover:text-app-red transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">تأكيد كلمة المرور</Label>
                  <div className="relative mt-2">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} className="pl-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="********" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 left-0 flex items-center px-3 text-slate-500 hover:text-app-red transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-app-red hover:bg-red-600 text-white font-bold py-3 text-lg shadow-lg transition-all duration-200" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="ml-2 h-5 w-5" />إنشاء حساب مهندس</>}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-slate-600 mt-8 space-y-2">
              <p>
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="font-semibold text-green-700 hover:text-green-600 hover:underline transition-all">
                  تسجيل الدخول
                </Link>
              </p>
              <p>
                هل أنت مالك مشروع؟{' '}
                <Link href="/owner-signup" className="font-semibold text-blue-600 hover:underline transition-all">
                  إنشاء حساب مالك
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-app-red via-slate-900 to-slate-800 text-white">
            <div className="absolute inset-0">
              <Image
                src="/signup-bg.jpg"
                alt="خلفية هندسية"
                fill
                className="object-cover opacity-20"
                data-ai-hint="engineering blueprint"
              />
            </div>
            <div className="relative z-10 text-right">
              <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">أدواتك الهندسية في مكان واحد</h2>
              <p className="text-gray-300 mb-10 max-w-md text-lg leading-relaxed">
                قم بإدارة مشاريعك، وحساب الكميات بدقة، والتواصل مع المالكين بكل سهولة من خلال لوحة تحكم متكاملة.
              </p>
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-3 transition-transform duration-200 hover:scale-105">
                  <CheckCircle className="h-7 w-7 text-app-gold mt-1 flex-shrink-0" />
                  <span className="text-xl">إدارة مشاريع متعددة بكفاءة عالية</span>
                </li>
                <li className="flex items-start gap-3 transition-transform duration-200 hover:scale-105">
                  <CheckCircle className="h-7 w-7 text-app-gold mt-1 flex-shrink-0" />
                  <span className="text-xl">حساب دقيق للكميات والتكاليف</span>
                </li>
                <li className="flex items-start gap-3 transition-transform duration-200 hover:scale-105">
                  <CheckCircle className="h-7 w-7 text-app-gold mt-1 flex-shrink-0" />
                  <span className="text-xl">تقارير متقدمة وإحصائيات مفصلة</span>
                </li>
                <li className="flex items-start gap-3 transition-transform duration-200 hover:scale-105">
                  <CheckCircle className="h-7 w-7 text-app-gold mt-1 flex-shrink-0" />
                  <span className="text-xl">تواصل مباشر مع المالكين</span>
                </li>
              </ul>
              <Button variant="outline" asChild className="mt-12 bg-transparent border-2 border-app-gold text-app-gold hover:bg-app-gold hover:text-slate-900 shadow-md transition-all duration-300">
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
