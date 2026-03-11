"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import type { JoinSubmission, ContactSubmission } from "@/lib/types/database";

type Props = {
  joinSubmissions: JoinSubmission[];
  contactSubmissions: ContactSubmission[];
  isHebrew: boolean;
};

export function SubmissionsView({ joinSubmissions, contactSubmissions, isHebrew }: Props) {
  const [activeTab, setActiveTab] = useState<"join" | "contact">("join");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const unreadJoin = joinSubmissions.filter((s) => !s.is_read).length;
  const unreadContact = contactSubmissions.filter((s) => !s.is_read).length;

  const filteredJoin = joinSubmissions.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredContact = contactSubmissions.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  async function toggleReadStatus(table: "join_submissions" | "contact_submissions", id: string, currentStatus: boolean) {
    const supabase = createClient();
    await supabase
      .from(table)
      .update({ is_read: !currentStatus })
      .eq("id", id);
    router.refresh();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-branch/10">
          <p className="text-sm text-ink-muted">{isHebrew ? "הצטרפות" : "Join"}</p>
          <p className="text-2xl font-bold text-navy">{joinSubmissions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-branch/10">
          <p className="text-sm text-ink-muted">{isHebrew ? "לא נקראו" : "Unread"}</p>
          <p className="text-2xl font-bold text-terracotta">{unreadJoin}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-branch/10">
          <p className="text-sm text-ink-muted">{isHebrew ? "יצירת קשר" : "Contact"}</p>
          <p className="text-2xl font-bold text-navy">{contactSubmissions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-branch/10">
          <p className="text-sm text-ink-muted">{isHebrew ? "לא נקראו" : "Unread"}</p>
          <p className="text-2xl font-bold text-terracotta">{unreadContact}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-dark rounded-lg p-1">
        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "join"
              ? "bg-white text-navy shadow-sm"
              : "text-ink-muted hover:text-navy"
          }`}
        >
          {isHebrew ? "הצטרפות" : "Join Requests"}
          {unreadJoin > 0 && (
            <span className="ms-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-terracotta text-white text-xs">
              {unreadJoin}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "contact"
              ? "bg-white text-navy shadow-sm"
              : "text-ink-muted hover:text-navy"
          }`}
        >
          {isHebrew ? "יצירת קשר" : "Contact Messages"}
          {unreadContact > 0 && (
            <span className="ms-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-terracotta text-white text-xs">
              {unreadContact}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isHebrew ? "חיפוש לפי שם או אימייל..." : "Search by name or email..."}
          className="w-full ps-10 pe-4 py-2.5 rounded-lg border border-branch/20 bg-white text-sm outline-none focus:border-branch focus:ring-1 focus:ring-branch transition-colors"
        />
      </div>

      {/* Join Submissions Table */}
      {activeTab === "join" && (
        <div className="bg-white rounded-xl border border-branch/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-branch/10">
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "סטטוס" : "Status"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "שם" : "Name"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "אימייל" : "Email"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "טלפון" : "Phone"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "תחומי עניין" : "Interests"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "תאריך" : "Date"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-branch/5">
                {filteredJoin.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                      {isHebrew ? "אין פניות הצטרפות" : "No join submissions"}
                    </td>
                  </tr>
                ) : (
                  filteredJoin.map((sub) => (
                    <tr key={sub.id} className={`${!sub.is_read ? "bg-terracotta/5" : ""} hover:bg-cream-dark/50 transition-colors`}>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${sub.is_read ? "bg-green" : "bg-terracotta"}`} />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">{sub.full_name}</td>
                      <td className="px-4 py-3 text-ink-light">{sub.email}</td>
                      <td className="px-4 py-3 text-ink-light">{sub.phone || "—"}</td>
                      <td className="px-4 py-3 text-ink-light max-w-[200px] truncate">{sub.interests || "—"}</td>
                      <td className="px-4 py-3 text-ink-muted text-xs">{formatDate(sub.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleReadStatus("join_submissions", sub.id, sub.is_read)}
                          className="text-xs text-branch hover:text-branch-light transition-colors"
                        >
                          {sub.is_read
                            ? (isHebrew ? "סמן כלא נקרא" : "Mark unread")
                            : (isHebrew ? "סמן כנקרא" : "Mark read")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Submissions Table */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-xl border border-branch/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-dark border-b border-branch/10">
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "סטטוס" : "Status"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "שם" : "Name"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "אימייל" : "Email"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "נושא" : "Subject"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "הודעה" : "Message"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted">{isHebrew ? "תאריך" : "Date"}</th>
                  <th className="text-start px-4 py-3 font-medium text-ink-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-branch/5">
                {filteredContact.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                      {isHebrew ? "אין הודעות" : "No contact messages"}
                    </td>
                  </tr>
                ) : (
                  filteredContact.map((sub) => (
                    <tr key={sub.id} className={`${!sub.is_read ? "bg-terracotta/5" : ""} hover:bg-cream-dark/50 transition-colors`}>
                      <td className="px-4 py-3">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${sub.is_read ? "bg-green" : "bg-terracotta"}`} />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">{sub.name}</td>
                      <td className="px-4 py-3 text-ink-light">{sub.email}</td>
                      <td className="px-4 py-3 text-ink-light">{sub.subject || "—"}</td>
                      <td className="px-4 py-3 text-ink-light max-w-[250px] truncate">{sub.message}</td>
                      <td className="px-4 py-3 text-ink-muted text-xs">{formatDate(sub.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleReadStatus("contact_submissions", sub.id, sub.is_read)}
                          className="text-xs text-branch hover:text-branch-light transition-colors"
                        >
                          {sub.is_read
                            ? (isHebrew ? "סמן כלא נקרא" : "Mark unread")
                            : (isHebrew ? "סמן כנקרא" : "Mark read")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
