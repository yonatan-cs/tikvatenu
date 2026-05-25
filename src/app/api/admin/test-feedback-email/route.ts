import { NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");
  if (!to) return NextResponse.json({ error: "missing 'to' param" }, { status: 400 });

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tikvatenu.com").replace(/\/$/, "");
  const result = await sendFeedbackEmail({
    to,
    participantName: "יונתן (דוגמה)",
    eventTitle: "תיקון לאחר שבועות - קריאות כיוון לישראל #2",
    feedbackUrl: `${siteUrl}/he/events/2/feedback`,
    customIntro:
      "הייי לכולם/ן!!!\nאז אחרי תיקון מדהים שהיה לנו\nחשוב לנו לקבל את המשוב שלכם/ן כדי ללמוד ולהשתפר\nוגם כדי לראות לאן אתם/ן רואים את 'תקוותנו' ממשיכה הלאה\nתודה רבה לכל מי שהגיע\nנתראה בהמשך!!",
  });

  return NextResponse.json(result);
}
