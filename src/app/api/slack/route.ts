import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, message } = await request.json();

    if (!webhookUrl || !message) {
      return NextResponse.json(
        { error: "Missing webhookUrl or message" },
        { status: 400 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to send to Slack" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Slack API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Slack" },
      { status: 500 }
    );
  }
}

