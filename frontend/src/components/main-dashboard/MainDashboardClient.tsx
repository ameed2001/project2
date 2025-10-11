// This is a client component for the main dashboard

"use client";

import InfoCard from '@/components/ui/InfoCard';
import { Box, BarChart3, Calculator } from 'lucide-react';
import { useState } from 'react';
import AuthRequiredModal from '@/components/modals/AuthRequiredModal';

const MainDashboardClient = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleFeatureClick = () => {
    setIsAuthModalOpen(true);
  };

  const dashboardCards = [
    {
      title: "حساب كميات الباطون",
      description: "حساب الكميات الدقيقة للخرسانة لمختلف العناصر الإنشائية.",
      icon: <Box className="h-8 w-8 text-red-600"/>, 
      iconWrapperClass: "bg-red-100",
      onClick: handleFeatureClick,
      dataAiHint: "concrete calculation",
      cardHeightClass: "h-72",
      applyFlipEffect: false,
      frontCustomClass: "bg-white/95",
    },
    {
      title: "حساب كميات الحديد",
      description: "تقدير كميات حديد التسليح المطلوبة لمشروعك.",
      icon: <BarChart3 className="h-8 w-8 text-blue-600"/>,
      iconWrapperClass: "bg-blue-100",
      onClick: handleFeatureClick,
      dataAiHint: "steel calculation",
      cardHeightClass: "h-72",
      applyFlipEffect: false,
      frontCustomClass: "bg-white/95",
    },
    {
      title: "حساب الأسعار",
      description: "تقدير التكلفة الإجمالية لمواد البناء المختلفة لمشروعك.",
      icon: <Calculator className="h-8 w-8 text-green-600"/>, // Using Calculator icon
      iconWrapperClass: "bg-green-100", // Different color for distinction
      onClick: handleFeatureClick,
      dataAiHint: "price calculation",
      cardHeightClass: "h-72",
      applyFlipEffect: false,
      frontCustomClass: "bg-white/95",
    },
  ];

  return (
    <>
      <section 
        className="py-16 text-center bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">أدواتك الأساسية للحسابات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {dashboardCards.map(card => (
              <InfoCard 
                key={card.title}
                {...card}
              />
            ))}
          </div>
        </div>
      </section>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default MainDashboardClient;
