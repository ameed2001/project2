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
import { Loader2, Home, Eye, EyeOff, User, Mail, CheckCircle, ArrowLeft, UserPlus, Shield } from 'lucide-react';
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
      <div className="min-h-[calc(100vh-250px)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white border border-slate-200">

          {/* Right side - The Form */}
          <div className="bg-slate-50 p-8 md:p-12 text-right flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-app-red/10 rounded-full mb-4">
                <Home className="h-8 w-8 text-app-red" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">إنشاء حساب مالك مشروع</h1>
              <p className="text-slate-600 mt-3 text-lg">انضم إلينا لمتابعة مشروعك بكل سهولة وشفافية.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium">الاسم الكامل</Label>
                <div className="relative mt-2">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="name" {...register("name")} className="pr-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="مثال: أحمد عبدالله" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700 font-medium">البريد الإلكتروني</Label>
                <div className="relative mt-2">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input id="email" type="email" {...register("email")} className="pr-10 border-slate-300 focus:border-app-red focus:ring-app-red text-lg py-3" placeholder="owner@example.com" />
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
                {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="ml-2 h-5 w-5" />إنشاء حساب مالك</>}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600 mt-8 space-y-2">
              <p>
                لديك حساب بالفعل؟{' '}
                <Link href="/owner-login" className="font-semibold text-green-700 hover:text-green-600 hover:underline transition-all">
                  تسجيل الدخول
                </Link>
              </p>
              <p>
                هل أنت مهندس؟{' '}
                <Link href="/signup" className="font-semibold text-blue-600 hover:underline transition-all">
                  إنشاء حساب مهندس
                </Link>
              </p>
            </div>
          </div>

          {/* Left side - The branding */}
          <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-app-red via-slate-900 to-slate-800 text-white">
            <div className="absolute inset-0">
              <Image
                src="/owner-signup-bg.jpg"
                alt="خلفية معمارية"
                fill
                className="object-cover opacity-20"
                data-ai-hint="modern architecture house"
              />
            </div>
            <div className="relative z-10 text-right">
              <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">متابعة مشروعك أصبحت أسهل</h2>
              <p className="text-gray-300 mb-10 max-w-md text-lg leading-relaxed">
                امتلك رؤية كاملة وشفافية تامة على كل تفاصيل مشروعك الإنشائي من خلال منصتنا، المصممة خصيصًا لك.
              </p>
              <ul className="space-y-5">
                {ownerBenefits.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 transition-transform duration-200 hover:scale-105">
                    <item.icon className="h-7 w-7 text-app-gold mt-1 flex-shrink-0" />
                    <span className="text-xl">{item.text}</span>
                  </li>
                ))}
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