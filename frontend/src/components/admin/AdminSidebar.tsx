"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ScrollText,
  LogOut,
  Home,
  Menu as MenuIcon,
  ChevronLeft,
  Briefcase,
  MailCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const adminNavItems = [
  { href: "/", label: "الرئيسية للموقع", icon: Home },
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
  { href: "/admin/projects", label: "إدارة المشاريع", icon: Briefcase },
  { href: "/admin/settings", label: "إعدادات النظام", icon: Settings },
  { href: "/admin/logs", label: "سجلات النظام", icon: ScrollText },
  { href: "/admin/email-tester", label: "فحص إعدادات البريد", icon: MailCheck },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [adminName, setAdminName] = useState("المسؤول");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setAdminName(name);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح.",
    });
    router.push("/admin-login");
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "bg-card text-card-foreground flex flex-col shadow-lg border-l transition-all duration-300 ease-in-out",
          isOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-4 flex items-center border-b h-[70px] flex-shrink-0">
          {isOpen && (
            <div className="flex-grow overflow-hidden">
              <h2 className="text-xl font-bold text-green-700 truncate">لوحة تحكم المسؤول</h2>
              <p className="text-sm text-muted-foreground truncate">مرحباً، {adminName}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={onToggle}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            aria-label={isOpen ? "طي الشريط الجانبي" : "فتح الشريط الجانبي"}
          >
            {isOpen ? <ChevronLeft size={22} /> : <MenuIcon size={22} />}
          </Button>
        </div>

        <nav className="flex-grow overflow-y-auto px-2 py-4">
          <ul className="space-y-1.5">
            {adminNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const isDashboard = item.href === "/admin";

              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                          isOpen ? "justify-start" : "justify-center",
                          isActive
                            ? isDashboard
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "bg-blue-100 text-blue-700 font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
                            isActive
                              ? isDashboard
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white"
                              : "group-hover:bg-blue-50 group-hover:text-blue-700"
                          )}
                        >
                          <item.icon size={20} />
                        </span>
                        {isOpen && <span>{item.label}</span>}
                      </Link>
                    </TooltipTrigger>
                    {!isOpen && (
                      <TooltipContent side="left" align="center">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                  "text-red-600 hover:bg-red-700/10",
                  isOpen ? "justify-start" : "justify-center"
                )}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-red-600/20">
                  <LogOut size={20} />
                </span>
                {isOpen && <span className="truncate">تسجيل الخروج</span>}
              </button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="left" align="center">
                <p>تسجيل الخروج</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
