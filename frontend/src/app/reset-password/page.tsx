
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { resetPasswordAction, resetPasswordSchema } from './actions';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<Omit<ResetPasswordFormValues, 'token'>>({
    resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
  });
  
  const onSubmit: SubmitHandler<Omit<ResetPasswordFormValues, 'token'>> = async (data) => {
    if (!token) {
      setErrorState("رابط إعادة التعيين غير صالح أو مفقود.");
      return;
    }

    setIsLoading(true);
    setErrorState(null);

    const result = await resetPasswordAction({ ...data, token });
    
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      toast({
        title: "تم تغيير كلمة المرور",
        description: result.message,
        variant: "default",
      });
      setTimeout(() => router.push('/login'), 3000);
    } else {
      toast({
        title: "خطأ",
        description: result.message,
        variant: "destructive",
      });
       if (result.fieldErrors) {
        for (const [fieldName, fieldErrorMessages] of Object.entries(result.fieldErrors)) {
          if (fieldErrorMessages && fieldErrorMessages.length > 0) {
            setError(fieldName as keyof Omit<ResetPasswordFormValues, 'token'>, {
              type: "server",
              message: fieldErrorMessages.join(", "),
            });
          }
        }
      } else {
         setErrorState(result.message);
      }
    }
  };

  if (success) {
    return (
       <div className="text-center space-y-4">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold">تم بنجاح!</h2>
          <p className="text-muted-foreground">تم إعادة تعيين كلمة مرورك بنجاح. سيتم توجيهك الآن إلى صفحة تسجيل الدخول.</p>
          <Button asChild>
            <Link href="/login">تسجيل الدخول الآن</Link>
          </Button>
       </div>
    );
  }

  if (error) {
     return (
       <div className="text-center space-y-4">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold">حدث خطأ</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/forgot-password">طلب رابط جديد</Link>
          </Button>
       </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right">
      <div>
        <Label htmlFor="password">كلمة المرور الجديدة</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-app-red hover:bg-red-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="ms-2 h-5 w-5 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <KeyRound className="ms-2 h-5 w-5" />
            حفظ كلمة المرور الجديدة
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto bg-white/95 shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-app-gold mb-3" />
            <CardTitle className="text-3xl font-bold text-app-red">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              أدخل كلمة المرور الجديدة لحسابك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <ResetPasswordForm />
            </Suspense>
          </CardContent>
           <CardFooter className="flex justify-center mt-4">
            <Link href="/login" className="font-semibold text-app-gold hover:underline">
              العودة إلى تسجيل الدخول
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
