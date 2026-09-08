import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHebrew = locale === "he";
  return {
    title: isHebrew ? "מדיניות עוגיות — תקוותנו" : "Cookie Policy — Tikvatenu",
  };
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  if (isHebrew) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-navy mb-2 font-['Secular_One']">מדיניות עוגיות</h1>
        <p className="text-sm text-ink-muted mb-10">עדכון אחרון: 8 בספטמבר 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-3">מהן עוגיות?</h2>
            <p>עוגיות (Cookies) הן קבצי טקסט קטנים המאוחסנים במכשיר שלכם כאשר אתם מבקרים באתר אינטרנט. הן עוזרות לאתר לזכור פרטים אודות הביקור שלכם, כגון העדפות או מצב התחברות.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">אילו עוגיות משתמש האתר?</h2>
            
            <h3 className="text-lg font-semibold text-navy mb-2 mt-5">עוגיות הכרחיות</h3>
            <p className="mb-2">עוגיות אלה נדרשות לתפקוד בסיסי של האתר. הן אינן דורשות הסכמה מפורשת.</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li><strong>Supabase Auth Cookies:</strong> משמשות לניהול הזדהות משתמש והפעלת מנהל אדמין. ללא עוגיות אלו, המערכת אינה יכולה לזהות מי מחובר.</li>
            </ul>

            <h3 className="text-lg font-semibold text-navy mb-2 mt-5">עוגיות אנליטיקה (לא הכרחיות)</h3>
            <p className="mb-2">עוגיות אלו עוזרות לנו להבין כיצד משתמשים מקיימים אינטראקציה עם האתר, אך אינן הכרחיות לתפעול האתר.</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li><strong>Vercel Analytics:</strong> משמש לאיסוף נתוני שימוש בסיסיים כמו דפים שנצפו ומקור התנועה, ללא איסוף נתונים מזהים אישיים. המידע משמש אך ורק לשיפור חוויית המשתמש.</li>
            </ul>

            <h3 className="text-lg font-semibold text-navy mb-2 mt-5">כלי ניטור שגיאות (לא הכרחיות)</h3>
            <p className="mb-2">כלים אלו עוזרים לנו לזהות תקלות טכניות ולשפר את יציבות האתר.</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li><strong>Sentry:</strong> משמש למעקב אחר שגיאות טכניות באתר. אנו אוספים מידע אודות תקלות (מסך דפדפן, הודעות שגיאה) ללא שליחת מידע מזהה אישי ברירת מחדל. אנו אוספים Session Replay (צילום אינטראקציה עם האתר) רק לאחר קבלת הסכמתכם, במדגם של 10% מהפעלות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">עוגיות שלא משתמשים בהן</h2>
            <p>אתר זה אינו משתמש בעוגיות פרסומיות, עוגיות מעקב צד שלישי למטרות שיווק, או בכל כלי שיווק חיצוני כגון Google AdMob.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">ניהול הסכמה</h2>
            <p>כאשר אתם מבקרים באתר לראשונה, תופיע בפניכם הודעת הסכמה לעוגיות. באפשרותכם לבחור:</p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li><strong>לקבל עוגיות לא הכרחיות</strong> — תאפשר ל-Vercel Analytics ול-Sentry Session Replay לפעול.</li>
              <li><strong>לדחות עוגיות לא הכרחיות</strong> — רק עוגיות הכרחיות (Supabase Auth) תפעלנה.</li>
            </ul>
            <p className="mt-3">ההעדפה שלכם תישמר במכשירכם. תוכלו לשנות החלטה זו בכל עת דרך ההגדרות בכפתור הנגישות באתר.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">פרטי המפעיל</h2>
            <p>אתר זה מופעל על ידי יוזמת תקוותנו.</p>
            <p className="mt-2"><strong>יצירת קשר:</strong> <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">שינויים במדיניות זו</h2>
            <p>אנו רשאים לעדכן מדיניות עוגיות זו מעת לעת. שינויים מהותיים יפורסמו באתר עם ציון מועד העדכון האחרון בראש הדף.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">פרטים נוספים</h2>
            <p>למידע מלא אודות האופן שבו אנו מטפלים במידע אישי שלכם, אנא קראו את <a href="/he/privacy" className="text-terracotta underline">מדיניות הפרטיות</a> שלנו.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-navy mb-2 font-[family-name:var(--font-playfair)]">Cookie Policy</h1>
      <p className="text-sm text-ink-muted mb-10">Last updated: September 8, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-3">What are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the website remember details about your visit, such as preferences or login status.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Which Cookies Does This Site Use?</h2>
          
          <h3 className="text-lg font-semibold text-navy mb-2 mt-5">Essential Cookies</h3>
          <p className="mb-2">These cookies are necessary for the basic functionality of the site. They do not require explicit consent.</p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li><strong>Supabase Auth Cookies:</strong> Used for user authentication and admin session management. Without these cookies, the system cannot identify who is logged in.</li>
          </ul>

          <h3 className="text-lg font-semibold text-navy mb-2 mt-5">Analytics Cookies (Non-Essential)</h3>
          <p className="mb-2">These cookies help us understand how users interact with the site, but are not essential for the site to function.</p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li><strong>Vercel Analytics:</strong> Used to collect basic usage data such as page views and traffic sources, without collecting personally identifiable information. The data is used solely to improve user experience.</li>
          </ul>

          <h3 className="text-lg font-semibold text-navy mb-2 mt-5">Error Monitoring Tools (Non-Essential)</h3>
          <p className="mb-2">These tools help us identify technical issues and improve the stability of the site.</p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li><strong>Sentry:</strong> Used to track technical errors on the site. We collect information about errors (browser screen, error messages) without sending personally identifiable information by default. We collect Session Replay (recording of interaction with the site) only after obtaining your consent, in a sample of 10% of sessions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Cookies We Do Not Use</h2>
          <p>This site does not use advertising cookies, third-party tracking cookies for marketing purposes, or any external marketing tools such as Google AdMob.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Consent Management</h2>
          <p>When you first visit the site, a cookie consent notice will appear. You can choose:</p>
          <ul className="list-disc list-inside space-y-1 mt-3">
            <li><strong>Accept non-essential cookies</strong> — This enables Vercel Analytics and Sentry Session Replay.</li>
            <li><strong>Decline non-essential cookies</strong> — Only essential cookies (Supabase Auth) will function.</li>
          </ul>
          <p className="mt-3">Your preference will be saved on your device. You can change this decision at any time through the settings in the accessibility menu on the site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Operator Details</h2>
          <p>This site is operated by the Tikvatenu initiative.</p>
          <p className="mt-2"><strong>Contact:</strong> <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Changes to This Policy</h2>
          <p>We may update this cookie policy from time to time. Material changes will be published on the site with the date of the last update noted at the top of the page.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">Additional Information</h2>
          <p>For full details on how we handle your personal information, please read our <a href="/en/privacy" className="text-terracotta underline">Privacy Policy</a>.</p>
        </section>
      </div>
    </div>
  );
}
