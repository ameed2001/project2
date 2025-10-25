"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings as SettingsIcon, Loader2, Mail, ShieldAlert, Globe, Upload, Bell } from 'lucide-react';
import { getSystemSettings, updateSystemSettings, type SystemSettingsDocument } from '@/lib/db';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettingsDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    async function fetchSettings() {
      setIsFetching(true);
      try {
        const fetchedSettings = await getSystemSettings();
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        } else {
          toast({
            title: "خطأ",
            description: "فشل تحميل إعدادات النظام.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "خطأ فادح",
          description: "حدث خطأ أثناء تحميل الإعدادات.",
          variant: "destructive"
        });
        console.error("Error fetching settings:", error);
      }
      setIsFetching(false);
    }
    fetchSettings();
  }, [toast]);

  const handleChange = (field: keyof SystemSettingsDocument, value: string | number | boolean | string[]) => {
    setSettings(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) {
      toast({
        title: "خطأ",
        description: "لا توجد إعدادات لحفظها.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    const result = await updateSystemSettings(settings);

    if (result.success) {
      toast({
        title: "تم حفظ الإعدادات",
        description: result.message || "تم تحديث إعدادات النظام بنجاح.",
        variant: "default",
      });
    } else {
      toast({
        title: "خطأ في الحفظ",
        description: result.message || "فشل تحديث إعدادات النظام.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-app-gold" />
        <p className="text-lg font-medium text-gray-600">جاري تحميل الإعدادات...</p>
        <p className="text-sm text-gray-500">قد تستغرق العملية بضع ثوانٍ</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-red-500">فشل تحميل الإعدادات</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          المحاولة مرة أخرى
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-white/95 shadow-xl w-full max-w-5xl mx-auto border-0">
        <CardHeader className="text-center border-b pb-6">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-app-red/10 to-app-gold/10 rounded-full">
            <SettingsIcon className="h-12 w-12 text-app-gold" />
          </div>
          <CardTitle className="text-3xl font-bold text-app-red mt-4">إعدادات النظام</CardTitle>
          <CardDescription className="text-gray-600 max-w-2xl mx-auto">
            قم بتكوين الإعدادات الأساسية والمتقدمة للنظام لضمان تجربة مستخدم مثالية
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-4 gap-2 mb-6 bg-gray-100 p-2 rounded-lg">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Globe className="w-4 h-4 ml-2" />
                عام
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 ml-2" />
                الأمان
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Bell className="w-4 h-4 ml-2" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Upload className="w-4 h-4 ml-2" />
                الملفات
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSaveSettings}>
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="siteName" className="block mb-2 font-medium text-gray-700 items-center gap-2">
                      <Globe className="w-4 h-4" />
                      اسم الموقع
                    </Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                    />
                    <p className="mt-1 text-sm text-gray-500">الاسم الذي سيظهر في أعلى الموقع</p>
                  </div>

                  <div>
                    <Label htmlFor="defaultLanguage" className="block mb-2 font-medium text-gray-700 items-center gap-2">
                      <Globe className="w-4 h-4" />
                      اللغة الافتراضية
                    </Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => handleChange('defaultLanguage', value)}
                    >
                      <SelectTrigger className="w-full bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300 text-right">
                        <SelectValue placeholder="اختر لغة..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar" className="flex justify-end">العربية</SelectItem>
                        <SelectItem value="en" className="flex justify-end">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-sm text-gray-500">اللغة التي سيتم عرض الموقع بها افتراضيًا</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <Label htmlFor="maintenanceMode" className="font-medium text-gray-700 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            وضع الصيانة
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                            عند التفعيل، لن يتمكن المستخدمون من الوصول للموقع
                        </p>
                    </div>
                    <Checkbox
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleChange('maintenanceMode', !!checked)}
                    />
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="loginAttemptsLimit" className="block mb-2 font-medium text-gray-700">
                      حد محاولات تسجيل الدخول
                    </Label>
                    <Input
                      id="loginAttemptsLimit"
                      type="number"
                      value={settings.loginAttemptsLimit || 5}
                      onChange={(e) => handleChange('loginAttemptsLimit', parseInt(e.target.value, 10))}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                    />
                    <p className="mt-1 text-sm text-gray-500">عدد المحاولات المسموحة قبل القفل المؤقت</p>
                  </div>

                  <div>
                    <Label htmlFor="passwordResetExpiry" className="block mb-2 font-medium text-gray-700">
                      صلاحية رابط إعادة تعيين كلمة المرور (ساعة)
                    </Label>
                    <Input
                      id="passwordResetExpiry"
                      type="number"
                      value={settings.passwordResetExpiry || 24}
                      onChange={(e) => handleChange('passwordResetExpiry', parseInt(e.target.value, 10))}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                    />
                    <p className="mt-1 text-sm text-gray-500">المدة الزمنية لصلاحية رابط إعادة التعيين</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <Label htmlFor="twoFactorAuth" className="font-medium text-gray-700">
                            المصادقة الثنائية للمشرفين
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                            تتطلب تأكيد الهوية عبر تطبيق المصادقة
                        </p>
                    </div>
                    <Checkbox
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth || false}
                        onCheckedChange={(checked) => handleChange('twoFactorAuth', !!checked)}
                    />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <Label htmlFor="emailNotificationsEnabled" className="font-medium text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            تفعيل إشعارات البريد الإلكتروني
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                            إرسال إشعارات عبر البريد للمستخدمين عند حدوث أنشطة مهمة
                        </p>
                    </div>
                    <Checkbox
                        id="emailNotificationsEnabled"
                        checked={settings.emailNotificationsEnabled}
                        onCheckedChange={(checked) => handleChange('emailNotificationsEnabled', !!checked)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="notificationEmail" className="block mb-2 font-medium text-gray-700">
                      بريد الإشعارات
                    </Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={settings.notificationEmail || ''}
                      onChange={(e) => handleChange('notificationEmail', e.target.value)}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                    />
                    <p className="mt-1 text-sm text-gray-500">البريد الإلكتروني الذي سيتم إرسال الإشعارات منه</p>
                  </div>

                  <div>
                    <Label htmlFor="notificationFrequency" className="block mb-2 font-medium text-gray-700">
                      تكرار الإشعارات
                    </Label>
                    <Select
                      value={settings.notificationFrequency || 'instant'}
                      onValueChange={(value) => handleChange('notificationFrequency', value)}
                    >
                      <SelectTrigger className="w-full bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300 text-right">
                        <SelectValue placeholder="اختر التكرار..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant" className="flex justify-end">فوري</SelectItem>
                        <SelectItem value="daily" className="flex justify-end">يومي</SelectItem>
                        <SelectItem value="weekly" className="flex justify-end">أسبوعي</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-sm text-gray-500">معدل إرسال الإشعارات المجمعة</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maxUploadSizeMB" className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      الحد الأقصى لحجم الملف (MB)
                    </Label>
                    <Input
                      id="maxUploadSizeMB"
                      type="number"
                      value={settings.maxUploadSizeMB}
                      onChange={(e) => handleChange('maxUploadSizeMB', parseInt(e.target.value, 10))}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                    />
                    <p className="mt-1 text-sm text-gray-500">الحجم الأقصى المسموح به لرفع الملفات</p>
                  </div>

                  <div>
                    <Label htmlFor="allowedFileTypes" className="block mb-2 font-medium text-gray-700">
                      أنواع الملفات المسموحة
                    </Label>
                    <Input
                      id="allowedFileTypes"
                      value={settings.allowedFileTypes?.join(', ') || ''}
                      onChange={(e) => handleChange('allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                      className="bg-white focus:ring-2 focus:ring-app-gold/50 border-gray-300"
                      placeholder="pdf, docx, jpg, png"
                    />
                    <p className="mt-1 text-sm text-gray-500">أدخل أنواع الملفات مفصولة بفاصلة</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <Label htmlFor="fileScanning" className="font-medium text-gray-700">
                            فحص الملفات المضغوطة
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                            فحص محتويات الملفات المضغوطة (ZIP, RAR) قبل الرفع
                        </p>
                    </div>
                    <Checkbox
                        id="fileScanning"
                        checked={settings.fileScanning || false}
                        onCheckedChange={(checked) => handleChange('fileScanning', !!checked)}
                    />
                </div>
              </TabsContent>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-gradient-to-r from-app-red to-app-gold hover:from-red-700 hover:to-amber-600 text-white font-bold py-3 px-8 text-lg shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ms-2 h-5 w-5" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
