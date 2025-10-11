"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateProjectReport, type GenerateProjectReportInput } from '@/ai/flows/generate-project-report';
import { Loader2 } from 'lucide-react';

const reportSchema = z.object({
  projectData: z.string().min(10, { message: "بيانات المشروع مطلوبة (10 أحرف على الأقل)." }),
  instructions: z.string().min(10, { message: "التعليمات مطلوبة (10 أحرف على الأقل)." }),
  audience: z.string().min(3, { message: "الجمهور المستهدف مطلوب (3 أحرف على الأقل)." }),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function AiReportGeneratorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedReportUrl(null);
    try {
      const input: GenerateProjectReportInput = {
        projectData: data.projectData,
        instructions: data.instructions,
        audience: data.audience,
      };
      const result = await generateProjectReport(input);
      
      // Assuming the report is a base64 PDF string
      const pdfBlob = new Blob([Uint8Array.from(atob(result.report), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setGeneratedReportUrl(url);

      toast({
        title: "نجاح",
        description: "تم إنشاء التقرير بنجاح. يمكنك تنزيله الآن.",
        variant: "default",
      });
      reset();
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto bg-white/95 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-app-red text-center">إنشاء تقرير مشروع بالذكاء الاصطناعي</CardTitle>
            <CardDescription className="text-center text-gray-600 mt-2">
              أدخل بيانات مشروعك والتعليمات لإنشاء تقرير PDF مخصص.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right">
              <div>
                <Label htmlFor="projectData" className="block mb-2 font-semibold text-gray-700">بيانات المشروع المتراكمة:</Label>
                <Textarea
                  id="projectData"
                  {...register("projectData")}
                  rows={5}
                  className="bg-white focus:border-app-gold"
                  placeholder="مثال: المشروع يتكون من 5 طوابق، تم إنجاز الأساسات والأعمدة للطابق الأول..."
                />
                {errors.projectData && <p className="text-red-500 text-sm mt-1">{errors.projectData.message}</p>}
              </div>

              <div>
                <Label htmlFor="instructions" className="block mb-2 font-semibold text-gray-700">تعليمات لتجميع التقرير:</Label>
                <Textarea
                  id="instructions"
                  {...register("instructions")}
                  rows={3}
                  className="bg-white focus:border-app-gold"
                  placeholder="مثال: ركز على التقدم المحرز في الشهر الماضي، أضف ملخصًا للتكاليف..."
                />
                {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions.message}</p>}
              </div>

              <div>
                <Label htmlFor="audience" className="block mb-2 font-semibold text-gray-700">الجمهور المستهدف للتقرير:</Label>
                <Input
                  id="audience"
                  type="text"
                  {...register("audience")}
                  className="bg-white focus:border-app-gold"
                  placeholder="مثال: المالك، المستثمرون، الإدارة العليا"
                />
                {errors.audience && <p className="text-red-500 text-sm mt-1">{errors.audience.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-app-red hover:bg-red-700 text-white font-bold py-3 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء التقرير"
                )}
              </Button>
            </form>
          </CardContent>
          {generatedReportUrl && (
            <CardFooter className="flex justify-center mt-6">
              <a
                href={generatedReportUrl}
                download="project_report.pdf"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                تنزيل التقرير (PDF)
              </a>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
