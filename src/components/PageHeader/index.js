import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Typography from "@mui/material/Typography";
import { HUES, v } from "assets/theme/enterprise";

function PageHeader({ title, description, actions, icon, hue }) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      mb={3}
    >
      <Box display="flex" alignItems="center" gap={1.75} minWidth={0}>
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "#fff",
              backgroundColor: v(hue),
              boxShadow: `0 6px 14px -6px ${v(hue)}`,
            }}
          >
            <Icon sx={{ fontSize: "22px !important" }}>{icon}</Icon>
          </Box>
        )}
        <Box minWidth={0}>
          <Typography component="h2" sx={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em", color: v("text"), lineHeight: 1.25 }}>
            {title}
          </Typography>
          {description && <Typography sx={{ fontSize: 14, color: v("text2"), mt: 0.25 }}>{description}</Typography>}
        </Box>
      </Box>
      {actions && (
        <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
          {actions}
        </Box>
      )}
    </Box>
  );
}

PageHeader.defaultProps = { description: null, actions: null, icon: null, hue: "blue" };
PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
  icon: PropTypes.string,
  hue: PropTypes.oneOf(HUES),
};

export default PageHeader;
