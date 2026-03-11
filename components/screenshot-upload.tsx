"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Clipboard, ImageIcon, X, CheckCircle } from "lucide-react";

const A = { border:"#e2e8f0", t1:"#0f172a", t4:"#64748b", t5:"#94a3b8", accent:"#00B4D8" };

export default function ScreenshotUpload({ onUpload, processing = false }: { onUpload: (file: File) => void; processing?: boolean }) {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };
  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items)
        for (const type of item.types)
          if (type.startsWith("image/")) { const blob = await item.getType(type); handleFile(new File([blob], "paste.png", { type })); }
    } catch {}
  }, [handleFile]);

  const dropZoneStyle: React.CSSProperties = {
    position: "relative", minHeight: 220, borderRadius: 12,
    border: `2px dashed ${isDragging ? A.accent : preview ? "rgba(0,180,216,0.4)" : A.border}`,
    backgroundColor: isDragging ? "rgba(0,180,216,0.04)" : preview ? "#f8fafc" : "#fafbfc",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={dropZoneStyle}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && !processing && fileInputRef.current?.click()}
      >
        {processing ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid #e2e8f0`, borderTopColor: A.accent, animation: "spin 0.7s linear infinite" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: A.t1 }}>Running OCR…</p>
              <p style={{ fontSize: 12, color: A.t5, marginTop: 4 }}>Extracting track data from your screenshot</p>
            </div>
          </div>
        ) : preview ? (
          <div style={{ position: "relative", width: "100%", padding: 16 }}>
            <img src={preview} alt="Preview" style={{ display: "block", margin: "0 auto", maxHeight: 160, borderRadius: 8, objectFit: "contain" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, fontSize: 12, color: A.t4 }}>
              <CheckCircle size={13} color="#10b981" />
              <span>{fileName}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setPreview(null); setFileName(null); }}
              style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", backgroundColor: "#e2e8f0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: A.t4 }}
            ><X size={12} /></button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ImageIcon size={22} color={A.t5} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: A.t1 }}>Drop your playlist screenshot here</p>
              <p style={{ fontSize: 12, color: A.t5, marginTop: 5, lineHeight: 1.5 }}>
                PNG, JPG, WEBP — playlist screenshots, DJ set lists, Rekordbox exports
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${A.border}`, backgroundColor: "#fff", fontSize: 12, fontWeight: 500, color: A.t4, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            >Browse Files</button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {[
          { icon: Clipboard, label: "Paste from Clipboard", action: handlePaste },
          { icon: Upload, label: "Upload File", action: () => fileInputRef.current?.click() },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderRadius: 9, border: `1px solid ${A.border}`, backgroundColor: "#fff", fontSize: 13, color: A.t4, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", transition: "all 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = A.border; }}
          >
            <Icon size={15} color={A.t5} />{label}
          </button>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
