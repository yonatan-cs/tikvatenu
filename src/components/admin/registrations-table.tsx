"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EventRegistration, RegistrationField } from "@/lib/types/database";

interface RegistrationsTableProps {
  registrations: EventRegistration[];
  customFields: RegistrationField[];
  eventTitle: string;
  isHebrew: boolean;
}

const statusConfig = {
  confirmed: { labelHe: "מאושר", labelEn: "Confirmed", variant: "success" as const },
  waitlist: { labelHe: "המתנה", labelEn: "Waitlist", variant: "warning" as const },
  cancelled: { labelHe: "בוטל", labelEn: "Cancelled", variant: "destructive" as const },
};

export function RegistrationsTable({
  registrations: initialRegistrations,
  customFields,
  eventTitle,
  isHebrew,
}: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = registrations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.includes(q))
    );
  });

  async function updateStatus(regId: string, newStatus: EventRegistration["status"]) {
    const supabase = createClient();
    await supabase
      .from("event_registrations")
      .update({ status: newStatus })
      .eq("id", regId);

    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status: newStatus } : r))
    );
  }

  function exportCSV() {
    const headers = [
      isHebrew ? "שם מלא" : "Full Name",
      isHebrew ? "אימייל" : "Email",
      isHebrew ? "טלפון" : "Phone",
      isHebrew ? "סטטוס" : "Status",
      isHebrew ? "תאריך הרשמה" : "Registration Date",
      ...customFields.map((f) => (isHebrew ? f.label_he : f.label_en)),
    ];

    const rows = registrations.map((r) => [
      r.full_name,
      r.email,
      r.phone || "",
      statusConfig[r.status][isHebrew ? "labelHe" : "labelEn"],
      new Date(r.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US"),
      ...customFields.map((f) => r.custom_fields?.[f.id]?.toString() || ""),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventTitle}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl border border-branch/5 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-branch/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHebrew ? "חיפוש..." : "Search..."}
            className="ps-9 h-9"
          />
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4" />
          {isHebrew ? "ייצוא CSV" : "Export CSV"}
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-ink-muted">
          {isHebrew ? "אין נרשמים עדיין" : "No registrations yet"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-branch/5 bg-cream/50">
                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                  {isHebrew ? "שם" : "Name"}
                </th>
                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                  {isHebrew ? "אימייל" : "Email"}
                </th>
                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                  {isHebrew ? "טלפון" : "Phone"}
                </th>
                {customFields.map((f) => (
                  <th key={f.id} className="text-start px-4 py-3 font-medium text-ink-muted">
                    {isHebrew ? f.label_he : f.label_en}
                  </th>
                ))}
                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                  {isHebrew ? "סטטוס" : "Status"}
                </th>
                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                  {isHebrew ? "תאריך" : "Date"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-b border-branch/3 hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-navy">{reg.full_name}</td>
                  <td className="px-4 py-3 text-ink-light" dir="ltr">{reg.email}</td>
                  <td className="px-4 py-3 text-ink-light" dir="ltr">{reg.phone || "—"}</td>
                  {customFields.map((f) => (
                    <td key={f.id} className="px-4 py-3 text-ink-light">
                      {reg.custom_fields?.[f.id]?.toString() || "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <Select
                      value={reg.status}
                      onValueChange={(val) => updateStatus(reg.id, val as EventRegistration["status"])}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent p-0">
                        <Badge variant={statusConfig[reg.status].variant}>
                          {statusConfig[reg.status][isHebrew ? "labelHe" : "labelEn"]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">{isHebrew ? "מאושר" : "Confirmed"}</SelectItem>
                        <SelectItem value="waitlist">{isHebrew ? "המתנה" : "Waitlist"}</SelectItem>
                        <SelectItem value="cancelled">{isHebrew ? "בוטל" : "Cancelled"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">
                    {new Date(reg.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
