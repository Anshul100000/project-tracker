import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import { enter } from "layouts/dashboard/animations";
import MotionIcon from "components/MotionIcon";

// Card with a title row, optional actions, and a divider under the header.
function Panel({ title, subtitle, actions, delay, children, bodySx, icon, hue }) {
  return (
    <Box sx={{ height: "100%", ...enter(delay) }}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          px={2.5}
          py={2}
          display="flex"
          flexWrap="wrap"
          gap={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderBottom: `1px solid ${v("border")}` }}
        >
          <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
            {icon && (
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  backgroundColor: v(`${hue}Soft`),
                  color: v(`${hue}Ink`),
                }}
              >
                <MotionIcon name={icon} size={18} loop={6000} loopDelay={800 + delay * 1000} />
              </Box>
            )}
            <Box minWidth={0}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: v("text") }}>{title}</Typography>
              {subtitle && <Typography sx={{ fontSize: 13, color: v("text3"), mt: 0.25 }}>{subtitle}</Typography>}
            </Box>
          </Box>
          {actions}
        </Box>
        <Box flex={1} p={2.5} display="flex" flexDirection="column" sx={bodySx}>
          {children}
        </Box>
      </Card>
    </Box>
  );
}

Panel.defaultProps = { subtitle: null, actions: null, delay: 0, bodySx: {}, icon: null, hue: "blue" };
Panel.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  delay: PropTypes.number,
  children: PropTypes.node.isRequired,
  bodySx: PropTypes.object,
  icon: PropTypes.string,
  hue: PropTypes.string,
};

export default Panel;
