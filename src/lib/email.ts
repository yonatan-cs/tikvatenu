import { Resend } from "resend";
import { COMMUNITY_LINKS } from "@/lib/constants/community";

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = "tikvatenu.il@gmail.com";
const FROM_ADDRESS = "תקוותנו <noreply@tikvatenu.com>";

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
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send registration email:", error);
  }
}

export async function sendAdminEventNotification({
  participantName,
  participantEmail,
  participantPhone,
  eventTitle,
  status,
}: {
  participantName: string;
  participantEmail: string;
  participantPhone?: string | null;
  eventTitle: string;
  status: "confirmed" | "waitlist";
}) {
  if (!resend) return;

  const statusHe = status === "waitlist" ? "רשימת המתנה" : "מאושר";
  const subject = `הרשמה חדשה: ${eventTitle} — ${participantName}`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a5f;">הרשמה חדשה לאירוע</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #7a7a7a;">אירוע:</td><td style="padding: 8px; font-weight: 600;">${eventTitle}</td></tr>
        <tr><td style="padding: 8px; color: #7a7a7a;">שם:</td><td style="padding: 8px;">${participantName}</td></tr>
        <tr><td style="padding: 8px; color: #7a7a7a;">אימייל:</td><td style="padding: 8px;">${participantEmail}</td></tr>
        ${participantPhone ? `<tr><td style="padding: 8px; color: #7a7a7a;">טלפון:</td><td style="padding: 8px;">${participantPhone}</td></tr>` : ""}
        <tr><td style="padding: 8px; color: #7a7a7a;">סטטוס:</td><td style="padding: 8px; font-weight: 600;">${statusHe}</td></tr>
      </table>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: ADMIN_EMAIL, subject, html });
  } catch (error) {
    console.error("Failed to send admin event notification:", error);
  }
}

export async function sendJoinConfirmationEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  if (!resend) return;

  const subject = "תודה שהצטרפת לתקוותנו!";
  const html = `
    <div dir="rtl" style="font-family: 'Heebo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2a4d7a); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #f0ede8; margin: 0; font-size: 24px;">תקוותנו</h1>
        <p style="color: #f0ede8; opacity: 0.7; margin: 8px 0 0; font-size: 14px;">צעירים למען עתיד ישראל</p>
      </div>
      <div style="background: #faf7f2; padding: 30px; border: 1px solid #e8e4de; border-top: none; border-radius: 0 0 16px 16px;">
        <h2 style="color: #1e3a5f; margin: 0 0 16px;">ברוך הבא לקהילה!</h2>
        <p style="color: #4a4a4a; line-height: 1.6;">
          שלום ${name},<br><br>
          קיבלנו את פנייתך והצטרפותך לקהילת תקוותנו. ניצור איתך קשר בהקדם.
        </p>
        <p style="color: #7a7a7a; font-size: 13px; margin-top: 24px; text-align: center;">
          תקוותנו - צעירים למען עתיד ישראל
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, replyTo: ADMIN_EMAIL, to, subject, html });
  } catch (error) {
    console.error("Failed to send join confirmation email:", error);
  }
}

export async function sendAdminJoinNotification({
  name,
  email,
  phone,
  interests,
  howHeard,
  message,
}: {
  name: string;
  email: string;
  phone?: string | null;
  interests?: string | null;
  howHeard?: string | null;
  message?: string | null;
}) {
  if (!resend) return;

  const subject = `הצטרפות חדשה לקהילה — ${name}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a5f;">הצטרפות חדשה לקהילה</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #7a7a7a;">שם:</td><td style="padding: 8px; font-weight: 600;">${name}</td></tr>
        <tr><td style="padding: 8px; color: #7a7a7a;">אימייל:</td><td style="padding: 8px;">${email}</td></tr>
        ${phone ? `<tr><td style="padding: 8px; color: #7a7a7a;">טלפון:</td><td style="padding: 8px;">${phone}</td></tr>` : ""}
        ${interests ? `<tr><td style="padding: 8px; color: #7a7a7a;">תחומי עניין:</td><td style="padding: 8px;">${interests}</td></tr>` : ""}
        ${howHeard ? `<tr><td style="padding: 8px; color: #7a7a7a;">איך שמעו:</td><td style="padding: 8px;">${howHeard}</td></tr>` : ""}
        ${message ? `<tr><td style="padding: 8px; color: #7a7a7a;">הודעה:</td><td style="padding: 8px;">${message}</td></tr>` : ""}
      </table>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: ADMIN_EMAIL, subject, html });
  } catch (error) {
    console.error("Failed to send admin join notification:", error);
  }
}

interface FeedbackEmailParams {
  to: string;
  participantName: string;
  eventTitle: string;
  feedbackUrl: string;
  customIntro: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendFeedbackEmail({
  to,
  participantName,
  eventTitle,
  feedbackUrl,
  customIntro,
}: FeedbackEmailParams) {
  if (!resend) {
    console.log("Resend not configured, skipping feedback email to:", to);
    return { ok: false, error: "Resend not configured" };
  }

  const subject = `נשמח לשמוע ממך - ${eventTitle}`;
  const introBlock = customIntro && customIntro.trim()
    ? `<div style="background: white; border: 1px solid #e8e4de; border-radius: 12px; padding: 16px 20px; margin: 0 0 20px; color: #4a4a4a; line-height: 1.7; white-space: pre-line;">${escapeHtml(customIntro)}</div>`
    : "";

  const html = `
    <div dir="rtl" style="font-family: 'Heebo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2a4d7a); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #f0ede8; margin: 0; font-size: 24px;">תקוותנו</h1>
        <p style="color: #f0ede8; opacity: 0.7; margin: 8px 0 0; font-size: 14px;">צעירים למען עתיד ישראל</p>
      </div>

      <div style="background: #faf7f2; padding: 30px; border: 1px solid #e8e4de; border-top: none; border-radius: 0 0 16px 16px;">
        <h2 style="color: #1e3a5f; margin: 0 0 16px; font-size: 20px;">נשמח לקבל את המשוב שלך</h2>

        <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 16px;">
          שלום ${escapeHtml(participantName)},<br>
          תודה שהשתתפת ב-<strong>${escapeHtml(eventTitle)}</strong>!
        </p>

        ${introBlock}

        <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 24px;">
          המשוב שלך חשוב לנו - הוא עוזר לנו ללמוד, להשתפר ולגדול. ניקח כמה דקות?
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${feedbackUrl}" style="display: inline-block; background: #c97b5b; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
            למילוי המשוב
          </a>
        </div>

        <p style="color: #7a7a7a; font-size: 12px; margin: 16px 0 0; text-align: center; word-break: break-all;">
          או העתיקו את הקישור: <br>
          <a href="${feedbackUrl}" style="color: #c97b5b;">${feedbackUrl}</a>
        </p>

        <div style="margin: 36px 0 0; padding: 24px 0 0; border-top: 1px solid #e8e4de;">
          <h3 style="color: #1e3a5f; font-weight: 600; margin: 0 0 10px; font-size: 17px; text-align: center;">
            הישארו מעודכנים!
          </h3>
          <p style="color: #4a4a4a; font-size: 14px; line-height: 1.7; margin: 0 0 20px; text-align: center;">
            הצטרפו לקבוצת ה-WhatsApp שלנו לעדכונים על אירועים מתוכננים וכל מה שקורה,<br>ועקבו אחרינו באינסטגרם 💞🤩
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="padding: 0 6px;">
                <a href="${COMMUNITY_LINKS.whatsappGroup}" style="display: inline-block; background: #25D366; color: white; padding: 11px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; white-space: nowrap;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style="vertical-align: -3px; margin-left: 6px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg><span style="vertical-align: middle;">וואצאפ</span>
                </a>
              </td>
              <td style="padding: 0 6px;">
                <a href="${COMMUNITY_LINKS.instagram}" style="display: inline-block; background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%); color: white; padding: 11px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; white-space: nowrap;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style="vertical-align: -3px; margin-left: 6px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span style="vertical-align: middle;">אינסטגרם</span>
                </a>
              </td>
            </tr>
          </table>
        </div>

      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({ from: FROM_ADDRESS, replyTo: ADMIN_EMAIL, to, subject, html });
    if (result.error) {
      console.error("Failed to send feedback email:", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function sendAdminContactNotification({
  name,
  email,
  subject: msgSubject,
  message,
}: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  if (!resend) return;

  const subject = `הודעת צור קשר מ-${name}${msgSubject ? `: ${msgSubject}` : ""}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a5f;">הודעת צור קשר חדשה</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; color: #7a7a7a;">שם:</td><td style="padding: 8px; font-weight: 600;">${name}</td></tr>
        <tr><td style="padding: 8px; color: #7a7a7a;">אימייל:</td><td style="padding: 8px;">${email}</td></tr>
        ${msgSubject ? `<tr><td style="padding: 8px; color: #7a7a7a;">נושא:</td><td style="padding: 8px;">${msgSubject}</td></tr>` : ""}
        <tr><td style="padding: 8px; color: #7a7a7a; vertical-align: top;">הודעה:</td><td style="padding: 8px;">${message.replace(/\n/g, "<br>")}</td></tr>
      </table>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: ADMIN_EMAIL, subject, html });
  } catch (error) {
    console.error("Failed to send admin contact notification:", error);
  }
}
