"use client";

import { useState } from 'react';
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
import { Loader2, KeyRound, MessageSquareText, Mail, Phone } from 'lucide-react';
import { forgotPasswordAction } from './actions';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  phone: z.string().min(10, { message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setIsLoading(true);
    const result = await forgotPasswordAction(data);
    setIsLoading(false);

    // Always show a generic success message for security reasons
    toast({
      title: "تم إرسال التعليمات",
      description: result.message,
      variant: "default",
    });
    
    if (result.success) {
      reset();
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto bg-white/95 shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-app-gold mb-3" />
            <CardTitle className="text-3xl font-bold text-app-red">نسيت كلمة المرور؟</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              أدخل بريدك الإلكتروني المسجل ورقم هاتفك. سنرسل لك رمز إعادة التعيين عبر رسالة نصية (SMS).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right">
              <div>
                <Label htmlFor="email" className="block mb-1.5 font-semibold text-gray-700">البريد الإلكتروني المسجل</Label>
                 <div className="relative">
                    <Input id="email" type="email" {...register("email")} className="bg-white focus:border-app-gold pr-10" placeholder="example@domain.com" />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

               <div>
                <Label htmlFor="phone" className="block mb-1.5 font-semibold text-gray-700">رقم الهاتف (مع المقدمة الدولية)</Label>
                <div className="relative">
                  <Input id="phone" type="tel" {...register("phone")} className="bg-white focus:border-app-gold pr-10" placeholder="+97059XXXXXXX" />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-app-red hover:bg-red-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                  <MessageSquareText className="ms-2 h-5 w-5" />
                  إرسال رمز إعادة التعيين
                  </>
                )}
              </Button>
            </form>
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
