"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface ImageUploaderProps {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  isHebrew?: boolean;
}

export function ImageUploader({ bucket, value, onChange, isHebrew = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(isHebrew ? "ניתן להעלות תמונות בלבד" : "Only images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(isHebrew ? "גודל מקסימלי: 5MB" : "Max file size: 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(isHebrew ? "שגיאה בהעלאה" : "Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    onChange(data.publicUrl);
    setUploading(false);
  }, [bucket, onChange, isHebrew]);

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

  if (value) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-branch/10 bg-cream-dark/30">
        <Image
          src={value}
          alt="Cover"
          width={600}
          height={300}
          className="w-full h-48 object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 end-2 p-1.5 rounded-full bg-navy/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
            ? "border-branch bg-branch/5"
            : "border-branch/20 hover:border-branch/40 hover:bg-cream-dark/30",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-branch/30 border-t-branch rounded-full animate-spin" />
            <span className="text-sm text-ink-muted">{isHebrew ? "מעלה..." : "Uploading..."}</span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-branch/10 flex items-center justify-center">
              {dragOver ? <ImageIcon className="w-5 h-5 text-branch" /> : <Upload className="w-5 h-5 text-branch" />}
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-navy">
                {isHebrew ? "גררו תמונה או לחצו לבחירה" : "Drag image or click to browse"}
              </span>
              <p className="text-xs text-ink-muted mt-1">PNG, JPG, WebP (max 5MB)</p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  );
}
