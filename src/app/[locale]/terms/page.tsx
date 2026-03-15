import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHebrew = locale === "he";
  return {
    title: isHebrew ? "תקנון תנאי שימוש — תקוותנו" : "Terms of Service — Tikvatenu",
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  if (isHebrew) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-navy mb-2 font-['Secular_One']">תקנון תנאי שימוש</h1>
        <p className="text-sm text-ink-muted mb-10">עדכון אחרון: מרץ 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-3">1. כללי</h2>
            <p>ברוכים הבאים לאתר תקוותנו (<strong>tikvatenu.com</strong>). השימוש באתר מהווה הסכמה לתנאי השימוש המפורטים להלן. הגוף המפעיל את האתר הוא יוזמת "תקוותנו" (להלן: "תקוותנו" או "אנחנו").</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">2. השימוש באתר</h2>
            <p>האתר מיועד לצורך מידע, הרשמה לאירועים ויצירת קשר עם יוזמת תקוותנו. אין להשתמש באתר לכל מטרה בלתי חוקית, פוגענית או שעלולה לגרום נזק לתקוותנו, למשתמשים אחרים או לכל צד שלישי.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">3. קניין רוחני</h2>
            <p>כל התכנים המופיעים באתר — לרבות טקסטים, תמונות, עיצוב ולוגו — הם רכושה של תקוותנו ומוגנים בזכויות יוצרים. אין להעתיק, לשכפל, להפיץ או לעשות שימוש מסחרי בתכנים אלה ללא אישור מפורש בכתב מאיתנו.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">4. הרשמה לאירועים</h2>
            <p>ההרשמה לאירועים מחייבת מסירת פרטים אישיים מדויקים. תקוותנו שומרת לעצמה את הזכות לבטל הרשמה בכל עת ומכל סיבה שהיא, לרבות אם נמצא שהמידע שנמסר אינו מדויק.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">5. אחריות</h2>
            <p>תקוותנו פועלת במיטב יכולתה לספק מידע עדכון ומדויק, אך אינה אחראית לנזקים ישירים או עקיפים הנובעים מהשימוש באתר או מהסתמכות על המידע המופיע בו.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">6. שינויים בתקנון</h2>
            <p>תקוותנו רשאית לשנות את תנאי השימוש בכל עת. שינויים מהותיים יפורסמו באתר. המשך השימוש באתר לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-3">7. יצירת קשר</h2>
            <p>לכל שאלה בנוגע לתקנון זה, ניתן לפנות אלינו בכתובת: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-navy mb-2 font-[family-name:var(--font-playfair)]">Terms of Service</h1>
      <p className="text-sm text-ink-muted mb-10">Last updated: March 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-ink leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-3">1. General</h2>
          <p>Welcome to Tikvatenu (<strong>tikvatenu.com</strong>). By using this website, you agree to the terms of service described herein. The website is operated by the Tikvatenu initiative (hereinafter: "Tikvatenu" or "we").</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">2. Use of the Website</h2>
          <p>This website is intended for informational purposes, event registration, and contact with the Tikvatenu initiative. You may not use the website for any unlawful, harmful, or damaging purpose towards Tikvatenu, other users, or any third party.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">3. Intellectual Property</h2>
          <p>All content on this website — including texts, images, design, and logo — is the property of Tikvatenu and is protected by copyright. You may not copy, reproduce, distribute, or make commercial use of this content without our explicit written permission.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">4. Event Registration</h2>
          <p>Registering for events requires providing accurate personal information. Tikvatenu reserves the right to cancel any registration at any time and for any reason, including if the provided information is found to be inaccurate.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">5. Liability</h2>
          <p>Tikvatenu strives to provide accurate and up-to-date information, but is not liable for direct or indirect damages arising from the use of this website or reliance on the information contained herein.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">6. Changes to Terms</h2>
          <p>Tikvatenu may modify these terms of service at any time. Material changes will be published on the website. Continued use of the website after changes are published constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-3">7. Contact</h2>
          <p>For any questions regarding these terms, please contact us at: <a href="mailto:info@tikvatenu.com" className="text-terracotta underline">info@tikvatenu.com</a></p>
        </section>
      </div>
    </div>
  );
}
