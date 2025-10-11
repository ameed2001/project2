"use client";

import { Quote } from 'lucide-react';
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "عميد سماره",
    role: "صاحب مشروع",
    testimonial: "الموقع رائع وسهل الاستخدام! ساعدني كثيرًا في تقدير كميات المواد لمشروعي بسرعة ودقة. أنصح به بشدة.",
    dataAiHint: "user testimonial"
  },
  {
    name: "م. أحمد خالد",
    role: "مهندس إنشائي",
    testimonial: "كـ مهندس، أجد هذا الموقع أداة قيمة جدًا. المعادلات دقيقة والواجهة سهلة. يوفر الكثير من الوقت والجهد.",
    dataAiHint: "engineer testimonial"
  },
  {
    name: "سارة عبدالله",
    role: "مستخدم جديد",
    testimonial: "أخيرًا موقع عربي متكامل لحساب كميات البناء! تصميم جذاب وأدوات مفيدة للغاية. شكرًا للقائمين عليه.",
    dataAiHint: "user review"
  },
  {
    name: "شركة البناء الحديث",
    role: "مقاولات عامة",
    testimonial: "نستخدم الموقع لتقديراتنا الأولية للمشاريع. يساعدنا في تقديم عروض أسعار سريعة لعملائنا. عمل ممتاز!",
    dataAiHint: "company feedback"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* العنوان */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            ماذا يقول المستخدمون عنا؟
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            آراء وشهادات من مهندسين وملاك مشاريع يثقون في منصتنا.
          </p>
          <div className="mt-4 w-24 h-1 bg-app-gold mx-auto rounded-full" />
        </div>

        {/* المراجعات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              data-ai-hint={testimonial.dataAiHint}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 text-right transition-all duration-500 group hover:scale-[1.02]"
              )}
            >
              {/* أيقونة الاقتباس */}
              <Quote className="absolute top-4 left-4 text-app-gold opacity-20 w-12 h-12" />

              {/* المحتوى */}
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-app-gold transition-colors">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.testimonial}"
                </p>
              </div>

              {/* زخرفة دائرية خلفية */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-app-gold/10 rounded-full blur-2xl z-0"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
