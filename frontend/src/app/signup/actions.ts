
// src/app/signup/actions.ts
'use server';

import { z } from 'zod';
import { registerUser, type RegistrationResult, type UserRole } from '@/lib/db';

export interface SignupActionResponse {
  success: boolean;
  message: string;
  isPendingApproval?: boolean;
  redirectTo?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

// Schema for data coming FROM THE OWNER CLIENT (lowercase role, no role field needed)
const ownerSignupFormSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6, { message: "تأكيد كلمة المرور مطلوب." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type OwnerSignupFormDataType = z.infer<typeof ownerSignupFormSchema>;

export async function ownerSignupUserAction(
  formData: OwnerSignupFormDataType
): Promise<SignupActionResponse> {
  console.log("[SignupAction JSON_DB] Start: ownerSignupUserAction called");
  console.log("[SignupAction JSON_DB] Received formData:", { name: formData.name, email: formData.email });

  console.log("[SignupAction JSON_DB] Starting data validation...");
  const validationResult = ownerSignupFormSchema.safeParse(formData);
  console.log("[SignupAction JSON_DB] Data validation completed. Success:", validationResult.success);


  if (!validationResult.success) {
    console.error("[SignupAction JSON_DB] Owner data validation failed:", validationResult.error.flatten().fieldErrors);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(validationResult.error.flatten().fieldErrors)) {
        if (value) fieldErrors[key] = value;
    }
    return {
      success: false,
      message: "البيانات المدخلة غير صالحة. يرجى التحقق من الحقول.",
      fieldErrors: fieldErrors,
    };
  }
  
  console.log("[SignupAction JSON_DB] Validation successful. Calling registerUser...");

  const data = validationResult.data;

  const registrationResult: RegistrationResult = await registerUser({
      name: data.name,
      email: data.email,
      password_input: data.password, 
      role: 'OWNER', // Hardcoded role for this action
  });
  console.log("[SignupAction JSON_DB] registerUser call completed. Result success:", registrationResult.success);

  
  if (!registrationResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    if (registrationResult.errorType === 'email_exists' && registrationResult.message) {
        fieldErrors.email = [registrationResult.message];
    }
    return {
        success: false,
        message: registrationResult.message || "فشل إنشاء حساب المالك.",
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  console.log("[SignupAction JSON_DB] Owner signup successful.");

  return {
    success: true,
    message: registrationResult.message || "تم إنشاء حساب المالك بنجاح!",
    isPendingApproval: false, // Owners are typically active immediately
    redirectTo: "/owner-login" // Redirect to owner login page
  };
}

// Schema for data coming FROM THE ENGINEER CLIENT
const engineerSignupFormSchema = z.object({
  name: z.string().min(3, { message: "الاسم مطلوب (3 أحرف على الأقل)." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }),
  confirmPassword: z.string().min(6, { message: "تأكيد كلمة المرور مطلوب." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

type EngineerSignupFormDataType = z.infer<typeof engineerSignupFormSchema>;

export async function engineerSignupUserAction(
  formData: EngineerSignupFormDataType
): Promise<SignupActionResponse> {
  console.log("[SignupAction JSON_DB] Server Action called for ENGINEER signup:", {
    name: formData.name,
    email: formData.email,
  });

  const validationResult = engineerSignupFormSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error("[SignupAction JSON_DB] Engineer data validation failed:", validationResult.error.flatten().fieldErrors);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(validationResult.error.flatten().fieldErrors)) {
        if (value) fieldErrors[key] = value;
    }
    return {
      success: false,
      message: "البيانات المدخلة غير صالحة. يرجى التحقق من الحقول.",
      fieldErrors: fieldErrors,
    };
  }
  
  const data = validationResult.data;

  const registrationResult: RegistrationResult = await registerUser({
      name: data.name,
      email: data.email,
      password_input: data.password, 
      role: 'ENGINEER', // Hardcoded role for this action
  });

  if (!registrationResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    if (registrationResult.errorType === 'email_exists' && registrationResult.message) {
        fieldErrors.email = [registrationResult.message];
    }
    return {
        success: false,
        message: registrationResult.message || "فشل إنشاء حساب المهندس.",
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  return {
    success: true,
    message: registrationResult.message || "تم إنشاء حساب المهندس بنجاح!",
    isPendingApproval: registrationResult.isPendingApproval, 
    redirectTo: registrationResult.isPendingApproval ? undefined : "/login" // Redirect to engineer login if not pending
  };
}
