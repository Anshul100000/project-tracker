import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import { v } from "assets/theme/enterprise";

const TONES = {
  success: { fg: "success", bg: "successSoft", border: "successBorder" },
  warning: { fg: "warning", bg: "warningSoft", border: "warningBorder" },
  danger: { fg: "danger", bg: "dangerSoft", border: "dangerBorder" },
  neutral: { fg: "text2", bg: "hover", border: "border" },
};

// Small status label: colored dot + text, so state is never conveyed by color alone.
function StatusPill({ label, tone }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.25,
        borderRadius: "6px",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        color: v(t.fg),
        backgroundColor: v(t.bg),
        border: `1px solid ${v(t.border)}`,
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor" }} />
      {label}
    </Box>
  );
}

StatusPill.defaultProps = { tone: "neutral" };
StatusPill.propTypes = {
  label: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["success", "warning", "danger", "neutral"]),
};

export default StatusPill;
