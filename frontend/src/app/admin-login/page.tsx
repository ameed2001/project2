"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { adminLoginAction } from './actions';
import { type LoginActionResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';

const adminLoginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password_input: z.string().min(1, { message: "كلمة المرور مطلوبة." }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

// مكون خلفية الشاشة مع تأثير كتابة برمجي باستخدام Canvas
const CodeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // أسطر كود للعرض
  const codeLines = [
    "function authenticate(email, password) {",
    "  const user = users.find(u => u.email === email);",
    "  if (user && bcrypt.compareSync(password, user.hash)) {",
    "    return generateToken(user);",
    "  }",
    "  throw new Error('Invalid credentials');",
    "}",
    "// Middleware لحماية المسارات",
    "const adminMiddleware = (req, res, next) => {",
    "  if (req.user.role !== 'ADMIN') {",
    "    return res.status(403).send('Access denied');",
    "  }",
    "  next();",
    "};",
    "// تسجيل الدخول الآمن",
    "app.post('/admin/login', rateLimiter, (req, res) => {",
    "  const { email, password } = req.body;",
    "  try {",
    "    const token = authenticate(email, password);",
    "    res.json({ token });",
    "  } catch (err) {",
    "    res.status(401).send(err.message);",
    "  }",
    "});"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // إعدادات الرسم
    const fontSize = 14;
    const lineHeight = fontSize * 1.5;
    const maxLines = Math.floor(canvas.height / lineHeight);
    const linePositions: {y: number, line: string, alpha: number}[] = [];
    
    // إنشاء خطوط جديدة بشكل دوري
    const addNewLine = () => {
      if (linePositions.length < maxLines) {
        const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
        linePositions.push({
          y: -lineHeight,
          line: randomLine,
          alpha: 0.1
        });
      }
    };
    
    // رسم الخطوط
    const drawLines = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < linePositions.length; i++) {
        const pos = linePositions[i];
        ctx.fillStyle = `rgba(74, 222, 128, ${pos.alpha})`;
        ctx.fillText(pos.line, 50, pos.y);
        
        // تحريك الخط لأسفل
        pos.y += 0.5;
        
        // زيادة الشفافية تدريجياً
        if (pos.alpha < 0.3) pos.alpha += 0.001;
        
        // إزالة الخطوط التي تجاوزت الشاشة
        if (pos.y > canvas.height + lineHeight) {
          linePositions.splice(i, 1);
          i--;
        }
      }
      
      // إضافة خط جديد بشكل عشوائي
      if (Math.random() < 0.05) {
        addNewLine();
      }
      
      animationRef.current = requestAnimationFrame(drawLines);
    };
    
    // بدء الرسم
    drawLines();
    
    // معالجة تغيير حجم النافذة
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0"
    />
  );
};

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password_input: "",
    }
  });

  const onSubmit: SubmitHandler<AdminLoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result: LoginActionResponse = await adminLoginAction(data);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "تسجيل دخول المسؤول",
          description: result.message || "تم تسجيل الدخول بنجاح.",
          variant: "default",
        });
        reset();
        
        if (result.user && typeof window !== 'undefined') {
            localStorage.setItem('userName', result.user.name);
            localStorage.setItem('userRole', result.user.role); 
            localStorage.setItem('userEmail', result.user.email); 
            localStorage.setItem('userId', result.user.id);
        }

        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          router.push('/admin'); 
        }
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.message || "بيانات اعتماد المسؤول غير صحيحة.",
          variant: "destructive",
        });
        if (result.fieldErrors) {
          for (const [fieldName, fieldErrorMessages] of Object.entries(result.fieldErrors)) {
            if (fieldErrorMessages && fieldErrorMessages.length > 0) {
              setError(fieldName as keyof AdminLoginFormValues, {
                type: "server",
                message: fieldErrorMessages.join(", "),
              });
            }
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Admin login submission error:", error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden flex items-center justify-center">
      <style jsx global>{`
        .input-field:focus + .input-label,
        .input-field:not(:placeholder-shown) + .input-label {
          transform: translateY(-1.8rem) scale(0.85);
          color: #d4af37;
          background: linear-gradient(to bottom, rgba(31, 41, 55, 1), rgba(31, 41, 55, 0.9));
          padding: 0 0.5rem;
          border-radius: 0.25rem;
        }
        .login-card {
          background: rgba(31, 41, 55, 0.92);
          border: 2px solid rgba(255, 215, 64, 0.18);
          box-shadow: 0 10px 40px 0 rgba(212,175,55,0.10), 0 2px 24px 0 rgba(0,0,0,0.25);
          position: relative;
        }
        .login-card:before {
          content: '';
          position: absolute;
          inset: -3px;
          z-index: 0;
          border-radius: 1.25rem;
          background: linear-gradient(120deg, #d4af37 0%, #fffbe6 40%, #d4af37 100%);
          opacity: 0.18;
          filter: blur(2px);
        }
        .login-card-inner {
          position: relative;
          z-index: 1;
        }
        .gold-gradient-text {
          background: linear-gradient(90deg, #d4af37 30%, #fffbe6 70%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .eye-btn {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .eye-btn:hover {
          background: rgba(212,175,55,0.08);
        }
        .login-err {
          background: rgba(255, 0, 0, 0.08);
          border-right: 3px solid #d32f2f;
          color: #ffb4b4;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          margin-top: 0.5rem;
          font-size: 1rem;
        }
      `}</style>
      <CodeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-gray-900/80 z-0" />
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-2rem)] py-8 w-full">
        <div className="w-full max-w-md px-2 sm:px-4">
          <div className="login-card rounded-2xl overflow-hidden p-0 transition-all duration-500 shadow-2xl">
            <div className="login-card-inner p-8">
              <div className="text-center mb-8 flex flex-col items-center gap-2">
                <div className="mx-auto w-fit p-4 bg-gradient-to-tr from-app-gold/30 to-yellow-100/10 rounded-full text-app-gold animate-pulse shadow-lg border border-app-gold/30">
                  <Shield width="54" height="54" className="drop-shadow-gold" />
                </div>
                <h1 className="text-3xl font-extrabold gold-gradient-text mt-4 tracking-tight">دخول لوحة التحكم</h1>
                <p className="text-gray-300 mt-2 text-base">الرجاء إدخال بيانات الاعتماد الخاصة بك</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                <div className="space-y-7">
                  <div className="relative">
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      className={`w-full px-4 py-4 bg-gray-800/70 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white input-field focus:ring-2 focus:ring-app-gold focus:border-app-gold outline-none transition-all duration-300 placeholder:text-gray-400`}
                      placeholder=" "
                    />
                    <label 
                      htmlFor="email" 
                      className="absolute right-4 top-4 text-gray-400 transition-all duration-200 pointer-events-none input-label origin-right"
                    >
                      البريد الإلكتروني
                    </label>
                    {errors.email && (
                      <div className="login-err text-sm mt-2 text-right">
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      {...register("password_input")}
                      id="password_input"
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-4 bg-gray-800/70 border ${errors.password_input ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white input-field focus:ring-2 focus:ring-app-gold focus:border-app-gold outline-none transition-all duration-300 placeholder:text-gray-400 pr-14`}
                      placeholder=" "
                      autoComplete="current-password"
                    />
                    <label 
                      htmlFor="password_input" 
                      className="absolute right-4 top-4 text-gray-400 transition-all duration-200 pointer-events-none input-label origin-right"
                    >
                      كلمة المرور
                    </label>
                    {/* زر إظهار/إخفاء كلمة المرور */}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      className="eye-btn absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-app-gold focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                    {errors.password_input && (
                      <div className="login-err text-sm mt-2 text-right">
                        {errors.password_input.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-app-gold hover:text-app-gold/80 transition-colors font-bold"
                  >
                    هل نسيت كلمة المرور؟
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-app-gold to-yellow-400 text-gray-900 font-extrabold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-app-gold/30 disabled:opacity-70 transform hover:-translate-y-0.5 text-lg tracking-wide border-2 border-app-gold/40 hover:scale-[1.03] focus:ring-2 focus:ring-app-gold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      جاري المعالجة...
                    </>
                  ) : 'تسجيل الدخول'}
                </button>
                <div className="text-center pt-4">
                  <Link 
                    href="/" 
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 font-bold"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    العودة للرئيسية
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
