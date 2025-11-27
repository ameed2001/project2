"use client";

import { useState, useEffect } from 'react';
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

import { Loader2, HardHat, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';
import { loginUserAction } from './actions';
import { type LoginActionResponse } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password_input: z.string().min(1, { message: "كلمة المرور مطلوبة." }),
});

type EngineerLoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (userRole === 'ENGINEER') {
      toast({
        title: "تم تسجيل الدخول بالفعل",
        description: `مرحباً ${userName || 'بعودتك'} أيها المهندس! جاري توجيهك...`,
        variant: "default",
      });
      router.push('/engineer/dashboard');
    }
  }, [router, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<EngineerLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password_input: "",
    }
  });

  const onSubmit: SubmitHandler<EngineerLoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result: LoginActionResponse = await loginUserAction(data);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "تسجيل دخول المهندس",
          description: result.message || "مرحباً بعودتك!",
          variant: "default",
        });
        reset();

        if (result.user) {
          localStorage.setItem('userName', result.user.name);
          localStorage.setItem('userRole', result.user.role);
          localStorage.setItem('userEmail', result.user.email);
          localStorage.setItem('userId', result.user.id);
        }

        setTimeout(() => {
          if (result.redirectTo) {
            router.push(result.redirectTo);
          } else {
            router.push('/engineer/dashboard');
          }
        }, 50);
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          variant: "destructive",
        });

        if (result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            if (messages && messages.length > 0) {
              const errorKey = fieldName === 'password' ? 'password_input' : fieldName;
              setError(errorKey as keyof EngineerLoginFormValues, {
                type: "server",
                message: messages.join(", "),
              });
            }
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Engineer login error:", error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-250px)] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
          {/* Right side - The Form */}
          <div className="p-8 md:p-12 text-right flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <HardHat className="mx-auto h-12 w-12 text-app-gold mb-3" />
                <h1 className="text-3xl font-bold text-app-red">تسجيل دخول المهندس</h1>
                <p className="text-gray-600 mt-1">أدخل بياناتك للوصول إلى أدواتك الهندسية.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="engineer@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password_input">كلمة المرور</Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                      هل نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <Input id="password_input" type={showPassword ? "text" : "password"} {...register("password_input")} placeholder="********" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password_input && <p className="text-red-500 text-xs mt-1">{errors.password_input.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="ml-2 h-5 w-5" />}
                  {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
                </Button>
              </form>
              <div className="text-center text-sm text-gray-600 mt-6 space-y-2">
                <p>
                  ليس لديك حساب؟{' '}
                  <Link href="/signup" className="font-semibold text-app-gold hover:underline">
                    إنشاء حساب مهندس
                  </Link>
                </p>
                <p>
                  هل أنت مالك مشروع؟{' '}
                  <Link href="/owner-login" className="font-semibold text-blue-600 hover:underline">
                    تسجيل الدخول كمالك
                  </Link>
                </p>
              </div>
            </div>
          </div>
          {/* Left side - The branding */}
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
