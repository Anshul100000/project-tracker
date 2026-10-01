import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { normalizeKra } from "layouts/dashboard/utils/apiShape";

const SHOW = 6;

// Status always carries an icon + label, never color alone.
function status(progress) {
  if (progress >= 75) return { label: "On track", icon: "trending_up", tone: "success" };
  if (progress >= 40) return { label: "In progress", icon: "trending_flat", tone: "warning" };
  return { label: "At risk", icon: "trending_down", tone: "danger" };
}

function KraProgress({ kras, loading, delay }) {
  const [order, setOrder] = useState("risk");

  const { rows, average, atRisk } = useMemo(() => {
    const list = kras.map(normalizeKra).filter((k) => k.active);
    const sorted = [...list].sort((a, b) => (order === "risk" ? a.progress - b.progress : b.progress - a.progress));
    const avg = list.length ? Math.round(list.reduce((s, k) => s + k.progress, 0) / list.length) : 0;
    return { rows: sorted.slice(0, SHOW), average: avg, atRisk: list.filter((k) => k.progress < 40).length };
  }, [kras, order]);

  return (
    <Panel
      title="KRA progress"
      subtitle={loading ? " " : `Average ${average}% · ${atRisk} at risk`}
      delay={delay}
      icon="activity"
      hue="rose"
      actions={
        <ToggleButtonGroup exclusive size="small" value={order} onChange={(_, val) => val && setOrder(val)} aria-label="Sort KRAs">
          <ToggleButton value="risk">Needs attention</ToggleButton>
          <ToggleButton value="top">Top</ToggleButton>
        </ToggleButtonGroup>
      }
      bodySx={{ py: 1 }}
    >
      {loading && [...Array(4)].map((_, i) => <Skeleton key={i} height={52} />)}
      {!loading && rows.length === 0 && (
        <Typography sx={{ fontSize: 14, color: v("text3"), py: 5, textAlign: "center" }}>No KRAs found</Typography>
      )}
      {!loading &&
        rows.map((kra) => {
          const s = status(kra.progress);
          return (
            <Box key={kra.id} py={1.5} sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                <Box minWidth={0}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }} noWrap>
                    {kra.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
                    {[kra.projectName, kra.dept].filter(Boolean).join(" · ") || "—"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.75} flexShrink={0} sx={{ color: v(s.tone) }}>
                  <Icon sx={{ fontSize: "16px !important" }}>{s.icon}</Icon>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: "inherit", display: { xs: "none", sm: "block" } }}>
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: v("text"), minWidth: 36, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                  >
                    {kra.progress}%
                  </Typography>
                </Box>
              </Box>
              <Box height={6} sx={{ borderRadius: 3, backgroundColor: v("hover"), overflow: "hidden" }}>
                <Box
                  height="100%"
                  sx={{ width: `${kra.progress}%`, backgroundColor: v(s.tone), borderRadius: 3, transition: "width .6s ease" }}
                />
              </Box>
            </Box>
          );
        })}
    </Panel>
  );
}

KraProgress.defaultProps = { delay: 0 };
KraProgress.propTypes = {
  kras: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default KraProgress;
