import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";

function Footer() {
  return (
    <Box
      component="footer"
      mt="auto"
      pt={4}
      display="flex"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography sx={{ fontSize: 12, color: v("text3") }}>
        © {new Date().getFullYear()} Performance Tracker. All rights reserved.
      </Typography>
      <Typography sx={{ fontSize: 12, color: v("text3") }}>v2.2.0</Typography>
    </Box>
  );
}

export default Footer;
