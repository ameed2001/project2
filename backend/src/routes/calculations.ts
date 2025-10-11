import { Router } from 'express';
import { prisma } from '../lib/db';
import { 
  calculateConcreteQuantities, 
  calculateSteelQuantities, 
  estimateCosts,
  type ConcreteCalculationInput,
  type SteelCalculationInput,
  type CostEstimationInput
} from '../lib/calculations';

const router = Router();

// POST /api/calculations/concrete
router.post('/concrete', async (req, res) => {
  try {
    const input: ConcreteCalculationInput = req.body;
    
    // التحقق من صحة البيانات
    if (!input.projectArea || !input.floors || !input.foundationDepth) {
      return res.status(400).json({
        success: false,
        message: 'البيانات المطلوبة: مساحة المشروع، عدد الطوابق، عمق الأساسات'
      });
    }
    
    const result = calculateConcreteQuantities(input);
    
    // حفظ النتائج في قاعدة البيانات (اختياري)
    // يمكن حفظها كجزء من المشروع أو كسجل منفصل
    
    res.json({
      success: true,
      data: result,
      message: 'تم حساب كميات الباطون بنجاح'
    });
  } catch (error) {
    console.error('Error calculating concrete quantities:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حساب كميات الباطون'
    });
  }
});

// POST /api/calculations/steel
router.post('/steel', async (req, res) => {
  try {
    const input: SteelCalculationInput = req.body;
    
    // التحقق من صحة البيانات
    if (!input.concreteVolume) {
      return res.status(400).json({
        success: false,
        message: 'حجم الباطون مطلوب لحساب كميات الحديد'
      });
    }
    
    const result = calculateSteelQuantities(input);
    
    res.json({
      success: true,
      data: result,
      message: 'تم حساب كميات الحديد بنجاح'
    });
  } catch (error) {
    console.error('Error calculating steel quantities:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حساب كميات الحديد'
    });
  }
});

// POST /api/calculations/cost-estimation
router.post('/cost-estimation', async (req, res) => {
  try {
    const input: CostEstimationInput = req.body;
    
    // التحقق من صحة البيانات
    if (!input.concreteVolume || !input.steelWeight) {
      return res.status(400).json({
        success: false,
        message: 'حجم الباطون ووزن الحديد مطلوبان لتقدير التكاليف'
      });
    }
    
    const result = estimateCosts(input);
    
    res.json({
      success: true,
      data: result,
      message: 'تم تقدير التكاليف بنجاح'
    });
  } catch (error) {
    console.error('Error estimating costs:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تقدير التكاليف'
    });
  }
});

// POST /api/calculations/generate-cost-report
router.post('/generate-cost-report', async (req, res) => {
  try {
    const { projectId, calculationType, input } = req.body;
    
    if (!projectId || !calculationType || !input) {
      return res.status(400).json({
        success: false,
        message: 'معرف المشروع، نوع الحساب، والبيانات مطلوبة'
      });
    }
    
    // التحقق من وجود المشروع
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    let calculationResult;
    let reportName;
    let items = [];
    
    if (calculationType === 'concrete') {
      calculationResult = calculateConcreteQuantities(input);
      reportName = `تقرير كميات الباطون - ${project.name}`;
      
      // إنشاء عناصر التقرير
      items = [
        {
          name: 'باطون الأساسات',
          quantity: calculationResult.foundationVolume,
          unit: 'م³',
          pricePerUnit: 350, // سعر افتراضي
          totalCost: calculationResult.foundationVolume * 350
        },
        {
          name: 'باطون الأعمدة',
          quantity: calculationResult.columnsVolume,
          unit: 'م³',
          pricePerUnit: 380,
          totalCost: calculationResult.columnsVolume * 380
        },
        {
          name: 'باطون البلاطات',
          quantity: calculationResult.slabsVolume,
          unit: 'م³',
          pricePerUnit: 360,
          totalCost: calculationResult.slabsVolume * 360
        },
        {
          name: 'باطون الكمرات',
          quantity: calculationResult.beamsVolume,
          unit: 'م³',
          pricePerUnit: 370,
          totalCost: calculationResult.beamsVolume * 370
        },
        {
          name: 'باطون السلالم',
          quantity: calculationResult.stairsVolume,
          unit: 'م³',
          pricePerUnit: 390,
          totalCost: calculationResult.stairsVolume * 390
        },
        {
          name: 'باطون الجدران',
          quantity: calculationResult.wallsVolume,
          unit: 'م³',
          pricePerUnit: 340,
          totalCost: calculationResult.wallsVolume * 340
        }
      ];
    } else if (calculationType === 'steel') {
      calculationResult = calculateSteelQuantities(input);
      reportName = `تقرير كميات الحديد - ${project.name}`;
      
      // إنشاء عناصر التقرير
      items = [
        {
          name: 'حديد الأعمدة',
          quantity: calculationResult.columnsSteel,
          unit: 'كجم',
          pricePerUnit: 12, // سعر افتراضي
          totalCost: calculationResult.columnsSteel * 12
        },
        {
          name: 'حديد الكمرات',
          quantity: calculationResult.beamsSteel,
          unit: 'كجم',
          pricePerUnit: 12,
          totalCost: calculationResult.beamsSteel * 12
        },
        {
          name: 'حديد البلاطات',
          quantity: calculationResult.slabsSteel,
          unit: 'كجم',
          pricePerUnit: 12,
          totalCost: calculationResult.slabsSteel * 12
        },
        {
          name: 'حديد الأساسات',
          quantity: calculationResult.foundationSteel,
          unit: 'كجم',
          pricePerUnit: 12,
          totalCost: calculationResult.foundationSteel * 12
        }
      ];
    }
    
    // حساب إجمالي التكلفة
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    
    // إنشاء تقرير التكاليف في قاعدة البيانات
    const costReport = await prisma.costReport.create({
      data: {
        projectId: parseInt(projectId),
        reportName,
        engineerId: project.userId || '',
        engineerName: project.engineer || '',
        ownerId: '',
        ownerName: project.clientName || project.linkedOwnerEmail || '',
        totalCostILS: totalCost,
        items: {
          create: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            pricePerUnit: item.pricePerUnit,
            totalCost: item.totalCost
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    res.json({
      success: true,
      data: {
        costReport,
        calculationResult
      },
      message: 'تم إنشاء تقرير التكاليف بنجاح'
    });
  } catch (error) {
    console.error('Error generating cost report:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء تقرير التكاليف'
    });
  }
});

export default router;
