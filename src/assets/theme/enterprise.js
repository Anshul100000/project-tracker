/**
 * Enterprise design layer.
 *
 * Sits on top of the Material Dashboard base themes (light, dark, RTL) and
 * replaces the template look with a restrained, neutral enterprise style.
 *
 * Colors are exposed two ways:
 *  - CSS custom properties (--pt-*) so any sx / CSS can use them and they
 *    follow light/dark automatically.
 *  - Real hex values in the MUI palette, because MUI runs color math
 *    (alpha, darken) on palette entries and can't do that with var().
 */
import { createTheme } from "@mui/material/styles";

export const tokens = {
  light: {
    bg: "#f7f8fa",
    surface: "#ffffff",
    surface2: "#f9fafb",
    hover: "#f2f4f7",
    border: "#e4e7ec",
    borderStrong: "#d0d5dd",
    text: "#101828",
    text2: "#475467",
    text3: "#98a2b3",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    accentSoft: "#eff4ff",
    accentText: "#1d4ed8",
    success: "#067647",
    successSoft: "#ecfdf3",
    successBorder: "#abefc6",
    warning: "#b54708",
    warningSoft: "#fffaeb",
    warningBorder: "#fedf89",
    danger: "#d92d20",
    dangerSolid: "#d92d20",
    dangerHover: "#b42318",
    dangerSoft: "#fef3f2",
    dangerBorder: "#fecdca",
    shadowSm: "0 1px 2px rgba(16,24,40,0.05)",
    shadowMd: "0 4px 8px -2px rgba(16,24,40,0.08), 0 2px 4px -2px rgba(16,24,40,0.04)",
    shadowLg: "0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)",
    shadowXl: "0 20px 24px -4px rgba(16,24,40,0.10), 0 8px 8px -4px rgba(16,24,40,0.04)",
    focus: "0 0 0 3px rgba(37,99,235,0.18)",
  },
  dark: {
    bg: "#0c0e12",
    surface: "#14171d",
    surface2: "#181c23",
    hover: "#1f242d",
    border: "#262b35",
    borderStrong: "#363d4a",
    text: "#f5f6f7",
    text2: "#a8b0bd",
    text3: "#6b7482",
    accent: "#2563eb",
    accentHover: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.14)",
    accentText: "#7aa7ff",
    success: "#47cd89",
    successSoft: "rgba(71,205,137,0.12)",
    successBorder: "rgba(71,205,137,0.32)",
    warning: "#fdb022",
    warningSoft: "rgba(253,176,34,0.12)",
    warningBorder: "rgba(253,176,34,0.32)",
    danger: "#f97066",
    dangerSolid: "#d92d20",
    dangerHover: "#b42318",
    dangerSoft: "rgba(249,112,102,0.12)",
    dangerBorder: "rgba(249,112,102,0.32)",
    shadowSm: "0 1px 2px rgba(0,0,0,0.4)",
    shadowMd: "0 4px 8px -2px rgba(0,0,0,0.5)",
    shadowLg: "0 12px 16px -4px rgba(0,0,0,0.5)",
    shadowXl: "0 20px 24px -4px rgba(0,0,0,0.6)",
    focus: "0 0 0 3px rgba(59,130,246,0.3)",
  },
};

// Categorical hues for identity color (icons, avatars, chips). Each has:
//   solid - fill behind a white icon (>= 3:1 against white)
//   soft  - tinted background
//   ink   - readable text on the soft tint
export const HUE_VALUES = {
  blue: { solid: "#2563eb", light: ["#eff4ff", "#1d4ed8"], dark: ["rgba(59,130,246,0.16)", "#93c5fd"] },
  violet: { solid: "#7c3aed", light: ["#f5f3ff", "#6d28d9"], dark: ["rgba(139,92,246,0.18)", "#c4b5fd"] },
  teal: { solid: "#0d9488", light: ["#f0fdfa", "#0f766e"], dark: ["rgba(20,184,166,0.16)", "#5eead4"] },
  amber: { solid: "#d97706", light: ["#fffbeb", "#b45309"], dark: ["rgba(245,158,11,0.16)", "#fcd34d"] },
  rose: { solid: "#e11d48", light: ["#fff1f2", "#be123c"], dark: ["rgba(244,63,94,0.16)", "#fda4af"] },
  emerald: { solid: "#059669", light: ["#ecfdf5", "#047857"], dark: ["rgba(16,185,129,0.16)", "#6ee7b7"] },
  sky: { solid: "#0284c7", light: ["#f0f9ff", "#0369a1"], dark: ["rgba(14,165,233,0.16)", "#7dd3fc"] },
  indigo: { solid: "#4f46e5", light: ["#eef2ff", "#4338ca"], dark: ["rgba(99,102,241,0.18)", "#a5b4fc"] },
};

export const HUES = Object.keys(HUE_VALUES);

Object.entries(HUE_VALUES).forEach(([name, h]) => {
  ["light", "dark"].forEach((mode) => {
    tokens[mode][name] = h.solid;
    [tokens[mode][`${name}Soft`], tokens[mode][`${name}Ink`]] = h[mode];
  });
});

// Sidebar: deep navy in both modes.
Object.assign(tokens.light, {
  nav: "#0f1b3d",
  navHover: "rgba(255,255,255,0.06)",
  navActive: "rgba(255,255,255,0.10)",
  navBorder: "rgba(255,255,255,0.08)",
  navText: "rgba(255,255,255,0.72)",
  navTextStrong: "#ffffff",
  navMuted: "rgba(255,255,255,0.42)",
});
Object.assign(tokens.dark, {
  nav: "#0b1024",
  navHover: "rgba(255,255,255,0.05)",
  navActive: "rgba(255,255,255,0.09)",
  navBorder: "rgba(255,255,255,0.07)",
  navText: "rgba(255,255,255,0.68)",
  navTextStrong: "#ffffff",
  navMuted: "rgba(255,255,255,0.38)",
});

// Stable hue for a label, so the same department/person always gets the same color.
export function hueFor(label = "") {
  let h = 0;
  for (let i = 0; i < label.length; i += 1) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
}

const toCssVars = (t) =>
  Object.fromEntries(
    Object.entries(t).map(([k, v]) => [`--pt-${k.replace(/[A-Z0-9]/g, (m) => `-${m.toLowerCase()}`)}`, v])
  );

// Short handle for var() lookups in style objects: v("text2") -> "var(--pt-text-2)"
export const v = (name) => `var(--pt-${name.replace(/[A-Z0-9]/g, (m) => `-${m.toLowerCase()}`)})`;

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const solid = (c) => ({ main: c, state: c });

// Colour themes offered in the "Colour suggestions" panel.
// accent = buttons/links/active states; from/to = brand gradient (banners, sidebar tint).
export const ACCENTS = {
  ocean: {
    name: "Ocean",
    mood: "Trustworthy & corporate",
    from: "#1d4ed8",
    to: "#6d28d9",
    light: { accent: "#2563eb", accentHover: "#1d4ed8", accentSoft: "#eff4ff", accentText: "#1d4ed8" },
    dark: { accent: "#2563eb", accentHover: "#3b82f6", accentSoft: "rgba(59,130,246,0.14)", accentText: "#7aa7ff" },
  },
  indigo: {
    name: "Indigo",
    mood: "Modern SaaS",
    from: "#4338ca",
    to: "#7c3aed",
    light: { accent: "#4f46e5", accentHover: "#4338ca", accentSoft: "#eef2ff", accentText: "#4338ca" },
    dark: { accent: "#4f46e5", accentHover: "#6366f1", accentSoft: "rgba(99,102,241,0.16)", accentText: "#a5b4fc" },
  },
  violet: {
    name: "Violet",
    mood: "Creative & bold",
    from: "#6d28d9",
    to: "#db2777",
    light: { accent: "#7c3aed", accentHover: "#6d28d9", accentSoft: "#f5f3ff", accentText: "#6d28d9" },
    dark: { accent: "#7c3aed", accentHover: "#8b5cf6", accentSoft: "rgba(139,92,246,0.18)", accentText: "#c4b5fd" },
  },
  emerald: {
    name: "Emerald",
    mood: "Growth & finance",
    from: "#047857",
    to: "#0d9488",
    light: { accent: "#059669", accentHover: "#047857", accentSoft: "#ecfdf5", accentText: "#047857" },
    dark: { accent: "#059669", accentHover: "#10b981", accentSoft: "rgba(16,185,129,0.16)", accentText: "#6ee7b7" },
  },
  teal: {
    name: "Teal",
    mood: "Calm & focused",
    from: "#0f766e",
    to: "#0284c7",
    light: { accent: "#0d9488", accentHover: "#0f766e", accentSoft: "#f0fdfa", accentText: "#0f766e" },
    dark: { accent: "#0d9488", accentHover: "#14b8a6", accentSoft: "rgba(20,184,166,0.16)", accentText: "#5eead4" },
  },
  rose: {
    name: "Rose",
    mood: "Energetic & vibrant",
    from: "#be123c",
    to: "#7c3aed",
    light: { accent: "#e11d48", accentHover: "#be123c", accentSoft: "#fff1f2", accentText: "#be123c" },
    dark: { accent: "#e11d48", accentHover: "#f43f5e", accentSoft: "rgba(244,63,94,0.16)", accentText: "#fda4af" },
  },
  sunset: {
    name: "Sunset",
    mood: "Warm & friendly",
    from: "#c2410c",
    to: "#db2777",
    light: { accent: "#ea580c", accentHover: "#c2410c", accentSoft: "#fff7ed", accentText: "#c2410c" },
    dark: { accent: "#ea580c", accentHover: "#f97316", accentSoft: "rgba(249,115,22,0.16)", accentText: "#fdba74" },
  },
  graphite: {
    name: "Graphite",
    mood: "Minimal & monochrome",
    from: "#1e293b",
    to: "#475569",
    light: { accent: "#334155", accentHover: "#1e293b", accentSoft: "#f1f5f9", accentText: "#1e293b" },
    dark: { accent: "#475569", accentHover: "#64748b", accentSoft: "rgba(148,163,184,0.16)", accentText: "#cbd5e1" },
  },
};

const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export function withEnterprise(base, mode = "light", accentKey = "ocean") {
  const preset = ACCENTS[accentKey] || ACCENTS.ocean;
  const t = {
    ...tokens[mode],
    ...preset[mode],
    brandFrom: preset.from,
    brandTo: preset.to,
    focus: `0 0 0 3px ${rgba(preset[mode].accent, mode === "dark" ? 0.3 : 0.18)}`,
  };
  const dark = mode === "dark";

  return createTheme(base, {
    palette: {
      mode,
      background: { default: t.bg, paper: t.surface, card: t.surface },
      text: { main: t.text2, focus: t.text2, primary: t.text, secondary: t.text2, disabled: t.text3 },
      primary: { main: t.accent, focus: t.accentHover, dark: t.accentHover, light: "#60a5fa", contrastText: "#fff" },
      info: { main: t.accent, focus: t.accentHover, dark: t.accentHover, light: "#60a5fa", contrastText: "#fff" },
      secondary: { main: "#667085", focus: "#475467" },
      success: { main: "#17b26a", focus: "#079455" },
      warning: { main: "#f79009", focus: "#dc6803" },
      error: { main: "#f04438", focus: "#d92d20" },
      dark: { main: dark ? "#f5f6f7" : "#101828", focus: dark ? "#ffffff" : "#1d2939" },
      divider: t.border,
      inputBorderColor: t.borderStrong,
      // Flatten every template gradient to a solid color.
      gradients: {
        primary: solid(t.accent),
        secondary: solid("#667085"),
        info: solid(t.accent),
        success: solid("#17b26a"),
        warning: solid("#f79009"),
        error: solid("#f04438"),
        light: solid(dark ? "#1f242d" : "#f2f4f7"),
        dark: solid(dark ? "#1f242d" : "#101828"),
      },
    },

    typography: {
      fontFamily: FONT,
      h1: { fontFamily: FONT, fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.02em", color: v("text") },
      h2: { fontFamily: FONT, fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.02em", color: v("text") },
      h3: { fontFamily: FONT, fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em", color: v("text") },
      h4: { fontFamily: FONT, fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em", color: v("text") },
      h5: { fontFamily: FONT, fontSize: "1.125rem", fontWeight: 600, color: v("text") },
      h6: { fontFamily: FONT, fontSize: "1rem", fontWeight: 600, color: v("text") },
      subtitle1: { fontFamily: FONT, fontSize: "1rem", fontWeight: 500 },
      subtitle2: { fontFamily: FONT, fontSize: "0.875rem", fontWeight: 500 },
      body1: { fontFamily: FONT, fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.55 },
      body2: { fontFamily: FONT, fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
      button: { fontFamily: FONT, fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
      caption: { fontFamily: FONT, fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5 },
      overline: { fontFamily: FONT },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": { ...toCssVars(t), colorScheme: mode },
          body: {
            backgroundColor: `${t.bg} !important`,
            color: t.text,
            fontFamily: FONT,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          // native date/time picker icons follow the theme
          "input::-webkit-calendar-picker-indicator": { filter: dark ? "invert(0.85)" : "none", cursor: "pointer" },
          "@keyframes ptDialogIn": {
            from: { opacity: 0, transform: "translateY(12px) scale(0.97)" },
            to: { opacity: 1, transform: "none" },
          },
          "::selection": { background: dark ? "rgba(59,130,246,0.35)" : "#dbe7ff" },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            background: t.borderStrong,
            borderRadius: 8,
            border: `2px solid ${t.bg}`,
          },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          ":focus-visible": { outline: `2px solid ${t.accent}`, outlineOffset: 2 },
          // SweetAlert2 popups, matched to the design system
          ".swal2-container": { zIndex: "2000 !important", fontFamily: FONT },
          ".swal2-popup.pt-swal": {
            background: `${t.surface} !important`,
            color: `${t.text2} !important`,
            border: `1px solid ${t.border}`,
            borderRadius: "14px !important",
            boxShadow: t.shadowXl,
            padding: "24px !important",
            width: "26rem !important",
          },
          ".swal2-popup.pt-swal .swal2-title": { color: t.text, fontSize: "1.125rem", fontWeight: 600 },
          ".swal2-popup.pt-swal .swal2-html-container": { fontSize: "0.875rem", color: t.text2 },
          ".swal2-popup.pt-swal .swal2-icon": { transform: "scale(0.7)", margin: "0 auto -8px" },
          ".pt-swal-btn": {
            background: t.surface,
            color: t.text,
            border: `1px solid ${t.borderStrong}`,
            borderRadius: 8,
            padding: "8px 18px",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            "&:hover": { background: t.hover },
          },
          ".swal2-popup.pt-swal-toast": {
            background: `${t.surface} !important`,
            color: `${t.text} !important`,
            border: `1px solid ${t.border}`,
            borderRadius: "10px !important",
            boxShadow: `${t.shadowLg} !important`,
            padding: "10px 14px !important",
          },
          ".swal2-popup.pt-swal-toast .swal2-title": { fontSize: "0.875rem !important", fontWeight: 500, color: t.text },
          ".swal2-popup.pt-swal-toast .swal2-timer-progress-bar": { background: t.accent },
        },
      },

      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            boxShadow: t.shadowSm,
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: 0,
            borderRadius: 8,
            boxShadow: "none",
            backgroundSize: "auto !important",
            gap: 6,
            "&:disabled": { opacity: 0.5 },
          },
          contained: {
            minHeight: 38,
            padding: "8px 16px",
            boxShadow: t.shadowSm,
            "&:hover": { boxShadow: t.shadowSm },
          },
          containedSizeSmall: { minHeight: 32, padding: "5px 12px", fontSize: "0.8125rem" },
          containedSizeLarge: { minHeight: 44, padding: "10px 20px", fontSize: "0.9375rem" },
          containedPrimary: {
            backgroundColor: t.accent,
            color: "#fff",
            "&:hover": { backgroundColor: t.accentHover },
            "&:focus:not(:hover)": { backgroundColor: t.accent },
          },
          containedError: {
            backgroundColor: t.dangerSolid,
            color: "#fff",
            "&:hover": { backgroundColor: t.dangerHover },
          },
          outlined: {
            minHeight: 38,
            padding: "7px 15px",
            color: t.text,
            borderColor: t.borderStrong,
            backgroundColor: t.surface,
            boxShadow: t.shadowSm,
            "&:hover": { opacity: 1, backgroundColor: t.hover, borderColor: t.borderStrong },
          },
          outlinedSizeSmall: { minHeight: 32, padding: "4px 11px", fontSize: "0.8125rem" },
          outlinedSizeLarge: { minHeight: 44, padding: "9px 19px" },
          outlinedPrimary: {
            color: t.text,
            borderColor: t.borderStrong,
            backgroundColor: t.surface,
            "&:hover": { backgroundColor: t.hover, borderColor: t.borderStrong },
          },
          outlinedSecondary: {
            color: t.text2,
            borderColor: t.borderStrong,
            backgroundColor: t.surface,
            "&:hover": { backgroundColor: t.hover, borderColor: t.borderStrong },
          },
          outlinedError: {
            color: t.danger,
            borderColor: t.dangerBorder,
            "&:hover": { backgroundColor: t.dangerSoft, borderColor: t.dangerBorder },
          },
          text: {
            minHeight: 36,
            padding: "6px 12px",
            color: t.text2,
            "&:hover": { backgroundColor: t.hover },
          },
          textSizeSmall: { minHeight: 30, padding: "4px 10px", fontSize: "0.8125rem" },
          textPrimary: { color: t.accentText, "&:hover": { color: t.accentText, backgroundColor: t.accentSoft } },
          textSecondary: { color: t.text2, "&:hover": { color: t.text } },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            color: t.text2,
            "&:hover": { backgroundColor: t.hover },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            borderRadius: 8,
            fontSize: "0.875rem",
            transition: "box-shadow .15s, border-color .15s",
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: t.text3 },
            "&.Mui-focused": {
              boxShadow: t.focus,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: t.accent, borderWidth: 1 },
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: t.danger },
          },
          notchedOutline: { borderColor: t.borderStrong },
          input: {
            color: t.text,
            "&::placeholder": { color: t.text3, opacity: 1 },
          },
          multiline: { color: t.text },
        },
      },

      MuiInputBase: {
        styleOverrides: { input: { color: t.text } },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { color: t.text2, "&.Mui-focused": { color: t.accentText } },
        },
      },

      MuiFormLabel: {
        styleOverrides: { root: { color: t.text2 } },
      },

      MuiFormHelperText: {
        styleOverrides: { root: { marginLeft: 2, fontSize: "0.75rem" } },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            paddingRight: "32px !important",
            // The base theme zeroes vertical padding; without a floor, selects without
            // an explicit height collapse to one line of text.
            "&.MuiOutlinedInput-input": { boxSizing: "border-box", minHeight: "38px !important" },
          },
          icon: { display: "inline-block", color: t.text3, right: 8 },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadowLg,
            borderRadius: 10,
          },
          option: { fontSize: "0.875rem", color: t.text },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: { backgroundColor: "transparent", boxShadow: "none", borderRadius: 0 },
        },
      },

      // The template set TableHead to display:block, which breaks column alignment.
      MuiTableHead: {
        styleOverrides: { root: { display: "table-header-group", padding: 0, borderRadius: 0 } },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "12px 16px",
            fontSize: "0.875rem",
            color: t.text,
            borderBottom: `1px solid ${t.border}`,
          },
          head: {
            backgroundColor: t.surface2,
            color: t.text2,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color .12s",
            "&.MuiTableRow-hover:hover": { backgroundColor: t.hover },
            "&:last-child td": { borderBottom: 0 },
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: { color: t.text2, borderTop: `1px solid ${t.border}` },
          selectLabel: { fontSize: "0.8125rem" },
          displayedRows: { fontSize: "0.8125rem" },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "16px !important",
            boxShadow: dark ? t.shadowXl : "0 24px 48px -12px rgba(16,24,40,0.25)",
            overflow: "hidden",
            animation: "ptDialogIn .32s cubic-bezier(0.22, 1, 0.36, 1)",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: dark ? "rgba(0,0,0,0.6)" : "rgba(16,24,40,0.45)", backdropFilter: "blur(6px)" } },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { padding: "20px 24px 12px", fontSize: "1.125rem", fontWeight: 600, color: t.text },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "20px 24px",
            // MUI zeroes this after a title; keep the first field clear of the header divider.
            ".MuiDialogTitle-root + &": { paddingTop: 20 },
          },
        },
      },
      MuiDialogContentText: {
        styleOverrides: { root: { color: t.text2, fontSize: "0.875rem" } },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: { padding: "14px 24px", borderTop: `1px solid ${t.border}`, backgroundColor: t.surface2, gap: 8 },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: "0.75rem", height: 24 },
          label: { paddingLeft: 8, paddingRight: 8 },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: `${t.surface} !important`,
            border: `1px solid ${t.border}`,
            boxShadow: `${t.shadowLg} !important`,
            borderRadius: "10px !important",
            padding: "4px !important",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            color: t.text,
            borderRadius: 6,
            padding: "8px 10px",
            minHeight: "auto",
            "&:hover": { backgroundColor: t.hover, color: t.text },
            "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: t.accentSoft, color: t.accentText },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: { backgroundColor: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadowLg },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? "#f5f6f7" : "#101828",
            color: dark ? "#101828" : "#fff",
            fontSize: "0.75rem",
            fontWeight: 500,
            borderRadius: 6,
            padding: "6px 10px",
          },
          arrow: { color: dark ? "#f5f6f7" : "#101828" },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: t.border,
            backgroundImage: "none !important",
            opacity: 1,
            height: 1,
            margin: 0,
          },
          vertical: { backgroundImage: "none !important", width: 1, height: "auto", margin: 0 },
          light: { backgroundColor: t.border, backgroundImage: "none !important" },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10, fontSize: "0.875rem", alignItems: "center" },
          standardError: { backgroundColor: t.dangerSoft, color: t.danger, border: `1px solid ${t.dangerBorder}` },
          standardWarning: { backgroundColor: t.warningSoft, color: t.warning, border: `1px solid ${t.warningBorder}` },
          standardSuccess: { backgroundColor: t.successSoft, color: t.success, border: `1px solid ${t.successBorder}` },
          standardInfo: { backgroundColor: t.accentSoft, color: t.accentText, border: `1px solid ${t.border}` },
        },
      },

      MuiSkeleton: {
        styleOverrides: { root: { backgroundColor: t.hover } },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 3, backgroundColor: t.hover, overflow: "hidden" },
          bar: { borderRadius: 3 },
        },
      },

      MuiCircularProgress: {
        defaultProps: { color: "primary" },
      },

      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 2,
            gap: 2,
          },
          grouped: { border: "0 !important", borderRadius: "6px !important", margin: 0 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.8125rem",
            color: t.text2,
            padding: "4px 12px",
            "&:hover": { backgroundColor: t.hover },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: t.surface,
              color: t.text,
              boxShadow: t.shadowSm,
            },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: { backgroundColor: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 2 },
          indicator: { backgroundColor: t.surface, borderRadius: 6, boxShadow: t.shadowSm },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 500, fontSize: "0.8125rem", color: t.text2, "&.Mui-selected": { color: t.text } },
        },
      },

      // Compact iOS-style switch in the accent color.
      MuiSwitch: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: { width: 40, height: 24, padding: 0, overflow: "visible", margin: "0 4px" },
          switchBase: {
            padding: 3,
            color: "#fff",
            "&:hover": { backgroundColor: "transparent" },
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& .MuiSwitch-thumb": { borderColor: "transparent !important" },
              "& + .MuiSwitch-track": {
                backgroundColor: `${t.accent} !important`,
                borderColor: `${t.accent} !important`,
                opacity: 1,
              },
            },
            "&.Mui-focusVisible + .MuiSwitch-track": { boxShadow: t.focus },
            "&.Mui-disabled + .MuiSwitch-track": { opacity: "0.4 !important" },
          },
          thumb: {
            width: 18,
            height: 18,
            backgroundColor: "#fff",
            border: "0 !important",
            boxShadow: "0 1px 2px rgba(16,24,40,0.2)",
            backgroundImage: "none !important",
          },
          track: {
            width: 40,
            height: 24,
            borderRadius: 12,
            backgroundColor: t.borderStrong,
            border: "0 !important",
            opacity: 1,
          },
          sizeSmall: {
            width: 32,
            height: 20,
            "& .MuiSwitch-switchBase": { padding: 3 },
            "& .MuiSwitch-switchBase.Mui-checked": { transform: "translateX(12px)" },
            "& .MuiSwitch-thumb": { width: 14, height: 14 },
            "& .MuiSwitch-track": { width: 32, height: 20, borderRadius: 10 },
          },
        },
      },

      MuiIcon: {
        defaultProps: { baseClassName: "material-icons-outlined" },
      },

      MuiBreadcrumbs: {
        styleOverrides: { li: { lineHeight: 1 }, separator: { color: t.text3 } },
      },
    },
  });
}
