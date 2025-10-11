"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CalendarDays, Image as ImageIcon, FileText, MessageSquare, Edit, Send, Palette, CheckCircle2, 
  UploadCloud, Download, Link2, HardHat, Users, Percent, FileEdit, BarChart3, GanttChartSquare, Settings2, Loader2 as LoaderIcon, Mail, Calculator, Wrench, ListChecks, Wallet, Plus, Trash2, Save, Clock, DollarSign, User, MapPin, Building, Flag, Target, TrendingUp, Activity, FileImage, Video, File, Folder, Star, AlertCircle, Info, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger, DialogOverlay } from '@/components/ui/dialog';
import { findProjectById, updateProject as dbUpdateProject, getCostReportsForProject, addCostReport, type Project, type ProjectComment, type ProjectPhoto, type TimelineTask, type CostReport } from '@/lib/db';
import { apiClient, type ConcreteCalculationInput, type SteelCalculationInput } from '@/lib/api';
import Link from 'next/link';
import EditProjectDialog from '@/components/engineer/EditProjectDialog';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EngineerProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [costReports, setCostReports] = useState<CostReport[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState({ percentage: '', notes: '' });
  const [linkedOwnerEmailInput, setLinkedOwnerEmailInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isContactEngineerModalOpen, setIsContactEngineerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [engineerMessage, setEngineerMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationStatus, setSimulationStatus] = useState('');
  const [newTask, setNewTask] = useState({ name: '', startDate: '', endDate: '', color: '#3b82f6', status: 'مخطط له' });
  
  // Default colors for tasks
  const defaultColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280'  // gray
  ];
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCostReportModalOpen, setIsCostReportModalOpen] = useState(false);
  const [newCostReport, setNewCostReport] = useState({ reportName: '', totalCost_ILS: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [fileType, setFileType] = useState('image');
  const [taskToEdit, setTaskToEdit] = useState<TimelineTask | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [concreteResults, setConcreteResults] = useState<any>(null);
  const [steelResults, setSteelResults] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [resultsType, setResultsType] = useState('');

  const isOwnerView = false; // This is the Engineer's view

  const refreshProjectData = async () => { 
    const [currentProject, reports] = await Promise.all([
        findProjectById(projectId),
        getCostReportsForProject(projectId)
    ]);
    setProject(currentProject ? {...currentProject} : null); 
    setCostReports(reports);

    if (currentProject?.linkedOwnerEmail) {
      setLinkedOwnerEmailInput(currentProject.linkedOwnerEmail);
    }
    if (currentProject?.overallProgress) {
      setProgressUpdate(prev => ({ ...prev, percentage: currentProject.overallProgress.toString() }));
    }
  };

  useEffect(() => {
    refreshProjectData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); 

  const handleCommentSubmit = async (e: FormEvent) => { 
    e.preventDefault();
    if (!newComment.trim() || !project) return;
    setIsSubmittingComment(true);
    
    const commentToAdd: ProjectComment = {
      id: crypto.randomUUID(), 
      user: isOwnerView ? "المالك" : "المهندس (أنت)", 
      text: newComment, 
      date: new Date().toISOString(), 
      avatar: isOwnerView ? "https://placehold.co/40x40.png?text=OW" : "https://placehold.co/40x40.png?text=ME", 
      dataAiHintAvatar: isOwnerView ? "owner avatar" : "my avatar"
    };
    
    const updatedProjectResult = await dbUpdateProject(project.id.toString(), { 
        comments: [...(project.comments || []), commentToAdd]
    });

    if (updatedProjectResult.success) {
        await refreshProjectData();
        setNewComment('');
        toast({ title: "تم إضافة التعليق", description: "تم نشر تعليقك بنجاح." });
    } else {
        toast({ title: "خطأ", description: "فشل إضافة التعليق.", variant: "destructive" });
    }
    setIsSubmittingComment(false);
  };

  const handleProgressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !progressUpdate.percentage) {
      toast({ title: "خطأ", description: "يرجى إدخال نسبة التقدم.", variant: "destructive" });
      return;
    }
    const newProgress = parseInt(progressUpdate.percentage, 10);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      toast({ title: "خطأ", description: "الرجاء إدخال نسبة تقدم صالحة (0-100).", variant: "destructive" });
      return;
    }
  
    const updates: Partial<Project> = {
      overallProgress: newProgress,
      quantitySummary: (project.quantitySummary || '') + (progressUpdate.notes ? `\n(ملاحظة تقدم: ${progressUpdate.notes})` : '')
    };
  
    if (newProgress > 0 && project.status === 'مخطط له') {
      updates.status = 'قيد التنفيذ';
    } else if (newProgress === 100 && project.status !== 'مكتمل') {
      updates.status = 'مكتمل';
    }
  
    const updatedProjectResult = await dbUpdateProject(project.id.toString(), updates);
  
    if (updatedProjectResult.success) {
      await refreshProjectData();
      toast({ title: "تم تحديث التقدم", description: `تم تحديث تقدم المشروع إلى ${newProgress}%.` });
      setProgressUpdate(prev => ({ ...prev, notes: '' }));
    } else {
      toast({ title: "خطأ", description: "فشل تحديث التقدم.", variant: "destructive" });
    }
  };
  

  const handleLinkOwnerSubmit = async (e: FormEvent) => { 
    e.preventDefault();
    if (!project || !linkedOwnerEmailInput.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني للمالك.", variant: "destructive"});
      return;
    }
    
    const updatedProjectResult = await dbUpdateProject(project.id.toString(), { linkedOwnerEmail: linkedOwnerEmailInput }); 
    if (updatedProjectResult.success) {
        await refreshProjectData();
        toast({ title: "تم ربط المالك", description: `تم ربط المالك بالبريد الإلكتروني: ${linkedOwnerEmailInput}.` });
    } else {
        toast({ title: "خطأ", description: "فشل ربط المالك.", variant: "destructive" });
    }
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !project) {
      toast({ title: "لم يتم اختيار ملف", description: "يرجى اختيار ملف لتحميله.", variant: "destructive" });
      return;
    }
    setIsUploadingFile(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const newPhoto: ProjectPhoto = {
      id: crypto.randomUUID(),
      src: URL.createObjectURL(selectedFile), 
      alt: `Uploaded: ${selectedFile.name}`,
      dataAiHint: "uploaded image",
      caption: `تم الرفع: ${selectedFile.name}`
    };
    
    const updatedProjectResult = await dbUpdateProject(project.id.toString(), { 
        photos: [...(project.photos || []), newPhoto]
    });

    if (updatedProjectResult.success) {
        await refreshProjectData();
        setSelectedFile(null);
        const fileInput = document.getElementById('projectFileUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        toast({ title: "تم رفع الملف بنجاح", description: `${selectedFile.name} جاهز الآن.` });
        setIsUploadModalOpen(false); // Close modal on success
    } else {
        toast({ title: "خطأ", description: "فشل رفع الملف.", variant: "destructive" });
    }
    setIsUploadingFile(false);
  };

  // Calculate project start and end dates based on actual project data
  const getProjectDates = () => {
    if (!project) {
      return { 
        projectStartDate: new Date(), 
        projectEndDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        totalProjectDurationDays: 30
      };
    }

    let projectStartDate: Date;
    let projectEndDate: Date;
    let totalProjectDurationDays: number;

    // Use project dates if available
    if (project.startDate && project.endDate) {
      projectStartDate = new Date(project.startDate);
      projectEndDate = new Date(project.endDate);
      totalProjectDurationDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } 
    // Fall back to timeline tasks if project dates are not available
    else if (project.timelineTasks && project.timelineTasks.length > 0) {
      projectStartDate = new Date(Math.min(...project.timelineTasks.map(task => new Date(task.startDate).getTime())));
      projectEndDate = new Date(Math.max(...project.timelineTasks.map(task => new Date(task.endDate).getTime())));
      totalProjectDurationDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } 
    // Default to current date and 30 days if no data is available
    else {
      projectStartDate = new Date();
      projectEndDate = new Date(new Date().setDate(new Date().getDate() + 30));
      totalProjectDurationDays = 30;
    }

    // Ensure minimum duration of 1 day
    if (totalProjectDurationDays <= 0) {
      totalProjectDurationDays = 1;
      projectEndDate = new Date(projectStartDate);
      projectEndDate.setDate(projectEndDate.getDate() + 1);
    }

    return { projectStartDate, projectEndDate, totalProjectDurationDays };
  };

  const { projectStartDate, projectEndDate, totalProjectDurationDays } = getProjectDates();

  const getTaskPositionAndWidth = (task: TimelineTask) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const offsetDays = Math.ceil((taskStart.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const durationDays = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const leftPercentage = (offsetDays / totalProjectDurationDays) * 100;
    const widthPercentage = (durationDays / totalProjectDurationDays) * 100;
    return {
      left: `${Math.max(0, Math.min(100 - widthPercentage, leftPercentage))}%`,
      width: `${Math.max(2, Math.min(100, widthPercentage))}%`,
    };
  };

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Alert variant="destructive">
          <FileText className="h-5 w-5" />
          <AlertTitle>المشروع غير موجود</AlertTitle>
          <AlertDescription>لم يتم العثور على تفاصيل المشروع المطلوب.</AlertDescription>
        </Alert>
         <Button asChild className="mt-6 bg-app-gold hover:bg-yellow-600 text-primary-foreground">
           <Link href="/engineer/projects">العودة إلى قائمة المشاريع</Link>
         </Button>
      </div>
    );
  }

  // Enhanced simulation function with progress tracking
  const simulateAction = async (actionName: string, duration = 2000) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationStatus(`جاري تنفيذ ${actionName}...`);
    
    // Simulate progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, duration / 10);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    setIsSimulating(false);
    setSimulationStatus('');
    toast({ 
      title: "اكتملت المحاكاة", 
      description: `تم تنفيذ "${actionName}" بنجاح (محاكاة).` 
    });
  };
  
  // Add a new timeline task (persistent)
  const handleAddTask = async () => {
    if (!newTask.name || !newTask.startDate || !newTask.endDate) {
      toast({ title: "خطأ", description: "يرجى ملء جميع حقول المهمة", variant: "destructive" });
      return;
    }

    if (project) {
      // Use default color if none specified
      const taskColor = newTask.color || defaultColors[project.timelineTasks?.length % defaultColors.length] || '#3b82f6';
      
      const taskToAdd: TimelineTask = {
        id: crypto.randomUUID(),
        name: newTask.name,
        startDate: newTask.startDate,
        endDate: newTask.endDate,
        status: newTask.status as any,
        color: taskColor,
        progress: 0
      };
      
      const updatedProjectResult = await dbUpdateProject(project.id.toString(), { 
        timelineTasks: [...(project.timelineTasks || []), taskToAdd]
      });

      if (updatedProjectResult.success) {
        await refreshProjectData();
        setNewTask({ name: '', startDate: '', endDate: '', color: '#3b82f6', status: 'مخطط له' });
        setIsAddTaskModalOpen(false);
        toast({ title: "تمت إضافة المهمة", description: "تم حفظ المهمة الجديدة بنجاح." });
      }
    }
  };
  
  // Edit an existing timeline task (persistent)
  const handleEditTask = async () => {
    if (!taskToEdit || !taskToEdit.name || !taskToEdit.startDate || !taskToEdit.endDate) {
      toast({ title: "خطأ", description: "يرجى ملء جميع حقول المهمة", variant: "destructive" });
      return;
    }

    if (project) {
      const updatedTasks = project.timelineTasks?.map(task => 
        task.id === taskToEdit.id ? taskToEdit : task
      ) || [];
      
      const updatedProjectResult = await dbUpdateProject(project.id.toString(), { 
        timelineTasks: updatedTasks
      });

      if (updatedProjectResult.success) {
        await refreshProjectData();
        setTaskToEdit(null);
        setIsEditTaskModalOpen(false);
        toast({ title: "تم تعديل المهمة", description: "تم حفظ التعديلات بنجاح." });
      }
    }
  };
  
  // Delete a timeline task (persistent)
  const handleDeleteTask = async (taskId: string) => {
    if (project) {
      const updatedTasks = project.timelineTasks?.filter(task => task.id !== taskId) || [];
      
      const updatedProjectResult = await dbUpdateProject(project.id.toString(), { 
        timelineTasks: updatedTasks
      });

      if (updatedProjectResult.success) {
        await refreshProjectData();
        toast({ title: "تم حذف المهمة", description: "تم حذف المهمة وحفظ التغيير." });
      }
    }
  };
  
  // Add cost report (persistent)
  const handleAddCostReport = async () => {
    if (!newCostReport.reportName || newCostReport.totalCost_ILS <= 0) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم التقرير والتكلفة", variant: "destructive" });
      return;
    }
    if (!project) return;

    const created = await addCostReport({
      projectId: project.id,
      reportName: newCostReport.reportName,
      engineerId: '',
      engineerName: project.engineer || '',
      ownerId: '',
      ownerName: project.clientName || project.linkedOwnerEmail || '',
      items: [],
      totalCost_ILS: newCostReport.totalCost_ILS,
    });

    if (created) {
      const refreshed = await getCostReportsForProject(project.id.toString());
      setCostReports(refreshed);
      setNewCostReport({ reportName: '', totalCost_ILS: 0 });
      setIsCostReportModalOpen(false);
      toast({ title: "تمت إضافة التقرير", description: "تم حفظ تقرير التكاليف بنجاح." });
    } else {
      toast({ title: "خطأ", description: "فشل حفظ تقرير التكاليف.", variant: "destructive" });
    }
  };
  
  // Real concrete calculation using API
  const calculateConcreteQuantities = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationStatus("جاري حساب كميات الباطون...");
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setSimulationProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      // Prepare calculation input (you can make this dynamic based on project data)
      const input: ConcreteCalculationInput = {
        projectArea: 200, // مساحة افتراضية - يمكن جعلها ديناميكية
        floors: 3,
        foundationDepth: 1.5,
        wallThickness: 0.2,
        slabThickness: 0.15
      };
      
      const response = await apiClient.calculateConcrete(input);
      
      clearInterval(interval);
      setIsSimulating(false);
      setSimulationStatus('');
      
      if (response.success && response.data) {
        setConcreteResults(response.data);
        setResultsType('concrete');
        setIsResultsModalOpen(true);
        
        toast({ 
          title: "نتائج حساب الباطون", 
          description: `إجمالي الحجم: ${response.data.totalVolume} م³` 
        });
        
        return response.data;
      } else {
        toast({ 
          title: "خطأ في الحساب", 
          description: response.message || "فشل حساب كميات الباطون", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      setIsSimulating(false);
      setSimulationStatus('');
      toast({ 
        title: "خطأ في الاتصال", 
        description: "فشل الاتصال بخادم الحسابات", 
        variant: "destructive" 
      });
    }
  };
  
  // Real steel calculation using API
  const calculateSteelQuantities = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationStatus("جاري حساب كميات الحديد...");
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setSimulationProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      // Use concrete volume from previous calculation or default
      const concreteVolume = concreteResults?.totalVolume || 100;
      
      const input: SteelCalculationInput = {
        concreteVolume,
        steelRatio: 80 // نسبة افتراضية 80 كجم/م³
      };
      
      const response = await apiClient.calculateSteel(input);
      
      clearInterval(interval);
      setIsSimulating(false);
      setSimulationStatus('');
      
      if (response.success && response.data) {
        setSteelResults(response.data);
        setResultsType('steel');
        setIsResultsModalOpen(true);
        
        toast({ 
          title: "نتائج حساب الحديد", 
          description: `إجمالي الوزن: ${response.data.totalWeight} كجم` 
        });
        
        return response.data;
      } else {
        toast({ 
          title: "خطأ في الحساب", 
          description: response.message || "فشل حساب كميات الحديد", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      setIsSimulating(false);
      setSimulationStatus('');
      toast({ 
        title: "خطأ في الاتصال", 
        description: "فشل الاتصال بخادم الحسابات", 
        variant: "destructive" 
      });
    }
  };
  
  // Simulation for generating reports
  const simulateReportGeneration = async () => {
    await simulateAction("توليد تقارير المشروع", 4000);
    
    // Mock report generation
    const reportData = {
      projectProgress: project.overallProgress,
      completedTasks: project.timelineTasks?.filter(t => t.status === 'مكتمل').length || 0,
      totalTasks: project.timelineTasks?.length || 0,
      totalCost: costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0),
      estimatedRemainingCost: Math.floor(Math.random() * 50000) + 10000,
      budgetUtilization: Math.floor(Math.random() * 30) + 40,
      timeRemaining: Math.floor(Math.random() * 90) + 30,
      riskLevel: Math.random() > 0.7 ? 'عالي' : Math.random() > 0.4 ? 'متوسط' : 'منخفض'
    };
    
    setReportData(reportData);
    setResultsType('report');
    setIsResultsModalOpen(true);
    
    toast({ 
      title: "تم إنشاء التقرير", 
      description: "تم إنشاء تقرير المشروع بنجاح" 
    });
    
    return reportData;
  };
  
  // Function to open edit task modal
  const openEditTaskModal = (task: TimelineTask) => {
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  // Format date for timeline display (shorter format)
  const formatTimelineDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <>
      {/* Simulation Progress Bar */}
      {isSimulating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg p-4 border-b border-gray-200">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LoaderIcon className="h-5 w-5 animate-spin text-app-red" />
                <span className="font-medium">{simulationStatus}</span>
              </div>
              <div className="w-64">
                <Progress value={simulationProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto py-8 px-4 text-right">
        {/* Project Header */}
        <Card className="bg-white/95 shadow-xl mb-8 border-t-4 border-t-app-red rounded-lg overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-3xl font-bold text-app-red">{project.name}</CardTitle>
                        <Badge variant={project.status === 'مكتمل' ? 'default' : project.status === 'قيد التنفيذ' ? 'secondary' : 'outline'} className="text-sm">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Building className="h-3 w-3 ms-1" />
                          {project.location || 'غير محدد'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 ms-1" />
                          {project.engineer || 'غير محدد'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-gray-700 text-base">{project.description}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!isOwnerView && (
                      <Button variant="outline" size="sm" className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white" onClick={() => setIsEditModalOpen(true)}>
                          <FileEdit size={18} className="ms-1.5" /> تعديل بيانات المشروع
                      </Button>
                  )}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm text-gray-600 mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-app-red" />
                  <strong>الموقع:</strong> {project.location || 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4 text-app-red" />
                  <strong>المهندس:</strong> {project.engineer || 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-app-red" />
                  <strong>العميل:</strong> {project.clientName || 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-app-red" />
                  <strong>الميزانية:</strong> {project.budget ? `${project.budget.toLocaleString()} شيكل` : 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-app-red" />
                  <strong>تاريخ البدء:</strong> {project.startDate ? formatDate(project.startDate) : 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-app-red" />
                  <strong>التسليم المتوقع:</strong> {project.endDate ? formatDate(project.endDate) : 'غير محدد'}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-app-red" />
                  <strong>مدة المشروع:</strong> {totalProjectDurationDays} يوم
                </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-base font-semibold text-gray-800">التقدم العام للمشروع:</Label>
                <span className="font-bold text-app-gold text-lg">{project.overallProgress}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={project.overallProgress} className="h-4 flex-grow" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className={`text-sm font-semibold ${
                      project.status === 'مكتمل' ? 'text-green-600' :
                      project.status === 'قيد التنفيذ' ? 'text-yellow-600' :
                      'text-blue-600' 
                    }`}>
                      الحالة الحالية: {project.status}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Activity className="h-4 w-4 text-app-red" />
                  <span className="font-medium text-base">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Tools */}
        {!isOwnerView && (
          <Card className="bg-white/95 shadow-lg mb-8 border-t-4 border-t-blue-500 rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                <Wrench size={28}/> أدوات إدارة المشروع
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600 h-14" onClick={() => simulateAction("فتح نموذج إدخال تفاصيل العناصر الإنشائية")}>
                  <ListChecks size={18} className="ms-2"/> إدخال تفاصيل العناصر
              </Button>
               <Button variant="outline" className="w-full justify-start bg-red-500 text-white hover:bg-red-600 h-14" onClick={calculateConcreteQuantities}>
                  <HardHat size={18} className="ms-2"/> حساب كميات الباطون
              </Button>
              <Button variant="outline" className="w-full justify-start bg-green-500 text-white hover:bg-green-600 h-14" onClick={calculateSteelQuantities}>
                  <BarChart3 size={18} className="ms-2"/> حساب كميات الحديد
              </Button>
               <Button variant="outline" className="w-full justify-start bg-purple-500 text-white hover:bg-purple-600 h-14" onClick={() => setIsUploadModalOpen(true)}>
                  <UploadCloud size={18} className="ms-2"/> رفع صور/فيديو للمشروع
              </Button>
                <Button variant="outline" className="w-full justify-start bg-orange-500 text-white hover:bg-orange-600 h-14" onClick={() => setIsAddTaskModalOpen(true)}>
                    <GanttChartSquare size={18} className="ms-2"/> إضافة مهمة جديدة
                </Button>
                <Button variant="outline" className="w-full justify-start bg-cyan-500 text-white hover:bg-cyan-600 h-14" onClick={simulateReportGeneration}>
                    <Download size={18} className="ms-2"/> توليد/تصدير التقارير
                </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">نظرة عامة</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">الجدول الزمني</TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">الوسائط</TabsTrigger>
            <TabsTrigger value="costs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">التكاليف</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-white/95 shadow-lg border-t-4 border-t-green-500 rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                      <Target size={28} /> ملخص المشروع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <CalendarDays className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">مدة المشروع</p>
                              <p className="font-semibold">{totalProjectDurationDays} يوم</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">المهام المكتملة</p>
                              <p className="font-semibold">
                                {project.timelineTasks?.filter(t => t.status === 'مكتمل').length || 0} / {project.timelineTasks?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">التعليقات</p>
                              <p className="font-semibold">{project.comments?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">التكاليف الإجمالية</p>
                              <p className="font-semibold">
                                {costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0).toLocaleString()} شيكل
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-100 rounded-full">
                              <ImageIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">الوسائط</p>
                              <p className="font-semibold">{project.photos?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-full">
                              <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">معدل التقدم</p>
                              <p className="font-semibold">{project.overallProgress}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/95 shadow-lg border-t-4 border-t-pink-500 rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                      <MessageSquare size={28} /> التعليقات والاستفسارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCommentSubmit} className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="newComment" className="font-semibold text-gray-700">أضف تعليقاً أو استفساراً:</Label>
                        <Textarea
                          id="newComment" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                          placeholder="اكتب تعليقك هنا..." rows={3} className="mt-1 bg-white focus:border-app-gold"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={isSubmittingComment || !newComment.trim()}>
                        {isSubmittingComment ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                        إرسال التعليق
                      </Button>
                    </form>
                    <Separator className="my-6" />
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                      {project.comments && project.comments.length > 0 ? (
                        project.comments.slice().reverse().map((comment) => (
                          <div key={comment.id} className={cn(
                            "p-4 rounded-lg border shadow-sm transition-all hover:shadow-md",
                            comment.user === "المالك" ? "bg-yellow-50 border-app-gold" : "bg-gray-50 border-gray-200"
                          )}>
                            <div className="flex items-start gap-3">
                               <Avatar className="h-10 w-10">
                                <AvatarImage src={comment.avatar} alt={comment.user} />
                                <AvatarFallback className={comment.user === "المالك" ? "bg-yellow-200 text-yellow-800" : "bg-blue-200 text-blue-800"}>
                                  {comment.user.substring(0,1)}
                                </AvatarFallback>
                              </Avatar>
                               <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                      <p className="font-semibold text-gray-800">{comment.user}</p>
                                      <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <p className="text-gray-700 mt-2">{comment.text}</p>
                               </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-8">
                {!isOwnerView && (
                  <>
                    <Card className="bg-white/95 shadow-lg border-t-4 border-t-yellow-500 rounded-lg overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                          <Percent size={28} /> تحديث تقدم الإنشاء
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleProgressSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="progressPercentage" className="font-semibold text-gray-700">نسبة التقدم الإجمالية (%):</Label>
                            <Input 
                              id="progressPercentage" type="number" min="0" max="100"
                              value={progressUpdate.percentage}
                              onChange={(e) => setProgressUpdate({...progressUpdate, percentage: e.target.value})}
                              className="mt-1 bg-white focus:border-app-gold" placeholder="مثال: 75"
                            />
                          </div>
                          <div>
                            <Label htmlFor="progressNotes" className="font-semibold text-gray-700">ملاحظات التقدم:</Label>
                            <Textarea 
                              id="progressNotes" rows={3}
                              value={progressUpdate.notes}
                              onChange={(e) => setProgressUpdate({...progressUpdate, notes: e.target.value})}
                              className="mt-1 bg-white focus:border-app-gold" placeholder="أضف ملاحظات حول التقدم المحرز..."
                            />
                          </div>
                          <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                            <Send size={18} className="ms-2"/> إرسال تحديث التقدم
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  
                    <Card className="bg-white/95 shadow-lg border-t-4 border-t-indigo-500 rounded-lg overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                          <Users size={28} /> ربط المالك بالمشروع
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleLinkOwnerSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="ownerEmail" className="font-semibold text-gray-700">البريد الإلكتروني للمالك:</Label>
                            <Input 
                              id="ownerEmail" type="email"
                              value={linkedOwnerEmailInput}
                              onChange={(e) => setLinkedOwnerEmailInput(e.target.value)}
                              className="mt-1 bg-white focus:border-app-gold" placeholder="owner@example.com"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-app-gold hover:bg-yellow-600 text-primary-foreground font-semibold">
                            <Link2 size={18} className="ms-2"/> {project.linkedOwnerEmail ? "تحديث ربط المالك" : "ربط المالك"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </>
                )}
                
                <Card className="bg-white/95 shadow-lg border-t-4 border-teal-500 rounded-lg overflow-hidden">
                  <CardHeader>
                      <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                          <Wallet size={28}/> تقارير التكاليف
                      </CardTitle>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => setIsCostReportModalOpen(true)}>
                          <Plus size={16} className="ms-1"/> إضافة تقرير
                        </Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                  {costReports.length > 0 ? (
                      <div className="space-y-3">
                          {costReports.map(report => (
                          <div key={report.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                              <div>
                              <p className="font-medium text-sm text-gray-700">{report.reportName}</p>
                              <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString('ar-EG')}</p>
                              </div>
                              <p className="font-semibold text-base text-green-700">{report.totalCost_ILS.toLocaleString()} شيكل</p>
                          </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between items-center pt-2">
                          <p className="font-bold text-base text-app-red">الإجمالي الكلي:</p>
                          <p className="font-bold text-lg text-app-red">
                              {costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0).toLocaleString()} شيكل
                          </p>
                          </div>
                      </div>
                      ) : (
                      <div className="text-center py-8">
                        <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm mb-3">لا توجد تقارير تكاليف محفوظة لهذا المشروع بعد.</p>
                        {!isOwnerView && (
                          <Button size="sm" onClick={() => setIsCostReportModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                            <Plus size={16} className="ms-1"/> إضافة أول تقرير
                          </Button>
                        )}
                      </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-8">
            <Card className="bg-white/95 shadow-lg border-t-4 border-t-green-500 rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                  <GanttChartSquare size={28} /> الجدول الزمني للمشروع
                </CardTitle>
                {!isOwnerView && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white" onClick={() => setIsAddTaskModalOpen(true)}>
                        <Plus size={18} className="ms-1.5" /> إضافة مهمة
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white" onClick={() => setActiveTab('timeline')}>
                        <CalendarDays size={18} className="ms-1.5" /> تعديل مهام الجدول
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {project.timelineTasks && project.timelineTasks.length > 0 ? (
                  <>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">تاريخ البدء: {formatDate(projectStartDate.toISOString())}</p>
                          <p className="text-sm text-gray-600">تاريخ الانتهاء: {formatDate(projectEndDate.toISOString())}</p>
                        </div>
                        <p className="text-sm font-semibold">المدة الإجمالية: {totalProjectDurationDays} يوم</p>
                      </div>
                    </div>
                    
                    {/* Timeline Header with Dates */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">تاريخ البدء</p>
                          <p className="font-bold text-blue-700">{formatDate(projectStartDate.toISOString())}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">تاريخ الانتهاء</p>
                          <p className="font-bold text-green-700">{formatDate(projectEndDate.toISOString())}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">المدة الإجمالية</p>
                          <p className="font-bold text-purple-700">{totalProjectDurationDays} يوم</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Chart */}
                    <div className="space-y-5 relative overflow-x-auto p-4 pb-6 min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-inner border">
                      {/* Month/Year Grid */}
                      <div className="absolute inset-0 grid grid-cols-12 gap-0 pointer-events-none opacity-30">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const monthDate = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth() + i);
                          return (
                            <div key={`month-grid-${i}`} className={cn("border-r border-gray-300", i === 11 && "border-r-0")}>
                              <div className="p-2 text-center">
                                <span className="block text-xs text-gray-500 font-medium">
                                  {monthDate.toLocaleString('ar', { month: 'short' })}
                                </span>
                                <span className="block text-xs text-gray-400">
                                  {monthDate.getFullYear()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Timeline Tasks */}
                      {project.timelineTasks.map((task, index) => {
                        const { left, width } = getTaskPositionAndWidth(task);
                        const taskStartDate = new Date(task.startDate);
                        const taskEndDate = new Date(task.endDate);
                        
                        return (
                          <div key={task.id} className="relative h-16 flex items-center text-right pr-3 group" style={{ zIndex: index + 1 }}>
                            {/* Task Color Indicator */}
                            <div 
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: task.color }}
                            />
                            
                            {/* Task Bar */}
                            <div 
                              className={cn(
                                "absolute h-10 rounded-lg shadow-md flex items-center justify-between px-3 text-white transition-all duration-300 ease-in-out hover:shadow-lg text-sm font-medium",
                                !isOwnerView && "cursor-pointer group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-50"
                              )}
                              style={{ 
                                left, 
                                width, 
                                right: 'auto',
                                backgroundColor: task.color,
                                boxShadow: `0 4px 8px ${task.color}40`
                              }}
                              title={`${task.name}\nمن: ${formatTimelineDate(task.startDate)}\nإلى: ${formatTimelineDate(task.endDate)}\nالحالة: ${task.status}${task.progress !== undefined ? `\nالتقدم: ${task.progress}%` : ''}`}
                              onClick={!isOwnerView ? () => openEditTaskModal(task) : undefined}
                            >
                              <span className="font-semibold truncate">{task.name}</span>
                              <div className="flex items-center gap-1">
                                {task.status === 'مكتمل' && <CheckCircle2 size={16} className="text-white shrink-0"/>}
                                {task.status === 'قيد التنفيذ' && <div className="h-3 w-3 rounded-full bg-white animate-pulse shrink-0"></div>}
                                {task.status === 'مخطط له' && <div className="h-3 w-3 rounded-full bg-white/70 shrink-0"></div>}
                              </div>
                            </div>

                            {/* Task Info */}
                            <div className="absolute right-0 top-0 h-full flex flex-col justify-center pr-2">
                              <div className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded shadow-sm">
                                <div className="font-medium">{task.name}</div>
                                <div className="text-gray-500">
                                  {formatTimelineDate(task.startDate)} - {formatTimelineDate(task.endDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">قائمة المهام</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">المهمة</TableHead>
                            <TableHead className="text-right">اللون</TableHead>
                            <TableHead className="text-right">تاريخ البدء</TableHead>
                            <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                            <TableHead className="text-right">المدة</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {project.timelineTasks.map((task) => {
                            const startDate = new Date(task.startDate);
                            const endDate = new Date(task.endDate);
                            const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            
                            return (
                              <TableRow key={task.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{task.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: task.color }}
                                    />
                                    <span className="text-xs text-gray-500 font-mono">{task.color}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{formatDate(task.startDate)}</div>
                                    <div className="text-xs text-gray-500">
                                      {startDate.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{formatDate(task.endDate)}</div>
                                    <div className="text-xs text-gray-500">
                                      {endDate.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-medium text-blue-600">
                                    {duration} يوم
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={task.status === 'مكتمل' ? 'default' : task.status === 'قيد التنفيذ' ? 'secondary' : 'outline'}
                                    className={cn(
                                      task.status === 'مكتمل' && 'bg-green-100 text-green-800',
                                      task.status === 'قيد التنفيذ' && 'bg-yellow-100 text-yellow-800',
                                      task.status === 'مخطط له' && 'bg-blue-100 text-blue-800'
                                    )}
                                  >
                                    {task.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {!isOwnerView && (
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" onClick={() => openEditTaskModal(task)}>
                                        <FileEdit size={14} />
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <GanttChartSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-6">لا يوجد جدول زمني محدد لهذا المشروع بعد.</p>
                    {!isOwnerView && (
                      <Button onClick={() => setIsAddTaskModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                        <Plus size={18} className="ms-2"/> إضافة أول مهمة
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-8">
            <Card className="bg-white/95 shadow-lg border-t-4 border-t-purple-500 rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                  <ImageIcon size={28} /> وسائط المشروع
                </CardTitle>
                <div className="flex justify-end">
                  {!isOwnerView && (
                    <Button onClick={() => setIsUploadModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                      <UploadCloud size={18} className="ms-2"/> رفع وسائط جديدة
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {project.photos && project.photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {project.photos.map((photo) => (
                      <div key={photo.id} className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="aspect-square relative">
                          <Image 
                              src={photo.src} alt={photo.alt} fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              data-ai-hint={photo.dataAiHint} 
                          />
                        </div>
                        {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {photo.caption}
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-6">لا توجد وسائط مرفوعة لهذا المشروع حالياً.</p>
                    {!isOwnerView && (
                      <Button onClick={() => setIsUploadModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                        <UploadCloud size={18} className="ms-2"/> رفع أول وسائط
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-8">
            <Card className="bg-white/95 shadow-lg border-t-4 border-teal-500 rounded-lg overflow-hidden">
              <CardHeader>
                  <CardTitle className="text-2xl font-bold text-app-red flex items-center gap-2">
                      <Wallet size={28}/> تقارير التكاليف
                  </CardTitle>
                  <div className="flex justify-end">
                    {!isOwnerView && (
                      <Button onClick={() => setIsCostReportModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                        <Plus size={18} className="ms-2"/> إضافة تقرير جديد
                      </Button>
                    )}
                  </div>
              </CardHeader>
              <CardContent>
              {costReports.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700 mb-1">عدد التقارير</p>
                        <p className="text-2xl font-bold text-blue-900">{costReports.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-green-700 mb-1">إجمالي التكاليف</p>
                        <p className="text-2xl font-bold text-green-900">
                          {costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0).toLocaleString()} شيكل
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <p className="text-sm text-purple-700 mb-1">متوسط التكلفة</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round(costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0) / costReports.length).toLocaleString()} شيكل
                        </p>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم التقرير</TableHead>
                          <TableHead className="text-right">التكلفة (شيكل)</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costReports.map(report => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.reportName}</TableCell>
                            <TableCell className="font-semibold text-green-700">{report.totalCost_ILS.toLocaleString()}</TableCell>
                            <TableCell>{new Date(report.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Download size={14} />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <FileEdit size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="font-bold text-base text-app-red">الإجمالي الكلي:</p>
                      <p className="font-bold text-xl text-app-red">
                          {costReports.reduce((acc, r) => acc + r.totalCost_ILS, 0).toLocaleString()} شيكل
                      </p>
                    </div>
                  </div>
                  ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm mb-6">لا توجد تقارير تكاليف محفوظة لهذا المشروع بعد.</p>
                    {!isOwnerView && (
                      <Button onClick={() => setIsCostReportModalOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                        <Plus size={18} className="ms-2"/> إضافة أول تقرير
                      </Button>
                    )}
                  </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload File Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px] bg-white/95 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsUploadModalOpen(false)}
              className="rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="text-xl font-bold text-gray-800 text-right">رفع وسائط جديدة</DialogTitle>
          </DialogHeader>
          <div className="py-4 px-6 space-y-4 text-right">
              <div>
                  <Label htmlFor="fileType" className="block mb-1.5 font-semibold text-gray-700">نوع الوسائط:</Label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="bg-white focus:border-blue-500 border-gray-200">
                      <SelectValue placeholder="اختر نوع الوسائط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">صورة</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="document">مستند</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                  <Label htmlFor="projectFileUpload" className="block mb-1.5 font-semibold text-gray-700">اختر ملفًا:</Label>
                  <Input id="projectFileUpload" type="file" onChange={handleFileChange} className="bg-white focus:border-blue-500 border-gray-200"/>
                  {selectedFile && <p className="text-xs text-gray-500 mt-1">الملف المختار: {selectedFile.name}</p>}
              </div>
              <Button onClick={handleFileUpload} disabled={isUploadingFile || !selectedFile || isOwnerView} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isUploadingFile ? <LoaderIcon className="ms-2 h-5 w-5 animate-spin"/> : <UploadCloud size={18} className="ms-2"/>}
                  {isUploadingFile ? 'جاري الرفع...' : 'رفع الملف'}
              </Button>
              {isOwnerView && <p className="text-xs text-red-500 text-center">المالك لا يمكنه رفع الملفات.</p>}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px] bg-white/95 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAddTaskModalOpen(false)}
              className="rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="text-xl font-bold text-gray-800 text-right">إضافة مهمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="py-4 px-6 space-y-4 text-right">
              <div>
                  <Label htmlFor="taskName" className="block mb-1.5 font-semibold text-gray-700">اسم المهمة:</Label>
                  <Input 
                    id="taskName" 
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="bg-white focus:border-orange-500 border-gray-200"
                    placeholder="مثال: الحفر والأساسات"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate" className="block mb-1.5 font-semibold text-gray-700">تاريخ البدء:</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      value={newTask.startDate}
                      onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                      className="bg-white focus:border-orange-500 border-gray-200"
                    />
                </div>
                <div>
                    <Label htmlFor="endDate" className="block mb-1.5 font-semibold text-gray-700">تاريخ الانتهاء:</Label>
                    <Input 
                      id="endDate" 
                      type="date"
                      value={newTask.endDate}
                      onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                      className="bg-white focus:border-orange-500 border-gray-200"
                    />
                </div>
              </div>
              <div>
                  <Label htmlFor="taskStatus" className="block mb-1.5 font-semibold text-gray-700">الحالة:</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value})}>
                    <SelectTrigger className="bg-white focus:border-orange-500 border-gray-200">
                      <SelectValue placeholder="اختر حالة المهمة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مخطط له">مخطط له</SelectItem>
                      <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                      <SelectItem value="مكتمل">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                  <Label htmlFor="taskColor" className="block mb-1.5 font-semibold text-gray-700">اللون:</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        id="taskColor" 
                        type="color"
                        value={newTask.color}
                        onChange={(e) => setNewTask({...newTask, color: e.target.value})}
                        className="w-12 h-12 p-1 bg-white border rounded-lg shadow-sm"
                      />
                      <span className="text-sm text-gray-600">اختر لون المهمة</span>
                    </div>
                    
                    {/* Color Palette */}
                    <div className="grid grid-cols-5 gap-2">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            newTask.color === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTask({...newTask, color})}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
              </div>
              <Button onClick={handleAddTask} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Plus size={18} className="ms-2"/> إضافة المهمة
              </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px] bg-white/95 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditTaskModalOpen(false)}
              className="rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="text-xl font-bold text-gray-800 text-right">تعديل المهمة</DialogTitle>
          </DialogHeader>
          {taskToEdit && (
            <div className="py-4 px-6 space-y-4 text-right">
                <div>
                    <Label htmlFor="editTaskName" className="block mb-1.5 font-semibold text-gray-700">اسم المهمة:</Label>
                    <Input 
                      id="editTaskName" 
                      value={taskToEdit.name}
                      onChange={(e) => setTaskToEdit({...taskToEdit, name: e.target.value})}
                      className="bg-white focus:border-indigo-500 border-gray-200"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="editStartDate" className="block mb-1.5 font-semibold text-gray-700">تاريخ البدء:</Label>
                      <Input 
                        id="editStartDate" 
                        type="date"
                        value={taskToEdit.startDate}
                        onChange={(e) => setTaskToEdit({...taskToEdit, startDate: e.target.value})}
                        className="bg-white focus:border-indigo-500 border-gray-200"
                      />
                  </div>
                  <div>
                      <Label htmlFor="editEndDate" className="block mb-1.5 font-semibold text-gray-700">تاريخ الانتهاء:</Label>
                      <Input 
                        id="editEndDate" 
                        type="date"
                        value={taskToEdit.endDate}
                        onChange={(e) => setTaskToEdit({...taskToEdit, endDate: e.target.value})}
                        className="bg-white focus:border-indigo-500 border-gray-200"
                      />
                  </div>
                </div>
                <div>
                    <Label htmlFor="editTaskStatus" className="block mb-1.5 font-semibold text-gray-700">الحالة:</Label>
                    <Select value={taskToEdit.status} onValueChange={(value) => setTaskToEdit({...taskToEdit, status: value as any})}>
                      <SelectTrigger className="bg-white focus:border-indigo-500 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مخطط له">مخطط له</SelectItem>
                        <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                        <SelectItem value="مكتمل">مكتمل</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="editTaskColor" className="block mb-1.5 font-semibold text-gray-700">اللون:</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input 
                          id="editTaskColor" 
                          type="color"
                          value={taskToEdit.color}
                          onChange={(e) => setTaskToEdit({...taskToEdit, color: e.target.value})}
                          className="w-12 h-12 p-1 bg-white border rounded-lg shadow-sm"
                        />
                        <span className="text-sm text-gray-600">اختر لون المهمة</span>
                      </div>
                      
                      {/* Color Palette */}
                      <div className="grid grid-cols-5 gap-2">
                        {defaultColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                              taskToEdit.color === color ? 'border-gray-800 shadow-lg' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setTaskToEdit({...taskToEdit, color})}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditTask} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Save size={18} className="ms-2"/> حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={() => handleDeleteTask(taskToEdit.id)} className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 size={18} />
                  </Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cost Report Dialog */}
      <Dialog open={isCostReportModalOpen} onOpenChange={setIsCostReportModalOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px] bg-white/95 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600"></div>
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCostReportModalOpen(false)}
              className="rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="text-xl font-bold text-gray-800 text-right">إضافة تقرير تكاليف جديد</DialogTitle>
          </DialogHeader>
          <div className="py-4 px-6 space-y-4 text-right">
              <div>
                  <Label htmlFor="reportName" className="block mb-1.5 font-semibold text-gray-700">اسم التقرير:</Label>
                  <Input 
                    id="reportName" 
                    value={newCostReport.reportName}
                    onChange={(e) => setNewCostReport({...newCostReport, reportName: e.target.value})}
                    className="bg-white focus:border-teal-500 border-gray-200"
                    placeholder="مثال: تكاليف المواد الأولية"
                  />
              </div>
              <div>
                  <Label htmlFor="totalCost" className="block mb-1.5 font-semibold text-gray-700">إجمالي التكلفة (شيكل):</Label>
                  <Input 
                    id="totalCost" 
                    type="number"
                    min="0"
                    value={newCostReport.totalCost_ILS || ''}
                    onChange={(e) => setNewCostReport({...newCostReport, totalCost_ILS: Number(e.target.value)})}
                    className="bg-white focus:border-teal-500 border-gray-200"
                    placeholder="مثال: 15000"
                  />
              </div>
              <Button onClick={handleAddCostReport} className="w-full bg-teal-600 hover:bg-teal-700">
                  <Plus size={18} className="ms-2"/> إضافة التقرير
              </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Results Modal */}
      <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[600px] bg-white/95 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="absolute top-4 left-4 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsResultsModalOpen(false)}
              className="rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogHeader className="pt-8 pb-4 px-6">
            <DialogTitle className="text-xl font-bold text-gray-800 text-right">
              {resultsType === 'concrete' ? 'نتائج حساب كميات الباطون' : 
               resultsType === 'steel' ? 'نتائج حساب كميات الحديد' : 
               'تقرير المشروع'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 px-6 space-y-4 text-right">
            {resultsType === 'concrete' && concreteResults && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">إجمالي حجم الباطون:</span>
                    <span className="text-xl font-bold text-blue-700">{concreteResults.totalVolume} م³</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">حجم الأساسات:</p>
                    <p className="font-semibold">{concreteResults.foundationVolume} م³</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">حجم الأعمدة:</p>
                    <p className="font-semibold">{concreteResults.columnsVolume} م³</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">حكم الكمرات:</p>
                    <p className="font-semibold">{concreteResults.beamsVolume} م³</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">حكم البلاطات:</p>
                    <p className="font-semibold">{concreteResults.slabsVolume} م³</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">حكم السلالم:</p>
                    <p className="font-semibold">{concreteResults.stairsVolume} م³</p>
                  </div>
                </div>
              </div>
            )}
            
            {resultsType === 'steel' && steelResults && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">إجمالي وزن الحديد:</span>
                    <span className="text-xl font-bold text-green-700">{steelResults.totalWeight} كجم</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">وزن حديد الأعمدة:</p>
                    <p className="font-semibold">{steelResults.columnsSteel} كجم</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">وزن حديد الكمرات:</p>
                    <p className="font-semibold">{steelResults.beamsSteel} كجم</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">وزن حديد البلاطات:</p>
                    <p className="font-semibold">{steelResults.slabsSteel} كجم</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">وزن حديد الرئيسي:</p>
                    <p className="font-semibold">{steelResults.mainSteelWeight} كجم</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">وزن حديد الثانوي:</p>
                    <p className="font-semibold">{steelResults.secondarySteelWeight} كجم</p>
                  </div>
                </div>
              </div>
            )}
            
            {resultsType === 'report' && reportData && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">تقدم المشروع:</span>
                    <span className="text-xl font-bold text-purple-700">{reportData.projectProgress}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">المهام المكتملة:</p>
                    <p className="font-semibold">{reportData.completedTasks} / {reportData.totalTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">التكاليف الإجمالية:</p>
                    <p className="font-semibold">{reportData.totalCost.toLocaleString()} شيكل</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">التكاليف المقدرة المتبقية:</p>
                    <p className="font-semibold">{reportData.estimatedRemainingCost.toLocaleString()} شيكل</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">نسبة استهلاك الميزانية:</p>
                    <p className="font-semibold">{reportData.budgetUtilization}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">الوقت المتبقي (أيام):</p>
                    <p className="font-semibold">{reportData.timeRemaining}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">مستوى المخاطرة:</p>
                    <p className={`font-semibold ${
                      reportData.riskLevel === 'عالي' ? 'text-red-600' : 
                      reportData.riskLevel === 'متوسط' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {reportData.riskLevel}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsResultsModalOpen(false)}>
                إغلاق
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Download size={18} className="ms-2"/> تصدير النتائج
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <EditProjectDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProjectUpdated={refreshProjectData}
        project={project}
      />
    </>
  );
}