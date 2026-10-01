import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import { hueStyles } from "components/StatTile";
import MotionIcon from "components/MotionIcon";

// Small progress ring; the arc eases in when the value changes.
function Ring({ value, color, label }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <Tooltip title={label}>
      <Box position="relative" width={44} height={44} flexShrink={0}>
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
          <circle cx="22" cy="22" r={r} fill="none" stroke="var(--pt-hover)" strokeWidth="5" />
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            transform="rotate(-90 22 22)"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <Box position="absolute" sx={{ inset: 0, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: v("text2") }}>
          {Math.round(pct)}%
        </Box>
      </Box>
    </Tooltip>
  );
}

Ring.propTypes = { value: PropTypes.number.isRequired, color: PropTypes.string.isRequired, label: PropTypes.string.isRequired };
import { enter } from "layouts/dashboard/animations";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Eases from the previous value to the new one when live data changes.
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (prefersReducedMotion() || from === value) {
      setDisplay(value);
      fromRef.current = value;
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 700);
      setDisplay(Math.round(from + (value - from) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      fromRef.current = value;
    };
  }, [value]);

  return display.toLocaleString();
}

AnimatedNumber.propTypes = { value: PropTypes.number.isRequired };

function StatCard({ title, value, icon, motion, hue, ring, footer, loading, error, delay, onClick }) {
  const c = hueStyles(hue);
  return (
    <Box sx={{ height: "100%", ...enter(delay) }}>
      <Card
        onClick={onClick}
        role={onClick ? "link" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
        sx={{
          height: "100%",
          p: { xs: 2, sm: 2.5 },
          position: "relative",
          overflow: "hidden",
          backgroundImage: `radial-gradient(120% 90% at 100% 0%, ${c.soft} 0%, transparent 60%)`,
          cursor: onClick ? "pointer" : "default",
          transition: "border-color .15s, box-shadow .15s, transform .15s",
          "&:hover": onClick ? { borderColor: v("borderStrong"), boxShadow: v("shadowMd"), transform: "translateY(-2px)" } : {},
          "&:hover .stat-go": { opacity: 1, transform: "none" },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                backgroundColor: c.solid,
                color: "#fff",
                flexShrink: 0,
                boxShadow: `0 4px 10px -4px ${c.solid}`,
              }}
            >
              {motion ? (
                <MotionIcon name={motion} size={19} loop={4200} loopDelay={600 + delay * 2500} />
              ) : (
                <Icon sx={{ fontSize: "19px !important" }}>{icon}</Icon>
              )}
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text2") }} noWrap>
              {title}
            </Typography>
          </Box>
          {onClick && (
            <Icon
              className="stat-go"
              sx={{
                fontSize: "18px !important",
                color: v("text3"),
                display: { xs: "none", sm: "inline-block" },
                opacity: 0,
                transform: "translateX(-4px)",
                transition: "all .15s",
              }}
            >
              arrow_forward
            </Icon>
          )}
        </Box>

        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          {loading ? (
            <Skeleton variant="text" width={90} height={40} />
          ) : (
            <Typography
              sx={{
                fontSize: { xs: 24, sm: 30 },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                color: v("text"),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {error && value === 0 ? "—" : <AnimatedNumber value={value} />}
            </Typography>
          )}
          {!loading && ring && <Ring value={ring.value} color={c.solid} label={ring.label} />}
        </Box>

        <Box mt={0.75} minHeight={20} display="flex" alignItems="center">
          {error ? (
            <Tooltip title={error}>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: v("warning") }}>
                <Icon sx={{ fontSize: "16px !important" }}>error_outline</Icon>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: "inherit" }}>
                  {value ? "Showing last known value" : "Couldn't load"}
                </Typography>
              </Box>
            </Tooltip>
          ) : (
            <Typography sx={{ fontSize: 13, color: v("text3") }}>
              {loading ? <Skeleton width={110} /> : footer}
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}

StatCard.defaultProps = { motion: null, ring: null, hue: "blue", footer: null, loading: false, error: null, delay: 0, onClick: null };
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  hue: PropTypes.string,
  motion: PropTypes.string,
  ring: PropTypes.shape({ value: PropTypes.number, label: PropTypes.string }),
  footer: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
  delay: PropTypes.number,
  onClick: PropTypes.func,
};

export default StatCard;
