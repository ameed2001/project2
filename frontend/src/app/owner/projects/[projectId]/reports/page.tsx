"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

export default function ProjectReportsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
  return (
    <div className="container mx-auto py-10 px-4 text-right">
      <Card className="max-w-2xl mx-auto bg-white/95 shadow-xl">
        <CardHeader className="text-center">
          <FileText className="mx-auto h-16 w-16 text-app-gold mb-3" />
          <CardTitle className="text-3xl font-bold text-app-red">تقارير الكميات للمشروع</CardTitle>
          <CardDescription className="text-gray-600 mt-2 text-base">
            هذه الصفحة مخصصة لعرض التقارير التفصيلية للكميات والتكاليف.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-5 px-6">
          <p className="text-gray-800 text-lg">
            سيقوم المهندس برفع التقارير هنا عند اكتمالها.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg">
            <Link href={`/owner/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              العودة إلى تفاصيل المشروع
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
