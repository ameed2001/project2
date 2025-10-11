
"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FolderArchive, UploadCloud, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
}

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف لتحميله.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDocument: DocumentFile = {
      id: crypto.randomUUID(),
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
    };
    setUploadedDocuments(prev => [...prev, newDocument]);
    setSelectedFile(null);
    // Clear the file input visually
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    setIsLoading(false);
    toast({
      title: "تم رفع الملف بنجاح",
      description: `${selectedFile.name} جاهز الآن.`,
      variant: "default",
    });
  };

  const handleDeleteDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "تم حذف المستند",
      description: "تمت إزالة المستند من القائمة.",
      variant: "default",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-4xl mx-auto bg-white/95 shadow-xl">
          <CardHeader className="text-center">
            <FolderArchive className="mx-auto h-16 w-16 text-app-gold mb-4" />
            <CardTitle className="text-3xl font-bold text-app-red">إدارة المستندات</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              مكان مركزي لإدارة جميع مستندات المشروع مثل المخططات، العقود، والفواتير.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 space-y-8 px-4 md:px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
              <div className="space-y-2 text-right">
                <Label htmlFor="fileUpload" className="text-base font-semibold text-gray-800">اختر ملفًا للرفع:</Label>
                <Input
                  id="fileUpload"
                  type="file"
                  onChange={handleFileChange}
                  className="bg-white file:text-app-red file:font-semibold hover:file:bg-app-red/10 file:rounded-md file:border-0 file:mr-2 file:ml-4 file:py-2 file:px-4 cursor-pointer"
                />
                {selectedFile && <p className="text-sm text-gray-500 mt-1">الملف المختار: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>}
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-app-red hover:bg-red-700 text-white font-bold py-2.5 px-6 text-lg" disabled={isLoading || !selectedFile}>
                {isLoading ? (
                  <>
                    <UploadCloud className="ms-2 h-5 w-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <UploadCloud className="ms-2 h-5 w-5" />
                    رفع الملف
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-app-red text-right border-b-2 border-app-gold pb-2">المستندات المرفوعة</h3>
              {uploadedDocuments.length === 0 ? (
                <div data-ai-hint="empty document list" className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>لا توجد مستندات مرفوعة حاليًا.</p>
                  <p className="text-sm">استخدم النموذج أعلاه لرفع أول مستند.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {uploadedDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 text-right">
                        <FileText className="h-6 w-6 text-app-gold shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">{doc.name}</p>
                          <p className="text-xs text-gray-500">النوع: {doc.type || 'غير معروف'} - الحجم: {formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">حذف المستند</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
