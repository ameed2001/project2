
"use server";

import { z } from 'zod';
import { registerUser, type UserRole, adminResetUserPassword as dbAdminResetUserPassword, updateUser as dbUpdateUser } from '@/lib/db';
import type { SignupActionResponse } from '@/app/signup/actions'; 
import type { AdminUserUpdateResult } from '@/lib/db';

// Schema for admin creating a user - very similar to signup
const adminCreateUserSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
  role: z.enum(['ADMIN', 'ENGINEER', 'OWNER'], { required_error: "الدور مطلوب." }),
});

type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;

export async function adminCreateUserAction(
  data: AdminCreateUserFormValues
): Promise<SignupActionResponse> {
  console.log("[AdminCreateUserAction] Attempting to create user by admin:", data.email, "Role:", data.role);

  const registrationResult = await registerUser({
    name: data.name,
    email: data.email,
    password_input: data.password,
    role: data.role as UserRole,
    status: data.role === 'OWNER' ? 'ACTIVE' : undefined, // Set status to ACTIVE for OWNER role, otherwise let registerUser decide (likely PENDING_APPROVAL for ENGINEER)
  });

  if (!registrationResult.success) {
    return {
      success: false,
      message: registrationResult.message || "فشل إنشاء حساب المستخدم.",
      fieldErrors: registrationResult.errorType === 'email_exists' && registrationResult.message 
        ? { email: [registrationResult.message] } 
        : undefined,
    };
  }

  return {
    success: true,
    message: registrationResult.message || "تم إنشاء حساب المستخدم بنجاح.",
  };
}

// Schema for admin resetting a user's password
const adminResetPasswordSchema = z.object({
  userId: z.string().min(1, { message: "معرف المستخدم مطلوب." }),
  newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." }),
});

type AdminResetPasswordFormValues = z.infer<typeof adminResetPasswordSchema>;

interface AdminResetPasswordActionResponse {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function adminResetPasswordAction(
  data: AdminResetPasswordFormValues,
  adminUserId: string 
): Promise<AdminResetPasswordActionResponse> {
  console.log(`[AdminResetPasswordAction] Admin ${adminUserId} attempting to reset password for user ID: ${data.userId}`);

  const result = await dbAdminResetUserPassword(adminUserId, data.userId, data.newPassword);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "فشل إعادة تعيين كلمة المرور.",
    };
  }

  return {
    success: true,
    message: result.message || "تم إعادة تعيين كلمة مرور المستخدم بنجاح.",
  };
}

// Schema for admin updating a user's details
const adminUpdateUserSchema = z.object({
  userId: z.string().min(1, { message: "معرف المستخدم مطلوب." }),
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).optional(), // Email is optional for update
  // Role updates can be handled separately or added here if needed
});

export type AdminUpdateUserFormValues = z.infer<typeof adminUpdateUserSchema>;


export async function adminUpdateUserAction(
  data: AdminUpdateUserFormValues,
  adminUserId: string // For logging
): Promise<AdminUserUpdateResult> {
  console.log(`[AdminUpdateUserAction] Admin ${adminUserId} attempting to update user ID: ${data.userId}`);
  
  const updates: Partial<Omit<import('@/lib/db').UserDocument, 'id' | 'password_hash' | 'createdAt'>> = {
    name: data.name,
  };

  if (data.email) {
    updates.email = data.email;
  }

  const result = await dbUpdateUser(data.userId, updates);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "فشل تحديث بيانات المستخدم.",
      fieldErrors: result.fieldErrors,
    };
  }

  return {
    success: true,
    message: result.message || "تم تحديث بيانات المستخدم بنجاح.",
    user: result.user,
  };
}

// Schema for restoring a deleted user account
const restoreUserSchema = z.object({
  userId: z.string().min(1, { message: "معرف المستخدم مطلوب." }),
});

type RestoreUserFormValues = z.infer<typeof restoreUserSchema>;

export async function restoreUserAction(
  data: RestoreUserFormValues,
  adminUserId: string // For logging
): Promise<{ success: boolean, message?: string }> {
  console.log(`[RestoreUserAction] Admin ${adminUserId} attempting to restore user ID: ${data.userId}`);

  // استدعاء دالة استعادة المستخدم من قاعدة البيانات
  const { restoreUser } = await import('@/lib/db');
  const result = await restoreUser(data.userId);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "فشل استعادة حساب المستخدم.",
    };
  }

  return {
    success: true,
    message: result.message || "تم استعادة حساب المستخدم بنجاح.",
  };
}
    