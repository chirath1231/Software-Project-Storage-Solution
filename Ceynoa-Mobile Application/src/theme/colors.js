// CEYNOA — Smart, Secure & Affordable Cloud Storage
// Brand tokens derived from the product sketches: warm orange→amber brand,
// clean white surfaces (light) with a charcoal floating tab bar.

// Brand accents (constant across themes)
export const accent = {
  orange: "#FF8A00",
  amber: "#FFB300",
  deep: "#F97316",
  // primary gradient (buttons, headers, logo) — orange → amber
  gradient: ["#FF8A00", "#FFB300"],
  gradientSoft: ["#FF9A1A", "#FFC107"],
};

// status / semantic tones (constant across themes)
export const tones = {
  ok: "#10b981",
  okText: "#0f9d6b",
  warn: "#f59e0b",
  warnText: "#d97706",
  danger: "#ef4444",
  dangerText: "#dc2626",
  info: "#3b82f6",
  infoText: "#2563eb",
};

// The dark floating bottom tab bar is the same in both themes (per sketch).
export const tabBar = {
  bg: "#222A39",
  bgRaised: "#2B3445",
  inactive: "#8A93A6",
  active: "#FFFFFF",
};

export const lightColors = {
  bgApp: "#F5F6F8",
  bgPrimary: "#FFFFFF",
  bgSecondary: "#FFFFFF",
  bgTertiary: "#F1F3F6",
  bgSoftOrange: "#FFF4E6",
  border: "rgba(17,24,39,0.08)",
  borderStrong: "rgba(17,24,39,0.16)",
  textPrimary: "#1B2230",
  textSecondary: "#5B6472",
  textMuted: "#98A1B0",
  overlay: "rgba(17,24,39,0.03)",
  overlayStrong: "rgba(17,24,39,0.06)",
  shadow: "#1B2230",
  isDark: false,
};

export const darkColors = {
  bgApp: "#10141C",
  bgPrimary: "#161B26",
  bgSecondary: "#1B2230",
  bgTertiary: "#222A39",
  bgSoftOrange: "rgba(255,138,0,0.12)",
  border: "rgba(148,163,184,0.14)",
  borderStrong: "rgba(148,163,184,0.26)",
  textPrimary: "#F1F5F9",
  textSecondary: "#B7C0CE",
  textMuted: "#7A8494",
  overlay: "rgba(255,255,255,0.04)",
  overlayStrong: "rgba(255,255,255,0.08)",
  shadow: "#000000",
  isDark: true,
};

export function buildPalette(isDark) {
  const base = isDark ? darkColors : lightColors;
  return { ...base, accent, tones, tabBar };
}
