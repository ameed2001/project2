const express = require('express');
const router = express.Router();

// Concrete calculation endpoint
router.post('/concrete', (req, res) => {
  console.log('[POST /calculations/concrete] Received request:', req.body);
  try {
    const { projectArea, floors, foundationDepth, wallThickness, slabThickness } = req.body;

    // Validate input
    if (!projectArea || !floors || !foundationDepth || !wallThickness || !slabThickness) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
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

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في حساب كميات الباطون'
    });
  }
});

// Steel calculation endpoint
router.post('/steel', (req, res) => {
  console.log('[POST /calculations/steel] Received request:', req.body);
  try {
    const { concreteVolume, steelRatio } = req.body;

    if (!concreteVolume) {
      return res.status(400).json({
        success: false,
        message: 'حجم الباطون مطلوب'
      });
    }

    // steelRatio can be:
    // - A ratio (0.08 = 8%) - multiply by 7850 to get kg/m³
    // - kg/m³ value (80 = 80 kg/m³) - use directly
    // Default to 80 kg/m³ if not provided
    let steelKgPerCubicMeter;
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

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في حساب كميات الحديد'
    });
  }
});

// Cost estimation endpoint
router.post('/cost-estimation', (req, res) => {
  try {
    const {
      concreteVolume,
      steelWeight,
      concretePricePerCubicMeter,
      steelPricePerKg
    } = req.body;

    if (!concreteVolume || !steelWeight || !concretePricePerCubicMeter || !steelPricePerKg) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    const concreteCost = concreteVolume * concretePricePerCubicMeter;
    const steelCost = steelWeight * steelPricePerKg;
    const totalCost = concreteCost + steelCost;

    // Cost breakdown (estimates)
    const labor = totalCost * 0.25;
    const equipment = totalCost * 0.15;
    const overhead = totalCost * 0.1;

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في تقدير التكلفة'
    });
  }
});

// Generate cost report endpoint
router.post('/generate-cost-report', (req, res) => {
  try {
    const { projectId, calculationType, input } = req.body;

    // This endpoint can be extended to save reports to database
    return res.json({
      success: true,
      message: 'تم إنشاء تقرير التكلفة بنجاح',
      data: {
        projectId,
        calculationType,
        input,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cost report generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء تقرير التكلفة'
    });
  }
});

module.exports = router;

