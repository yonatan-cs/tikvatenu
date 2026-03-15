import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAdminContactNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, terms_accepted } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!terms_accepted) {
      return NextResponse.json(
        { error: "You must accept the terms and privacy policy" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send admin notification (non-blocking)
    sendAdminContactNotification({ name, email, subject: subject || null, message }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
