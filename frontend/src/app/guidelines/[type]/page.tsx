// This page can be a redirect to the main page or display a message.
// The actual functionality is triggered via modals from the main dashboard (page.tsx).
"use client"; 

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from 'next/navigation';

export default function GuidelinesPage() {
  const params = useParams();
  const type = params.type;
  const pageTitle = type === 'engineer' ? 'إرشادات للمهندس' : type === 'owner' ? 'إرشادات لصاحب المبنى' : 'إرشادات';

  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto bg-white/90 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-app-red">{pageTitle}</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              لعرض الإرشادات، يرجى استخدام الخيارات المتاحة في الصفحة الرئيسية.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 space-y-6 text-center">
            <p>
              يتم عرض الإرشادات التفصيلية من خلال نوافذ منبثقة (Modals) في لوحة التحكم الرئيسية.
            </p>
            <Button asChild className="bg-app-gold hover:bg-yellow-600 text-primary-foreground">
              <Link href="/">العودة إلى الصفحة الرئيسية</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
