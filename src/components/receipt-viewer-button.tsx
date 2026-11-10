"use client";

import { useState } from "react";
import { Eye, ExternalLink, X } from "lucide-react";

export function ReceiptViewerButton({
  url,
  name,
  mimeType,
}: {
  url: string;
  name: string;
  mimeType?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const isPdf =
    mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  function handleOpen() {
    if (!isPdf && url.startsWith("data:image/")) {
      setModalOpen(true);
      return;
    }
    if (!url.startsWith("data:")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const [header, base64] = url.split(",");
      const mimeMatch = header.match(/data:([^;]+);base64/);
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      setModalOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="btn btn-secondary text-xs inline-flex items-center gap-1.5 bg-white border-emerald-300 shadow-sm text-emerald-950 hover:bg-emerald-50 cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5 text-emerald-700" />
        <span>Ver comprobante</span>
        <ExternalLink className="h-3 w-3 opacity-60" />
      </button>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={name}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

