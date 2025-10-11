"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, AlertCircle, HelpCircle, Mail, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


const staticNavLinks = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/about', label: 'عن الموقع', icon: AlertCircle },
  { href: '/help', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { href: '/contact', label: 'تواصل معنا', icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');
      if (role && name) {
        setIsLoggedIn(true);
        setUserName(name);
        setUserRole(role);
        setUserInitial(name.charAt(0).toUpperCase());
      } else {
        setIsLoggedIn(false);
      }
    }
  }, [pathname]); // Re-check on path change

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح.",
      });
      router.push('/');
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'ADMIN': return '/admin';
      case 'ENGINEER': return '/engineer/dashboard';
      case 'OWNER': return '/owner/dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg"> 
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-14">
                {/* Left Side: User Menu or Empty */}
                <div className="flex-1 flex justify-start">
                  {isLoggedIn && userName && (
                     <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-gray-700/50 p-2 h-auto">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={userName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <span className="font-semibold block text-sm">{userName}</span>
                             <span className="text-xs text-gray-400 block">{userRole}</span>
                          </div>
                           <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                           <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={getDashboardLink()}>
                            <LayoutDashboard className="ml-2 h-4 w-4" />
                            <span>لوحة التحكم</span>
                          </Link>
                        </DropdownMenuItem>
                        {userRole !== 'ADMIN' && (
                          <DropdownMenuItem asChild>
                            <Link href="/profile">
                              <User className="ml-2 h-4 w-4" />
                              <span>الملف الشخصي</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                          <LogOut className="ml-2 h-4 w-4" />
                          <span>تسجيل الخروج</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Center: Main Links */}
                 <ul className="flex justify-center items-center gap-2">
                    {staticNavLinks.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className={cn(
                                "flex items-center gap-2 px-3 py-2 text-base font-semibold text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors", 
                                pathname === link.href && "text-app-gold bg-gray-700/80"
                            )}>
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Right Side: Spacer */}
                <div className="flex-1"></div>
            </div>
        </div>
    </nav>
  );
}
