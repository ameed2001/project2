"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck, MailWarning, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import { testEmailSettingsAction, type EmailTestResult } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function AdminEmailTesterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);

  const handleRunTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const result = await testEmailSettingsAction();
      setTestResult(result);
    } catch (error) {
      console.error("Email test error:", error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء إجراء اختبار الاتصال. يرجى مراجعة سجلات الخادم.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-white/95 shadow-xl w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Server className="mx-auto h-12 w-12 text-app-gold mb-3" />
        <CardTitle className="text-3xl font-bold text-app-red">فحص إعدادات البريد الإلكتروني</CardTitle>
        <CardDescription className="text-gray-600">
          استخدم هذه الأداة للتحقق من أن إعدادات البريد الإلكتروني في ملف <code>.env.local</code> صحيحة وأن النظام يمكنه الاتصال بخادم البريد الخاص بك.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        <div className="flex justify-center">
          <Button onClick={handleRunTest} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg px-8">
            {isLoading ? (
              <>
                <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                جاري الاختبار...
              </>
            ) : (
              <>
                <MailCheck className="ms-2 h-5 w-5" />
                بدء اختبار الاتصال
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className="pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4 text-center">نتائج الاختبار</h3>
            
            <div className={`p-4 rounded-lg border-2 ${testResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center gap-3">
                {testResult.success ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertTriangle className="h-8 w-8 text-red-600" />}
                <h4 className={`text-lg font-bold ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.success ? 'الاتصال ناجح!' : 'فشل الاتصال'}
                </h4>
              </div>
              <p className={`mt-2 text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.message}
              </p>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-md border">
                <h5 className="font-semibold mb-2 text-right">المتغيرات الموجودة:</h5>
                {testResult.configuredVars.length > 0 ? (
                  <ul className="flex flex-col items-start gap-1">
                    {testResult.configuredVars.map(v => <li key={v} className="flex items-center gap-2 text-green-700"><code>{v}</code><CheckCircle size={16} /></li>)}
                  </ul>
                ) : <p className="text-gray-500 text-right">لا توجد.</p>}
              </div>
              <div className="p-3 bg-gray-50 rounded-md border">
                <h5 className="font-semibold mb-2 text-right">المتغيرات المفقودة:</h5>
                 {testResult.missingVars.length > 0 ? (
                  <ul className="flex flex-col items-start gap-1">
                    {testResult.missingVars.map(v => <li key={v} className="flex items-center gap-2 text-red-700"><code>{v}</code><MailWarning size={16} /></li>)}
                  </ul>
                ) : <p className="text-gray-500 text-right">لا يوجد نقص.</p>}
              </div>
            </div>
             {!testResult.success && testResult.message.includes('getaddrinfo ENOTFOUND') && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm">
                    <p><strong>تلميح:</strong> الخطأ <code>ENOTFOUND</code> يعني أن قيمة <code>EMAIL_HOST</code> غير صحيحة أو لا يمكن الوصول إليها. تأكد من أنها مكتوبة بشكل صحيح (مثال: <code>smtp.gmail.com</code>).</p>
                </div>
            )}
             {!testResult.success && (testResult.message.includes('Invalid login') || testResult.message.includes('535-5.7.8')) && (
                <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm">
                    <p><strong>تلميح:</strong> الخطأ <code>Invalid login</code> يعني أن <code>EMAIL_USER</code> أو <code>EMAIL_PASS</code> غير صحيحين. إذا كنت تستخدم Gmail، تأكد من استخدام "كلمة مرور للتطبيقات" (App Password) وليس كلمة مرور حسابك العادية.</p>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
