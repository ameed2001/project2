import { NextRequest, NextResponse } from 'next/server';

export interface CostEstimationInput {
  concreteVolume: number;
  steelWeight: number;
  concretePricePerCubicMeter: number;
  steelPricePerKg: number;
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

export async function POST(request: NextRequest) {
  try {
    const body: CostEstimationInput = await request.json();
    const {
      concreteVolume,
      steelWeight,
      concretePricePerCubicMeter,
      steelPricePerKg
    } = body;

    if (!concreteVolume || !steelWeight || !concretePricePerCubicMeter || !steelPricePerKg) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول مطلوبة'
        },
        { status: 400 }
      );
    }

    const concreteCost = concreteVolume * concretePricePerCubicMeter;
    const steelCost = steelWeight * steelPricePerKg;
    const totalCost = concreteCost + steelCost;

    // Cost breakdown (estimates)
    const labor = totalCost * 0.25;
    const equipment = totalCost * 0.15;
    const overhead = totalCost * 0.1;

    return NextResponse.json({
      success: true,
      data: {
        concreteCost: Math.round(concreteCost * 100) / 100,
        steelCost: Math.round(steelCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        costBreakdown: {
          concrete: Math.round(concreteCost * 100) / 100,
          steel: Math.round(steelCost * 100) / 100,
          labor: Math.round(labor * 100) / 100,
          equipment: Math.round(equipment * 100) / 100,
          overhead: Math.round(overhead * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Cost estimation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ في تقدير التكلفة'
      },
      { status: 500 }
    );
  }
}

