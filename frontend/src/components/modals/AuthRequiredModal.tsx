
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, UserCircle, X, ShieldCheck as AdminIcon } from 'lucide-react'; 
import Link from 'next/link';
import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/navigation'; 

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthRequiredModal = ({ isOpen, onClose }: AuthRequiredModalProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        const isAuthenticated = !!role;
        
        setIsLoggedIn(isAuthenticated);
        setUserRole(role);
        setIsAdmin(role === 'ADMIN');
      }
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (isLoading) return <div className="hidden">جار التحميل...</div>;

  const handleGoToAccount = () => {
    const dashboardPath = userRole === 'OWNER' ? '/owner/dashboard' : '/my-projects';
    router.push(dashboardPath);
    onClose();
  };
  
  const handleGoToAdminDashboard = () => {
    router.push('/admin');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-800 sm:max-w-md animate-modal-fade-in p-6 rounded-xl border border-gray-200 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-2xl font-bold text-red-600 pt-2">
            {isLoggedIn ? "تم تسجيل الدخول" : "يجب عليك تسجيل الدخول"}
          </DialogTitle>
        </DialogHeader>
        
        <DialogDescription className="text-right text-gray-600 text-base leading-relaxed mb-6 px-4">
          {isLoggedIn && isAdmin ? (
            "لقد قمت بتسجيل الدخول كمسؤول. للوصول إلى هذه الميزة، يلزمك أن تكون مالكًا أو مهندسًا."
          ) : isLoggedIn ? (
            "لقد قمت بتسجيل دخولك مسبقًا. يرجى النقر على زر 'حسابي' للانتقال إلى لوحة التحكم الخاصة بك."
          ) : (
            <span>
              لاستخدام هذه الميزة وغيرها من الميزات المتقدمة في منصة 
              <span className="font-semibold text-red-600"> "المحترف لحساب الكميات"</span>، 
              يرجى تسجيل الدخول إلى حسابك أو إنشاء حساب جديد إذا لم تكن مسجلاً بعد.
            </span>
          )}
        </DialogDescription>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          {isLoggedIn && isAdmin ? (
            <>
              <Button 
                onClick={handleGoToAdminDashboard} 
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 text-base flex items-center justify-center"
              >
                <AdminIcon className="ml-2 h-5 w-5" />
                حساب المسؤول
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 text-base"
              >
                <X className="ml-2 h-5 w-5" />
                إغلاق
              </Button>
            </>
          ) : isLoggedIn ? (
            <>
              <Button 
                onClick={handleGoToAccount} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base flex items-center justify-center"
              >
                <UserCircle className="ml-2 h-5 w-5" />
                حسابي
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 text-base"
              >
                <X className="ml-2 h-5 w-5" />
                إغلاق
              </Button>
            </>
          ) : (
            <Button 
              onClick={onClose} 
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 text-base"
            >
              إغلاق
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;
