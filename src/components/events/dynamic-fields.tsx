"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RegistrationField } from "@/lib/types/database";

interface DynamicFieldsProps {
  fields: RegistrationField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  isHebrew: boolean;
}

export function DynamicFields({ fields, values, onChange, isHebrew }: DynamicFieldsProps) {
  return (
    <>
      {fields.map((field) => {
        const label = isHebrew ? field.label_he : field.label_en;
        const selectedValue = values[field.id] || "";
        const isOtherSelected = selectedValue === "אחר" || selectedValue === "Other";

        if (field.type === "checkbox") {
          return (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`field-${field.id}`}
                checked={selectedValue === "true"}
                onChange={(e) => onChange(field.id, e.target.checked.toString())}
                className="rounded border-branch/20"
                required={field.required}
              />
              <label htmlFor={`field-${field.id}`} className="text-sm text-ink-light cursor-pointer">
                {label} {field.required && <span className="text-terracotta">*</span>}
              </label>
            </div>
          );
        }

        if (field.type === "rating") {
          return (
            <div key={field.id}>
              <Label className="mb-1.5">
                {label} {field.required && "*"}
              </Label>
              <div className="flex items-center gap-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = Number(selectedValue) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange(field.id, String(n))}
                      className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-terracotta text-white border-terracotta"
                          : "bg-white text-navy border-branch/20 hover:border-branch/40"
                      }`}
                      aria-label={String(n)}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {field.required && !selectedValue && (
                <input type="hidden" required value="" name={`__req_${field.id}`} readOnly />
              )}
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.id}>
              <Label className="mb-1.5">
                {label} {field.required && "*"}
              </Label>
              <Textarea
                value={selectedValue}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
                rows={4}
                dir={isHebrew ? "rtl" : "ltr"}
              />
            </div>
          );
        }

        return (
          <div key={field.id}>
            <Label className="mb-1.5">
              {label} {field.required && "*"}
            </Label>

            {field.type === "select" ? (
              <>
                <Select
                  value={selectedValue}
                  onValueChange={(val) => onChange(field.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isHebrew ? "בחרו אפשרות" : "Select option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isOtherSelected && (
                  <Input
                    className="mt-2"
                    placeholder={isHebrew ? "פרטו כאן..." : "Please specify..."}
                    value={values[`${field.id}__other`] || ""}
                    onChange={(e) => onChange(`${field.id}__other`, e.target.value)}
                    required={field.required}
                  />
                )}
              </>
            ) : (
              <Input
                type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                value={selectedValue}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
