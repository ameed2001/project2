// Concrete calculations based on project dimensions
export interface ConcreteCalculationInput {
  projectArea: number; // مساحة المشروع بالمتر المربع
  floors: number; // عدد الطوابق
  foundationDepth: number; // عمق الأساسات بالمتر
  wallThickness: number; // سمك الجدران بالمتر
  slabThickness: number; // سمك البلاطات بالمتر
}

export interface ConcreteCalculationResult {
  totalVolume: number;
  foundationVolume: number;
  columnsVolume: number;
  slabsVolume: number;
  beamsVolume: number;
  stairsVolume: number;
  wallsVolume: number;
}

export function calculateConcreteQuantities(input: ConcreteCalculationInput): ConcreteCalculationResult {
  const { projectArea, floors, foundationDepth, wallThickness, slabThickness } = input;
  
  // حساب حجم الأساسات
  const foundationArea = projectArea * 1.1; // زيادة 10% للأسوار الخارجية
  const foundationVolume = foundationArea * foundationDepth;
  
  // حساب حجم الأعمدة (افتراض 4% من مساحة المشروع)
  const columnsArea = projectArea * 0.04;
  const columnsHeight = floors * 3; // ارتفاع متوسط 3 أمتار لكل طابق
  const columnsVolume = columnsArea * columnsHeight;
  
  // حساب حجم البلاطات
  const slabsVolume = projectArea * floors * slabThickness;
  
  // حساب حجم الكمرات (افتراض 3% من مساحة المشروع)
  const beamsArea = projectArea * 0.03;
  const beamsHeight = 0.3; // ارتفاع متوسط 30 سم
  const beamsVolume = beamsArea * floors * beamsHeight;
  
  // حساب حجم السلالم (افتراض سلالم لكل طابق)
  const stairsArea = 20; // مساحة السلالم بالمتر المربع
  const stairsHeight = floors * 3;
  const stairsVolume = stairsArea * stairsHeight * 0.15; // سمك 15 سم
  
  // حساب حجم الجدران
  const perimeter = Math.sqrt(projectArea) * 4; // محيط تقريبي
  const wallsVolume = perimeter * floors * 3 * wallThickness; // ارتفاع 3 أمتار لكل طابق
  
  const totalVolume = foundationVolume + columnsVolume + slabsVolume + beamsVolume + stairsVolume + wallsVolume;
  
  return {
    totalVolume: Math.round(totalVolume * 100) / 100,
    foundationVolume: Math.round(foundationVolume * 100) / 100,
    columnsVolume: Math.round(columnsVolume * 100) / 100,
    slabsVolume: Math.round(slabsVolume * 100) / 100,
    beamsVolume: Math.round(beamsVolume * 100) / 100,
    stairsVolume: Math.round(stairsVolume * 100) / 100,
    wallsVolume: Math.round(wallsVolume * 100) / 100,
  };
}

// Steel calculations based on concrete volume
export interface SteelCalculationInput {
  concreteVolume: number; // حجم الباطون بالمتر المكعب
  steelRatio: number; // نسبة الحديد للباطون (افتراض 80 كجم/م³)
}

export interface SteelCalculationResult {
  totalWeight: number;
  mainSteelWeight: number;
  secondarySteelWeight: number;
  columnsSteel: number;
  beamsSteel: number;
  slabsSteel: number;
  foundationSteel: number;
}

export function calculateSteelQuantities(input: SteelCalculationInput): SteelCalculationResult {
  const { concreteVolume, steelRatio = 80 } = input;
  
  // إجمالي وزن الحديد
  const totalWeight = concreteVolume * steelRatio;
  
  // توزيع الحديد حسب العناصر الإنشائية
  const mainSteelWeight = totalWeight * 0.4; // 40% حديد رئيسي
  const secondarySteelWeight = totalWeight * 0.3; // 30% حديد ثانوي
  
  // توزيع حسب العناصر
  const columnsSteel = totalWeight * 0.25; // 25% للأعمدة
  const beamsSteel = totalWeight * 0.35; // 35% للكمرات
  const slabsSteel = totalWeight * 0.25; // 25% للبلاطات
  const foundationSteel = totalWeight * 0.15; // 15% للأساسات
  
  return {
    totalWeight: Math.round(totalWeight),
    mainSteelWeight: Math.round(mainSteelWeight),
    secondarySteelWeight: Math.round(secondarySteelWeight),
    columnsSteel: Math.round(columnsSteel),
    beamsSteel: Math.round(beamsSteel),
    slabsSteel: Math.round(slabsSteel),
    foundationSteel: Math.round(foundationSteel),
  };
}

// Cost estimation based on quantities
export interface CostEstimationInput {
  concreteVolume: number;
  steelWeight: number;
  concretePricePerCubicMeter: number; // سعر المتر المكعب من الباطون
  steelPricePerKg: number; // سعر الكيلو من الحديد
}

export interface CostEstimationResult {
  concreteCost: number;
  steelCost: number;
  totalCost: number;
  costBreakdown: {
    concrete: number;
    steel: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
}

export function estimateCosts(input: CostEstimationInput): CostEstimationResult {
  const { concreteVolume, steelWeight, concretePricePerCubicMeter, steelPricePerKg } = input;
  
  // تكلفة الباطون
  const concreteCost = concreteVolume * concretePricePerCubicMeter;
  
  // تكلفة الحديد
  const steelCost = steelWeight * steelPricePerKg;
  
  // تكلفة العمالة (افتراض 30% من تكلفة المواد)
  const laborCost = (concreteCost + steelCost) * 0.3;
  
  // تكلفة المعدات (افتراض 15% من تكلفة المواد)
  const equipmentCost = (concreteCost + steelCost) * 0.15;
  
  // المصاريف الإدارية (افتراض 10% من التكلفة الإجمالية)
  const overheadCost = (concreteCost + steelCost + laborCost + equipmentCost) * 0.1;
  
  const totalCost = concreteCost + steelCost + laborCost + equipmentCost + overheadCost;
  
  return {
    concreteCost: Math.round(concreteCost),
    steelCost: Math.round(steelCost),
    totalCost: Math.round(totalCost),
    costBreakdown: {
      concrete: Math.round(concreteCost),
      steel: Math.round(steelCost),
      labor: Math.round(laborCost),
      equipment: Math.round(equipmentCost),
      overhead: Math.round(overheadCost),
    },
  };
}
