"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2, Users, Briefcase, CheckCircle, AlertCircle, Building, User, Mail, ArrowLeft } from 'lucide-react';
import { getProjects, getUsers, updateProject, type Project, type UserDocument } from '@/lib/db';
import { useRouter } from 'next/navigation';

const linkOwnerSchema = z.object({
  projectId: z.string().min(1, { message: "يرجى اختيار مشروع." }),
  ownerId: z.string().min(1, { message: "يرجى اختيار مالك." }),
});

type LinkOwnerFormValues = z.infer<typeof linkOwnerSchema>;

export default function LinkOwnerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [owners, setOwners] = useState<Omit<UserDocument, 'password_hash'>[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Omit<UserDocument, 'password_hash'> | null>(null);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<LinkOwnerFormValues>({
    resolver: zodResolver(linkOwnerSchema),
  });

  useEffect(() => {
    async function fetchData() {
      setIsFetchingData(true);
      const engineerId = localStorage.getItem('userId');
      if (!engineerId) {
        toast({ title: "خطأ", description: "لم يتم العثور على معلومات المهندس. يرجى تسجيل الدخول.", variant: "destructive" });
        router.push('/login');
        return;
      }

      try {
        const [projectsResult, usersResult] = await Promise.all([
          getProjects(engineerId),
          getUsers() // Fetch all users
        ]);

        if (projectsResult.success && projectsResult.projects) {
          setProjects(projectsResult.projects.filter(p => p.status !== 'مؤرشف'));
        } else {
          toast({ title: "خطأ", description: "فشل تحميل قائمة المشاريع.", variant: "destructive" });
        }

        if (usersResult.success && usersResult.users) {
          // Filter only active owners (IDs are already normalized in getUsers)
          const activeOwners = usersResult.users.filter(u => u.role === 'OWNER' && u.status === 'ACTIVE');
          setOwners(activeOwners);
        } else {
          toast({ title: "خطأ", description: "فشل تحميل قائمة المالكين.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "خطأ فادح", description: "حدث خطأ أثناء جلب البيانات.", variant: "destructive" });
      }
      setIsFetchingData(false);
    }

    fetchData();
  }, [toast, router]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id.toString() === projectId);
    setSelectedProject(project || null);
    setValue("projectId", projectId);
  };

  const handleOwnerChange = (ownerId: string) => {
    const owner = owners.find(o => {
      const oId = o.id || (o as any)._id;
      return oId === ownerId;
    });
    setSelectedOwner(owner || null);
    setValue("ownerId", ownerId);
  };

  const onSubmit = async (data: LinkOwnerFormValues) => {
    setIsLoading(true);
    
    // Validate required fields
    if (!data.projectId || !data.ownerId) {
      toast({ 
        title: "خطأ", 
        description: "يرجى اختيار المشروع والمالك.", 
        variant: "destructive" 
      });
      setIsLoading(false);
      return;
    }

    const selectedOwner = owners.find(o => {
      const oId = o.id || (o as any)._id;
      return oId === data.ownerId;
    });

    if (!selectedOwner) {
      toast({ title: "خطأ", description: "المالك المختار غير موجود.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const updates = {
      linkedOwnerEmail: selectedOwner.email,
      clientName: selectedOwner.name,
    };

    const result = await updateProject(data.projectId, updates);

    if (result.success) {
      toast({
        title: "تم الربط بنجاح",
        description: `تم ربط المالك "${selectedOwner.name}" بالمشروع بنجاح.`,
        variant: "default",
      });
      reset();
      setSelectedProject(null);
      setSelectedOwner(null);
      // Optionally, redirect or refresh data
      router.push(`/engineer/projects/${data.projectId}`);
    } else {
      toast({
        title: "فشل الربط",
        description: result.message || "فشل تحديث المشروع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isFetchingData) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-app-gold mb-4" />
        <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          العودة
        </Button>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <Link2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ربط المالكين بالمشاريع</h1>
          <p className="text-gray-600">اختر مشروعًا ومالكًا لربطهما معًا.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectId" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Building className="h-4 w-4 text-blue-500" />
                    اختر المشروع
                  </Label>
                  <Controller
                    name="projectId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => { field.onChange(value); handleProjectChange(value); }} defaultValue={field.value} dir="rtl">
                        <SelectTrigger id="projectId" className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all">
                          <SelectValue placeholder="اختر مشروعًا لربطه..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.length > 0 ? projects.map((project, index) => {
                            const projectId = project.id?.toString() || (project as any)._id?.toString() || `project-${index}`;
                            return (
                              <SelectItem key={projectId} value={projectId}>
                                {project.name}
                              </SelectItem>
                            );
                          }) : <SelectItem value="none" disabled>لا توجد مشاريع متاحة</SelectItem>}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.projectId && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectId.message}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerId" className="flex items-center gap-2 text-gray-700 font-medium">
                    <User className="h-4 w-4 text-blue-500" />
                    اختر المالك
                  </Label>
                  <Controller
                    name="ownerId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => { field.onChange(value); handleOwnerChange(value); }} defaultValue={field.value} dir="rtl">
                        <SelectTrigger id="ownerId" className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all">
                          <SelectValue placeholder="اختر مالكًا لربطه بالمشروع..." />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.length > 0 ? owners.map((owner, index) => {
                            const ownerId = owner.id || (owner as any)._id || `owner-${index}`;
                            return (
                              <SelectItem key={ownerId} value={ownerId}>
                                {owner.email}
                              </SelectItem>
                            );
                          }) : <SelectItem value="none" disabled>لا يوجد ملاك متاحون</SelectItem>}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ownerId && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.ownerId.message}
                  </p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md" 
                  disabled={isLoading || isFetchingData}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الربط...
                    </>
                  ) : (
                    <>
                      <Link2 className="ml-2 h-5 w-5" />
                      ربط المشروع بالمالك
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {selectedProject && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-500" />
                  تفاصيل المشروع
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">اسم المشروع</p>
                    <p className="font-medium">{selectedProject.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الموقع</p>
                    <p className="font-medium">{selectedProject.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المالك الحالي</p>
                    <p className="font-medium">{selectedProject.clientName || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحالة</p>
                    <p className="font-medium">{selectedProject.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedOwner && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  تفاصيل المالك
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="font-medium">{selectedOwner.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedOwner.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحالة</p>
                    <p className="font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      نشط
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="shadow-lg border-0 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                ملاحظات
              </h3>
              <p className="text-sm text-gray-600">
                عند ربط المالك بالمشروع، سيتم تحديث اسم المالك وبريده الإلكتروني في تفاصيل المشروع. يمكن للمالك بعد ذلك الوصول إلى معلومات المشروع من حسابه.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}