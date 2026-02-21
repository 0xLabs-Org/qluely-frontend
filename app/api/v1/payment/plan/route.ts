import { NextRequest, NextResponse } from 'next/server';

/**
 * GET request handler for fetching payment plans
 * Route: /api/v1/payment/plan
 */
export async function GET(request: NextRequest) {
  try {
    // 1. In a production environment, you might fetch this from a central backend
    const backend = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backend}/api/v1/details`);
    const data  = await response.json();
   

   

    return NextResponse.json({
      success: true,
      message: 'Plans fetched successfully',
      data: data.data,
    }, { status: 200 });

  } catch (error) {
    console.error('[PAYMENT] GET Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export type Plan = {
  id: string;
  name: 'FREE' | 'UNLIMITED' | 'PRO' | 'BASIC';
  currency: 'INR' | 'USD';
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyDiscount: number | null;
  yearlyDiscount: number | null;
  popular: boolean;
};
