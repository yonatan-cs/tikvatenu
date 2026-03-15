import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = "info@tikvatenu.com";
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
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
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
