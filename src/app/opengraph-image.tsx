import { ImageResponse } from "next/og";

export const alt = "Pathway: Find work abroad. Hire from abroad.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, drawn from the same tokens as the site. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1b2b48", color: "#fff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
          <svg width="64" height="64" viewBox="0 0 28 28">
            <rect width="28" height="28" fill="#111d33" />
            <path d="M7 21V12h14" fill="none" stroke="#fff" strokeWidth="3.2" />
            <path d="M16.5 7.5 21 12l-4.5 4.5" fill="none" stroke="#ffd23f" strokeWidth="3.2" />
          </svg>
          Pathway
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <span>Find work abroad.</span>
          <span>Hire from abroad.</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 30, color: "#bcc4d3" }}>
          <span style={{ border: "2px solid #bcc4d3", padding: "8px 18px" }}>Fit score 0–100</span>
          <span style={{ border: "2px solid #bcc4d3", padding: "8px 18px" }}>Right to work, shown separately</span>
        </div>
      </div>
    ),
    size,
  );
}
