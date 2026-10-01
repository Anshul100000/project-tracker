import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { HUES, v } from "assets/theme/enterprise";

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

const initialsOf = (text = "") =>
  String(text)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const ACTION_TONES = {
  default: { fg: "text2", hover: "hover" },
  accent: { fg: "accentText", hover: "accentSoft" },
  danger: { fg: "danger", hover: "dangerSoft" },
};

/**
 * One record rendered as a card.
 * avatar: initials text, or an icon name when `avatarIcon` is set.
 */
function RecordCard({ title, subtitle, avatar, avatarIcon, hue, status, meta, progress, description, actions, index }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        animation: `${rise} .45s cubic-bezier(0.22,1,0.36,1) ${Math.min(index, 12) * 0.035}s both`,
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: v("shadowLg"),
          borderColor: v("borderStrong"),
        },
        "&:hover .rc-actions": { opacity: 1 },
        // colored accent strip
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 3,
          backgroundColor: v(hue),
          opacity: 0.9,
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none", "&:hover": { transform: "none" } },
      }}
    >
      <Box p={2.25} pb={1.5} flex={1}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: avatarIcon ? "12px" : "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: v(`${hue}Soft`),
              color: v(`${hue}Ink`),
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {avatarIcon ? <Icon sx={{ fontSize: "20px !important" }}>{avatarIcon}</Icon> : initialsOf(avatar || title)}
          </Box>
          <Box minWidth={0} flex={1}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: v("text"), lineHeight: 1.3 }} noWrap title={String(title)}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ fontSize: 13, color: v("text3"), mt: 0.25 }} noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
          {status && <Box flexShrink={0}>{status}</Box>}
        </Box>

        {description && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 13,
              color: v("text2"),
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}

        {meta.length > 0 && (
          <Box mt={1.75} display="grid" gap={1}>
            {meta.map((m) => (
              <Box key={m.label} display="flex" alignItems="center" gap={1} minWidth={0}>
                <Icon sx={{ fontSize: "16px !important", color: v("text3"), flexShrink: 0 }}>{m.icon}</Icon>
                <Typography sx={{ fontSize: 13, color: v("text3"), flexShrink: 0 }}>{m.label}</Typography>
                <Typography
                  sx={{ fontSize: 13, color: v("text"), fontWeight: 500, ml: "auto", textAlign: "right", minWidth: 0 }}
                  noWrap
                >
                  {m.value ?? "—"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {typeof progress === "number" && (
          <Box mt={1.75}>
            <Box display="flex" justifyContent="space-between" mb={0.75}>
              <Typography sx={{ fontSize: 12, color: v("text3") }}>Progress</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: v("text") }}>{progress}%</Typography>
            </Box>
            <Box height={6} sx={{ borderRadius: 3, backgroundColor: v("hover"), overflow: "hidden" }}>
              <Box
                height="100%"
                sx={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                  borderRadius: 3,
                  backgroundColor: progress >= 75 ? "#17b26a" : progress >= 40 ? "#f79009" : "#f04438",
                  transition: "width .6s ease",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {actions.length > 0 && (
        <Box
          className="rc-actions"
          px={1.25}
          py={0.75}
          display="flex"
          justifyContent="flex-end"
          gap={0.25}
          sx={{ borderTop: `1px solid ${v("border")}`, backgroundColor: v("surface2") }}
        >
          {actions.map((a) => {
            const t = ACTION_TONES[a.tone] || ACTION_TONES.default;
            return (
              <Tooltip key={a.label} title={a.label}>
                <IconButton
                  size="small"
                  aria-label={a.label}
                  onClick={a.onClick}
                  sx={{ color: v(t.fg), "&:hover": { backgroundColor: v(t.hover) } }}
                >
                  <Icon sx={{ fontSize: "18px !important" }}>{a.icon}</Icon>
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Card>
  );
}

RecordCard.defaultProps = {
  subtitle: null,
  avatar: null,
  avatarIcon: null,
  hue: "blue",
  status: null,
  meta: [],
  progress: null,
  description: null,
  actions: [],
  index: 0,
};

RecordCard.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  avatar: PropTypes.string,
  avatarIcon: PropTypes.string,
  hue: PropTypes.oneOf(HUES),
  status: PropTypes.node,
  meta: PropTypes.arrayOf(PropTypes.shape({ icon: PropTypes.string, label: PropTypes.string, value: PropTypes.node })),
  progress: PropTypes.number,
  description: PropTypes.node,
  actions: PropTypes.arrayOf(
    PropTypes.shape({ icon: PropTypes.string, label: PropTypes.string, onClick: PropTypes.func, tone: PropTypes.string })
  ),
  index: PropTypes.number,
};

// Grid wrapper with loading skeletons and an empty state.
export function CardGrid({ loading, empty, emptyText, children }) {
  return (
    <Box
      p={{ xs: 1.5, sm: 2 }}
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        backgroundColor: v("surface2"),
      }}
    >
      {loading &&
        [...Array(6)].map((_, i) => (
          <Card key={i} sx={{ p: 2.25 }}>
            <Box display="flex" gap={1.5} alignItems="center">
              <Skeleton variant="circular" width={42} height={42} />
              <Box flex={1}>
                <Skeleton width="70%" />
                <Skeleton width="40%" />
              </Box>
            </Box>
            <Skeleton sx={{ mt: 2 }} />
            <Skeleton width="80%" />
          </Card>
        ))}
      {!loading && empty && (
        <Box gridColumn="1 / -1" py={6} textAlign="center">
          <Icon sx={{ fontSize: "40px !important", color: v("text3") }}>inbox</Icon>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text2"), mt: 1 }}>{emptyText}</Typography>
        </Box>
      )}
      {!loading && !empty && children}
    </Box>
  );
}

CardGrid.defaultProps = { loading: false, empty: false, emptyText: "Nothing to show", children: null };
CardGrid.propTypes = {
  loading: PropTypes.bool,
  empty: PropTypes.bool,
  emptyText: PropTypes.string,
  children: PropTypes.node,
};

export default RecordCard;
