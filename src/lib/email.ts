import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface RegistrationEmailParams {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  status: "confirmed" | "waitlist";
}

export async function sendRegistrationEmail({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventLocation,
  status,
}: RegistrationEmailParams) {
  if (!resend) {
    console.log("Resend not configured, skipping email to:", to);
    return;
  }

  const formattedDate = new Date(eventDate).toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isWaitlist = status === "waitlist";
  const subject = isWaitlist
    ? `נרשמת לרשימת המתנה - ${eventTitle}`
    : `אישור הרשמה - ${eventTitle}`;

  const html = `
    <div dir="rtl" style="font-family: 'Heebo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2a4d7a); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #f0ede8; margin: 0; font-size: 24px;">תקוותנו</h1>
        <p style="color: #f0ede8; opacity: 0.7; margin: 8px 0 0; font-size: 14px;">צעירים למען עתיד ישראל</p>
      </div>

      <div style="background: #faf7f2; padding: 30px; border: 1px solid #e8e4de; border-top: none; border-radius: 0 0 16px 16px;">
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-size: 20px;">
          ${isWaitlist ? "נרשמת לרשימת ההמתנה" : "ההרשמה אושרה!"}
        </h2>

        <p style="color: #4a4a4a; line-height: 1.6; margin: 0 0 20px;">
          שלום ${participantName},<br>
          ${isWaitlist
            ? `נרשמת בהצלחה לרשימת ההמתנה לאירוע <strong>${eventTitle}</strong>. נעדכן אותך אם יתפנה מקום.`
            : `ההרשמה שלך לאירוע <strong>${eventTitle}</strong> אושרה בהצלחה!`
          }
        </p>

        <div style="background: white; border: 1px solid #e8e4de; border-radius: 12px; padding: 20px; margin: 0 0 20px;">
          <p style="margin: 0 0 8px; color: #7a7a7a; font-size: 13px;">פרטי האירוע</p>
          <p style="margin: 0 0 4px; color: #1e3a5f; font-weight: 600;">${eventTitle}</p>
          <p style="margin: 0 0 4px; color: #4a4a4a; font-size: 14px;">📅 ${formattedDate}</p>
          ${eventLocation ? `<p style="margin: 0; color: #4a4a4a; font-size: 14px;">📍 ${eventLocation}</p>` : ""}
        </div>

        <p style="color: #7a7a7a; font-size: 13px; margin: 0; text-align: center;">
          תקוותנו - צעירים למען עתיד ישראל
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "תקוותנו <noreply@tikvatenu.com>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send registration email:", error);
  }
}
