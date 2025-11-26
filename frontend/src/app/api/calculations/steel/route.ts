import { NextRequest, NextResponse } from 'next/server';

export interface SteelCalculationInput {
  concreteVolume: number;
  steelRatio?: number;
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

export async function POST(request: NextRequest) {
  try {
    const body: SteelCalculationInput = await request.json();
    const { concreteVolume, steelRatio } = body;

    if (!concreteVolume) {
      return NextResponse.json(
        {
          success: false,
          message: 'حجم الباطون مطلوب'
        },
        { status: 400 }
      );
    }

    // steelRatio can be:
    // - A ratio (0.08 = 8%) - multiply by 7850 to get kg/m³
    // - kg/m³ value (80 = 80 kg/m³) - use directly
    // Default to 80 kg/m³ if not provided
    let steelKgPerCubicMeter: number;
    if (steelRatio === undefined || steelRatio === null) {
      steelKgPerCubicMeter = 80; // Default 80 kg/m³
    } else if (steelRatio < 1) {
      // If less than 1, treat as ratio (e.g., 0.08 = 8%)
      steelKgPerCubicMeter = steelRatio * 7850;
    } else {
      // If 1 or greater, treat as kg/m³ directly
      steelKgPerCubicMeter = steelRatio;
    }

    // Calculate steel weight
    const totalWeight = concreteVolume * steelKgPerCubicMeter;

    // Distribute steel across different elements
    const mainSteelWeight = totalWeight * 0.4;
    const secondarySteelWeight = totalWeight * 0.6;
    const columnsSteel = totalWeight * 0.3;
    const beamsSteel = totalWeight * 0.25;
    const slabsSteel = totalWeight * 0.25;
    const foundationSteel = totalWeight * 0.2;

    return NextResponse.json({
      success: true,
      data: {
        totalWeight: Math.round(totalWeight * 100) / 100,
        mainSteelWeight: Math.round(mainSteelWeight * 100) / 100,
        secondarySteelWeight: Math.round(secondarySteelWeight * 100) / 100,
        columnsSteel: Math.round(columnsSteel * 100) / 100,
        beamsSteel: Math.round(beamsSteel * 100) / 100,
        slabsSteel: Math.round(slabsSteel * 100) / 100,
        foundationSteel: Math.round(foundationSteel * 100) / 100
      }
    });
  } catch (error) {
    console.error('Steel calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ في حساب كميات الحديد'
      },
      { status: 500 }
    );
  }
}

