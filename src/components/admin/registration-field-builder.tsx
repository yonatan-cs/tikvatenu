"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { RegistrationField, RegistrationFieldType } from "@/lib/types/database";

interface RegistrationFieldBuilderProps {
  fields: RegistrationField[];
  onChange: (fields: RegistrationField[]) => void;
  isHebrew: boolean;
}

const fieldTypeLabels: Record<RegistrationFieldType, { he: string; en: string }> = {
  text: { he: "טקסט", en: "Text" },
  email: { he: "אימייל", en: "Email" },
  phone: { he: "טלפון", en: "Phone" },
  number: { he: "מספר", en: "Number" },
  select: { he: "בחירה", en: "Select" },
  checkbox: { he: "תיבת סימון", en: "Checkbox" },
};

export function RegistrationFieldBuilder({ fields, onChange, isHebrew }: RegistrationFieldBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function addField() {
    const newField: RegistrationField = {
      id: crypto.randomUUID(),
      label_he: "",
      label_en: "",
      type: "text",
      required: false,
    };
    onChange([...fields, newField]);
    setExpandedId(newField.id);
  }

  function updateField(id: string, updates: Partial<RegistrationField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id));
  }

  function moveField(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange(newFields);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-navy">
          {isHebrew ? "שדות טופס הרשמה" : "Registration Form Fields"}
        </Label>
        <span className="text-xs text-ink-muted">
          {isHebrew ? `${fields.length} שדות` : `${fields.length} fields`}
        </span>
      </div>

      <p className="text-xs text-ink-muted">
        {isHebrew
          ? "שם מלא, אימייל וטלפון הם שדות ברירת מחדל. הוסיפו שדות נוספים לפי הצורך."
          : "Full name, email, and phone are default fields. Add custom fields as needed."}
      </p>

      {/* Default fields preview */}
      <div className="space-y-1.5">
        {[
          { he: "שם מלא", en: "Full Name", type: "text" },
          { he: "אימייל", en: "Email", type: "email" },
          { he: "טלפון", en: "Phone", type: "phone" },
        ].map((df) => (
          <div
            key={df.en}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-navy/3 border border-branch/5 text-sm"
          >
            <GripVertical className="w-4 h-4 text-ink-muted/30" />
            <span className="text-ink-light">{isHebrew ? df.he : df.en}</span>
            <span className="text-xs text-ink-muted ms-auto">
              {fieldTypeLabels[df.type as RegistrationFieldType][isHebrew ? "he" : "en"]}
            </span>
            <span className="text-xs text-terracotta font-medium">
              {isHebrew ? "חובה" : "Required"}
            </span>
          </div>
        ))}
      </div>

      {/* Custom fields */}
      {fields.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-branch/10">
          <p className="text-xs font-medium text-navy/60 uppercase tracking-wider">
            {isHebrew ? "שדות מותאמים" : "Custom Fields"}
          </p>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-branch/10 bg-white overflow-hidden"
            >
              {/* Field header */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-cream-dark/30 transition-colors"
                onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveField(index, "up"); }}
                    disabled={index === 0}
                    className="text-ink-muted/40 hover:text-ink-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveField(index, "down"); }}
                    disabled={index === fields.length - 1}
                    className="text-ink-muted/40 hover:text-ink-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <span className="text-sm font-medium text-navy flex-1 truncate">
                  {(isHebrew ? field.label_he : field.label_en) || (isHebrew ? "שדה חדש" : "New Field")}
                </span>

                <span className="text-xs text-ink-muted">
                  {fieldTypeLabels[field.type][isHebrew ? "he" : "en"]}
                </span>

                {field.required && (
                  <span className="text-xs text-terracotta">*</span>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                  className="p-1 text-error/50 hover:text-error transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded editor */}
              {expandedId === field.id && (
                <div className="px-3 pb-3 pt-1 border-t border-branch/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1">תווית (עברית)</Label>
                      <Input
                        value={field.label_he}
                        onChange={(e) => updateField(field.id, { label_he: e.target.value })}
                        placeholder="שם השדה בעברית"
                        dir="rtl"
                        className="text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1">Label (English)</Label>
                      <Input
                        value={field.label_en}
                        onChange={(e) => updateField(field.id, { label_en: e.target.value })}
                        placeholder="Field label in English"
                        dir="ltr"
                        className="text-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs mb-1">{isHebrew ? "סוג שדה" : "Field Type"}</Label>
                      <Select
                        value={field.type}
                        onValueChange={(val) => updateField(field.id, { type: val as RegistrationFieldType })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(fieldTypeLabels).map(([type, labels]) => (
                            <SelectItem key={type} value={type}>
                              {isHebrew ? labels.he : labels.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                      />
                      <Label className="text-xs">
                        {isHebrew ? "חובה" : "Required"}
                      </Label>
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div>
                      <Label className="text-xs mb-1">
                        {isHebrew ? "אפשרויות (הפרידו בפסיקים)" : "Options (comma-separated)"}
                      </Label>
                      <Input
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder={isHebrew ? "אפשרות 1, אפשרות 2, אפשרות 3" : "Option 1, Option 2, Option 3"}
                        className="text-sm h-8"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addField}
        className="w-full"
      >
        <Plus className="w-4 h-4" />
        {isHebrew ? "הוסף שדה" : "Add Field"}
      </Button>
    </div>
  );
}
