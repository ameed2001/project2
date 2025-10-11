
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Briefcase as ProjectsIcon, Loader2, Info, LayoutDashboard } from 'lucide-react';
import { getProjects as dbGetProjects, type Project, type ProjectStatusType } from "@/lib/db";
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OwnerProjectsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, [toast]);

  useEffect(() => {
    async function fetchOwnerProjects() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
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
        console.error("Error fetching projects for owner:", error);
        toast({ title: "خطأ فادح", description: "حدث خطأ أثناء تحميل بيانات المشاريع.", variant: "destructive" });
        setProjects([]);
      }
      setIsLoading(false);
    }

    if (userId) {
      fetchOwnerProjects();
    }
  }, [userId, toast]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || project.status === statusFilter)
    );
  }, [projects, searchTerm, statusFilter]);

  const projectStatusOptions: { value: ProjectStatusType | 'all'; label: string }[] = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'مخطط له', label: 'مخطط له' },
    { value: 'قيد التنفيذ', label: 'قيد التنفيذ' },
    { value: 'مكتمل', label: 'مكتمل' },
    { value: 'مؤرشف', label: 'مؤرشف' },
  ];

  return (
    <Card className="bg-white/95 shadow-xl w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ProjectsIcon className="h-8 w-8 text-app-gold" />
                <CardTitle className="text-3xl font-bold text-app-red">مشاريعي</CardTitle>
            </div>
            <Button asChild className="bg-app-gold hover:bg-yellow-500 text-primary-foreground font-semibold">
                <Link href="/owner/dashboard">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    العودة إلى لوحة التحكم
                </Link>
            </Button>
        </div>
        <CardDescription className="text-gray-600 mt-1">
          عرض جميع مشاريع البناء المرتبطة بحسابك. يمكنك تصفية المشاريع والاطلاع على تفاصيلها.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-gray-50">
          <div className="relative flex-grow w-full sm:w-auto">
            <Input
              type="search"
              placeholder="ابحث باسم المشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-white focus:border-app-gold"
              aria-label="بحث في المشاريع"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter} dir="rtl">
            <SelectTrigger className="w-full sm:w-auto bg-white focus:border-app-gold text-right" aria-label="تصفية حسب الحالة">
              <SelectValue placeholder="تصفية حسب الحالة..." />
            </SelectTrigger>
            <SelectContent>
              {projectStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
            <p className="ms-3 text-lg">جاري تحميل المشاريع...</p>
          </div>
        ) : !userId ? (
            <Alert variant="destructive" className="text-right">
                <Info className="h-5 w-5" />
                <AlertTitle>مستخدم غير مسجل</AlertTitle>
                <AlertDescription>
                    يرجى تسجيل الدخول أولاً لعرض مشاريعك.
                     <Link href="/owner-login" className="font-semibold text-blue-600 hover:underline mr-1">
                        تسجيل الدخول كمالك
                    </Link>
                </AlertDescription>
            </Alert>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-right font-semibold text-gray-700">اسم المشروع</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">نسبة الإنجاز</TableHead>
                  <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-app-red hover:underline">
                        <Link href={`/owner/projects/${project.id}`}>{project.name}</Link>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'مكتمل' ? 'bg-green-100 text-green-700' :
                        project.status === 'قيد التنفيذ' ? 'bg-yellow-100 text-yellow-700' :
                        project.status === 'مخطط له' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700' 
                      }`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.overallProgress || 0} className="w-[70%] h-2.5" />
                        <span className="text-sm font-medium">{project.overallProgress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="outline" className="font-semibold border-app-red text-app-red hover:bg-app-red hover:text-white transition-colors duration-200">
                        <Link href={`/owner/projects/${project.id}`}>
                          <Eye className="h-4 w-4 ml-1" />
                          تفاصيل
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg" data-ai-hint="no owner projects found">
            <ProjectsIcon size={48} className="mx-auto mb-3 text-gray-400" />
            {projects.length === 0 && !searchTerm && statusFilter === 'all' ? (
              <>
                <p>لا توجد مشاريع مرتبطة بحسابك حاليًا.</p>
                <p className="text-sm">عندما يقوم المهندس بربط مشروع ببريدك الإلكتروني، سيظهر هنا.</p>
              </>
            ) : (
              <p>لا توجد مشاريع تطابق معايير البحث أو التصفية الحالية.</p>
            )}
          </div>
        )}
        {filteredProjects.length > 0 && (
          <p className="text-xs text-gray-500 text-center">يتم عرض {filteredProjects.length} من إجمالي {projects.length} مشروع.</p>
        )}
      </CardContent>
    </Card>
  );
}
