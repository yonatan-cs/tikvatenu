import { Instagram } from "lucide-react";

interface InstagramWidgetProps {
  url: string;
  isHebrew: boolean;
}

export function InstagramWidget({ url, isHebrew }: InstagramWidgetProps) {
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy/[0.03] via-transparent to-terracotta/[0.03] border border-branch/[0.06] p-10 md:p-14 text-center">
      {/* Decorative corner elements */}
      <div className="absolute top-4 start-4 w-8 h-8 border-t border-s border-branch/10 rounded-tl-lg" />
      <div className="absolute bottom-4 end-4 w-8 h-8 border-b border-e border-branch/10 rounded-br-lg" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg shadow-[#fd1d1d]/15">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
            {isHebrew ? "עקבו אחרינו" : "Follow Us"}
          </h2>
        </div>

        <p className="text-ink-muted mb-7 max-w-md mx-auto leading-relaxed">
          {isHebrew
            ? "הישארו מעודכנים עם התכנים והאירועים האחרונים שלנו"
            : "Stay updated with our latest content and events"
          }
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold hover:opacity-90 transition-all duration-300 shadow-md shadow-[#fd1d1d]/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#fd1d1d]/20"
        >
          <Instagram className="w-5 h-5" />
          {isHebrew ? "לאינסטגרם שלנו" : "Visit Our Instagram"}
        </a>
      </div>
    </div>
  );
}
