import { useMemo } from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from "chart.js";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { tokens, v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { normalizeKra } from "layouts/dashboard/utils/apiShape";

ChartJS.register(ArcElement, ChartTooltip);

// Status colors are reserved for state and always shown with a text label.
const STATUS = [
  { key: "track", label: "On track", min: 75, color: "#17b26a" },
  { key: "progress", label: "In progress", min: 40, color: "#f79009" },
  { key: "risk", label: "At risk", min: 0, color: "#f04438" },
];

function KraStatus({ kras, loading, darkMode, delay }) {
  const { counts, avg, total } = useMemo(() => {
    const list = kras.map(normalizeKra).filter((k) => k.active);
    const c = STATUS.map((s) => ({ ...s, n: list.filter((k) => STATUS.find((x) => k.progress >= x.min).key === s.key).length }));
    const a = list.length ? Math.round(list.reduce((sum, k) => sum + k.progress, 0) / list.length) : 0;
    return { counts: c, avg: a, total: list.length };
  }, [kras]);

  const t = darkMode ? tokens.dark : tokens.light;

  return (
    <Panel title="KRA status" subtitle={`${total} active KRAs`} icon="chart-pie" hue="rose" delay={delay}>
      {loading ? (
        <Skeleton variant="circular" width={180} height={180} sx={{ mx: "auto" }} />
      ) : (
        <>
          <Box position="relative" height={200}>
            <Doughnut
              data={{
                labels: counts.map((s) => s.label),
                datasets: [{ data: counts.map((s) => s.n), backgroundColor: counts.map((s) => s.color), borderColor: t.surface, borderWidth: 3, hoverOffset: 6 }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "74%",
                animation: { animateRotate: true, duration: 900 },
                plugins: {
                  legend: { display: false },
                  tooltip: { backgroundColor: t.surface, titleColor: t.text, bodyColor: t.text2, borderColor: t.border, borderWidth: 1 },
                },
              }}
              aria-label="KRA status breakdown"
              role="img"
            />
            <Box position="absolute" sx={{ inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
              <Box textAlign="center">
                <Typography sx={{ fontSize: 30, fontWeight: 700, color: v("text"), lineHeight: 1 }}>{avg}%</Typography>
                <Typography sx={{ fontSize: 12, color: v("text3"), mt: 0.5 }}>avg. progress</Typography>
              </Box>
            </Box>
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} mt={2}>
            {counts.map((s) => (
              <Box key={s.key} textAlign="center" py={1} sx={{ borderRadius: "10px", backgroundColor: v("surface2"), border: `1px solid ${v("border")}` }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: v("text") }}>{s.n}</Typography>
                <Box display="inline-flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: s.color }} />
                  <Typography sx={{ fontSize: 11.5, color: v("text2") }}>{s.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Panel>
  );
}

KraStatus.defaultProps = { delay: 0 };
KraStatus.propTypes = {
  kras: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default KraStatus;
