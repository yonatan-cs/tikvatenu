"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { PieChart as PieIcon, BarChart3 } from "lucide-react";
import type { RegistrationField } from "@/lib/types/database";

const PALETTE = [
  "#1e3a5f", // navy
  "#c97b5b", // terracotta
  "#7a9b7e", // green/branch
  "#d4a574", // sand
  "#6b8e9e", // navy-light
  "#a87555", // brown
  "#94b89a", // mint
  "#e0b88e",
];

interface ResponseChartsProps {
  responses: Array<Record<string, string | number | boolean | undefined>>;
  fields: RegistrationField[];
  isHebrew: boolean;
}

type ChartType = "pie" | "bar";

function aggregateCategorical(responses: ResponseChartsProps["responses"], fieldId: string) {
  const counts = new Map<string, number>();
  for (const r of responses) {
    const raw = r[fieldId];
    if (raw === undefined || raw === null || raw === "") continue;
    const key = String(raw);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
}

function aggregateBoolean(responses: ResponseChartsProps["responses"], fieldId: string, isHebrew: boolean) {
  let yes = 0;
  let no = 0;
  for (const r of responses) {
    const raw = r[fieldId];
    if (raw === true || raw === "true") yes++;
    else no++;
  }
  return [
    { name: isHebrew ? "כן" : "Yes", value: yes },
    { name: isHebrew ? "לא" : "No", value: no },
  ];
}

function aggregateRating(responses: ResponseChartsProps["responses"], fieldId: string) {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const r of responses) {
    const raw = r[fieldId];
    if (raw === undefined || raw === null || raw === "") continue;
    const n = Number(raw);
    if (!isNaN(n) && n >= 1 && n <= 5) {
      counts[Math.round(n)]++;
      total++;
      sum += n;
    }
  }
  const data = [1, 2, 3, 4, 5].map((n) => ({ name: String(n), value: counts[n] }));
  const avg = total > 0 ? sum / total : 0;
  return { data, avg, total };
}

function ChartCard({
  title,
  data,
  chartType,
  onToggleType,
  showToggle = true,
  subtitle,
  isHebrew,
}: {
  title: string;
  data: Array<{ name: string; value: number }>;
  chartType: ChartType;
  onToggleType: () => void;
  showToggle?: boolean;
  subtitle?: string;
  isHebrew: boolean;
}) {
  const totalResponses = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-branch/5 p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-navy line-clamp-2">{title}</h3>
          {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
          <p className="text-xs text-ink-muted mt-0.5">
            {totalResponses} {isHebrew ? "תשובות" : "responses"}
          </p>
        </div>
        {showToggle && (
          <button
            type="button"
            onClick={onToggleType}
            className="shrink-0 p-1.5 rounded-md border border-branch/10 text-ink-muted hover:text-navy hover:bg-cream/50 transition-colors cursor-pointer"
            aria-label={chartType === "pie" ? "Bar" : "Pie"}
          >
            {chartType === "pie" ? <BarChart3 className="w-4 h-4" /> : <PieIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {totalResponses === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-muted">
          {isHebrew ? "אין נתונים" : "No data"}
        </div>
      ) : (
        <div className="h-56" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(entry: { value: number }) => entry.value}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5a5a5a" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5a5a5a" }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: "#1e3a5f" }} />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function ResponseCharts({ responses, fields, isHebrew }: ResponseChartsProps) {
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});

  function toggleType(id: string, currentDefault: ChartType) {
    setChartTypes((prev) => ({
      ...prev,
      [id]: (prev[id] || currentDefault) === "pie" ? "bar" : "pie",
    }));
  }

  const chartable = fields.filter(
    (f) => f.type === "select" || f.type === "checkbox" || f.type === "rating"
  );

  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-branch/5 p-8 text-center text-ink-muted">
        {isHebrew ? "אין תשובות עדיין" : "No responses yet"}
      </div>
    );
  }

  if (chartable.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-branch/5 p-8 text-center text-ink-muted">
        {isHebrew
          ? "אין שדות שאפשר להציג כגרף (רק שדות בחירה, סימון ודירוג מוצגים)"
          : "No chartable fields (select, checkbox, rating only)"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {chartable.map((f) => {
        const title = isHebrew ? f.label_he : f.label_en;
        const defaultType: ChartType = f.type === "rating" ? "bar" : "pie";
        const current = chartTypes[f.id] || defaultType;

        if (f.type === "rating") {
          const { data, avg, total } = aggregateRating(responses, f.id);
          const subtitle = total > 0
            ? (isHebrew ? `ממוצע: ${avg.toFixed(2)}` : `Avg: ${avg.toFixed(2)}`)
            : undefined;
          return (
            <ChartCard
              key={f.id}
              title={title}
              data={data}
              chartType={current}
              onToggleType={() => toggleType(f.id, defaultType)}
              subtitle={subtitle}
              isHebrew={isHebrew}
            />
          );
        }

        const data =
          f.type === "checkbox"
            ? aggregateBoolean(responses, f.id, isHebrew)
            : aggregateCategorical(responses, f.id);

        return (
          <ChartCard
            key={f.id}
            title={title}
            data={data}
            chartType={current}
            onToggleType={() => toggleType(f.id, defaultType)}
            isHebrew={isHebrew}
          />
        );
      })}
    </div>
  );
}
