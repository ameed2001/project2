import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, Home, Shield, Zap, Target, Eye, GitCommit } from "lucide-react";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-5xl mx-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl border-0 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-app-red/5 to-app-gold/5 rounded-t-lg">
            <div className="relative">
              <Zap className="mx-auto h-16 w-16 text-app-gold mb-4 drop-shadow-lg animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-app-red rounded-full animate-ping opacity-20"></div>
            </div>
            <CardTitle className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-app-red to-app-gold">
              عن منصتنا
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-lg text-gray-800 text-right leading-relaxed px-8 md:px-12">
            <section className="mb-10">
              <div className="flex items-center justify-start gap-3 mb-6">
                <GitCommit className="h-8 w-8 text-app-red" />
                <h3 className="text-3xl font-bold text-app-red">منصة المحترف لإدارة المشاريع الإنشائية</h3>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <p className="mb-4 text-gray-700 font-medium">
                  مرحبًا بكم في "المحترف لحساب الكميات" — منصة رقمية متكاملة تجمع بين المهندسين وأصحاب المشاريع ومديري النظام في بيئة عمل واحدة. تم تصميم المنصة لتسهيل إدارة المشاريع الإنشائية من مرحلة التخطيط وحساب الكميات، وصولًا إلى المتابعة والتسليم.
                </p>
                <p className="text-gray-700 font-medium">
                  نهدف إلى توفير أدوات قوية وشفافة تعزز التواصل والثقة بين جميع الأطراف، وتضمن سير العمل بكفاءة ودقة عالية.
                </p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 h-full shadow-lg border border-red-100">
                  <div className="flex items-center justify-start gap-3 mb-4">
                    <Target className="h-8 w-8 text-app-red" />
                    <h4 className="text-2xl font-bold text-app-red">رسالتنا</h4>
                  </div>
                  <p className="text-gray-700 font-medium">
                    تتمثل رسالتنا في بناء جسر رقمي متين من الثقة والشفافية بين المهندسين وأصحاب المشاريع، من خلال توفير أدوات ذكية لإدارة المشاريع، ومتابعة التكاليف، وتوثيق التقدم، مما يضمن تحقيق الأهداف المشتركة بأعلى معايير الجودة.
                  </p>
                </div>
              </div>
              
              <div className="transform transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 h-full shadow-lg border border-yellow-100">
                  <div className="flex items-center justify-start gap-3 mb-4">
                    <Eye className="h-8 w-8 text-app-gold" />
                    <h4 className="text-2xl font-bold text-app-gold">رؤيتنا</h4>
                  </div>
                  <p className="text-gray-700 font-medium">
                    نسعى لنكون المنصة الرائدة في العالم العربي التي يعتمد عليها المهندسون والملاك لإدارة مشاريعهم الإنشائية، من خلال الابتكار المستمر وتقديم حلول تقنية تلبي تحديات قطاع البناء وتساهم في نجاح المشاريع.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r border-t-4 border-gradient-to-r from-app-red to-app-gold pt-8">
                  ماذا تقدم المنصة؟
                </h3>
              </div>
              
              <div className="space-y-8">
                <div className="transform transition-all duration-300 hover:scale-102 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                    <div className="flex items-center justify-start gap-4 mb-6">
                      <HardHat className="h-10 w-10 text-blue-600" />
                      <h4 className="text-2xl font-bold text-blue-600">للمهندسين</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                        <h5 className="font-bold text-blue-800 mb-2">إدارة شاملة للمشاريع</h5>
                        <p className="text-sm text-gray-700">إنشاء ومتابعة وتحديث حالة المشاريع من لوحة تحكم مركزية</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                        <h5 className="font-bold text-blue-800 mb-2">حساب دقيق للتكاليف</h5>
                        <p className="text-sm text-gray-700">أدوات متقدمة لتقدير تكاليف المواد وربط التقارير بالمشاريع</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                        <h5 className="font-bold text-blue-800 mb-2">توثيق التقدم</h5>
                        <p className="text-sm text-gray-700">رفع صور وملاحظات من موقع العمل لمشاركتها مع المالك</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                        <h5 className="font-bold text-blue-800 mb-2">ربط المالكين</h5>
                        <p className="text-sm text-gray-700">دعوة المالكين لمتابعة مشاريعهم وتعزيز الشفافية</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transform transition-all duration-300 hover:scale-102 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                    <div className="flex items-center justify-start gap-4 mb-6">
                      <Home className="h-10 w-10 text-green-600" />
                      <h4 className="text-2xl font-bold text-green-600">للمالكين</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                        <h5 className="font-bold text-green-800 mb-2">متابعة حية للمشاريع</h5>
                        <p className="text-sm text-gray-700">عرض تفصيلي لتقدم المشاريع ونسبة الإنجاز والجداول الزمنية</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                        <h5 className="font-bold text-green-800 mb-2">شفافية كاملة</h5>
                        <p className="text-sm text-gray-700">الاطلاع على تقارير التكاليف والصور التي يرفعها المهندس</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                        <h5 className="font-bold text-green-800 mb-2">تواصل مباشر</h5>
                        <p className="text-sm text-gray-700">إضافة تعليقات واستفسارات على صفحة المشروع للتواصل الفعال</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                        <h5 className="font-bold text-green-800 mb-2">أدوات تقديرية</h5>
                        <p className="text-sm text-gray-700">استخدام حاسبة مبسطة لتقدير تكاليف المواد بشكل أولي</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="transform transition-all duration-300 hover:scale-102 hover:shadow-xl">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100">
                    <div className="flex items-center justify-start gap-4 mb-6">
                      <Shield className="h-10 w-10 text-purple-600" />
                      <h4 className="text-2xl font-bold text-purple-600">للمسؤولين</h4>
                    </div>
                    <div className="grid md:grid-cols-1 gap-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                        <h5 className="font-bold text-purple-800 mb-2">تحكم كامل بالنظام</h5>
                        <p className="text-sm text-gray-700">لوحة تحكم لإدارة جميع المستخدمين والمشاريع والإعدادات</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                        <h5 className="font-bold text-purple-800 mb-2">مراقبة النشاط</h5>
                        <p className="text-sm text-gray-700">مراجعة سجلات النظام لمتابعة جميع الأنشطة والأحداث الهامة</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                        <h5 className="font-bold text-purple-800 mb-2">إدارة الصلاحيات</h5>
                        <p className="text-sm text-gray-700">الموافقة على حسابات المهندسين، تعليق الحسابات، وإعادة تعيين كلمات المرور</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}