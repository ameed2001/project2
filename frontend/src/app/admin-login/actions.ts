
'use server';

import { type LoginActionResponse } from '@/types/auth';
// Note: The original logic for admin login was hardcoded.
// If you want admin login to use the users in db.json, this needs to change
// to use `loginUser` from `lib/db.ts` and check for 'ADMIN' role.
// For now, restoring the hardcoded version.

const ADMIN_EMAIL = "ameed2001@admin.com"; 
const ADMIN_PASSWORD = "2792001"; 

export async function adminLoginAction(data: { email: string; password_input: string; }): Promise<LoginActionResponse> {
  console.log("[AdminLoginAction] Attempting admin login for email:", data.email);

  if (data.email === ADMIN_EMAIL && data.password_input === ADMIN_PASSWORD) {
    console.log("[AdminLoginAction] Admin login successful for:", data.email);
    
    const adminUser = {
      id: 'admin-hardcoded-001', // This ID is not from db.json
      name: 'مسؤول الموقع',
      email: ADMIN_EMAIL,
      role: 'ADMIN', // Role is ADMIN
    };

    return {
      success: true,
      message: "تم تسجيل دخول المسؤول بنجاح!",
      redirectTo: "/admin",
      user: adminUser,
    };
  } else {
    console.warn("[AdminLoginAction] Admin login failed for:", data.email);
    const fieldErrors: LoginActionResponse['fieldErrors'] = {};
    if (data.email !== ADMIN_EMAIL) {
        fieldErrors.email = ["البريد الإلكتروني للمسؤول غير صحيح."];
    }
    // Ensure the key matches the form field name for password
    if (data.password_input !== ADMIN_PASSWORD && data.email === ADMIN_EMAIL) {
        fieldErrors.password_input = ["كلمة مرور المسؤول غير صحيحة."];
    }
    
    return {
      success: false,
      message: "بيانات اعتماد المسؤول غير صحيحة.",
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : { email: ["بيانات اعتماد المسؤول غير صحيحة."], password_input: [" "] },
    };
  }
}
