
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  description?: string; 
  onClick?: () => void;
  href?: string;
  className?: string;
  icon?: ReactNode;
  iconWrapperClass?: string;
  iconColorClass?: string; 
  dataAiHint?: string;
  cardHeightClass?: string; 
  applyFlipEffect?: boolean; 
  backCustomContent?: ReactNode;
  backCustomClass?: string;
  frontCustomClass?: string;
}

const InfoCard = (props: InfoCardProps) => {
  const {
    title,
    description,
    onClick,
    href,
    className,
    icon,
    iconWrapperClass,
    iconColorClass,
    dataAiHint,
    cardHeightClass = "h-72",
    applyFlipEffect = false,
    backCustomContent,
    backCustomClass,
    frontCustomClass,
  } = props;

  const isInteractive = !!href || !!onClick;

  const FrontContent = () => (
    <div className={cn(
      "card-flipper-front p-6 sm:p-8 flex flex-col justify-center items-center text-center",
      frontCustomClass
    )}>
      {icon && (
        <div className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-5 sm:mb-6 shrink-0 card-icon",
          iconWrapperClass
        )}>
          {icon}
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-app-red">{title}</h3>
      {description && <p className="text-sm sm:text-base flex-grow text-gray-600">{description}</p>}
    </div>
  );

  const BackContent = () => (
     <div className={cn(
        "card-flipper-back p-4",
        backCustomClass
      )}>
        {backCustomContent}
    </div>
  );

  if (applyFlipEffect) {
    return (
      <div 
        className={cn("card-flipper", cardHeightClass, className)} 
        data-ai-hint={dataAiHint}
      >
        <div className="card-flipper-inner h-full">
          <FrontContent />
          <BackContent />
        </div>
      </div>
    );
  }

  // Fallback for non-flipping cards
  const Tag = isInteractive && href ? Link : 'div';
  const interactiveProps = isInteractive && href ? { href } : { onClick };

  return (
    <Tag
      {...interactiveProps}
      className={cn(
        "bg-card text-card-foreground p-6 sm:p-8 flex flex-col justify-center items-center text-center border border-border shadow-lg rounded-xl",
        "transition-all duration-300 ease-in-out",
        isInteractive && "hover:shadow-xl hover:-translate-y-2 cursor-pointer",
        cardHeightClass,
        className,
        frontCustomClass // Apply front class even to non-flipping cards
      )}
      data-ai-hint={dataAiHint}
    >
      {icon && (
        <div className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-5 sm:mb-6 shrink-0",
          iconWrapperClass
        )}>
           {icon}
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-bold text-app-red mb-2">{title}</h3>
      {description && <p className="text-sm sm:text-base text-gray-600 flex-grow">{description}</p>}
    </Tag>
  );
};

export default InfoCard;
