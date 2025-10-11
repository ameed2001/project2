import { z } from 'zod';

export const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(3, { message: "اسم المشروع مطلوب (3 أحرف على الأقل)." }),
  location: z.string().min(3, { message: "موقع المشروع مطلوب." }),
  description: z.string().min(10, { message: "وصف المشروع مطلوب (10 أحرف على الأقل)." }),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاريخ البدء غير صالح." }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاريخ الانتهاء غير صالح." }),
  status: z.enum(['مخطط له', 'قيد التنفيذ', 'مكتمل', 'مؤرشف']),
  clientName: z.string().min(3, { message: "اسم العميل/المالك مطلوب." }),
  budget: z.number().positive({ message: "الميزانية يجب أن تكون رقمًا موجبًا." }).optional(),
  linkedOwnerEmail: z.string().email({ message: "بريد المالك الإلكتروني غير صالح."}).optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "تاريخ الانتهاء يجب أن يكون بعد أو نفس تاريخ البدء.",
  path: ["endDate"],
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;