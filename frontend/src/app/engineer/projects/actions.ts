
'use server';

import { updateProject as dbUpdateProject, type Project } from '@/lib/db';
import { updateProjectSchema, type UpdateProjectFormValues } from './schemas';

export async function updateProjectAction(data: UpdateProjectFormValues): Promise<{ success: boolean; message?: string; project?: Project, fieldErrors?: any }> {
  const validation = updateProjectSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "بيانات غير صالحة.", fieldErrors: validation.error.flatten().fieldErrors };
  }
  
  const { projectId, ...projectUpdates } = validation.data;

  const result = await dbUpdateProject(projectId, projectUpdates);

  if (result.success) {
    return { success: true, message: "تم تحديث المشروع بنجاح.", project: result.project };
  } else {
    return { success: false, message: result.message || "فشل تحديث المشروع." };
  }
}
