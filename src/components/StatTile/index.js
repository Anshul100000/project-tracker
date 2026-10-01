import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import { HUES, v } from "assets/theme/enterprise";

// Older call sites pass a semantic tone; map it to a hue.
const TONE_TO_HUE = { accent: "blue", success: "emerald", warning: "amber", danger: "rose", neutral: "slate" };

export function hueStyles(hue) {
  if (hue === "slate") return { solid: v("text3"), soft: v("hover"), ink: v("text2") };
  return { solid: v(hue), soft: v(`${hue}Soft`), ink: v(`${hue}Ink`) };
}

// Summary number card used across pages; matches the dashboard KPI cards.
function StatTile({ title, value, icon, description, tone, hue }) {
  const c = hueStyles(hue || TONE_TO_HUE[tone] || "blue");
  return (
    <Card
      sx={{
        height: "100%",
        p: { xs: 2, sm: 2.5 },
        position: "relative",
        overflow: "hidden",
        backgroundImage: `radial-gradient(120% 90% at 100% 0%, ${c.soft} 0%, transparent 60%)`,
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text2") }} noWrap>
            {title}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: 24, sm: 28 },
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: v("text"),
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            backgroundColor: c.solid,
            color: "#fff",
            flexShrink: 0,
            boxShadow: `0 4px 10px -4px ${c.solid}`,
            "& svg, & .MuiIcon-root": { fontSize: "20px !important", color: "#fff" },
          }}
        >
          {typeof icon === "string" ? <Icon>{icon}</Icon> : icon}
        </Box>
      </Box>
      {description && <Typography sx={{ mt: 0.75, fontSize: 13, color: v("text3") }}>{description}</Typography>}
    </Card>
  );
}

StatTile.defaultProps = { description: null, tone: "accent", hue: null };
StatTile.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  description: PropTypes.node,
  tone: PropTypes.oneOf(["accent", "success", "warning", "danger", "neutral"]),
  hue: PropTypes.oneOf([...HUES, "slate"]),
};

export default StatTile;
