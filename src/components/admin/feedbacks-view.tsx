"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, List, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { ResponseCharts } from "./response-charts";
import type { EventFeedback, RegistrationField } from "@/lib/types/database";

interface FeedbacksViewProps {
  feedbacks: EventFeedback[];
  feedbackFields: RegistrationField[];
  eventTitle: string;
  isHebrew: boolean;
}

export function FeedbacksView({ feedbacks, feedbackFields, eventTitle, isHebrew }: FeedbacksViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "charts">("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = feedbacks.filter((f) =>
    !searchQuery || f.respondent_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function exportCSV() {
    const headers = [
      isHebrew ? "שם" : "Name",
      isHebrew ? "תאריך" : "Date",
      ...feedbackFields.map((f) => (isHebrew ? f.label_he : f.label_en)),
    ];

    const rows = feedbacks.map((f) => [
      f.respondent_name,
      new Date(f.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US"),
      ...feedbackFields.map((field) => {
        const val = f.responses?.[field.id];
        const other = f.responses?.[`${field.id}__other`];
        const main = val !== undefined && val !== null ? String(val) : "";
        return other ? `${main} (${other})` : main;
      }),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const BOM = "﻿";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventTitle}-feedbacks.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-branch/10 p-0.5 bg-white">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              view === "list" ? "bg-navy/5 text-navy" : "text-ink-muted hover:text-navy"
            }`}
          >
            <List className="w-4 h-4" />
            {isHebrew ? "רשימה" : "List"}
          </button>
          <button
            type="button"
            onClick={() => setView("charts")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              view === "charts" ? "bg-navy/5 text-navy" : "text-ink-muted hover:text-navy"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            {isHebrew ? "גרפים" : "Charts"}
          </button>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" disabled={feedbacks.length === 0}>
          <Download className="w-4 h-4" />
          {isHebrew ? "ייצוא CSV" : "Export CSV"}
        </Button>
      </div>

      {view === "charts" ? (
        <ResponseCharts
          responses={feedbacks.map((f) => f.responses)}
          fields={feedbackFields}
          isHebrew={isHebrew}
        />
      ) : (
        <div className="bg-white rounded-xl border border-branch/5 overflow-hidden">
          <div className="p-4 border-b border-branch/5">
            <div className="relative max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHebrew ? "חיפוש לפי שם..." : "Search by name..."}
                className="ps-9 h-9"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              {isHebrew ? "אין משובים עדיין" : "No feedbacks yet"}
            </div>
          ) : (
            <ul className="divide-y divide-branch/5">
              {filtered.map((fb) => {
                const expanded = expandedId === fb.id;
                return (
                  <li key={fb.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : fb.id)}
                      className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-cream/30 transition-colors cursor-pointer text-start"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-navy truncate">{fb.respondent_name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {new Date(fb.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-ink-muted shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                      )}
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 space-y-3 bg-cream/20">
                        {feedbackFields.map((field) => {
                          const val = fb.responses?.[field.id];
                          const other = fb.responses?.[`${field.id}__other`];
                          if (val === undefined || val === null || val === "") return null;
                          return (
                            <div key={field.id}>
                              <p className="text-xs font-semibold text-navy mb-1">
                                {isHebrew ? field.label_he : field.label_en}
                              </p>
                              <p className="text-sm text-ink-light whitespace-pre-wrap">
                                {String(val)}
                                {other ? ` — ${other}` : ""}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
