import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import { enter } from "layouts/dashboard/animations";
import { v } from "assets/theme/enterprise";
import { bannerCity } from "assets/images/pt";
import AnimatedIcon from "components/AnimatedIcon";

// Colored greeting banner at the top of the dashboard. Static gradient, no motion.
function WelcomeBanner({ title, date, highlights, children }) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        mb: 3,
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 3.5 },
        color: "#fff",
        backgroundImage: `linear-gradient(120deg, color-mix(in srgb, ${v("brandFrom")} 92%, transparent) 0%, color-mix(in srgb, ${v("brandTo")} 80%, transparent) 100%), url(${bannerCity})`,
        backgroundSize: "cover",
        backgroundPosition: "center 70%",
        boxShadow: `0 16px 32px -16px ${v("brandFrom")}`,
        ...enter(0),
      }}
    >
      {/* soft decorative rings */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: -80,
          top: -120,
          width: 360,
          height: 360,
          borderRadius: "50%",
          border: "56px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: 180,
          bottom: -140,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />

      <Box position="relative" display="flex" flexWrap="wrap" gap={2.5} alignItems="center" justifyContent="space-between">
        <Box minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} mb={0.75}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                backgroundColor: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <AnimatedIcon name="activity" size={22} color="#ffffff" speed={0.8} />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{date}</Typography>
          </Box>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.25 }}
          >
            {title}
          </Typography>
          {highlights.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1} mt={1.5}>
              {highlights.map((h) => (
                <Box
                  key={h.label}
                  display="inline-flex"
                  alignItems="center"
                  gap={0.75}
                  px={1.25}
                  py={0.5}
                  sx={{
                    borderRadius: "999px",
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Icon sx={{ fontSize: "16px !important", color: h.color }}>{h.icon}</Icon>
                  {h.label}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

WelcomeBanner.defaultProps = { highlights: [], children: null };
WelcomeBanner.propTypes = {
  title: PropTypes.node.isRequired,
  date: PropTypes.node.isRequired,
  highlights: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, icon: PropTypes.string, color: PropTypes.string })
  ),
  children: PropTypes.node,
};

export default WelcomeBanner;
