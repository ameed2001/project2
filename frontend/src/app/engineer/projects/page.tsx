
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Loader2, Info, PlusCircle, Edit, Archive, MapPin, FolderKanban, Trash2, Printer, AlertTriangle, Check } from 'lucide-react';
import { getProjects as dbGetProjects, updateProject, deleteProject as dbDeleteProject, type Project, type ProjectStatusType } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';

export default function EngineerProjectsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusType | 'all'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'loading' | 'success'>('confirm');


  const fetchEngineerProjects = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const result = await dbGetProjects(userId);
      if (result.success && result.projects) {
        setProjects(result.projects);
      } else {
        toast({ title: "خطأ", description: result.message || "فشل تحميل المشاريع.", variant: "destructive" });
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects for engineer:", error);
      toast({ title: "خطأ فادح", description: "حدث خطأ أثناء تحميل بيانات المشاريع.", variant: "destructive" });
      setProjects([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setUserId(id);
    if (!id) {
      toast({
        title: "مستخدم غير معروف",
        description: "لم يتم العثور على معلومات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userId) {
      fetchEngineerProjects();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter === 'all' || project.status === statusFilter)
    );
  }, [projects, searchTerm, statusFilter]);

  const handleArchiveAction = async (projectId: number, projectName: string) => {
    const result = await updateProject(projectId.toString(), { status: 'مؤرشف' });
    if (result.success) {
        toast({
            title: "تمت أرشفة المشروع",
            description: `تم أرشفة مشروع "${projectName}" بنجاح.`,
        });
        fetchEngineerProjects();
    } else {
        toast({
            title: "خطأ في الأرشفة",
            description: result.message || "فشل أرشفة المشروع. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
    }
  };

  const handleOpenDeleteDialog = (item: Project, type: 'delete' | 'archive') => {
      setItemToDelete(item);
      setDeleteStep('confirm'); // Reset to confirm step
      setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!itemToDelete) return;

    setDeleteStep('loading');
    const result = await dbDeleteProject(itemToDelete.id.toString());
    if (result.success) {
        setDeleteStep('success');
        setTimeout(() => {
            setIsDeleteDialogOpen(false);
            fetchEngineerProjects();
        }, 2000);
    } else {
        toast({
            title: "خطأ في الحذف",
            description: result.message || "فشل حذف المشروع. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
    }
  };

  const handlePrintReport = () => {
    if (filteredProjects.length === 0) {
      toast({
        title: "لا توجد مشاريع للطباعة",
        description: "القائمة الحالية فارغة. قم بتغيير الفلاتر أو أضف مشاريع.",
        variant: "default"
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const tableRows = filteredProjects.map(project => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc;">${project.name}</td>
          <td style="padding: 10px; border: 1px solid #ccc;">${project.clientName || 'غير محدد'}</td>
          <td style="padding: 10px; border: 1px solid #ccc;">${project.engineer || 'غير محدد'}</td>
          <td style="padding: 10px; border: 1px solid #ccc;">${project.status}</td>
          <td style="padding: 10px; border: 1px solid #ccc;">${project.location}</td>
        </tr>
      `).join('');

      const reportHtml = `
        <html>
          <head>
            <title>تقرير المشاريع</title>
            <style>
              body { 
                font-family: 'Tajawal', sans-serif; 
                direction: rtl; 
                margin: 20px;
              }
              h1 {
                text-align: center;
                color: #B40404;
              }
              p {
                text-align: center;
                color: #555;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ccc; 
                padding: 10px; 
                text-align: right; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>تقرير المشاريع الإنشائية</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('en-CA')}</p>
            <table>
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>المالك</th>
                  <th>اسم المهندس</th>
                  <th>الحالة</th>
                  <th>الموقع</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.print();
    } else {
      toast({
        title: "خطأ",
        description: "لم يتمكن المتصفح من فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
    <Card className="bg-white/95 shadow-xl w-full text-right">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FolderKanban className="h-8 w-8 text-app-gold" />
                <CardTitle className="text-3xl font-bold text-app-red">إدارة المشاريع الإنشائية</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handlePrintReport} variant="outline" className="border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800 font-semibold">
                    <Printer size={18} className="ms-2" />
                    طباعة تقرير
                </Button>
                <Button asChild variant="outline" className="border-app-red text-app-red hover:bg-app-red hover:text-white font-semibold">
                    <Link href="/engineer/create-project">
                        <PlusCircle size={18} className="ms-2" />
                        إنشاء مشروع جديد
                    </Link>
                </Button>
            </div>
        </div>
        <CardDescription className="text-gray-600 mt-2">
          عرض، بحث، وإدارة جميع المشاريع الإنشائية المسندة إليك.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-gray-50">
          <div className="relative flex-grow w-full sm:w-auto">
            <Input
              type="search"
              placeholder="ابحث بالاسم، الموقع، أو المالك..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-white focus:border-app-gold"
              aria-label="بحث في المشاريع"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <DatePickerWithRange className="w-full sm:w-auto" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)} dir="rtl">
            <SelectTrigger className="w-full sm:w-[180px] bg-white focus:border-app-gold text-right" aria-label="تصفية حسب الحالة">
              <SelectValue placeholder="الحالة: الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
              <SelectItem value="مخطط له">مخطط له</SelectItem>
              <SelectItem value="مؤرشف">مؤرشف</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
            <p className="ms-3 text-lg">جاري تحميل المشاريع...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-right font-semibold text-gray-700">اسم المشروع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">المالك</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الموقع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">تاريخ الإضافة</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-app-red align-middle">
                       {project.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground align-middle">{project.clientName || 'غير محدد'}</TableCell>
                    <TableCell className="text-muted-foreground align-middle">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{project.location || 'غير محدد'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge variant={project.status === 'قيد التنفيذ' ? "default" : project.status === 'مكتمل' ? "secondary" : "outline"}
                       className={
                        project.status === 'قيد التنفيذ' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'مكتمل' ? 'bg-green-100 text-green-700' :
                        project.status === 'مؤرشف' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                       }>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground align-middle">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-CA') : 'غير محدد'}
                    </TableCell>
                    <TableCell className="text-center space-x-1 rtl:space-x-reverse align-middle">
                      <Button asChild variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 hover:bg-transparent" title="عرض">
                        <Link href={`/engineer/projects/${project.id}`}>
                          <Eye className="h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="text-green-600 hover:text-green-800 hover:bg-transparent" title="تعديل">
                         <Link href={`/engineer/projects/${project.id}`}>
                           <Edit className="h-5 w-5" />
                         </Link>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-800 hover:bg-transparent" title="أرشفة">
                               <Archive className="h-5 w-5" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="sm:max-w-md">
                            <AlertDialogHeader className="text-right">
                              <AlertDialogTitle className="text-xl font-bold">تأكيد الأرشفة</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground pt-2">
                                هل أنت متأكد أنك تريد أرشفة المشروع "{project.name}"؟ سيتم إخفاؤه من القائمة النشطة.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row justify-start gap-3 pt-4">
                              <AlertDialogAction onClick={() => handleArchiveAction(project.id, project.name)} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white">
                                نعم، قم بالأرشفة
                              </AlertDialogAction>
                              <AlertDialogCancel className="w-full sm:w-auto mt-0">إلغاء</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button size="icon" className="bg-red-700 text-white hover:bg-red-800 rounded-md" title="حذف" onClick={() => handleOpenDeleteDialog(project, 'delete')}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg" data-ai-hint="no engineer projects found">
            <Info size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">لا توجد مشاريع لعرضها</p>
            <p className="text-sm">
                {projects.length === 0 ? "لم تقم بإنشاء أي مشاريع بعد." : "لا توجد مشاريع تطابق معايير البحث الحالية."}
            </p>
             <Button asChild size="sm" className="mt-4 bg-app-red hover:bg-red-700 text-white">
                <Link href="/engineer/create-project">
                    <PlusCircle size={16} className="ms-2" />
                    إنشاء مشروع الآن
                </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl" className="sm:max-w-md">
            {deleteStep === 'confirm' && itemToDelete && (
                <>
                    <AlertDialogHeader className="text-center items-center space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-gray-800">تأكيد الحذف</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription asChild>
                        <div className="text-center text-base text-gray-600 space-y-4">
                            <p>هل أنت متأكد أنك تريد حذف هذا الإجراء؟</p>
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                                سيتم حذف المشروع: <span className="font-bold">"{itemToDelete.name}"</span>
                            </div>
                            <p className="text-xs text-gray-500">لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                    </AlertDialogDescription>
                    <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-4 pt-4">
                        <Button onClick={async (e) => { e.preventDefault(); await handleDeleteProject(); }} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 font-bold py-2.5 px-6 rounded-lg">
                            حذف نهائي
                        </Button>
                        <AlertDialogCancel className="w-full sm:w-auto mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-800 border-none font-bold py-2.5 px-6 rounded-lg">إلغاء</AlertDialogCancel>
                    </AlertDialogFooter>
                </>
            )}
            {deleteStep === 'loading' && (
                <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
                    <div className="w-24 h-24 bg-amber-100 rounded-full animate-pulse"></div>
                    <h2 className="text-3xl font-bold text-amber-700">جاري الحذف...</h2>
                    <p className="text-lg text-gray-500">يتم حذف المشروع الآن...</p>
                    <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-full animate-pulse"></div>
                    </div>
                </div>
            )}
            {deleteStep === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center ring-4 ring-green-200">
                        <Check className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-700">تم الحذف بنجاح</h2>
                    <p className="text-lg text-gray-500">تم حذف المشروع بنجاح من النظام.</p>
                </div>
            )}
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
