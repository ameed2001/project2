
'use server';

import { type LoginActionResponse } from '@/types/auth';
import { loginUser, type LoginResult } from '@/lib/db';

export async function adminLoginAction(data: { email: string; password_input: string; }): Promise<LoginActionResponse> {
  console.log("[AdminLoginAction] Attempting admin login for email:", data.email);

  const result: LoginResult = await loginUser(data.email, data.password_input);

  if (!result.success || !result.user) {
    return {
      success: false,
      message: result.message || "بيانات اعتماد المسؤول غير صحيحة.",
      fieldErrors: { email: [result.message || "بيانات اعتماد المسؤول غير صحيحة."] },
    };
  }

  if (result.user.role !== 'ADMIN') {
    return {
      success: false,
      message: "غير مصرح لك بالدخول من نموذج المسؤول.",
      fieldErrors: { email: ["حسابك ليس مسؤولاً."] },
    };
  }

  return {
    success: true,
    message: "تم تسجيل دخول المسؤول بنجاح!",
    redirectTo: "/admin",
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  };
}
