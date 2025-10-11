
'use server';

import { type LoginActionResponse } from '@/types/auth';
import { loginUser, type LoginResult, type UserDocument, logAction } from '@/lib/db'; // Added logAction

export async function ownerLoginAction(data: { email: string; password_input: string; }): Promise<LoginActionResponse> {
  console.log("[OwnerLoginAction] Attempting owner login for email:", data.email);

  const result: LoginResult = await loginUser(data.email, data.password_input);

  if (!result.success || !result.user) {
    const fieldErrors: LoginActionResponse['fieldErrors'] = {};
    let generalMessage = result.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    switch (result.errorType) {
      case "email_not_found":
        fieldErrors.email = [result.message || "البريد الإلكتروني غير مسجل."];
        break;
      case "invalid_password":
        fieldErrors.password_input = [result.message || "كلمة المرور غير صحيحة."];
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

  const userFromDb = result.user as Omit<UserDocument, 'password_hash'>;

  if (userFromDb.role !== 'OWNER') {
    console.warn(`[OwnerLoginAction] Login attempt by non-owner user: ${data.email}, Role: ${userFromDb.role}`);
    await logAction('OWNER_LOGIN_FAILURE_WRONG_ROLE', 'WARNING', `Login attempt via owner form by non-owner user: ${data.email}`, userFromDb.id);
    return {
      success: false,
      message: "هذا النموذج مخصص لدخول المالكين فقط. يرجى استخدام نموذج الدخول المناسب.",
      fieldErrors: { email: ["غير مصرح لك بالدخول من هذا النموذج."] },
    };
  }
  
  const userForClient = {
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      role: userFromDb.role,
  };

  console.log(`[OwnerLoginAction] Owner login successful for ${userFromDb.email}. Redirecting to /owner/dashboard`);
  return {
    success: true,
    message: "تم تسجيل دخول المالك بنجاح!",
    redirectTo: "/owner/dashboard",
    user: userForClient,
  };
}
