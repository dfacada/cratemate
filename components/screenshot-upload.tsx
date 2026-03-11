"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Upload, Clipboard, Image, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScreenshotUpload({ onUpload, processing = false, className }: { onUpload: (file: File) => void; processing?: boolean; className?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onUpload(file);
  }, [onUpload]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) for (const type of item.types) if (type.startsWith("image/")) { const blob = await item.getType(type); handleFile(new File([blob], "paste.png", { type })); }
    } catch {}
  }, [handleFile]);

  return (
    <div className={cn("space-y-3", className)}>
      <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
        className={cn("relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
          isDragging ? "border-cyan-400 bg-cyan-50" : preview ? "border-cyan-200 bg-slate-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
        )}>
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <div className="text-center"><p className="text-sm font-medium text-slate-700">Running OCR…</p><p className="text-xs text-slate-400">Extracting track data from your screenshot</p></div>
          </div>
        ) : preview ? (
          <div className="relative w-full p-4">
            <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span>{fileName}</span></div>
            <button onClick={() => { setPreview(null); setFileName(null); }} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200"><Image className="h-5 w-5 text-slate-400" /></div>
            <div><p className="text-sm font-medium text-slate-700">Drop screenshot here</p><p className="mt-0.5 text-xs text-slate-400">PNG, JPG, WEBP — Playlist screenshots, DJ set lists, Rekordbox exports</p></div>
            <button onClick={() => fileInputRef.current?.click()} className="mt-1 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800">Browse Files</button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
      </div>
      <div className="flex gap-2">
        <button onClick={handlePaste} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"><Clipboard className="h-4 w-4" />Paste from Clipboard</button>
        <button onClick={() => fileInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50"><Upload className="h-4 w-4" />Upload File</button>
      </div>
    </div>
  );
}
