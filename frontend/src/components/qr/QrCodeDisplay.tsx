"use client";

import React, { useMemo, useRef, useState } from "react";
import { Copy, Download, Share2, Check, ShieldCheck, Sparkles } from "lucide-react";
import { generateQrMatrix } from "@/lib/qr/qrGenerator";

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  code?: string;
  pin?: string;
  subtitle?: string;
  accentColor?: string;
  cornerColor?: string;
  downloadName?: string;
  showActions?: boolean;
  metadata?: { label: string; value: string }[];
}

export function QrCodeDisplay({
  value,
  size = 220,
  title = "Gate Clearance Pass",
  code,
  pin,
  subtitle = "Scan at gate security checkpoint",
  accentColor = "#B22222",
  cornerColor = "#C9A227",
  downloadName = "Lincoln-Estate-Pass",
  showActions = true,
  metadata = [],
}: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value);
    } catch (e) {
      console.error("QR Generation error:", e);
      return [];
    }
  }, [value]);

  const moduleCount = matrix.length;
  const quietZone = 2; // modules
  const totalModules = moduleCount + quietZone * 2;
  const cellSize = 8;
  const viewBoxSize = totalModules * cellSize;

  // Distinguish finder pattern modules for luxury 2-tone coloring (Gold corners + Crimson body)
  const isFinderModule = (r: number, c: number) => {
    const isTopLeft = r < 7 && c < 7;
    const isTopRight = r < 7 && c >= moduleCount - 7;
    const isBottomLeft = r >= moduleCount - 7 && c < 7;
    return isTopLeft || isTopRight || isBottomLeft;
  };

  const handleCopy = () => {
    const textLines = [
      `🏛️ LINCOLN ESTATE GATE CLEARANCE`,
      title,
      code ? `Code: ${code}` : "",
      pin ? `PIN: ${pin}` : "",
      ...metadata.map((m) => `${m.label}: ${m.value}`),
      `Clearance Token: ${value}`,
      `Present this pass to Security at the gate.`,
    ].filter(Boolean);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textLines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const scale = 3; // 3x high-res
    canvas.width = viewBoxSize * scale;
    canvas.height = viewBoxSize * scale;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `${downloadName}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handleWhatsAppShare = () => {
    const message = [
      `*🏛️ LINCOLN ESTATE GATE PASS*`,
      `*${title}*`,
      code ? `*Code:* ${code}` : "",
      pin ? `*Security PIN:* ${pin}` : "",
      ...metadata.map((m) => `• ${m.label}: ${m.value}`),
      `\n_Present this clearance code or scan at Gate 1 / Gate 2 for verified access._`,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Luxury Pass Container */}
      <div className="relative p-5 rounded-2xl bg-white border-2 border-[#B22222]/20 shadow-md flex flex-col items-center">
        {/* Top Estate Crest Pill */}
        <div className="mb-3 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#B22222]/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B22222]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#B22222]">
            Post Army House Estate Verified
          </span>
        </div>

        {/* Scalable SVG QR Code */}
        <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            width={size}
            height={size}
            className="w-auto h-auto max-w-full"
            style={{ shapeRendering: "crispEdges" }}
          >
            {/* White quiet zone background */}
            <rect width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />

            {/* QR Code Modules */}
            {matrix.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) return null;
                const isCorner = isFinderModule(r, c);
                const fill = isCorner ? cornerColor : accentColor;
                const x = (c + quietZone) * cellSize;
                const y = (r + quietZone) * cellSize;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={fill}
                  />
                );
              })
            )}

            {/* Central Post Army House Estate Emblem */}
            <g
              transform={`translate(${viewBoxSize / 2 - 16}, ${viewBoxSize / 2 - 16})`}
            >
              <rect
                x="0"
                y="0"
                width="32"
                height="32"
                rx="8"
                fill="#FFFFFF"
                stroke="#B22222"
                strokeWidth="2"
              />
              <text
                x="16"
                y="21"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="#B22222"
                fontFamily="system-ui, sans-serif"
              >
                LE
              </text>
            </g>
          </svg>
        </div>

        {/* Clearance Code & PIN */}
        {code && (
          <div className="mt-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Gate Clearance Code
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#B22222] tracking-widest mt-0.5">
              {code}
            </div>
            {pin && (
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Security PIN: <strong className="text-dark font-mono">{pin}</strong>
              </p>
            )}
          </div>
        )}

        {/* Metadata Details */}
        {metadata.length > 0 && (
          <div className="w-full mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
            {metadata.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-muted">{m.label}:</span>
                <span className="font-bold text-dark">{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtitle / Guard Notice */}
      <p className="text-xs text-muted max-w-xs">{subtitle}</p>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Share Pass</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#B22222] text-xs font-bold text-white hover:bg-[#8F1A1A] transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR</span>
          </button>
        </div>
      )}
    </div>
  );
}
