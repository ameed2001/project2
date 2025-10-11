"use client";

import React from "react";
import { X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalCloseButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'text' | 'icon' | 'rounded';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom' | 'none';
}

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({ 
  onClick, 
  className = "",
  variant = 'default',
  size = 'md',
  position = 'none'
}) => {
  const sizeClasses: Record<string,string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  };

  const positionClasses: Record<string,string> = {
    'top-left': 'absolute top-4 left-4',
    'top-right': 'absolute top-4 right-4',
    'bottom': 'mt-4',
    'none': ''
  };

  // Default variant - professional close button with text
  if (variant === 'default') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        aria-label="إغلاق النافذة"
        className={`
          ${sizeClasses[size]}
          ${positionClasses[position]}
          bg-white hover:bg-gray-50 
          border-gray-300 hover:border-gray-400
          text-gray-700 hover:text-gray-900
          font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          shadow-sm hover:shadow-md
          rounded-lg
          flex items-center gap-2
          ${className}
        `}
      >
        <span>إغلاق</span>
      </Button>
    );
  }

  // Text only variant
  if (variant === 'text') {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        aria-label="إغلاق النافذة"
        className={`
          ${sizeClasses[size]}
          ${positionClasses[position]}
          text-gray-600 hover:text-gray-900
          hover:bg-gray-100
          font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          rounded-lg
          ${className}
        `}
      >
        إغلاق
      </Button>
    );
  }

  // Icon only variant
  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label="إغلاق النافذة"
        className={`
          w-8 h-8
          ${positionClasses[position]}
          text-gray-500 hover:text-gray-700
          hover:bg-gray-100
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          rounded-lg
          ${className}
        `}
      >
        <X size={18} />
      </Button>
    );
  }

  // Rounded variant with icon and background
  if (variant === 'rounded') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        aria-label="إغلاق النافذة"
        className={`
          ${sizeClasses[size]}
          ${positionClasses[position]}
          bg-red-50 hover:bg-red-100
          border-red-200 hover:border-red-300
          text-red-600 hover:text-red-700
          font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          shadow-sm hover:shadow-md
          rounded-full
          flex items-center gap-2
          ${className}
        `}
      >
        <XCircle size={16} />
        <span>إغلاق</span>
      </Button>
    );
  }

  // Fallback to default
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-label="إغلاق النافذة"
      className={`
        ${sizeClasses[size]}
        ${positionClasses[position]}
        bg-white hover:bg-gray-50 
        border-gray-300 hover:border-gray-400
        text-gray-700 hover:text-gray-900
        font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        shadow-sm hover:shadow-md
        rounded-lg
        ${className}
      `}
    >
      إغلاق
    </Button>
  );
};

// Demo component to showcase different variants
export const ModalCloseButtonDemo = () => {
  const [showDemo, setShowDemo] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">أزرار إغلاق النوافذ المحسنة</h1>
          <p className="text-gray-600 text-lg">تصاميم متنوعة لأزرار الإغلاق بأساليب احترافية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Default Variant */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">الزر الافتراضي</h3>
            <div className="space-y-4">
              <ModalCloseButton variant="default" size="sm" />
              <ModalCloseButton variant="default" size="md" />
              <ModalCloseButton variant="default" size="lg" />
            </div>
          </div>

          {/* Text Variant */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">زر النص فقط</h3>
            <div className="space-y-4">
              <ModalCloseButton variant="text" size="sm" />
              <ModalCloseButton variant="text" size="md" />
              <ModalCloseButton variant="text" size="lg" />
            </div>
          </div>

          {/* Icon Variant */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">زر الأيقونة فقط</h3>
            <div className="flex gap-4">
              <ModalCloseButton variant="icon" />
              <ModalCloseButton variant="icon" className="w-10 h-10" />
              <ModalCloseButton variant="icon" className="w-12 h-12" />
            </div>
          </div>

          {/* Rounded Variant */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">الزر الدائري</h3>
            <div className="space-y-4">
              <ModalCloseButton variant="rounded" size="sm" />
              <ModalCloseButton variant="rounded" size="md" />
              <ModalCloseButton variant="rounded" size="lg" />
            </div>
          </div>
        </div>

        {/* Live Demo Section */}
        <div className="bg-white rounded-xl shadow-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">تجربة تفاعلية</h2>
          <Button
            onClick={() => setShowDemo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            عرض النافذة التجريبية
          </Button>

          {/* Demo Modal */}
          {showDemo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border">
                {/* Positioned close buttons */}
                <ModalCloseButton 
                  variant="icon" 
                  position="top-left" 
                  onClick={() => setShowDemo(false)}
                />
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">نافذة تجريبية</h3>
                  <p className="text-gray-600 mb-6">
                    هذه نافذة تجريبية لعرض أزرار الإغلاق المختلفة في العمل.
                  </p>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">اختر طريقة الإغلاق:</p>
                    
                    <div className="flex flex-col gap-3">
                      <ModalCloseButton 
                        variant="default" 
                        onClick={() => setShowDemo(false)}
                      />
                      
                      <ModalCloseButton 
                        variant="text" 
                        onClick={() => setShowDemo(false)}
                      />
                      
                      <ModalCloseButton 
                        variant="rounded" 
                        onClick={() => setShowDemo(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-gray-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">أمثلة الاستخدام</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">الاستخدام الأساسي:</h4>
              <code className="text-sm text-gray-600 bg-gray-50 p-2 rounded block">
                {`<ModalCloseButton onClick={handleClose} />`}
              </code>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">مع المتغيرات:</h4>
              <code className="text-sm text-gray-600 bg-gray-50 p-2 rounded block">
                {`<ModalCloseButton 
  variant="rounded" 
  size="lg" 
  position="top-right"
  onClick={handleClose} 
/>`}
              </code>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">مع تخصيص إضافي:</h4>
              <code className="text-sm text-gray-600 bg-gray-50 p-2 rounded block">
                {`<ModalCloseButton 
  variant="default"
  className="bg-red-50 text-red-600 border-red-200"
  onClick={handleClose} 
/>`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCloseButton;