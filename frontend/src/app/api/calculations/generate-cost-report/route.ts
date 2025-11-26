import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, calculationType, input } = body;

    // This endpoint can be extended to save reports to database
    return NextResponse.json({
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
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ في إنشاء تقرير التكلفة'
      },
      { status: 500 }
    );
  }
}

