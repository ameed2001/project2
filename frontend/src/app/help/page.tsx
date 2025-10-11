"use client";

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { HelpCircle, HardHat, Home, UserPlus, Search, MessageCircle } from "lucide-react";

const generalFaqs = [
  {
    question: "ما هي منصة 'المحترف لحساب الكميات'؟",
    answer: "هي منصة رقمية متكاملة مصممة للمهندسين وأصحاب المشاريع ومديري النظام لإدارة المشاريع الإنشائية بكفاءة، بدءًا من التخطيط وتقدير الكميات، وصولًا إلى متابعة التقدم والتكاليف وإصدار التقارير."
  },
  {
    question: "كيف تعمل أدوات تقدير الكميات؟",
    answer: "توفر المنصة حاسبات متخصصة لتقدير كميات الباطون والحديد بناءً على الأبعاد والمواصفات الهندسية التي تدخلها. كما توفر أداة شاملة لتقدير التكاليف بناءً على أسعار المواد المحدثة."
  },
  {
    question: "هل يمكنني تتبع تقدم المشروع من خلال المنصة؟",
    answer: "نعم، يمكن للمهندسين تحديث نسبة الإنجاز، رفع صور من موقع العمل، وإدارة جدول زمني تفاعلي للمشروع. ويمكن للمالكين الاطلاع على كل هذه التحديثات بشكل فوري من خلال لوحة التحكم الخاصة بهم."
  },
  {
    question: "ما نوع التقارير التي يمكن إنشاؤها؟",
    answer: "يمكنك إنشاء تقارير مفصلة للتكاليف، ملخصات لكميات المواد، وقريبًا، سيتم إضافة ميزة إنشاء تقارير PDF مدعومة بالذكاء الاصطناعي ومخصصة لجماهير مختلفة (مثل المالكين أو المستثمرين)."
  },
  {
    question: "هل بياناتي آمنة على المنصة؟",
    answer: "بالتأكيد. نحن نولي أهمية قصوى لأمن البيانات ونستخدم أحدث بروتوكولات الأمان لحماية جميع معلومات المستخدمين والمشاريع."
  }
];

const engineerFaqs = [
  {
    question: "كيف أقوم بإنشاء مشروع جديد؟",
    answer: "من لوحة تحكم المهندس، يمكنك العثور على خيار 'إنشاء مشروع جديد'. سيتم توجيهك إلى نموذج لإدخال جميع التفاصيل الأساسية للمشروع مثل الاسم والموقع والوصف."
  },
  {
    question: "كيف يمكنني ربط مالك بمشروع؟",
    answer: "بعد إنشاء المشروع، يمكنك استخدام أداة 'ربط المالكين' حيث تقوم بإدخال البريد الإلكتروني للمالك المسجل في المنصة لربطه بالمشروع ومنحه صلاحية المتابعة."
  },
  {
    question: "هل يمكنني إدارة عدة مشاريع في نفس الوقت؟",
    answer: "نعم، تم تصميم لوحة تحكم المهندس لعرض وإدارة جميع مشاريعك النشطة والمؤرشفة في مكان واحد، مما يسهل عليك التنقل بينها ومتابعتها."
  }
];

const ownerFaqs = [
  {
    question: "كيف أرى تقدم المشروع الخاص بي؟",
    answer: "بمجرد أن يقوم المهندس المسؤول بربط حسابك بالمشروع، ستظهر جميع تفاصيله في لوحة التحكم الخاصة بك، بما في ذلك نسبة الإنجاز، الصور المرفوعة، الجدول الزمني، وتقارير التكاليف."
  },
  {
    question: "هل يمكنني التواصل مع المهندس عبر المنصة؟",
    answer: "نعم، يمكنك إضافة تعليقات واستفسارات مباشرة على صفحة المشروع المخصصة، وسيتلقى المهندس إشعارًا بذلك، مما يسهل التواصل وحفظ سجل للمناقشات."
  },
  {
    question: "هل لدي صلاحية الوصول إلى تقارير التكاليف؟",
    answer: "نعم، عندما يقوم المهندس بإعداد تقارير التكاليف أو الكميات ومشاركتها، ستكون متاحة لك للاطلاع عليها مباشرة من خلال صفحة المشروع."
  }
];

const newUserFaqs = [
    {
    question: "هل أحتاج إلى حساب لاستخدام الأدوات؟",
    answer: <>نعم، التسجيل إلزامي للاستفادة من جميع ميزات المنصة. يمكنك <Link href="/signup" className="text-app-red hover:underline font-semibold">التسجيل كمهندس</Link> أو <Link href="/owner-signup" className="text-app-red hover:underline font-semibold">كمالك مشروع</Link>.</>
    },
    {
    question: "ما الفرق بين حساب المهندس وحساب المالك؟",
    answer: "حساب المهندس مخصص لإدارة المشاريع، إدخال البيانات الفنية، حساب الكميات والتكاليف، وتحديث التقدم. أما حساب المالك فهو مخصص لمراقبة هذه البيانات، الاطلاع على التقارير، والتواصل مع فريق العمل."
    },
];


export default function HelpPage() {
  // فتح أول سؤال افتراضيًا لكل قسم لتسريع تجربة المستخدم
  const [openGeneral, setOpenGeneral] = useState<string | null>('general-0');
  const [openEngineer, setOpenEngineer] = useState<string | null>('engineer-0');
  const [openOwner, setOpenOwner] = useState<string | null>('owner-0');
  const [openNewUser, setOpenNewUser] = useState<string | null>('new-user-0');

  // دوال فتح/إغلاق سريعة
  const handleGeneral = useCallback((value: string) => setOpenGeneral(v => v === value ? null : value), []);
  const handleEngineer = useCallback((value: string) => setOpenEngineer(v => v === value ? null : value), []);
  const handleOwner = useCallback((value: string) => setOpenOwner(v => v === value ? null : value), []);
  const handleNewUser = useCallback((value: string) => setOpenNewUser(v => v === value ? null : value), []);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <HelpCircle className="mx-auto h-16 w-16 text-app-gold mb-4" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-app-red rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-app-red to-app-gold mb-4">
            مركز المساعدة
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            تجد هنا إجابات للأسئلة الأكثر شيوعًا حول منصتنا. إذا لم تجد ما تبحث عنه، لا تتردد في <Link href="/contact" className="text-app-red hover:underline font-semibold">مراسلتنا</Link>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Search className="mx-auto h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-800 mb-2">البحث السريع</h3>
              <p className="text-sm text-gray-600">استخدم Ctrl+F للبحث في الأسئلة الشائعة</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-green-800 mb-2">تواصل معنا</h3>
              <p className="text-sm text-gray-600">
                <Link href="/contact" className="text-green-700 hover:underline">راسلنا مباشرة</Link> لأي استفسارات إضافية
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Content */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            {/* General FAQs */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-app-red mb-6 pb-3 border-b-2 border-app-gold">
                أسئلة عامة عن المنصة
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <Accordion type="single" collapsible className="w-full" value={openGeneral ?? undefined} onValueChange={handleGeneral}>
                  {generalFaqs.map((faq, index) => (
                    <AccordionItem value={`general-${index}`} key={index} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="py-4 text-lg font-semibold text-right hover:text-app-gold transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-2 text-gray-700 leading-relaxed bg-white/70 p-4 rounded-lg">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
            {/* Role-based FAQs */}
            <section>
              <h2 className="text-2xl font-bold text-app-red mb-6 pb-3 border-b-2 border-app-gold">
                أسئلة حسب دور المستخدم
              </h2>
              <div className="space-y-6">
                {/* Engineers */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-blue-700 mb-4">
                    <HardHat className="h-6 w-6" />
                    للمهندسين
                  </h3>
                  <Accordion type="single" collapsible className="w-full" value={openEngineer ?? undefined} onValueChange={handleEngineer}>
                    {engineerFaqs.map((faq, index) => (
                      <AccordionItem value={`engineer-${index}`} key={index} className="border-b border-blue-200 last:border-b-0">
                        <AccordionTrigger className="py-3 text-base text-right hover:text-blue-800 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2 text-gray-700 leading-relaxed bg-white/70 p-4 rounded-lg">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                {/* Owners */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-green-700 mb-4">
                    <Home className="h-6 w-6" />
                    للمالكين
                  </h3>
                  <Accordion type="single" collapsible className="w-full" value={openOwner ?? undefined} onValueChange={handleOwner}>
                    {ownerFaqs.map((faq, index) => (
                      <AccordionItem value={`owner-${index}`} key={index} className="border-b border-green-200 last:border-b-0">
                        <AccordionTrigger className="py-3 text-base text-right hover:text-green-800 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2 text-gray-700 leading-relaxed bg-white/70 p-4 rounded-lg">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                {/* New Users */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="flex items-center gap-3 text-xl font-bold text-purple-700 mb-4">
                    <UserPlus className="h-6 w-6" />
                    للتسجيل والمستخدمين الجدد
                  </h3>
                  <Accordion type="single" collapsible className="w-full" value={openNewUser ?? undefined} onValueChange={handleNewUser}>
                    {newUserFaqs.map((faq, index) => (
                      <AccordionItem value={`new-user-${index}`} key={index} className="border-b border-purple-200 last:border-b-0">
                        <AccordionTrigger className="py-3 text-base text-right hover:text-purple-800 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-2 text-gray-700 leading-relaxed bg-white/70 p-4 rounded-lg">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>
            {/* Contact CTA */}
            <div className="mt-10 text-center">
              <div className="bg-gradient-to-r from-app-red/10 to-app-gold/10 rounded-xl p-6 border border-app-red/20">
                <h3 className="text-xl font-bold text-app-red mb-3">لم تجد ما تبحث عنه؟</h3>
                <p className="text-gray-600 mb-4">فريقنا جاهز لمساعدتك في أي وقت</p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 bg-app-red text-white px-6 py-3 rounded-lg hover:bg-app-red/90 transition-colors font-semibold"
                >
                  <MessageCircle className="h-5 w-5" />
                  تواصل معنا
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}