import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  try {
    return NextResponse.json({ message: "server is running" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
