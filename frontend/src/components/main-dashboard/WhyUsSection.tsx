"use client";

import { CheckCircle, Eye, Target } from "lucide-react";

const whyUsData = [
  {
    icon: <Target className="h-10 w-10 text-red-500" />,
    title: "الدقة هي أساسنا",
    description:
      "نحن نستخدم معايير هندسية صارمة لضمان أن كل حساب يتم على منصتنا هو دقيق وموثوق، مما يمنحك الثقة لاتخاذ قرارات سليمة.",
  },
  {
    icon: <Eye className="h-10 w-10 text-blue-500" />,
    title: "الشفافية الكاملة",
    description:
      "نوفر جسرًا من الثقة بين المهندس والمالك من خلال تقارير واضحة ومتابعة حية للمشروع، مما يضمن أن يكون الجميع على اطلاع دائم.",
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-green-500" />,
    title: "الكفاءة وتوفير الوقت",
    description:
      "تم تصميم أدواتنا لتبسيط العمليات المعقدة، مما يوفر ساعات من العمل اليدوي ويسمح لك بالتركيز على ما هو أكثر أهمية: نجاح مشروعك.",
  },
];

const WhyUsSection = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            لماذا تثق بنا؟
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            نحن لا نقدم مجرد أرقام، بل نقدم الثقة والوضوح في كل خطوة من خطوات
            مشروعك الإنشائي.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyUsData.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex justify-center items-center mb-6 w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-center text-app-red dark:text-app-gold mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
