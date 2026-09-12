import { ImageResponse } from "next/og";

export const alt =
  "PITCON — Where African ambition becomes funded and structured";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide OpenGraph image, added in the pre-launch hardening pass.
 * Next.js auto-detects this file and injects the og:image/twitter:image
 * meta tags on every route that doesn't define its own more specific
 * one - there wasn't one before, so shared links rendered no preview
 * image at all.
 *
 * No brand logo asset exists yet (see components/shared/logo.tsx's own
 * comment on that) - this reuses the same "Pit" + purple "con" wordmark
 * treatment rather than inventing a new mark, so this stays accurate
 * the moment a real logo shows up and Logo is updated.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, #f7f2fc 0%, #ffffff 55%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#171717" }}>
          Pit<span style={{ color: "#7634c8" }}>con</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#404040",
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          Where African ambition becomes funded and structured
        </div>
      </div>
    ),
    { ...size },
  );
}
