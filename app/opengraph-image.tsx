import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
export const alt = "DS2 — Your Business Problem. Our Technology Solution.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/ds2-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(120deg, #ffffff, #c5ddf7)",
        color: "#121a29",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 70,
        fontFamily: "sans-serif",
      }}
    >
      {/* ImageResponse renders its own image elements, not next/image. */}
      <img
        src={logoSrc}
        width={420}
        height={140}
        alt="DurgaSoftwareSolutions (DS2)"
        style={{ objectFit: "contain", borderRadius: 12 }}
      />
      <div
        style={{
          fontSize: 60,
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          fontWeight: 700,
        }}
      >
        <span>Your Business Problem.</span>
        <span style={{ color: "#0868cf" }}>Our Technology Solution.</span>
      </div>
      <div style={{ fontSize: 24, color: "#51627a", marginTop: 30 }}>
        Software · Automation · Quality Engineering
      </div>
      <div style={{ fontSize: 18, color: "#51627a", marginTop: 24 }}>
        DurgaSoftwareSolutions | Chennai, India
      </div>
    </div>,
    size,
  );
}
