import { useMemo } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { hueFor, v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { normalizeKra } from "layouts/dashboard/utils/apiShape";

const MEDALS = ["#f5b400", "#a3aab8", "#cd7f32"];

// Departments ranked by average KRA progress.
function Leaderboard({ kras, loading, delay }) {
  const rows = useMemo(() => {
    const byDept = new Map();
    kras
      .map(normalizeKra)
      .filter((k) => k.active && k.dept)
      .forEach((k) => {
        const e = byDept.get(k.dept) || { sum: 0, n: 0 };
        byDept.set(k.dept, { sum: e.sum + k.progress, n: e.n + 1 });
      });
    return [...byDept.entries()]
      .map(([dept, e]) => ({ dept, avg: Math.round(e.sum / e.n), n: e.n }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6);
  }, [kras]);

  return (
    <Panel title="Department leaderboard" subtitle="By average KRA progress" icon="trending-up" hue="emerald" delay={delay} bodySx={{ py: 1 }}>
      {loading && [...Array(4)].map((_, i) => <Skeleton key={i} height={48} />)}
      {!loading && rows.length === 0 && (
        <Typography sx={{ fontSize: 14, color: v("text3"), py: 5, textAlign: "center" }}>No KRA data yet</Typography>
      )}
      {!loading &&
        rows.map((r, i) => {
          const hue = hueFor(r.dept);
          return (
            <Box key={r.dept} display="flex" alignItems="center" gap={1.25} py={1.1} sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: i < 3 ? "#fff" : v("text2"),
                  backgroundColor: i < 3 ? MEDALS[i] : v("hover"),
                  boxShadow: i < 3 ? `0 4px 10px -4px ${MEDALS[i]}` : "none",
                }}
              >
                {i < 3 ? <Icon sx={{ fontSize: "16px !important" }}>emoji_events</Icon> : i + 1}
              </Box>
              <Box flex={1} minWidth={0}>
                <Box display="flex" justifyContent="space-between" gap={1} mb={0.5}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: v("text") }} noWrap>
                    {r.dept}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text") }}>{r.avg}%</Typography>
                </Box>
                <Box height={6} sx={{ borderRadius: 3, backgroundColor: v("hover"), overflow: "hidden" }}>
                  <Box height="100%" sx={{ width: `${r.avg}%`, borderRadius: 3, backgroundColor: v(hue), transition: "width .8s ease" }} />
                </Box>
                <Typography sx={{ fontSize: 11.5, color: v("text3"), mt: 0.25 }}>
                  {r.n} KRA{r.n === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Box>
          );
        })}
    </Panel>
  );
}

Leaderboard.defaultProps = { delay: 0 };
Leaderboard.propTypes = { kras: PropTypes.arrayOf(PropTypes.object).isRequired, loading: PropTypes.bool.isRequired, delay: PropTypes.number };

export default Leaderboard;
