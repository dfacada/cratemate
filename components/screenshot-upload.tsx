"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Upload, Clipboard, Image, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotUploadProps {
  onUpload: (file: File) => void;
  processing?: boolean;
  className?: string;
}

export default function ScreenshotUpload({
  onUpload,
  processing = false,
  className,
}: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "paste.png", { type });
            handleFile(file);
          }
        }
      }
    } catch {
      // Paste failed (permissions or non-image clipboard content)
    }
  }, [handleFile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearUpload = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-teal-400/60 bg-teal-500/5 shadow-[0_0_24px_0_rgba(20,184,166,0.12)]"
            : preview
            ? "border-teal-500/30 bg-[#15151B]"
            : "border-white/10 bg-[#15151B] hover:border-white/20 hover:bg-white/3"
        )}
      >
        {processing ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            <div>
              <p className="text-sm font-medium text-zinc-300">Running OCR…</p>
              <p className="text-xs text-zinc-600">Extracting track data from your screenshot</p>
            </div>
          </div>
        ) : preview ? (
          <div className="relative w-full p-4">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-40 rounded-lg object-contain opacity-80"
            />
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <CheckCircle className="h-3.5 w-3.5 text-teal-400" />
              <span>{fileName}</span>
            </div>
            <button
              onClick={clearUpload}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <Image className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Drop screenshot here</p>
              <p className="mt-0.5 text-xs text-zinc-600">
                PNG, JPG, WEBP — Playlist screenshots, DJ set lists, Rekordbox exports
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 rounded-md bg-white/8 px-4 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/12 hover:text-white"
            >
              Browse Files
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handlePaste}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-zinc-200"
        >
          <Clipboard className="h-4 w-4" />
          Paste from Clipboard
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-zinc-200"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>
    </div>
  );
}
