
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Printer, PlusCircle, Trash2, Calculator, HardHat, User, Save, Loader2, Blocks, Ruler, FileText, ShoppingBasket, FileSignature, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserDocument, Project } from '@/lib/db';
import { getUsers, addCostReport, getProjects } from '@/lib/db';
import { cn } from '@/lib/utils';

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit_ILS: number;
  totalCost_ILS: number;
}

const baseUnits: Record<string, string> = {
  brick: "قطعة",
  iron: "كغم",
  concrete: "م³",
  mesh: "لفة",
  nails: "حبة",
  cuttingDiscs: "قرص",
  cement: "كيس",
  sand: "م³",
  hasma: "حصمة",
  naama: "ناعمة",
};

const getMaterialDisplayName = (key: string): string => {
  const names: Record<string, string> = {
    brick: "الطوب",
    iron: "الحديد",
    concrete: "الخرسانة",
    mesh: "السلك",
    nails: "مسامير",
    cuttingDiscs: "أقراص قطع",
    cement: "إسمنت",
    sand: "رمل",
    hasma: "حصمة",
    naama: "ناعمة",
  };
  return names[key] || key;
};

const materialSubTypes: Record<string, string[]> = {
  brick: ["طوب 10", "طوب 20", "طوب 15", "ربس 14", "ربس 17", "ربس 24"],
  iron: ["6 مم", "8 ملم", "10 ملم", "12 ملم", "14 ملم", "16 ملم", "18 ملم", "20 ملم", "شبك حديد"],
  concrete: ["خرسانة جاهزة (رملية)", "خرسانة جاهزة (ناعمة)"],
  mesh: ["سلك مجدول", "سلك ناعم"],
  nails: ["مسمار 6", "مسمار 10", "مسمار فولاذ"],
  cuttingDiscs: ["أقراص قطع حديد", "أقراص قطع خرسانة"],
  cement: ["اسمنت ابيض", "اسمنت اسود"],
  sand: ["رمل"],
  hasma: ["حصمة حبة كبيرة", "حصمة حبة صغيرة"],
  naama: ["ناعمة"],
};

export default function CostEstimatorForm() {
  const { toast } = useToast();
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string>('');
  const [selectedSubType, setSelectedSubType] = useState<string>('');
  const [pricePerUnitILS, setPricePerUnitILS] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [currentUnitDisplay, setCurrentUnitDisplay] = useState<string>('--');
  const [engineerName, setEngineerName] = useState<string>('');
  const [engineerId, setEngineerId] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');
  const [owners, setOwners] = useState<UserDocument[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    if (name) setEngineerName(name);
    if (id) setEngineerId(id);

    async function fetchData() {
      if (!id) return;
      const [usersResult, projectsResult] = await Promise.all([
        getUsers(),
        getProjects(id)
      ]);

      if (usersResult.success && usersResult.users) {
        // The API may return user objects that omit sensitive fields (e.g. password_hash).
        // Ensure the shape matches UserDocument by providing a safe default for password_hash
        // so TypeScript accepts the assignment to UserDocument[].
        const ownersList: UserDocument[] = usersResult.users
          .filter(u => u.role === 'OWNER' && u.status === 'ACTIVE')
          .map(u => ({ ...(u as any), password_hash: (u as any).password_hash ?? '' } as UserDocument));
        setOwners(ownersList);
      } else {
        toast({ title: "خطأ", description: "فشل تحميل قائمة المالكين.", variant: "destructive"});
      }

      if (projectsResult.success && projectsResult.projects) {
        setProjects(projectsResult.projects.filter(p => p.status !== 'مؤرشف'));
      } else {
        toast({ title: "خطأ", description: "فشل تحميل قائمة المشاريع.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (selectedMaterialKey) {
      setCurrentUnitDisplay(baseUnits[selectedMaterialKey] || '--');
      setSelectedSubType('');
    } else {
      setCurrentUnitDisplay('--');
      setSelectedSubType('');
    }
  }, [selectedMaterialKey]);
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id.toString() === projectId);
    if (project) {
        setReportName(project.name); 
        const owner = owners.find(o => o.email === project.linkedOwnerEmail);
        if (owner) {
            setSelectedOwnerId(owner.id);
        } else {
            setSelectedOwnerId('');
        }
    }
  };

  const handleAddItem = () => {
    if (!selectedMaterialKey || !selectedSubType || !pricePerUnitILS || !quantity) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع البيانات المطلوبة.",
        variant: "destructive",
      });
      return;
    }
    const priceNum = parseFloat(pricePerUnitILS);
    const quantityNum = parseFloat(quantity);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "بيانات غير صالحة",
        description: "يرجى التأكد من أن السعر والكمية أرقام موجبة.",
        variant: "destructive",
      });
      return;
    }
    const materialDisplayName = getMaterialDisplayName(selectedMaterialKey);
    const fullItemName = `${materialDisplayName} (${selectedSubType})`;
    const unit = baseUnits[selectedMaterialKey];
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      name: fullItemName,
      quantity: quantityNum,
      unit: unit,
      pricePerUnit_ILS: priceNum,
      totalCost_ILS: priceNum * quantityNum,
    };
    setItems(prevItems => [...prevItems, newItem]);
    setSelectedSubType('');
    setPricePerUnitILS('');
    setQuantity('');
     toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة "${fullItemName}" إلى القائمة.`,
        variant: "default",
      });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
        title: "تم الحذف",
        description: "تم حذف المادة من القائمة.",
      });
  };

  const handleClearAllItems = () => {
    setItems([]);
    setSelectedMaterialKey('');
    setSelectedSubType('');
    setPricePerUnitILS('');
    setQuantity('');
    setCurrentUnitDisplay('--');
    setReportName('');
    setSelectedOwnerId('');
    setSelectedProjectId('');
    toast({
        title: "تم مسح الكل",
        description: "تم مسح جميع المواد من القائمة.",
      });
  };
  
  const calculateOverallTotal_ILS = () => {
    return items.reduce((sum, item) => sum + item.totalCost_ILS, 0);
  };
  
  const handleSaveAndPrintReport = async () => {
    if (!selectedProjectId) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار مشروع لربط التقرير به.", variant: "destructive" });
      return;
    }
    if (!reportName.trim()) {
      toast({ title: "بيانات ناقصة", description: "يرجى إدخال اسم للتقرير.", variant: "destructive" });
      return;
    }
    if (!selectedOwnerId) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار مالك لربط التقرير به.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const selectedOwner = owners.find(o => o.id === selectedOwnerId);
    if (!selectedOwner) {
      toast({ title: "خطأ", description: "المالك المختار غير موجود.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    const reportData = {
      projectId: parseInt(selectedProjectId, 10),
      reportName,
      engineerId,
      engineerName,
      ownerId: selectedOwnerId,
      ownerName: selectedOwner.name,
      items: items,
      totalCost_ILS: calculateOverallTotal_ILS(),
    };
    const result = await addCostReport(reportData);
    setIsSaving(false);
    if (result) {
      toast({ title: "تم الحفظ بنجاح", description: "تم حفظ التقرير وربطه بالمالك.", variant: "default" });
      printReport(reportName, engineerName, selectedOwner.name);
    } else {
      toast({ title: "فشل الحفظ", description: "حدث خطأ أثناء حفظ التقرير.", variant: "destructive" });
    }
  };

  const printReport = (reportTitle: string, engName: string, ownerName: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const tableRows = items.map(item => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity} ${item.unit}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.pricePerUnit_ILS.toFixed(2)} ₪</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: left; font-weight: 500;">${item.totalCost_ILS.toFixed(2)} ₪</td>
        </tr>
      `).join('');
      const overallTotal = calculateOverallTotal_ILS().toFixed(2);
      const fullReportTitle = `تقرير تكلفة البناء: ${reportTitle}`;
      printWindow.document.write(`
        <html>
          <head>
            <title>${fullReportTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 25px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 25px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: right; }
              th { background-color: #f8fafc; font-weight: 700; color: #1e293b; }
              .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4f46e5; }
              .header h1 { color: #4f46e5; font-size: 28px; }
              .header p { margin: 4px 0; color: #475569; font-size: 16px; }
              .total-row td { font-weight: bold; font-size: 16px; background-color: #f1f5f9; }
              .total-row .total-label { color: #4f46e5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${fullReportTitle}</h1>
              <p>المهندس المسؤول: ${engName}</p>
              <p>المالك/العميل: ${ownerName}</p>
              <p>تاريخ التقرير: ${new Date().toLocaleString('ar-EG')}</p>
              <p>العملة: شيكل (₪)</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="total-label">المجموع الكلي:</td>
                  <td style="text-align: left;">${overallTotal} ₪</td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      toast({
        title: "خطأ في الطباعة",
        description: "لم يتمكن المتصفح من فتح نافذة الطباعة.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 cost-estimator-body">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          <span className="text-blue-600">حاسبة</span> أسعار المواد
        </h1>
        <p className="text-gray-600">أداة لحساب تكاليف مواد البناء بالشيكل</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg sticky top-6">
            <CardHeader className="bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6" />
                <CardTitle>إضافة مادة جديدة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
               <div>
                  <Label htmlFor="project" className="flex items-center gap-2 mb-2 font-medium text-gray-700"><Briefcase size={16} /> اختر المشروع</Label>
                  <Select onValueChange={handleProjectChange} value={selectedProjectId} dir="rtl">
                      <SelectTrigger id="project" className="w-full text-right bg-gray-50"><SelectValue placeholder="اختر مشروعًا لربط التقرير به..." /></SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (<SelectItem key={project.id} value={project.id.toString()}>{project.name}</SelectItem>))}
                      </SelectContent>
                  </Select>
              </div>

              <div>
                <Label htmlFor="material" className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <Blocks size={16} /> اختر مادة البناء
                </Label>
                <Select value={selectedMaterialKey} onValueChange={setSelectedMaterialKey} dir="rtl">
                  <SelectTrigger id="material" className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-right">
                    <SelectValue placeholder="حدد المادة من القائمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(baseUnits).map((matKey) => (
                      <SelectItem key={matKey} value={matKey}>
                        {getMaterialDisplayName(matKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMaterialKey && materialSubTypes[selectedMaterialKey] && (
                <div>
                  <Label htmlFor="subtype" className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <Blocks size={16} /> اختر النوع الفرعي
                  </Label>
                  <Select value={selectedSubType} onValueChange={setSelectedSubType} dir="rtl">
                    <SelectTrigger id="subtype" className="w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-right">
                      <SelectValue placeholder="اختر النوع الفرعي" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialSubTypes[selectedMaterialKey]?.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantity" className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                   <Ruler size={16} /> الكمية
                </Label>
                <div className="relative">
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="أدخل الكمية" className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-20 text-right" min="0.01" step="0.01"/>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-200 px-3 py-1 rounded text-sm text-gray-700 pointer-events-none">
                      {currentUnitDisplay}
                    </div>
                </div>
              </div>

              <div>
                <Label htmlFor="pricePerUnitILS" className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <span className="font-bold text-lg">₪</span> السعر لكل وحدة (شيكل)
                </Label>
                <Input id="pricePerUnitILS" type="number" value={pricePerUnitILS} onChange={(e) => setPricePerUnitILS(e.target.value)} placeholder="أدخل السعر" className="bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500" min="0.01" step="0.01"/>
              </div>
              
              <Button onClick={handleAddItem} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 text-lg transform hover:scale-105 transition-transform" disabled={!selectedMaterialKey || !selectedSubType || !pricePerUnitILS || !quantity}>
                <PlusCircle className="ml-2 h-5 w-5" />
                إضافة المادة للقائمة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Column */}
        <div className="lg:col-span-3 space-y-6">
          {items.length === 0 ? (
            <Card className="shadow-lg border-2 border-dashed border-gray-300 h-full flex items-center justify-center">
                <CardContent className="text-center text-gray-500 p-8">
                    <ShoppingBasket size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">قائمة التكاليف فارغة</h3>
                    <p className="mt-2">ابدأ بإضافة المواد من النموذج على اليمين لعرض تقرير التكاليف هنا.</p>
                </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6" />
                      <CardTitle>تقرير التكاليف</CardTitle>
                    </div>
                    <div className="text-right">
                       <div className="text-sm">المجموع الكلي</div>
                       <div className="text-2xl font-bold">{calculateOverallTotal_ILS().toFixed(2)} ₪</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">المادة</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">الكمية</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600">سعر الوحدة</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">المجموع</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-right text-gray-700 font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{item.pricePerUnit_ILS.toFixed(2)}</td>
                            <td className="px-4 py-3 text-left text-gray-700 font-semibold">{item.totalCost_ILS.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100/50 p-1 h-8 w-8">
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-indigo-500" />
                        <CardTitle className="text-gray-800">حفظ وربط التقرير</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="reportName" className="flex items-center gap-2 mb-2 font-medium text-gray-700"><FileSignature size={16} /> اسم التقرير</Label>
                        <Input id="reportName" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="مثال: تقدير تكلفة فيلا السيد أحمد" className="bg-gray-50" disabled={!!selectedProjectId} />
                    </div>
                    <div>
                        <Label htmlFor="owner" className="flex items-center gap-2 mb-2 font-medium text-gray-700"><User size={16} /> ربط بمالك</Label>
                        <Select onValueChange={setSelectedOwnerId} value={selectedOwnerId} dir="rtl" disabled={!!selectedProjectId}>
                            <SelectTrigger id="owner" className="w-full text-right bg-gray-50"><SelectValue placeholder="اختر مالكًا..." /></SelectTrigger>
                            <SelectContent>{owners.map(owner => (<SelectItem key={owner.id} value={owner.id}>{owner.name} ({owner.email})</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button onClick={handleClearAllItems} variant="destructive" className="w-full sm:w-auto"><Trash2 className="ml-2 h-5 w-5" /> مسح كل المواد</Button>
                    <Button onClick={handleSaveAndPrintReport} disabled={isSaving} className="w-full sm:w-auto flex-grow bg-gradient-to-r from-indigo-500 to-purple-500 text-white"><Printer className="ml-2 h-5 w-5" /> {isSaving ? "جاري الحفظ..." : "حفظ وطباعة التقرير"}</Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
