
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, HardHat } from 'lucide-react'; // Importing icons

const UserTasksSection: React.FC = () => {
  const userTasks = [
    {
      icon: <HardHat className="h-8 w-8 text-blue-500" />,
      title: "للمهندسين والمقاولين",
      description: "يتيح النظام حساب كميات المواد بدقة عالية، ويسهل إدارة المشاريع ومتابعة جميع مراحل التنفيذ. كما يمكن تتبع تقدم الأعمال الإنشائية بشكل مستمر مع إمكانية التعديل والتحديث على البيانات حسب الحاجة، لضمان سير العمل وفق الخطط الموضوعة.",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: <Home className="h-8 w-8 text-green-500" />,
      title: "للمالكين",
      description: "يمكن للمالكين متابعة المشاريع بشكل مباشر والتعرف على مراحل التنفيذ المختلفة، بالإضافة إلى تقدير التكاليف الأولية للمشاريع. كما يتم استلام تقارير دورية مفصلة عن تقدم الأعمال والتكاليف، مع الحفاظ على إمكانية الاطلاع فقط دون القدرة على التعديل، لضمان الشفافية والمراقبة المستمرة.",
      iconBgColor: "bg-green-100",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "للمسؤولين",
      description: "إدارة المستخدمين، مراقبة النظام، وتحديث قاعدة بيانات المواد والأسعار.",
      iconBgColor: "bg-red-100",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          مهام المستخدمين
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userTasks.map((task, index) => (
            <Card
              key={index}
              className="bg-white/95 shadow-lg rounded-xl p-6 text-center flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            >
              <CardHeader className="p-0 mb-4 flex justify-center items-center">
                <div className={`rounded-full p-3 inline-flex items-center justify-center mb-4 ${task.iconBgColor}`}>
                  {task.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-app-red">
                  {task.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-gray-700 flex-grow">
                <p className="text-base leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTasksSection;
