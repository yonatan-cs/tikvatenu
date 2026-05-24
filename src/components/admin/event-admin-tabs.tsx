"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Users, MessageSquare, Pencil } from "lucide-react";

interface EventAdminTabsProps {
  eventId: string;
  isHebrew: boolean;
}

export function EventAdminTabs({ eventId, isHebrew }: EventAdminTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/admin/events/${eventId}`,
      labelHe: "עריכה",
      labelEn: "Edit",
      icon: Pencil,
      match: (p: string) => p.endsWith(`/admin/events/${eventId}`),
    },
    {
      href: `/admin/events/${eventId}/registrations`,
      labelHe: "נרשמים",
      labelEn: "Registrations",
      icon: Users,
      match: (p: string) => p.includes(`/admin/events/${eventId}/registrations`),
    },
    {
      href: `/admin/events/${eventId}/feedbacks`,
      labelHe: "משובים",
      labelEn: "Feedbacks",
      icon: MessageSquare,
      match: (p: string) => p.includes(`/admin/events/${eventId}/feedbacks`),
    },
  ];

  return (
    <div className="inline-flex rounded-lg border border-branch/10 p-0.5 bg-white mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active ? "bg-navy/5 text-navy" : "text-ink-muted hover:text-navy"
            }`}
          >
            <Icon className="w-4 h-4" />
            {isHebrew ? tab.labelHe : tab.labelEn}
          </Link>
        );
      })}
    </div>
  );
}
