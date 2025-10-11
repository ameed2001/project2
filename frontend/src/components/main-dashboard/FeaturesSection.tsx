
"use client";

import FeatureCard from './FeatureCard';
import { Zap, ShieldCheck, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-red-500" />,
    title: "سرعة ودقة في الحساب",
    description: "نوفر لك أدوات حساب سريعة ودقيقة تمكنك من الحصول على النتائج في ثوان معدودة مع ضمان الدقة العالية.",
    iconBgColor: "bg-red-100",
    dataAiHint: "speed accuracy",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
    title: "موثوقية عالية",
    description: "تم تطوير الحاسبات وفقًا للمعايير الهندسية المعتمدة عالميًا لضمان نتائج موثوقة يمكن الاعتماد عليها.",
    iconBgColor: "bg-blue-100",
    dataAiHint: "reliability security",
  },
  {
    icon: <Smartphone className="h-8 w-8 text-green-500" />,
    title: "سهولة الاستخدام",
    description: "واجهة سهلة الاستخدام ومتوافقة مع جميع الأجهزة تتيح لك إجراء الحسابات في أي وقت ومن أي مكان.",
    iconBgColor: "bg-green-100",
    dataAiHint: "ease use",
  },
];


const FeaturesSection = () => {
  return (
    <section 
      className="py-16 md:py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          لماذا تختار موقعنا؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              iconBgColor={feature.iconBgColor}
              dataAiHint={feature.dataAiHint}
              className="bg-white/95"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
