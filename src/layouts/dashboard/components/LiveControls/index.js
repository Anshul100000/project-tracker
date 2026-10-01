import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import { pulse, spin } from "layouts/dashboard/animations";

export const INTERVALS = [
  { label: "Every 15s", value: 15000 },
  { label: "Every 30s", value: 30000 },
  { label: "Every 1m", value: 60000 },
  { label: "Every 5m", value: 300000 },
];

function relative(from, now) {
  if (!from) return "not yet";
  const s = Math.max(0, Math.round((now - from) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

// Ticks on its own so the once-a-second re-render stays local.
function UpdatedAgo({ at }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>Updated {relative(at, now)}</>;
}

UpdatedAgo.defaultProps = { at: null };
UpdatedAgo.propTypes = { at: PropTypes.instanceOf(Date) };

// `onColor` restyles the controls for placement on a colored banner.
const glass = {
  border: "1px solid rgba(255,255,255,0.28)",
  backgroundColor: "rgba(255,255,255,0.12)",
  color: "#fff",
  boxShadow: "none",
  backdropFilter: "blur(6px)",
};

function LiveControls({ live, onLiveChange, intervalMs, onIntervalChange, refreshing, onRefresh, lastUpdated, onColor }) {
  const box = onColor
    ? { ...glass, borderRadius: "8px" }
    : { border: `1px solid ${v("borderStrong")}`, borderRadius: "8px", backgroundColor: v("surface"), boxShadow: v("shadowSm") };
  const strong = onColor ? "#fff" : v("text");
  const muted = onColor ? "rgba(255,255,255,0.75)" : v("text3");
  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        pl={1.5}
        pr={0.5}
        height={38}
        sx={box}
      >
        <Box
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: live ? "#17b26a" : muted,
            animation: live ? `${pulse} 2s infinite` : "none",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: strong, whiteSpace: "nowrap" }}>
          {live ? "Live" : "Paused"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: muted, whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>
          · <UpdatedAgo at={lastUpdated} />
        </Typography>
        <Tooltip title={live ? "Pause auto-refresh" : "Resume auto-refresh"}>
          <Switch
            size="small"
            checked={live}
            onChange={(e) => onLiveChange(e.target.checked)}
            inputProps={{ "aria-label": "Auto-refresh" }}
            sx={onColor ? { "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#17b26a !important" }, "& .MuiSwitch-track": { backgroundColor: "rgba(255,255,255,0.35) !important" } } : undefined}
          />
        </Tooltip>
      </Box>

      <Select
        size="small"
        value={intervalMs}
        disabled={!live}
        onChange={(e) => onIntervalChange(Number(e.target.value))}
        inputProps={{ "aria-label": "Refresh interval" }}
        sx={{
          height: 38,
          minWidth: 120,
          fontSize: 13,
          boxShadow: v("shadowSm"),
          ...(onColor && {
            ...glass,
            "& .MuiOutlinedInput-notchedOutline": { border: 0 },
            "& .MuiSelect-select, & .MuiSelect-icon": { color: "#fff !important" },
            "&.Mui-disabled": { opacity: 0.6 },
            "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(255,255,255,0.25)" },
          }),
        }}
      >
        {INTERVALS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="outlined"
        onClick={onRefresh}
        sx={onColor ? { ...glass, "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.4)" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.7)" } } : undefined}
        disabled={refreshing}
        startIcon={
          <Icon sx={{ animation: refreshing ? `${spin} .8s linear infinite` : "none" }}>refresh</Icon>
        }
      >
        Refresh
      </Button>
    </Box>
  );
}

LiveControls.defaultProps = { lastUpdated: null, onColor: false };
LiveControls.propTypes = {
  live: PropTypes.bool.isRequired,
  onLiveChange: PropTypes.func.isRequired,
  intervalMs: PropTypes.number.isRequired,
  onIntervalChange: PropTypes.func.isRequired,
  refreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  lastUpdated: PropTypes.instanceOf(Date),
  onColor: PropTypes.bool,
};

export default LiveControls;
