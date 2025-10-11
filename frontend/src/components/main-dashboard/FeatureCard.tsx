"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  className?: string;
  dataAiHint?: string;
}

const FeatureCard = ({ icon, title, description, iconBgColor = "bg-gray-100", className, dataAiHint }: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "bg-white shadow-lg rounded-xl p-6 text-center flex flex-col items-center transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2",
        className
      )}
      data-ai-hint={dataAiHint || title.toLowerCase().replace(/\s+/g, '-')}
    >
      <div className={cn(
        "mb-5 p-4 rounded-full inline-flex items-center justify-center",
        iconBgColor
      )}>
        {icon}
      </div>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-xl font-bold text-app-red">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-sm text-gray-600 flex-grow">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
