"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  HardHat,
  Home as HomeIcon,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import InfoCard from "@/components/ui/InfoCard";
import React from 'react';
import { cn } from '@/lib/utils';

const authCardsData = [
  {
    id: "signup",
    icon: <UserPlus className="h-8 w-8 text-red-600" />,
    iconWrapperClass: "bg-red-100",
    title: "إنشاء حساب جديد",
    description: "انضم إلينا الآن وابدأ في إدارة مشاريعك بكفاءة.",
    frontCustomClass: "bg-white/95",
    backCustomClass: "bg-gradient-to-br from-red-700 to-red-900",
    back: {
      title: "خيارات التسجيل",
      description: "اختر نوع الحساب الذي يناسبك.",
      actions: [
        {
          label: "إنشاء حساب مهندس",
          href: "/signup",
          icon: <HardHat className="h-5 w-5" />,
          buttonClass: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        },
        {
          label: "إنشاء حساب مالك",
          href: "/owner-signup",
          icon: <HomeIcon className="h-5 w-5" />,
          buttonClass: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        },
      ],
    },
  },
  {
    id: "user-login",
    icon: <LogIn className="h-8 w-8 text-blue-600" />,
    iconWrapperClass: "bg-blue-100",
    title: "تسجيل الدخول",
    description: "لديك حساب مهندس أو مالك؟ قم بالدخول لمتابعة أعمالك.",
    frontCustomClass: "bg-white/95",
    backCustomClass: "bg-gradient-to-br from-blue-700 to-blue-900",
    back: {
      title: "خيارات الدخول",
      description: "اختر بوابة الدخول المناسبة لحسابك.",
      actions: [
        {
          label: "دخول كمهندس",
          href: "/login",
          icon: <HardHat className="h-5 w-5" />,
          buttonClass: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        },
        {
          label: "دخول كمالك",
          href: "/owner-login",
          icon: <HomeIcon className="h-5 w-5" />,
          buttonClass: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        },
      ],
    },
  },
  {
    id: "admin-login",
    icon: <ShieldCheck className="h-8 w-8 text-green-600" />,
    iconWrapperClass: "bg-green-100",
    title: "دخول المسؤول",
    description: "هذا القسم مخصص لإدارة النظام والمستخدمين.",
    frontCustomClass: "bg-white/95",
    backCustomClass: "bg-gradient-to-br from-green-700 to-green-900",
    back: {
      title: "لوحة تحكم المسؤول",
      description: "الوصول إلى أدوات الإدارة الشاملة.",
      actions: [
        {
          label: "دخول كمسؤول",
          href: "/admin-login",
          icon: <ShieldCheck className="h-5 w-5"/>,
          buttonClass: "bg-white/10 hover:bg-white/20 text-white border-white/20",
        },
      ],
    },
  },
];

export default function AuthCardsSection() {
  return (
    <section 
      id="start-journey" 
      className="py-16 bg-white"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          ابدأ رحلتك معنا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authCardsData.map((card) => (
            <InfoCard 
              key={card.id}
              applyFlipEffect={true}
              title={card.title}
              description={card.description}
              icon={card.icon}
              iconWrapperClass={card.iconWrapperClass}
              dataAiHint={card.id}
              frontCustomClass={card.frontCustomClass}
              backCustomClass={card.backCustomClass}
              backCustomContent={
                <div className="flex flex-col justify-center items-center h-full text-white p-4">
                  <h3 className="text-2xl font-bold mb-2">{card.back.title}</h3>
                  <p className="text-white/80 text-sm mb-6 flex-grow">{card.back.description}</p>
                  <div className="w-full space-y-3">
                    {card.back.actions.map((action) => (
                      <Button
                        key={action.href}
                        asChild
                        className={cn(
                          "w-full justify-between py-5 px-4 rounded-lg font-semibold transition-colors duration-200 border",
                          action.buttonClass
                        )}
                        variant="ghost"
                      >
                        <Link href={action.href}>
                          <span className="flex items-center gap-2">
                            {action.icon}
                            {action.label}
                          </span>
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
