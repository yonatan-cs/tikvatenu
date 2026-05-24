"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
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
  title?: { he: string; en: string };
  defaultFields?: Array<{ he: string; en: string; type: RegistrationFieldType }>;
  defaultFieldsHint?: { he: string; en: string };
}

const fieldTypeLabels: Record<RegistrationFieldType, { he: string; en: string }> = {
  text: { he: "טקסט", en: "Text" },
  email: { he: "אימייל", en: "Email" },
  phone: { he: "טלפון", en: "Phone" },
  number: { he: "מספר", en: "Number" },
  select: { he: "בחירה", en: "Select" },
  checkbox: { he: "תיבת סימון", en: "Checkbox" },
  rating: { he: "דירוג 1-5", en: "Rating 1-5" },
  textarea: { he: "טקסט ארוך", en: "Long Text" },
};

interface SortableFieldItemProps {
  field: RegistrationField;
  index: number;
  total: number;
  isExpanded: boolean;
  isHebrew: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<RegistrationField>) => void;
}

function SortableFieldItem({
  field,
  isExpanded,
  isHebrew,
  onToggle,
  onRemove,
  onUpdate,
}: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-branch/10 bg-white overflow-hidden"
    >
      {/* Field header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-cream-dark/30 transition-colors"
        onClick={onToggle}
      >
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-ink-muted/40 hover:text-ink-muted touch-none"
        >
          <GripVertical className="w-4 h-4" />
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
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-error/50 hover:text-error transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div onClick={(e) => e.stopPropagation()}>
          {isExpanded
            ? <ChevronUp className="w-3.5 h-3.5 text-ink-muted/40" />
            : <ChevronDown className="w-3.5 h-3.5 text-ink-muted/40" />
          }
        </div>
      </div>

      {/* Expanded editor */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-branch/5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1">תווית (עברית)</Label>
              <Input
                value={field.label_he}
                onChange={(e) => onUpdate({ label_he: e.target.value })}
                placeholder="שם השדה בעברית"
                dir="rtl"
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs mb-1">Label (English)</Label>
              <Input
                value={field.label_en}
                onChange={(e) => onUpdate({ label_en: e.target.value })}
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
                onValueChange={(val) => onUpdate({ type: val as RegistrationFieldType })}
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
                onCheckedChange={(checked) => onUpdate({ required: checked })}
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
                  onUpdate({
                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder={isHebrew ? "אפשרות 1, אפשרות 2, אחר" : "Option 1, Option 2, Other"}
                className="text-sm h-8"
              />
              <p className="text-xs text-ink-muted mt-1">
                {isHebrew
                  ? 'הוספת "אחר" תציג שדה פירוט חופשי כשנבחר'
                  : 'Adding "אחר" will show a free-text field when selected'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_REGISTRATION_DEFAULT_FIELDS = [
  { he: "שם מלא", en: "Full Name", type: "text" as RegistrationFieldType },
  { he: "אימייל", en: "Email", type: "email" as RegistrationFieldType },
  { he: "טלפון", en: "Phone", type: "phone" as RegistrationFieldType },
];

export function RegistrationFieldBuilder({
  fields,
  onChange,
  isHebrew,
  title,
  defaultFields,
  defaultFieldsHint,
}: RegistrationFieldBuilderProps) {
  const resolvedTitle = title || { he: "שדות טופס הרשמה", en: "Registration Form Fields" };
  const resolvedDefaultFields = defaultFields ?? DEFAULT_REGISTRATION_DEFAULT_FIELDS;
  const resolvedHint = defaultFieldsHint || {
    he: "שם מלא, אימייל וטלפון הם שדות ברירת מחדל. הוסיפו שדות נוספים לפי הצורך.",
    en: "Full name, email, and phone are default fields. Add custom fields as needed.",
  };
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  }

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
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-navy">
          {isHebrew ? resolvedTitle.he : resolvedTitle.en}
        </Label>
        <span className="text-xs text-ink-muted">
          {isHebrew ? `${fields.length} שדות` : `${fields.length} fields`}
        </span>
      </div>

      <p className="text-xs text-ink-muted">
        {isHebrew ? resolvedHint.he : resolvedHint.en}
      </p>

      {/* Default fields preview */}
      <div className="space-y-1.5">
        {resolvedDefaultFields.map((df) => (
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    index={index}
                    total={fields.length}
                    isExpanded={expandedId === field.id}
                    isHebrew={isHebrew}
                    onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
                    onRemove={() => removeField(field.id)}
                    onUpdate={(updates) => updateField(field.id, updates)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
