"use client";

import { useState } from "react";
import { Edit2, Trash2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn, confidenceLabel } from "@/lib/utils";
import { mockOcrTracks } from "@/data/mockTracks";

interface OcrRow {
  id: string;
  rawText: string;
  artist: string;
  title: string;
  label: string;
  year: number;
  confidence: number;
  verified: boolean;
  bpm?: number;
  key?: string;
}

interface OcrReviewTableProps {
  tracks?: OcrRow[];
  onConfirm?: (tracks: OcrRow[]) => void;
}

const ConfidenceBadge = ({ value }: { value: number }) => {
  const level = confidenceLabel(value);
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5">
      {level === "high" ? (
        <CheckCircle className="h-3.5 w-3.5 text-orange-600" />
      ) : level === "medium" ? (
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400" />
      )}
      <span
        className={cn(
          "text-xs font-mono",
          level === "high" ? "text-orange-600" : level === "medium" ? "text-yellow-400" : "text-red-400"
        )}
      >
        {pct}%
      </span>
    </div>
  );
};

export default function OcrReviewTable({ tracks = mockOcrTracks, onConfirm }: OcrReviewTableProps) {
  const [rows, setRows] = useState<OcrRow[]>(tracks as OcrRow[]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OcrRow>>({});

  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));

  const startEdit = (row: OcrRow) => {
    setEditingId(row.id);
    setEditData({ artist: row.artist, title: row.title, label: row.label, year: row.year });
  };

  const saveEdit = (id: string) => {
    setRows((r) =>
      r.map((row) =>
        row.id === id ? { ...row, ...editData, verified: true, confidence: Math.max(row.confidence, 0.95) } : row
      )
    );
    setEditingId(null);
  };

  const rerunOcr = (id: string) => {
    // Stub: simulate improved confidence after re-run
    setRows((r) =>
      r.map((row) =>
        row.id === id ? { ...row, confidence: Math.min(1, row.confidence + 0.15) } : row
      )
    );
  };

  const lowConfidenceCount = rows.filter((r) => confidenceLabel(r.confidence) === "low").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">OCR Extraction Review</h3>
          <p className="text-xs text-[#72727E]">
            {rows.length} tracks detected
            {lowConfidenceCount > 0 && (
              <span className="ml-2 text-yellow-400">
                · {lowConfidenceCount} need review
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => rows.forEach((r) => r.confidence < 0.8 && rerunOcr(r.id))}
            className="flex items-center gap-1.5 rounded-md border border-black/10 bg-black/4 px-3 py-1.5 text-xs text-[#4A4A58] transition hover:bg-black/7 hover:text-[#111114]"
          >
            <RefreshCw className="h-3 w-3" />
            Re-run OCR
          </button>
          <button
            onClick={() => onConfirm?.(rows)}
            className="flex items-center gap-1.5 rounded-md bg-orange-500/15 px-3 py-1.5 text-xs font-medium text-orange-700 ring-1 ring-orange-500/25 transition hover:bg-orange-500/30"
          >
            <CheckCircle className="h-3 w-3" />
            Confirm Playlist
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-black/9 bg-[#D4D4DA]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/7">
              {["#", "Artist", "Track", "Label", "Year", "Confidence", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#9595A0]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {rows.map((row, i) => {
              const level = confidenceLabel(row.confidence);
              const isEditing = editingId === row.id;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "group transition-colors",
                    level === "low" ? "bg-red-100 hover:bg-red-50" : "hover:bg-black/2"
                  )}
                >
                  <td className="w-10 px-4 py-3 font-mono text-xs text-[#9595A0]">{i + 1}</td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={editData.artist ?? ""}
                        onChange={(e) => setEditData({ ...editData, artist: e.target.value })}
                        className="w-full rounded bg-black/6 px-2 py-1 text-sm text-[#111114] outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    ) : (
                      <span className="font-medium text-[#1E1E26]">{row.artist}</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={editData.title ?? ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full rounded bg-black/6 px-2 py-1 text-sm text-[#111114] outline-none focus:ring-1 focus:ring-orange-500/30"
                      />
                    ) : (
                      <span className="text-[#2E2E38]">{row.title}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-[#72727E]">{row.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#9595A0]">{row.year}</td>

                  <td className="px-4 py-3">
                    <ConfidenceBadge value={row.confidence} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition group-hover:opacity-100">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(row.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-500/10"
                        >
                          Save
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(row)}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9595A0] hover:bg-black/6 hover:text-[#2E2E38]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => rerunOcr(row.id)}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9595A0] hover:bg-black/6 hover:text-[#2E2E38]"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeRow(row.id)}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#9595A0] hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
