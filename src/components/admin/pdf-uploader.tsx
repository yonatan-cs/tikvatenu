"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface PdfUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  isHebrew?: boolean;
}

export function PdfUploader({ value, onChange, isHebrew = true }: PdfUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError(isHebrew ? "ניתן להעלות קבצי PDF בלבד" : "Only PDF files are allowed");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(isHebrew ? "גודל מקסימלי: 50MB" : "Max file size: 50MB");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("article-pdfs")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(isHebrew ? "שגיאה בהעלאה" : "Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("article-pdfs").getPublicUrl(fileName);
    onChange(data.publicUrl);
    setUploading(false);
  }, [onChange, isHebrew]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, [upload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }, [upload]);

  // Extract filename from URL for display
  const fileName = value ? decodeURIComponent(value.split("/").pop() || "").replace(/^\d+-[a-z0-9]+\.pdf$/, "קובץ PDF") : null;

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-branch/20 bg-cream-dark/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-terracotta" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy truncate">{fileName}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-branch hover:underline">
              {isHebrew ? "פתח קובץ" : "Open file"}
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1.5 rounded-full hover:bg-navy/5 text-ink-muted hover:text-error transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          dragOver
            ? "border-terracotta bg-terracotta/5"
            : "border-branch/20 hover:border-branch/40 hover:bg-cream-dark/30",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
            <span className="text-sm text-ink-muted">{isHebrew ? "מעלה..." : "Uploading..."}</span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
              {dragOver ? <FileText className="w-5 h-5 text-terracotta" /> : <Upload className="w-5 h-5 text-terracotta" />}
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-navy">
                {isHebrew ? "גררו PDF או לחצו לבחירה" : "Drag PDF or click to browse"}
              </span>
              <p className="text-xs text-ink-muted mt-1">PDF (max 50MB)</p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  );
}
