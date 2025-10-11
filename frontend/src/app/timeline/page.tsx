
"use client";

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GanttChartSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TimelinePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-3xl mx-auto bg-white/95 shadow-xl">
          <CardHeader className="text-center">
            <GanttChartSquare className="mx-auto h-16 w-16 text-app-gold mb-4" />
            <CardTitle className="text-3xl font-bold text-app-red">الجدول الزمني للمشروع</CardTitle>
            <CardDescription className="text-gray-600 mt-2 text-lg">
              يتم إنشاء الجدول الزمني لكل مشروع على حدة بواسطة المهندس المسؤول.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 space-y-6 text-center">
            <p>
              لعرض الجدول الزمني التفاعلي والفعلي لمشروعك، يرجى تسجيل الدخول والانتقال إلى صفحة تفاصيل المشروع من قائمة مشاريعك.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-app-red hover:bg-red-700 text-white font-bold py-2.5 px-6">
                <Link href="/login">تسجيل دخول المهندس</Link>
              </Button>
               <Button asChild variant="secondary" className="font-bold">
                <Link href="/owner-login">تسجيل دخول المالك</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
