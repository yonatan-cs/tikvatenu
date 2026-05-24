import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { dispatchFeedbackEmails } from "@/lib/feedback-dispatch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const result = await dispatchFeedbackEmails(supabase, { lookbackDays: 7 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron] feedback dispatch failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
