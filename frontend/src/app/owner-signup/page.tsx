"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Eye, EyeOff, User, Mail, CheckCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { ownerSignupUserAction, type SignupActionResponse } from '../signup/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ownerSignupSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6, { message: "تأكيد كلمة المرور مطلوب." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type OwnerSignupFormValues = z.infer<typeof ownerSignupSchema>;

export default function OwnerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<OwnerSignupFormValues>({
    resolver: zodResolver(ownerSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  });

  const onSubmit: SubmitHandler<OwnerSignupFormValues> = async (data) => {
    setIsLoading(true);
    const result: SignupActionResponse = await ownerSignupUserAction(data);
    setIsLoading(false);

    if (result.success) {
      reset();
      toast({
        title: "تم إنشاء حساب المالك",
        description: result.message || "تم إنشاء حساب المالك بنجاح!",
        variant: "default",
      });
      if (result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        router.push('/owner-login');
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
            setError(fieldName as keyof OwnerSignupFormValues, {
              type: "server",
              message: fieldErrorMessages.join(", "),
            });
          }
        }
      }
    }
  };

  const ownerBenefits = [
    { text: "متابعة لحظية لتقدم مشروعك.", icon: CheckCircle },
    { text: "اطلاع دائم على الصور والتقارير.", icon: CheckCircle },
    { text: "شفافية كاملة في التكاليف والكميات.", icon: CheckCircle },
    { text: "تواصل مباشر وسهل مع المهندس المسؤول.", icon: CheckCircle },
  ];

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-250px)] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

          {/* Right side - The Form */}
          <div className="bg-white p-8 md:p-12 text-right">
            <div className="text-center mb-8">
              <Home className="mx-auto h-12 w-12 text-app-gold mb-3" />
              <h1 className="text-3xl font-bold text-app-red">إنشاء حساب مالك مشروع</h1>
              <p className="text-gray-600 mt-2">انضم إلينا لمتابعة مشروعك بكل سهولة وشفافية.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative mt-1">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="name" {...register("name")} className="pr-10" placeholder="مثال: أحمد عبدالله" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative mt-1">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="email" type="email" {...register("email")} className="pr-10" placeholder="owner@example.com" />
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

              <Button type="submit" className="w-full bg-app-red hover:bg-red-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="ml-2 h-5 w-5" />إنشاء حساب مالك</>}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-6 space-y-2">
              <p>
                لديك حساب بالفعل؟{' '}
                <Link href="/owner-login" className="font-semibold text-app-gold hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
              <p>
                هل أنت مهندس؟{' '}
                <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
                  إنشاء حساب مهندس
                </Link>
              </p>
            </div>
          </div>

          {/* Left side - The branding */}
          <div className="hidden lg:flex relative items-center justify-center p-12 bg-slate-900 text-white">
            <div className="absolute inset-0">
              <Image
                src="/owner-signup-bg.jpg"
                alt="خلفية معمارية"
                fill
                className="object-cover opacity-10"
                data-ai-hint="modern architecture house"
              />
            </div>
            <div className="relative z-10 text-right">
              <h2 className="text-4xl font-bold mb-4">متابعة مشروعك أصبحت أسهل</h2>
              <p className="text-gray-300 mb-8 max-w-md">
                امتلك رؤية كاملة وشفافية تامة على كل تفاصيل مشروعك الإنشائي من خلال منصتنا، المصممة خصيصًا لك.
              </p>
              <ul className="space-y-4">
                {ownerBenefits.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <item.icon className="h-6 w-6 text-app-gold mt-1 flex-shrink-0" />
                    <span className="text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild className="mt-10 bg-transparent border-app-gold text-app-gold hover:bg-app-gold hover:text-slate-900">
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
