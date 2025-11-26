"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStartClick = useCallback(() => {
    const startJourneySection = document.getElementById('start-journey');
    if (startJourneySection) {
      startJourneySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const features = useMemo(() => [
    {
      icon: "🎯",
      text: "تقدير الكميات بدقة وفقًا للمخططات والمعايير الفنية",
      delay: "0.1s"
    },
    {
      icon: "💰",
      text: "احتساب التكاليف والأسعار التقديرية لمواد البناء والعمالة",
      delay: "0.2s"
    },
    {
      icon: "🔧",
      text: "متابعة مراحل البناء خطوة بخطوة: من الحفر وحتى التشطيب",
      delay: "0.3s"
    },
    {
      icon: "📊",
      text: "إدارة المشاريع والمستندات بسهولة واحترافية",
      delay: "0.4s"
    }
  ], []);

  const staticBackground = useMemo(() => ({
    background: `
      radial-gradient(circle at 50% 50%, 
        rgba(255,193,7,0.08) 0%, 
        rgba(0,0,0,0.3) 30%, 
        rgba(0,0,0,0.7) 70%
      ),
      linear-gradient(135deg, 
        rgba(0,0,0,0.9) 0%, 
        rgba(0,0,0,0.5) 50%, 
        rgba(0,0,0,0.7) 100%
      )
    `
  }), []);

  const floatingParticles = useMemo(() => {
    const seed = 12345;
    function mulberry32(a: number) {
      return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
    }
    const rand = mulberry32(seed);
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      delay: `${rand() * 5}s`,
      duration: `${3 + rand() * 4}s`,
    }));
  }, []);

  return (
    <section 
      className="relative w-full min-h-[60vh] text-white text-center overflow-hidden"
      data-ai-hint="construction site crane"
    >
      {/* خلفية الصورة باستخدام Image من Next.js */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="https://i.imgur.com/9YdRlNn.jpg"
          alt="خلفية موقع بناء"
          fill
          priority
          quality={75}
          className="object-cover object-center will-change-transform"
          sizes="100vw"
        />
      </div>
      
      {/* طبقة تعتيم متدرجة ثابتة */}
      <div 
        className="absolute inset-0 z-0 will-change-transform"
        style={staticBackground}
        aria-hidden="true"
      />

      {/* عناصر هندسية متحركة - قللنا العدد */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-app-gold rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-app-gold rounded-full opacity-50 animate-bounce"></div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 h-full flex items-center justify-center px-2 py-8 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className={`max-w-3xl mx-auto backdrop-blur-md bg-gradient-to-b from-black/30 to-black/50 rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl will-change-transform transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            
            {/* العنوان الرئيسي */}
            <div className="relative mb-8">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight will-change-transform transform transition-all duration-1000 delay-200 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <span className="bg-gradient-to-r from-white via-app-gold to-white bg-clip-text text-transparent drop-shadow-2xl">
                  احسب بدقة، ابنِ بثقة
                </span>
                <br />
                <span className="text-app-gold text-3xl sm:text-4xl md:text-5xl">
                  وادِر مشروعك من الألف إلى الياء
                </span>
              </h1>
              
              {/* خط زخرفي */}
              <div className="flex justify-center mb-8">
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-app-gold to-transparent rounded-full"></div>
              </div>
            </div>

            {/* الوصف الرئيسي */}
            <div className={`mb-8 will-change-transform transform transition-all duration-1000 delay-300 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-xl sm:text-2xl text-gray-100 mb-6 leading-relaxed font-medium">
                منصة هندسية متكاملة لحساب كميات الحديد والباطون بدقة عالية، ومتابعة كل ما يتعلق بمشروعك الإنشائي
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <span className="bg-app-gold/20 text-app-gold px-4 py-2 rounded-full text-sm font-semibold border border-app-gold/30">
                  الأبنية
                </span>                <span className="bg-app-gold/20 text-app-gold px-4 py-2 rounded-full text-sm font-semibold border border-app-gold/30">
                  الجدران الاستنادية
                </span>
                <span className="bg-app-gold/20 text-app-gold px-4 py-2 rounded-full text-sm font-semibold border border-app-gold/30">
                  الأساسات
                </span>
              </div>
            </div>

            {/* المميزات */}
            <div className="mb-10">
              <p className={`text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-medium will-change-transform transform transition-all duration-1000 delay-400 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                سواء كنت مهندسًا، مقاولًا، أو صاحب عقار، نتيح لك أدوات قوية تُمكِّنك من:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`group flex items-start gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-app-gold/30 transition-all duration-300 will-change-transform transform ${
                      isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <p className="text-lg text-gray-100 leading-relaxed text-right flex-1">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* الدعوة للعمل */}
            <div className={`will-change-transform transform transition-all duration-1000 delay-700 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-xl sm:text-2xl text-gray-100 font-bold mb-10 leading-relaxed">
                ابدأ الآن، وامتلك السيطرة الكاملة على مشروعك بكل ثقة ووضوح.
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartClick}
                  className="group relative bg-gradient-to-r from-app-gold to-yellow-500 hover:from-yellow-500 hover:to-app-gold text-gray-900 font-bold py-6 px-12 text-xl rounded-2xl shadow-2xl will-change-transform transform transition-all duration-300 hover:scale-105 hover:shadow-app-gold/50 focus:outline-none focus:ring-4 focus:ring-app-gold/50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    ابدأ معنا
                    <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">
                      🚀
                    </span>
                  </span>
                  
                  {/* تأثير الإضاءة */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تأثير الجزيئات المحسن */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse will-change-transform"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;