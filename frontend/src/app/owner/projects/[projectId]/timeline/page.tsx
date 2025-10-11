
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GanttChartSquare, Loader2, ArrowLeft, Info, Calendar, User, FileText as NotesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findProjectById, type Project, type TimelineTask } from '@/lib/db';
import Link from 'next/link';

export default function ProjectSpecificTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setIsLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      const fetchedProject = await findProjectById(projectId);

      if (!fetchedProject || fetchedProject.linkedOwnerEmail !== userEmail) {
        toast({
          title: "غير مصرح به",
          description: "ليس لديك صلاحية لعرض هذا المشروع.",
          variant: "destructive",
        });
        router.push('/owner/dashboard');
        return;
      }
      
      setProject(fetchedProject);
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId, router, toast]);

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "غير محدد";
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} يومًا`;
  };


  if (isLoading) {
    return (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
         <p className="ms-3 text-lg">جاري تحميل الجدول الزمني...</p>
       </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Alert variant="destructive">
          <GanttChartSquare className="h-5 w-5" />
          <AlertTitle>المشروع غير موجود</AlertTitle>
          <AlertDescription>لم يتم العثور على تفاصيل المشروع المطلوب.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6 bg-app-gold hover:bg-yellow-600 text-primary-foreground">
          <Link href="/owner/projects">العودة إلى قائمة المشاريع</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 text-right">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-app-red">الجدول الزمني لمشروع: {project.name}</h1>
          <Button asChild variant="outline">
              <Link href={`/owner/projects/${projectId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  العودة لتفاصيل المشروع
              </Link>
          </Button>
      </div>
      <Card className="bg-white/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
            <GanttChartSquare size={28} /> جدول مراحل المشروع
          </CardTitle>
          <CardDescription>تفاصيل المراحل والأنشطة الرئيسية للمشروع.</CardDescription>
        </CardHeader>
        <CardContent>
          {project.timelineTasks && project.timelineTasks.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-right font-semibold text-gray-700">المرحلة</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 w-2/5">الأنشطة الرئيسية</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">المدة الزمنية</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">المسؤول</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.timelineTasks.map((task, index) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500"/>
                            {calculateDuration(task.startDate, task.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-500"/>
                            {project.engineer || 'غير محدد'}
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <NotesIcon size={14} className="text-gray-500"/>
                            لا توجد
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
                <Info size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="font-semibold">لا يوجد جدول زمني محدد</p>
                <p className="text-sm">لم يقم المهندس بإضافة مهام للجدول الزمني لهذا المشروع بعد.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
