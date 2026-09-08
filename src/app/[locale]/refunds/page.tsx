import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHebrew = locale === "he";
  return {
    title: isHebrew ? "מדיניות תשלומים והחזרים — תקוותנו" : "Payments & Refunds Policy — Tikvatenu",
  };
}

export default async function RefundsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  if (isHebrew) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-navy mb-2 font-['Secular_One']">מדיניות תשלומים והחזרים</h1>
        <p className="text-sm text-ink-muted mb-10">עדכון אחרון: 8 בספטמבר 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-3">1. אתר מידע ללא תשלום</h2>
            <p>אתר תקוותנו הוא אתר מידע חינמי. השימוש באתר, קריאת התכנים, ההרשמה לעדכונים והשתתפות במפגשים מקוונים הינם ללא תשלום.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">2. תשלום עבור אירועים</h2>
            <p>אירועים פיזיים מסוימים של תקוותנו עשויים להיות כרוכים בתשלום (למשל לכיסוי עלות מקום, ארוחות, או חומרי לימוד). כאשר ישנו תשלום הכרחי:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li>האתר יפנה אתכם לקישור חיצוני למערכת תשלום כגון <strong>ביט (Bit)</strong> או <strong>PayBox</strong>.</li>
              <li>תקוותנו אינה מעבדת את פרטי התשלום שלכם ישירות. אנו אינו מחזיקים או אוחסנים פרטי כרטיס אשראי.</li>
              <li>העסקה מתבצעת במלואה באמצעות מערכת התשלום החיצונית, ועל הנרשם לעמוד בתנאי השימוש של אותה מערכת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">3. מדיניות החזרים</h2>
            <p>מכיוון שתקוותנו אינה מעבדת תשלומים ישירות, אנו אינו מסוגלים להחזיר תשלום דרך האתר.</p>
            <p className="mt-3"><strong>אם ביצעתם תשלום עבור אירוע ורוצים החזר:</strong></p>
            <ul className="list-disc list-inside space-y-1.5 mt-3">
              <li>החזרים מתבצעים באמצעות מערכת התשלום עצמה (ביט / PayBox) או מול מארגן האירוע, בהתאם לנסיבות.</li>
              <li>במקרה של ביטול אירוע מטעמנו, נעדכן אתכם באמצעות דוא"ל ונסייע בתיאום החזר.</li>
              <li>במקרה של ביטול השתתפות מצד המשתתף, יש לפנות לכתובת <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a> לפחות <strong>48 שעות לפני מועד האירוע</strong>. נבחן כל מקרה לגופו ונסייע בתיאום עם מערכת התשלום או מארגן האירוע.</li>
            </ul>
            <p className="mt-3">אין החזרים אוטומטיים. כל החלטה תילקח בשיקול דעת ובהתחשב בעלויות האירוע שכבר הוצאו.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">4. חשבוניות ושאלות חיוב</h2>
            <p>לשאלות בנוגע לחיוב ספציפי, לבקשת חשבונית, או לכל בעיה טכנית הקשורה לתשלום — אנא פנו אלינו בכתובת: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
            <p className="mt-3">אנו נעשה את המיטב לסייע, אך אנו כפופים למגבלות מערכות התשלום החיצוניות.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">5. אחריות</h2>
            <p>תקוותנו אינה אחראית לבעיות טכניות, שגיאות חיוב, או עיכובים שמקורם במערכות תשלום צד שלישי. אנו נפעל בשקיפות וביושר לסייע במידת האפשר, אך אין לנו שליטה מלאה על תהליכים חיצוניים.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">6. שינויים במדיניות זו</h2>
            <p>אנו רשאים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר עם ציון תאריך העדכון האחרון בראש הדף.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">7. יצירת קשר</h2>
            <p>לכל שאלה בנוגע לתשלומים, החזרים או חיובים, צרו קשר: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-navy mb-2 font-[family-name:var(--font-playfair)]">Payments & Refunds Policy</h1>
      <p className="text-sm text-ink-muted mb-10">Last updated: September 8, 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-3">1. Free Informational Site</h2>
          <p>The Tikvatenu website is a free informational site. Using the site, reading content, registering for updates, and participating in online gatherings are provided at no cost.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">2. Payment for Events</h2>
          <p>Certain physical events hosted by Tikvatenu may involve a fee (for example, to cover venue costs, meals, or learning materials). When payment is required:</p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li>The website will direct you to an external payment link such as <strong>Bit</strong> or <strong>PayBox</strong>.</li>
            <li>Tikvatenu does not process your payment details directly. We do not store or handle credit card information.</li>
            <li>The transaction is conducted entirely through the external payment system, and the registrant must comply with the terms of that system.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">3. Refund Policy</h2>
          <p>Because Tikvatenu does not process payments directly, we are unable to issue refunds through the website.</p>
          <p className="mt-3"><strong>If you made a payment for an event and would like a refund:</strong></p>
          <ul className="list-disc list-inside space-y-1.5 mt-3">
            <li>Refunds are processed through the payment system itself (Bit / PayBox) or with the event organizer, depending on the circumstances.</li>
            <li>In the event of cancellation by us, we will notify you by email and assist in coordinating a refund.</li>
            <li>In the event of cancellation by the participant, please contact <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a> at least <strong>48 hours before the event date</strong>. We will review each case individually and assist in coordinating with the payment system or event organizer.</li>
          </ul>
          <p className="mt-3">There are no automatic refunds. Each decision will be made at our discretion and taking into account event costs already incurred.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">4. Invoices and Billing Questions</h2>
          <p>For questions regarding a specific charge, to request an invoice, or for any technical issue related to payment — please contact us at: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          <p className="mt-3">We will do our best to assist, but we are subject to the limitations of external payment systems.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">5. Liability</h2>
          <p>Tikvatenu is not responsible for technical issues, billing errors, or delays originating from third-party payment systems. We will act transparently and in good faith to assist where possible, but we do not have full control over external processes.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">6. Changes to This Policy</h2>
          <p>We may update this policy from time to time. Material changes will be published on the site with the date of the last update noted at the top of the page.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">7. Contact</h2>
          <p>For any questions regarding payments, refunds, or billing, please contact: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
        </section>
      </div>
    </div>
  );
}
