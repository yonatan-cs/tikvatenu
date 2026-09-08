import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHebrew = locale === "he";
  return {
    title: isHebrew ? "מדיניות פרטיות — תקוותנו" : "Privacy Policy — Tikvatenu",
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  if (isHebrew) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-navy mb-2 font-['Secular_One']">מדיניות פרטיות</h1>
        <p className="text-sm text-ink-muted mb-10">עדכון אחרון: 8 בספטמבר 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-3">1. איזה מידע אנחנו אוספים?</h2>
            <p>אנחנו אוספים את הפרטים שאתם מסרים לנו ישירות דרך טפסי האתר: שם מלא, כתובת אימייל, מספר טלפון (אופציונלי), ומידע שבחרתם לשתף כגון תחומי עניין. בנוסף, האתר עשוי לאסוף נתוני שימוש בסיסיים לצורך שיפור השירות (ראו סעיף 6 להלן).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">2. למה אנחנו משתמשים במידע?</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>לניהול הרשמות לאירועים ושליחת אישורים</li>
              <li>ליצירת קשר חוזר בנוגע לפניות שנשלחו</li>
              <li>לשליחת עדכונים על פעילות תקוותנו (בהסכמה בלבד)</li>
              <li>לשיפור חוויית השימוש באתר</li>
              <li>לזיהוי ותיקון שגיאות טכניות באתר</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">3. האם מידע משותף עם צדדים שלישיים?</h2>
            <p>אנחנו לא מוכרים, משכירים או מעבירים את המידע האישי שלכם לצדדים שלישיים לצורכי שיווק. המידע עשוי להיות מועבר לספקי שירות שאנו עובדים איתם אך ורק לצורך מתן השירות לכם:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li><strong>Supabase:</strong> אחסון מאובטח של נתוני המשתמשים והאותנטיקציה (הזדהות משתמשים מנהלים).</li>
              <li><strong>Vercel:</strong> אירוח האתר ואנליטיקה בסיסית (רק לאחר הסכמתכם לעוגיות לא הכרחיות).</li>
              <li><strong>Sentry:</strong> ניטור שגיאות טכניות לשיפור יציבות האתר. אנו לא שולחים מידע מזהה אישי במצב ברירת המחדל. Session Replay (הקלטת פעילות באתר) מופעלת רק לאחר הסכמתכם.</li>
              <li><strong>Resend:</strong> שליחת דוא"ל (אישורי הרשמה, הודעות מערכת).</li>
            </ul>
            <p className="mt-3">ספקים אלו מחויבים להגן על המידע שלכם ולהשתמש בו אך ורק לצורך מתן השירות.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">4. אחסון המידע</h2>
            <p>המידע מאוחסן בשרתים מאובטחים באמצעות Supabase. אנחנו נוקטים אמצעי אבטחה סבירים להגנה על המידע האישי שלכם מפני גישה בלתי מורשית, שינוי, חשיפה, או מחיקה.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">5. הזכויות שלכם</h2>
            <p>יש לכם את הזכות לעיין במידע שאנחנו מחזיקים עליכם, לתקנו, או לבקש את מחיקתו. לפנייה בנושא זה, שלחו אימייל ל-<a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">6. עוגיות (Cookies) ואנליטיקה</h2>
            <p>האתר משתמש בעוגיות הכרחיות לתפקוד תקין (כגון ניהול הפעלת משתמש), ובעוגיות לא הכרחיות לאנליטיקה וניטור שגיאות. אין שימוש בעוגיות פרסומיות או כלי שיווק צד שלישי.</p>
            <p className="mt-3">לפרטים מלאים על השימוש בעוגיות, לרבות אילו עוגיות משתמשות, כיצד לנהל הסכמה, ואילו כלים משולבים באתר, אנא קראו את <a href="/he/cookies" className="text-terracotta underline font-medium">מדיניות העוגיות</a> שלנו.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">7. שינויים במדיניות</h2>
            <p>אנחנו רשאים לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים יפורסמו באתר. המשך שימוש באתר לאחר פרסום שינויים מהווה הסכמה למדיניות המעודכנת.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">8. צרו קשר</h2>
            <p>לכל שאלה בנוגע למדיניות פרטיות זו: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-navy mb-2 font-[family-name:var(--font-playfair)]">Privacy Policy</h1>
      <p className="text-sm text-ink-muted mb-10">Last updated: September 8, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-3">1. What Information Do We Collect?</h2>
          <p>We collect information you provide directly through the website forms: full name, email address, phone number (optional), and information you choose to share such as interests. The website may also collect basic usage data to improve the service (see section 6 below).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">2. How Do We Use the Information?</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To manage event registrations and send confirmations</li>
            <li>To follow up on inquiries submitted through the website</li>
            <li>To send updates about Tikvatenu activities (with consent only)</li>
            <li>To improve the website user experience</li>
            <li>To identify and fix technical errors on the site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">3. Is Information Shared with Third Parties?</h2>
          <p>We do not sell, rent, or transfer your personal information to third parties for marketing purposes. Information may be shared with service providers we work with solely for the purpose of providing the service to you:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li><strong>Supabase:</strong> Secure storage of user data and authentication (admin user identification).</li>
            <li><strong>Vercel:</strong> Website hosting and basic analytics (only after your consent to non-essential cookies).</li>
            <li><strong>Sentry:</strong> Technical error monitoring to improve site stability. We do not send personally identifiable information by default. Session Replay (recording of site activity) is enabled only after your consent.</li>
            <li><strong>Resend:</strong> Email delivery (registration confirmations, system messages).</li>
          </ul>
          <p className="mt-3">These providers are committed to protecting your information and using it solely for the purpose of providing the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">4. Data Storage</h2>
          <p>Information is stored on secure servers using Supabase. We take reasonable security measures to protect your personal information from unauthorized access, modification, disclosure, or deletion.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or request deletion of the information we hold about you. To make such a request, email us at <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">6. Cookies and Analytics</h2>
          <p>The site uses essential cookies for proper functionality (such as session management), and non-essential cookies for analytics and error monitoring. No advertising cookies or third-party marketing tools are used.</p>
          <p className="mt-3">For full details on cookie use, including which cookies are used, how to manage consent, and which tools are integrated into the site, please read our <a href="/en/cookies" className="text-terracotta underline font-medium">Cookie Policy</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">7. Policy Changes</h2>
          <p>We may update this privacy policy from time to time. Material changes will be published on the website. Continued use of the website after changes are published constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">8. Contact</h2>
          <p>For any questions about this privacy policy: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
        </section>
      </div>
    </div>
  );
}
