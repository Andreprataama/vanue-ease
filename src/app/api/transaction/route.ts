import midtransClient from "midtrans-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { orderId, grossAmount } = await req.json();

  // Create Snap API instance
  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production environment
    serverKey: process.env.MIDTRANS_SERVER_KEY, // Use environment variables
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "08123456789",
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;
    // Return the token and redirect URL to the frontend
    return NextResponse.json({
      token: snapToken,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
