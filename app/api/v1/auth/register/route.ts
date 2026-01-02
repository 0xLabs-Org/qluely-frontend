import { registerSchema } from "@/lib/zod/schema";
import { AccountType, STATUS } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/helper/auth";
import { AccountTypes } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: true,
          message: "Invalid input format",
          details: parsed.error.issues,
        },
        { status: STATUS.BAD_REQUEST }
      );
    }

    const { email, password, coupon } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        email: true,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: true,
          message: "Email already taken",
        },
        { status: STATUS.CONFLICT }
      );
    }

    // Validate coupon if provided
    let accountType: AccountTypes = AccountTypes.FREE;
    if (coupon) {
      // TODO: Implement coupon validation logic
      // For now, assume valid coupon gives premium account
      const isValidCoupon = true; // Replace with actual validation
      if (isValidCoupon) {
        accountType = AccountTypes.PREMIUM;
      } else {
        return Response.json(
          {
            success: false,
            error: true,
            message: "Invalid coupon code",
          },
          { status: STATUS.BAD_REQUEST }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with account
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        account: {
          create: {
            type: accountType,
          },
        },
      },
      select: {
        id: true,
        email: true,
        account: {
          select: {
            type: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          error: true,
          message: "Failed to create user",
        },
        { status: STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Generate token
    const userAccountType = user.account?.type
      ? (user.account.type as AccountType)
      : AccountType.FREE;
    const token = generateToken(user.id, userAccountType);

    return Response.json(
      {
        success: true,
        error: false,
        message: "User created successfully",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            accountType: user.account?.type || AccountType.FREE,
          },
        },
      },
      { status: STATUS.CREATED }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      {
        success: false,
        error: true,
        message: "Internal server error",
      },
      { status: STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
