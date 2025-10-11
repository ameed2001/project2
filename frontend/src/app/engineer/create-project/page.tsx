"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, MapPin, CalendarRange, HardHat, Building, User, DollarSign, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addProject as dbAddProject, type Project, type ProjectStatusType } from '@/lib/db';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const createProjectSchema = z.object({
  projectName: z.string().min(3, { message: "اسم المشروع مطلوب (3 أحرف على الأقل)." }),
  location: z.string().min(3, { message: "موقع المشروع مطلوب." }),
  description: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاريخ البدء غير صالح." }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "تاريخ الانتهاء غير صالح." }),
  status: z.enum(['مخطط له', 'قيد التنفيذ', 'مكتمل', 'مؤرشف'], {
    required_error: "حالة المشروع مطلوبة."
  }),
  engineer: z.string().min(3, { message: "اسم المهندس مطلوب." }), 
  clientName: z.string().min(3, { message: "اسم العميل/المالك مطلوب." }),
  budget: z.preprocess((val) => {
    if (val === '' || val === null || typeof val === 'undefined' || Number.isNaN(val)) {
      return undefined;
    }
    return typeof val === 'number' ? val : Number(val);
  }, z.number().positive({ message: "الميزانية يجب أن تكون رقمًا موجبًا." }).optional()),
  linkedOwnerEmail: z.preprocess((val) => {
    return val === '' ? undefined : val;
  }, z.string().email({ message: "بريد المالك الإلكتروني غير صالح." }).optional())
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "تاريخ الانتهاء يجب أن يكون بعد أو نفس تاريخ البدء.",
  path: ["endDate"],
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const projectStatusOptions: { value: ProjectStatusType; label: string }[] = [
    { value: 'مخطط له', label: 'مخطط له' },
    { value: 'قيد التنفيذ', label: 'قيد التنفيذ' },
    { value: 'مكتمل', label: 'مكتمل' },
    { value: 'مؤرشف', label: 'مؤرشف' },
];

export default function CreateProjectPage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
        engineer: "",
        status: 'مخطط له',
    }
  });

  useEffect(() => {
    const engineerNameFromStorage = localStorage.getItem('userName');
    if (engineerNameFromStorage) {
      setValue('engineer', engineerNameFromStorage);
    } else {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على معلومات المهندس. يرجى تسجيل الدخول مرة أخرى.",
        variant: "destructive"
      });
      router.push('/login');
    }
  }, [setValue, router, toast]);

  const onSubmit: SubmitHandler<CreateProjectFormValues> = async (data) => {
    setIsLoading(true);
    
    const projectDataForDb: Omit<Project, 'id' | 'overallProgress' | 'photos' | 'timelineTasks' | 'comments' | 'createdAt'> = {
        name: data.projectName,
        location: data.location,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status as ProjectStatusType,
        engineer: data.engineer,
        clientName: data.clientName,
        budget: data.budget,
        linkedOwnerEmail: data.linkedOwnerEmail,
        quantitySummary: ""
    };

    const newProject = await dbAddProject(projectDataForDb);

    if (newProject) {
        toast({
          title: "تم إنشاء المشروع بنجاح",
          description: `مشروع "${newProject.name}" جاهز الآن.`,
          variant: "default",
        });
        reset();
        router.push(`/engineer/projects/${newProject.id}`);
    } else {
        toast({
            title: "خطأ في إنشاء المشروع",
            description: "لم يتمكن النظام من إنشاء المشروع. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
            <Building className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">إنشاء مشروع بناء جديد</h1>
          <p className="text-gray-600">أدخل تفاصيل المشروع الإنشائي الجديد للبدء في إدارته وحساب كمياته.</p>
        </div>
        
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Building className="h-4 w-4 text-red-500" />
                    اسم المشروع
                  </Label>
                  <Input 
                    id="projectName" 
                    type="text" 
                    {...register("projectName")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" 
                    placeholder="مثال: بناء فيلا سكنية" 
                  />
                  {errors.projectName && <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-gray-700 font-medium">
                    <MapPin className="h-4 w-4 text-red-500" />
                    موقع المشروع
                  </Label>
                  <Input 
                    id="location" 
                    type="text" 
                    {...register("location")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" 
                    placeholder="مثال: مدينة الرياض، حي النرجس" 
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="engineer" className="flex items-center gap-2 text-gray-700 font-medium">
                    <HardHat className="h-4 w-4 text-red-500" />
                    المهندس المسؤول
                  </Label>
                  <Input 
                    id="engineer" 
                    type="text" 
                    {...register("engineer")} 
                    className="bg-gray-100 border-gray-200 cursor-not-allowed" 
                    readOnly 
                    placeholder="جاري تحميل اسم المهندس..." 
                  />
                  {errors.engineer && <p className="text-red-500 text-sm mt-1">{errors.engineer.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName" className="flex items-center gap-2 text-gray-700 font-medium">
                    <User className="h-4 w-4 text-red-500" />
                    اسم العميل/المالك
                  </Label>
                  <Input 
                    id="clientName" 
                    type="text" 
                    {...register("clientName")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" 
                    placeholder="اسم صاحب المشروع" 
                  />
                  {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2 text-gray-700 font-medium">
                  <PlusCircle className="h-4 w-4 text-red-500" />
                  وصف المشروع
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all resize-none"
                  placeholder="صف بإيجاز طبيعة المشروع، أهدافه، وأهم مكوناته..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2 text-gray-700 font-medium">
                    <CalendarRange className="h-4 w-4 text-red-500" />
                    تاريخ البدء
                  </Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    {...register("startDate")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all"
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2 text-gray-700 font-medium">
                    <CalendarRange className="h-4 w-4 text-red-500" />
                    تاريخ الانتهاء
                  </Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    {...register("endDate")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all"
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2 text-gray-700 font-medium">
                    <PlusCircle className="h-4 w-4 text-red-500" />
                    المرحلة الحالية
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <SelectTrigger id="status" className="w-full border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2 text-gray-700 font-medium">
                    <DollarSign className="h-4 w-4 text-red-500" />
                    الميزانية التقديرية (شيكل)
                    <span className="text-gray-400 text-sm font-normal">(اختياري)</span>
                  </Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    {...register("budget", { valueAsNumber: true })} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" 
                    placeholder="مثال: 1500000" 
                  />
                  {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedOwnerEmail" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Mail className="h-4 w-4 text-red-500" />
                    بريد المالك الإلكتروني
                    <span className="text-gray-400 text-sm font-normal">(اختياري)</span>
                  </Label>
                  <Input 
                    id="linkedOwnerEmail" 
                    type="email" 
                    {...register("linkedOwnerEmail")} 
                    className="border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all" 
                    placeholder="owner@example.com" 
                  />
                  {errors.linkedOwnerEmail && <p className="text-red-500 text-sm mt-1">{errors.linkedOwnerEmail.message}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto flex-grow bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="ml-2 h-5 w-5" />
                      إنشاء المشروع
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-all" 
                  asChild
                >
                  <Link href="/engineer/projects">إلغاء</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}