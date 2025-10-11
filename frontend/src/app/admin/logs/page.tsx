
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ScrollText, Search, Download, Loader2, Trash2, AlertTriangle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { getLogs, type LogEntry, type LogLevel, deleteAllLogs } from '@/lib/db';
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

export default function AdminLogsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [logs, setLogsState] = useState<LogEntry[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setAdminUserId(id);
  }, []);

  const fetchLogsFromDb = async () => {
    setIsFetching(true);
    try {
      const fetchedLogs = await getLogs();
      setLogsState(fetchedLogs);
      setTotalLogsCount(fetchedLogs.length);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل تحميل سجلات النظام.", variant: "destructive" });
      console.error("Error fetching logs:", error);
      setLogsState([]);
      setTotalLogsCount(0);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchLogsFromDb();
  }, [toast]);


  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch = searchTerm === '' ||
                              log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, logLevelFilter]);

  const getLogLevelStyles = (level: LogLevel) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-700 border-red-500';
      case 'WARNING': return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-500';
      case 'INFO':
      default: return 'bg-blue-100 text-blue-700 border-blue-500';
    }
  };

  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      toast({ title: "لا توجد سجلات للتصدير", description: "يرجى تعديل الفلاتر إذا كنت تتوقع وجود سجلات.", variant: "default" });
      return;
    }
    const logData = filteredLogs.map(log => `${format(new Date(log.timestamp), "yyyy/MM/dd HH:mm:ss", { locale: arSA })} | ${log.level} | ${log.user || 'N/A'} | ${log.message}`).join("\n");
    const blob = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'system_logs.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    toast({ title: "تم تصدير السجلات", description: "تم بدء تنزيل ملف السجلات المصفاة." });
  };

  const handleDeleteAllLogs = async () => {
    if (!adminUserId) {
        toast({ title: "خطأ", description: "لم يتم التعرف على هوية المسؤول.", variant: "destructive"});
        return;
    }
    setDeleteStep('loading');
    
    const result = await deleteAllLogs(adminUserId);

    if (result.success) {
        setDeleteStep('success');
        setTimeout(() => {
            setIsDialogOpen(false);
            fetchLogsFromDb();
        }, 2000);
        toast({ title: "تم الحذف", description: result.message || "تم حذف جميع السجلات بنجاح."});
    } else {
        setDeleteStep('confirm');
        setIsDialogOpen(false);
        toast({ title: "خطأ في الحذف", description: result.message || "فشل حذف السجلات.", variant: "destructive"});
    }
  };
  
  const handleOpenDialog = () => {
    setDeleteStep('confirm');
    setIsDialogOpen(true);
  }


  return (
    <Card className="bg-white/95 shadow-xl w-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <CardTitle className="text-3xl font-bold text-app-red flex items-center gap-2">
                <ScrollText className="h-8 w-8" /> سجلات النظام
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">مراجعة وتصفية أنشطة وأحداث النظام الهامة.</CardDescription>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              onClick={handleExportLogs}
              className="bg-blue-50 text-blue-700 border-2 border-blue-500 hover:bg-blue-500 hover:text-white dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white font-medium"
            >
              <Download className="ms-2 h-4 w-4" /> تصدير السجلات
            </Button>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={handleOpenDialog}
                  variant="destructive"
                  className="bg-red-50 text-red-700 border-2 border-red-500 hover:bg-red-600 hover:text-white dark:bg-red-700/30 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white font-medium"
                  disabled={logs.length === 0}
                >
                  <Trash2 className="ms-2 h-4 w-4" />
                  حذف جميع السجلات
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl" className="sm:max-w-md">
                {deleteStep === 'confirm' && (
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
                            سيتم حذف: <span className="font-bold">"جميع سجلات النظام"</span>
                            </div>
                            <p className="text-xs text-gray-500">لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                        </AlertDialogDescription>

                        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-center gap-4 pt-4">
                        <AlertDialogAction onClick={handleDeleteAllLogs} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 font-bold py-2.5 px-6 rounded-lg" disabled={deleteStep === 'loading'}>
                            {deleteStep === 'loading' ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : "حذف نهائي"}
                        </AlertDialogAction>
                        <AlertDialogCancel className="w-full sm:w-auto mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-800 border-none font-bold py-2.5 px-6 rounded-lg">إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                    </>
                )}
                {deleteStep === 'loading' && (
                    <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
                        <div className="w-24 h-24 bg-amber-100 rounded-full animate-pulse"></div>
                        <h2 className="text-3xl font-bold text-amber-700">جاري الحذف...</h2>
                        <p className="text-lg text-gray-500">يتم حذف السجلات الآن...</p>
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
                        <p className="text-lg text-gray-500">تم حذف جميع السجلات بنجاح.</p>
                    </div>
                )}
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
          <div className="relative md:col-span-2">
            <Input
              type="search"
              placeholder="ابحث في رسائل السجل أو المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-white focus:border-app-gold"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Select value={logLevelFilter} onValueChange={setLogLevelFilter} dir="rtl">
            <SelectTrigger className="w-full bg-white focus:border-app-gold text-right">
              <SelectValue placeholder="تصفية حسب المستوى..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              <SelectItem value="INFO">معلومات (INFO)</SelectItem>
              <SelectItem value="SUCCESS">نجاح (SUCCESS)</SelectItem>
              <SelectItem value="WARNING">تحذير (WARNING)</SelectItem>
              <SelectItem value="ERROR">خطأ (ERROR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
            <p className="ms-3 text-lg">جاري تحميل السجلات...</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px] rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-100 z-10">
                  <TableRow>
                    <TableHead className="w-[180px] text-right font-semibold text-gray-700">الوقت والتاريخ</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold text-gray-700">المستوى</TableHead>
                    <TableHead className="w-[150px] text-right font-semibold text-gray-700">المستخدم</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">الرسالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/50 text-sm">
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), "yyyy/MM/dd HH:mm:ss", { locale: arSA })}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLogLevelStyles(log.level)}`}>
                          {log.level}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{log.user || 'نظام'}</TableCell>
                      <TableCell className="leading-relaxed">{log.message}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                        {logs.length === 0 ? "لا توجد سجلات في النظام حالياً." : "لا توجد سجلات تطابق معايير البحث أو التصفية."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            {filteredLogs.length > 0 && (
                <p className="text-xs text-gray-500 text-center">يتم عرض {filteredLogs.length} من إجمالي {totalLogsCount} سجل.</p>
            )}
             {totalLogsCount === 0 && !isFetching && (
                <p className="text-center text-gray-500 py-10">لا توجد سجلات في النظام حالياً.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
