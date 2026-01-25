import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UseCase } from '@prisma/client';
import { z } from 'zod';
import { error } from 'console';

const OnboardingSchema = z.object({
  role: z.nativeEnum(UserRole).nullable(),
  primaryUseCase: z.nativeEnum(UseCase).nullable(),
  skipped: z.boolean().optional(),
});

type OnboardingRequest = z.infer<typeof OnboardingSchema>;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: true,
        message: 'user not authenticated',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('token not present');

      return NextResponse.json({
        success: false,
        error: true,
        message: 'user not authenticated',
      });
    }

    const body = await request.json();
    const parsedData: OnboardingRequest = OnboardingSchema.parse(body);

    // Check if both role and primaryUseCase are null
    if (parsedData.role === null && parsedData.primaryUseCase === null) {
      console.log('null data');

      return NextResponse.json({
        success: false,
        error: true,
        message: 'payload both null',
      });
    }

    const backendUrl = process.env.BACKEND_API_URL;
    if (!backendUrl) {
      return NextResponse.json({
        success: false,
        error: true,
        message: 'Backend API URL not configured',
      });
    }

    const response = await fetch(`${backendUrl}/api/v1/user/details`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(parsedData),
    });

    const responseData = (await response.json()) as { success: boolean; error: boolean; data: any };
    console.log(responseData);

    return NextResponse.json(
      { success: responseData.success, error: responseData.error, data: responseData.data },
      { status: response.status },
    );
  } catch (error) {
    console.error('Onboarding proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: true,
        message: 'Failed to save onboarding data',
      },
      { status: 500 },
    );
  }
}
