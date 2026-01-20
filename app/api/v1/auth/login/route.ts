import { loginSchema } from '@/lib/zod/schema';
import { AccountType, STATUS } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/helper/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: true, message: 'Invalid input format' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true, password: true, account: { select: { type: true } } },
    });

    if (!user) {
      return Response.json(
        { success: false, error: true, message: 'Invalid credentials' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return Response.json(
        { success: false, error: true, message: 'Invalid credentials' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    // Generate token
    const accountType = user.account?.type ? (user.account.type as AccountType) : AccountType.FREE;

    try {
      const token = generateToken(user.id, accountType);

      return Response.json(
        {
          success: true,
          error: false,
          message: 'Login successful',
          data: { token, user: { id: user.id, email: user.email } },
        },
        { status: STATUS.OK },
      );
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return Response.json(
        { success: false, error: true, message: 'Authentication configuration error' },
        { status: STATUS.INTERNAL_SERVER_ERROR },
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, error: true, message: 'Internal server error' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
