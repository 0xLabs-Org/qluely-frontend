import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma, { type Prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function generateReferralCode(userId: string, email: string): string {
  return `${userId.replace(/-/g, "").slice(0, 4)}-${email
    .split("@")[0]
    .slice(0, 4)}`.toLowerCase();
}

export function generateUsernameFromEmail(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);

  const suffix = randomBytes(2).toString("hex"); // 4 chars

  return `${base}${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, referralCode } = await req.json();

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check for existing user (outside tx)
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Validate referral code (outside tx)
    let referralId: string | null = null;

    if (referralCode) {
      const referral = await prisma.referral.findUnique({
        where: { code: referralCode },
      });

      if (!referral) {
        return NextResponse.json(
          { message: "Invalid referral code" },
          { status: 400 }
        );
      }

      referralId = referral.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        username: generateUsernameFromEmail(email),
      },
      select: {
        password: false,
      },
    });

    if (!user) {
      throw new Error("error while creating user");
    }

    // 5. Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
