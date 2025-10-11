
"use server";

import { z } from 'zod';
import { updateUser as dbUpdateUser, changeUserPassword as dbChangeUserPassword, findUserById as dbFindUserById, deleteUser as dbDeleteUser, logAction, type UserDocument } from '@/lib/db';
import type { AdminUserUpdateResult, ChangePasswordResult } from '@/lib/db';

const profileUpdateSchema = z.object({
  userId: z.string().min(1, { message: "معرف المستخدم مطلوب." }),
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  phone: z.string().optional(),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export async function updateProfileAction(
  data: ProfileUpdateFormValues
): Promise<AdminUserUpdateResult> {
  console.log(`[UpdateProfileAction] User ${data.userId} attempting to update profile.`);
  
  const updates: Partial<Omit<UserDocument, 'id' | 'password_hash' | 'createdAt'>> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
  };
  
  const result = await dbUpdateUser(data.userId, updates);

  return result;
}

const changePasswordSchema = z.object({
    userId: z.string().min(1, { message: "معرف المستخدم مطلوب." }),
    currentPassword: z.string().min(6, { message: "كلمة المرور الحالية مطلوبة." }),
    newPassword: z.string().min(6, { message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." }),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export async function changePasswordAction(
    data: ChangePasswordFormValues
): Promise<ChangePasswordResult> {
    console.log(`[ChangePasswordAction] User ${data.userId} attempting to change password.`);

    const result = await dbChangeUserPassword(data.userId, data.currentPassword, data.newPassword);

    return result;
}

export async function getUserProfile(userId: string): Promise<Omit<UserDocument, 'password_hash'> | null> {
    console.log(`[GetUserProfile] Fetching profile for user ${userId}`);
    const user = await dbFindUserById(userId);
    return user;
}

export async function deleteUserAccountAction(userId: string): Promise<{ success: boolean, message?: string }> {
  console.log(`[DeleteUserAccountAction] User ${userId} attempting to delete own account.`);
  
  if (!userId) {
    return { success: false, message: "معرف المستخدم غير موجود." };
  }

  const result = await dbDeleteUser(userId);

  if (result.success) {
    await logAction('USER_DELETE_SUCCESS_BY_SELF', 'WARNING', `User ID ${userId} deleted their own account.`, userId);
  } else {
    await logAction('USER_DELETE_FAILURE_BY_SELF', 'ERROR', `Failed self-deletion for user ID ${userId}: ${result.message}`, userId);
  }

  return result;
}

