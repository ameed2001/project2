"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase, Settings, ScrollText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// تعريف variants خارج المكون الرئيسي
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      when: "beforeChildren"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1] as const
    } 
  },
  hover: { 
    scale: 1.04, 
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const
    }
  }
};

export default function AdminDashboardPage() {
  const overviewCards = [
    { 
      title: "إدارة المستخدمين", 
      href: "/admin/users", 
      icon: Users, 
      description: "عرض وتعديل وحذف المستخدمين.",
      iconBgClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-400",
      bottomBarClass: "bg-gradient-to-r from-blue-500 to-blue-700",
      buttonClassName: "bg-blue-50 text-blue-700 border-2 border-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-700/40 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-700 dark:hover:text-white",
      buttonText: "إدارة المستخدمين",
      dataAiHint: "manage-users"
    },
    { 
      title: "إدارة المشاريع", 
      href: "/admin/projects", 
      icon: Briefcase, 
      description: "متابعة وحذف المشاريع القائمة.",
      iconBgClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400",
      bottomBarClass: "bg-gradient-to-r from-amber-500 to-amber-700",
      buttonClassName: "bg-amber-50 text-amber-700 border-2 border-amber-600 hover:bg-amber-600 hover:text-white dark:bg-amber-700/40 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-amber-700 dark:hover:text-white",
      buttonText: "إدارة المشاريع",
      dataAiHint: "manage-projects"
    },
    { 
      title: "إعدادات النظام", 
      href: "/admin/settings", 
      icon: Settings, 
      description: "تكوين الإعدادات العامة للنظام.",
      iconBgClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-400",
      bottomBarClass: "bg-gradient-to-r from-purple-500 to-purple-700",
      buttonClassName: "bg-purple-50 text-purple-700 border-2 border-purple-600 hover:bg-purple-600 hover:text-white dark:bg-purple-700/40 dark:text-purple-300 dark:border-purple-600 dark:hover:bg-purple-700 dark:hover:text-white",
      buttonText: "تعديل الإعدادات",
      dataAiHint: "system-settings"
    },
    { 
      title: "سجلات النظام", 
      href: "/admin/logs", 
      icon: ScrollText, 
      description: "مراجعة أنشطة النظام والأحداث.",
      iconBgClass: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-400",
      bottomBarClass: "bg-gradient-to-r from-green-500 to-green-700",
      buttonClassName: "bg-green-50 text-green-700 border-2 border-green-600 hover:bg-green-600 hover:text-white dark:bg-green-700/40 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-700 dark:hover:text-white",
      buttonText: "عرض السجلات",
      dataAiHint: "system-logs"
    },
  ];

  return (
    <div className="space-y-16 text-right px-6 md:px-12 lg:px-24 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Welcome Section */}
      <Card className="bg-white/95 dark:bg-card shadow-2xl border border-gray-300 dark:border-gray-700 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            مرحباً بك، أيها المسؤول!
            <motion.span
              className="inline-block text-green-600 dark:text-green-400"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              👋
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 max-w-4xl mx-auto select-text">
            هذه هي لوحة التحكم الخاصة بك. يمكنك من هنا إدارة المستخدمين، المشاريع، إعدادات النظام، ومراجعة سجلات الأنشطة بسهولة وسرعة.
          </p>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <Card className="bg-white/95 dark:bg-card shadow-2xl border border-gray-300 dark:border-gray-700 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-app-red text-center mb-12 tracking-wide">
            لوحة تحكم المسؤول الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {overviewCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex flex-col"
                >
                  <Link
                    href={card.href}
                    className={cn(
                      "flex flex-col rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-card shadow-lg cursor-pointer select-none transition-shadow focus:outline-none focus:ring-4 focus:ring-blue-400 dark:focus:ring-blue-600",
                      "overflow-hidden h-full"
                    )}
                    data-ai-hint={card.dataAiHint}
                    tabIndex={0}
                    role="link"
                  >
                    <div className="p-7 flex justify-between items-center">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{card.title}</h3>
                      <div className={cn("p-5 rounded-full", card.iconBgClass)}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>
                    <p className="px-7 text-gray-600 dark:text-gray-400 text-base mb-10 leading-relaxed">{card.description}</p>
                    <div className="mt-auto px-7 pb-7">
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-center font-semibold tracking-wide",
                          card.buttonClassName,
                          "group-hover:bg-opacity-95 transition-colors duration-300"
                        )}
                        aria-label={card.buttonText}
                      >
                        <span>{card.buttonText}</span>
                        <ArrowLeft className="w-6 h-6 mr-3 rtl:mr-0 rtl:ml-3" />
                      </Button>
                    </div>
                    <div className={cn("h-2 rounded-b-2xl", card.bottomBarClass)} />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}