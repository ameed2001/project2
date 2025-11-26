import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      calculations: {
        concrete: '/api/calculations/concrete',
        steel: '/api/calculations/steel',
        costEstimation: '/api/calculations/cost-estimation'
      }
    }
  });
}

