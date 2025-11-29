
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Search, Trash2, AlertTriangle, Loader2, Check, ArchiveRestore } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type Project,
  type ProjectStatusType,
  getProjects,
  deleteProject,
  updateProject,
  restoreProject
} from '@/lib/db';

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'loading' | 'success'>('confirm');
  
  const [projectToRestore, setProjectToRestore] = useState<Project | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    setCurrentUserId(id);
    setCurrentUserRole(role);
    setAdminUserId(id); // Admin userId for authentication
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      (project.name.toLowerCase().includes(searchTerm) ||
      (project.engineer?.toLowerCase().includes(searchTerm)) ||
      (project.clientName?.toLowerCase().includes(searchTerm))
 ) &&
      (statusFilter === 'all' || project.status === statusFilter));
  }, [projects, searchTerm, statusFilter]);
  
  async function loadProjects() {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // Pass ADMIN role so backend returns all projects
    const result = await getProjects(currentUserId, currentUserRole || 'ADMIN');
    if (result.success && result.projects) {
      setProjects(result.projects);
    } else {
      toast({ title: "خطأ", description: result.message || "فشل تحميل المشاريع.", variant: "destructive" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, currentUserRole]);

  const handleOpenDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteStep('confirm');
    setIsDeleteDialogOpen(true);
  };
  
  const handleOpenRestoreDialog = (project: Project) => {
    setProjectToRestore(project);
    setIsRestoreDialogOpen(true);
  };

  async function handleDeleteProject() {
    if (!projectToDelete || !adminUserId) return;
    setDeleteStep('loading');

    // Pass adminUserId to permanently delete the project
    const result = await deleteProject(projectToDelete.id.toString(), currentUserId || undefined, adminUserId);
    if (result.success) {
      setDeleteStep('success');
      setTimeout(() => {
        setIsDeleteDialogOpen(false);
        loadProjects();
      }, 2000);
    } else {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
      setIsDeleteDialogOpen(false);
    }
  }
  
  async function handleRestoreProject() {
    if (!projectToRestore || !adminUserId) return;
    
    const result = await restoreProject(projectToRestore.id.toString(), adminUserId);
    if (result.success) {
      toast({ title: "نجاح", description: result.message || "تم استعادة المشروع بنجاح.", variant: "default" });
      loadProjects();
    } else {
      toast({ title: "خطأ", description: result.message || "فشل استعادة المشروع.", variant: "destructive" });
    }
    setIsRestoreDialogOpen(false);
  }

  async function handleUpdateProjectStatus(projectId: number, newStatus: ProjectStatusType) {
    const result = await updateProject(projectId.toString(), { status: newStatus });
    if (result.success) {
      toast({ title: "نجاح", description: "تم تحديث حالة المشروع بنجاح", variant: "default" });
      loadProjects();
    } else {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  }

  return (
    <>
    <Card className="bg-white/95 shadow-xl w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-app-red">إدارة المشاريع</CardTitle>
        <CardDescription className="text-gray-600">متابعة المشاريع الإنشائية في النظام وإدارتها.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Input
              type="search"
              placeholder="ابحث باسم المشروع، المهندس، أو المالك..."
              value={searchTerm}
              onChange={handleSearch}
              className="pr-10 bg-white focus:border-app-gold"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter} dir="rtl">
            <SelectTrigger className="w-full sm:w-auto bg-white focus:border-app-gold text-right">
              <SelectValue placeholder="تصفية حسب الحالة..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
              <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
              <SelectItem value="مخطط له">مخطط له</SelectItem>
              <SelectItem value="مؤرشف">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 space-x-3" dir="ltr">
            <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
            <p className="text-lg">جاري تحميل المشاريع...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-right font-semibold text-gray-700">اسم المشروع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">المهندس المسؤول</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">المالك</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-app-red hover:underline">
                    <Link href={`/engineer/projects/${project.id}`}>{project.name}</Link>
                  </TableCell>
                  <TableCell>{project.engineer || 'غير محدد'}</TableCell>
                  <TableCell>{project.clientName || 'غير محدد'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'مكتمل' ? 'bg-green-100 text-green-700' :
                        project.status === 'قيد التنفيذ' ? 'bg-yellow-100 text-yellow-700' :
                        project.status === 'مخطط له' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700' 
                      }`}>
                        {project.status}
                      </span>
                      {(project as any).projectStatus === 'DELETED' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                          محذوف
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center space-x-1 space-x-reverse">
                    {(project as any).projectStatus === 'DELETED' ? (
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-800 hover:bg-green-100" onClick={() => handleOpenRestoreDialog(project)}>
                        <ArchiveRestore className="h-5 w-5" /><span className="sr-only">استعادة</span>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-100" onClick={() => handleOpenDeleteDialog(project)}>
                        <Trash2 className="h-5 w-5" /><span className="sr-only">حذف</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    لا توجد مشاريع تطابق معايير البحث أو التصفية.
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </div>
        )}
        {!isLoading && filteredProjects.length > 0 && (
          <p className="text-xs text-gray-500 text-center">يتم عرض {filteredProjects.length} من إجمالي {projects.length} مشروع.</p>
        )}
        {!isLoading && projects.length === 0 && (
          <p className="text-center text-gray-500 py-10">لا توجد مشاريع في النظام حالياً.</p>
        )}
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl" className="sm:max-w-md">
            {deleteStep === 'confirm' && projectToDelete && (
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
                                سيتم حذف المشروع: <span className="font-bold">"{projectToDelete.name}"</span>
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
                    <Loader2 className="h-12 w-12 animate-spin text-amber-700" />
                    <h2 className="text-2xl font-bold text-amber-700">جاري الحذف...</h2>
                    <p className="text-lg text-gray-500">يتم حذف المشروع الآن...</p>
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
    
    {/* Restore Confirmation Dialog */}
    <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent dir="rtl" className="sm:max-w-md">
           {projectToRestore && (
             <>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد استعادة المشروع</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد أنك تريد استعادة المشروع "{projectToRestore.name}"؟ سيتم تغيير حالته إلى "قيد التنفيذ" وسيظهر مجدداً لدى المهندس.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestoreProject} className="bg-green-600 hover:bg-green-700">نعم، قم بالاستعادة</AlertDialogAction>
              </AlertDialogFooter>
             </>
           )}
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
