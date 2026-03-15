import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendJoinConfirmationEmail, sendAdminJoinNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone, interests, how_heard, message, terms_accepted } = body;

    if (!full_name || !email) {
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
      .from("join_submissions")
      .insert({
        full_name,
        email,
        phone: phone || null,
        interests: interests || null,
        how_heard: how_heard || null,
        message: message || null,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send emails (non-blocking)
    sendJoinConfirmationEmail({ to: email, name: full_name }).catch(() => {});
    sendAdminJoinNotification({ name: full_name, email, phone, interests, howHeard: how_heard, message }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
