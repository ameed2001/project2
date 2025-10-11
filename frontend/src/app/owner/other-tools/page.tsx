
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function OtherToolsPage() {
  return (
      <div className="container mx-auto py-10 px-4 text-right">
        <Card className="max-w-2xl mx-auto bg-white/95 shadow-xl border border-gray-200/80 dark:border-gray-700/60">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Wrench className="h-16 w-16 text-app-gold" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-app-red">
              أدوات إضافية للمالك
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300 mt-3">
              نعمل باستمرار على تطوير وإضافة المزيد من الأدوات لمساعدتك.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div 
              className="p-6 my-6 bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-dashed border-app-gold rounded-lg shadow-inner"
              data-ai-hint="coming soon tools"
            >
              <h3 className="text-2xl font-semibold text-amber-700 mb-3">
                ✨ قريبًا: المزيد من الأدوات! ✨
              </h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                نحن نعمل على تطوير مجموعة من الأدوات الإضافية والميزات الجديدة المصممة خصيصًا لمساعدتك كمالك للمشروع. هدفنا هو تزويدك بكل ما تحتاجه لإدارة وتتبع مشروعك بكفاءة وسهولة أكبر.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-3">
                تابعنا للاطلاع على التحديثات القادمة!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
