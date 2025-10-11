
// src/app/login/actions.ts
'use server';

import { type LoginActionResponse } from '@/types/auth';
import { loginUser, type LoginResult, type UserDocument } from '@/lib/db'; // Added logAction

export async function loginUserAction(data: { email: string; password_input: string; }): Promise<LoginActionResponse> {
  console.log("[LoginAction JSON_DB - Engineer] Attempting engineer login for email:", data.email);

  const result: LoginResult = await loginUser(data.email, data.password_input);

  if (!result.success || !result.user) {
    console.error("[LoginAction JSON_DB - Engineer] Login failed:", result.message, "ErrorType:", result.errorType);
    const fieldErrors: LoginActionResponse['fieldErrors'] = {};
    let generalMessage = result.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    switch (result.errorType) {
      case "email_not_found":
        fieldErrors.email = [result.message || "البريد الإلكتروني غير مسجل."];
        generalMessage = result.message || "البريد الإلكتروني غير مسجل.";
        break;
      case "invalid_password":
        fieldErrors.password_input = [result.message || "كلمة المرور غير صحيحة."];
        generalMessage = result.message || "كلمة المرور غير صحيحة.";
        break;
      case "account_suspended":
        generalMessage = result.message || "حسابك موقوف. يرجى التواصل مع الإدارة.";
        break;
      case "pending_approval":
        generalMessage = result.message || "حسابك قيد المراجعة. يرجى الانتظار حتى الموافقة عليه.";
        break;
      case "account_deleted":
        generalMessage = result.message || "هذا الحساب تم حذفه.";
        break;
      default:
        break;
    }

    return {
      success: false,
      message: generalMessage,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  const userFromDb = result.user as UserDocument;

  if (userFromDb.role !== 'ENGINEER') {
    console.warn(`[LoginAction JSON_DB - Engineer] Login attempt by non-engineer user: ${data.email}, Role: ${userFromDb.role}`);
    // await logAction('ENGINEER_LOGIN_FAILURE_WRONG_ROLE', 'WARNING', `Login attempt via engineer form by non-engineer user: ${data.email}`, userFromDb.id); // Assuming logAction is defined elsewhere or not needed here
    return {
      success: false,
      message: "هذا النموذج مخصص لدخول المهندسين فقط. يرجى استخدام نموذج الدخول المناسب.",
      fieldErrors: { email: ["غير مصرح لك بالدخول من هذا النموذج."] },
    };
  }

  const userForClient = {
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      role: userFromDb.role,
  };

  // The redirect should be handled client-side after storing user info
  return {
    success: true,
    message: "تم تسجيل دخول المهندس بنجاح!",
    redirectTo: "/engineer/dashboard",
    user: userForClient,
  };
}
