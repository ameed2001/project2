import { NextRequest, NextResponse } from 'next/server';

export interface ConcreteCalculationInput {
  projectArea: number;
  floors: number;
  foundationDepth: number;
  wallThickness: number;
  slabThickness: number;
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

export async function POST(request: NextRequest) {
  try {
    const body: ConcreteCalculationInput = await request.json();
    const { projectArea, floors, foundationDepth, wallThickness, slabThickness } = body;

    // Validate input
    if (!projectArea || !floors || !foundationDepth || !wallThickness || !slabThickness) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول مطلوبة'
        },
        { status: 400 }
      );
    }

    // Calculate foundation volume (assuming square foundation)
    const foundationSide = Math.sqrt(projectArea);
    const foundationVolume = foundationSide * foundationSide * foundationDepth;

    // Calculate columns volume (assuming 4 columns per floor, 0.3x0.3m each, 3m height)
    const columnVolumePerFloor = 4 * 0.3 * 0.3 * 3; // 4 columns, 0.3x0.3m, 3m height
    const columnsVolume = columnVolumePerFloor * floors;

    // Calculate slabs volume
    const slabsVolume = projectArea * slabThickness * floors;

    // Calculate beams volume (assuming perimeter beams, 0.3m width, 0.4m height)
    const perimeter = 4 * foundationSide;
    const beamVolumePerFloor = perimeter * 0.3 * 0.4;
    const beamsVolume = beamVolumePerFloor * floors;

    // Calculate stairs volume (assuming 1 stair per floor, 2m width, 3m length, 0.2m thickness)
    const stairsVolumePerFloor = 2 * 3 * 0.2;
    const stairsVolume = stairsVolumePerFloor * floors;

    // Calculate walls volume (perimeter walls, excluding openings)
    const wallHeight = 3; // 3 meters per floor
    const wallsVolume = perimeter * wallThickness * wallHeight * floors;

    // Total volume
    const totalVolume = foundationVolume + columnsVolume + slabsVolume + beamsVolume + stairsVolume + wallsVolume;

    return NextResponse.json({
      success: true,
      data: {
        totalVolume: Math.round(totalVolume * 100) / 100,
        foundationVolume: Math.round(foundationVolume * 100) / 100,
        columnsVolume: Math.round(columnsVolume * 100) / 100,
        slabsVolume: Math.round(slabsVolume * 100) / 100,
        beamsVolume: Math.round(beamsVolume * 100) / 100,
        stairsVolume: Math.round(stairsVolume * 100) / 100,
        wallsVolume: Math.round(wallsVolume * 100) / 100
      }
    });
  } catch (error) {
    console.error('Concrete calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ في حساب كميات الباطون'
      },
      { status: 500 }
    );
  }
}

