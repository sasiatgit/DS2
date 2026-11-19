import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), "public/brand/ds2-logo.png"));
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: 64,
        height: 59,
        overflow: "hidden",
        background: "white",
        borderRadius: 12,
      }}
    >
      {/* Frame the original layered emblem at a readable browser-tab size. */}
      <img
        src={`data:image/png;base64,${logo.toString("base64")}`}
        alt=""
        width={296}
        height={99}
        style={{ position: "absolute", left: -44, top: -5, maxWidth: 296 }}
      />
    </div>,
    size,
  );
}
