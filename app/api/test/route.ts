import { dodoClient } from "@/lib/dodo";
import { NextResponse } from "next/server";

export async function POST(_: Request) {
  try {
    const customer = await dodoClient.customers.create({
      email: "sameer.kattubadi@gmail.com",
      name: "Sameer Shaik",
    });
    const checkoutSession = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: "124", // REAL product id
          quantity: 1,
        },
      ],
      customer: {
        email: "buyer@example.com",
        name: "Sameer",
      },
    });

    // Process request

    return NextResponse.json({
      success: true,
      message: "Data received successfully",
      data: checkoutSession,
    });
  } catch (err) {
    console.error("POST /api/submit failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
