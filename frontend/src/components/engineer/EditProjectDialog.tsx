
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';
import { updateProjectAction } from '@/app/engineer/projects/actions';
import { updateProjectSchema, type UpdateProjectFormValues } from '@/app/engineer/projects/schemas';
import type { Project, ProjectStatusType } from '@/lib/db';
import { cn } from '@/lib/utils';

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  project: Project | null;
}

const projectStatusOptions: { value: ProjectStatusType; label: string }[] = [
    { value: 'مخطط له', label: 'مخطط له' },
    { value: 'قيد التنفيذ', label: 'قيد التنفيذ' },
    { value: 'مكتمل', label: 'مكتمل' },
    { value: 'مؤرشف', label: 'مؤرشف' },
];

export default function EditProjectDialog({ isOpen, onClose, onProjectUpdated, project }: EditProjectDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control, setError } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
  });

  useEffect(() => {
    if (project && isOpen) {
      reset({
        projectId: project.id.toString(),
        name: project.name,
        location: project.location,
        description: project.description,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        endDate: new Date(project.endDate).toISOString().split('T')[0],
        status: project.status,
        clientName: project.clientName || '',
        budget: project.budget,
        linkedOwnerEmail: project.linkedOwnerEmail,
      });
    }
  }, [project, isOpen, reset]);

  const onSubmit: SubmitHandler<UpdateProjectFormValues> = async (data) => {
    setIsLoading(true);
    const result = await updateProjectAction(data);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "تم تحديث المشروع",
        description: result.message || "تم تحديث بيانات المشروع بنجاح.",
        variant: "default",
      });
      onProjectUpdated();
      onClose();
    } else {
      toast({
        title: "خطأ في تحديث المشروع",
        description: result.message || "حدث خطأ ما.",
        variant: "destructive",
      });
      if (result.fieldErrors) {
        Object.keys(result.fieldErrors).forEach((key) => {
          setError(key as keyof UpdateProjectFormValues, {
            type: 'server',
            message: result.fieldErrors[key]?.join(', '),
          });
        });
      }
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl text-right">
        <DialogHeader>
          <DialogTitle>تعديل بيانات مشروع: {project.name}</DialogTitle>
          <DialogDescription>
            قم بتحديث التفاصيل الأساسية للمشروع.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <Label htmlFor="edit-name">اسم المشروع</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-description">وصف المشروع</Label>
              <Textarea id="edit-description" {...register("description")} />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="edit-location">موقع المشروع</Label>
              <Input id="edit-location" {...register("location")} />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>
             <div>
              <Label htmlFor="edit-clientName">اسم العميل</Label>
              <Input id="edit-clientName" {...register("clientName")} />
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-linkedOwnerEmail">بريد المالك (اختياري)</Label>
              <Input id="edit-linkedOwnerEmail" type="email" {...register("linkedOwnerEmail")} />
              {errors.linkedOwnerEmail && <p className="text-red-500 text-sm mt-1">{errors.linkedOwnerEmail.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="edit-startDate">تاريخ البدء</Label>
                    <Input id="edit-startDate" type="date" {...register("startDate")} />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                    <Label htmlFor="edit-endDate">تاريخ الانتهاء</Label>
                    <Input id="edit-endDate" type="date" {...register("endDate")} />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="edit-budget">الميزانية (اختياري)</Label>
                <Input id="edit-budget" type="number" {...register("budget", { valueAsNumber: true })} />
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>}
            </div>
            <div>
                <Label htmlFor="edit-status">الحالة</Label>
                 <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                      <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {projectStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
            </div>
             <DialogFooter className="pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin ml-2" /> : <Save className="ml-2" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
