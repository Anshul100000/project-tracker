import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";

import { useMaterialUIController, setLayout } from "context";
import { SIDENAV_SPACE, SIDENAV_MINI_SPACE } from "examples/Sidenav";

// Horizontal page gutter; DashboardNavbar bleeds out of it with matching negative margins.
export const PAGE_GUTTER = { xs: 2, md: 4 };

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        px: PAGE_GUTTER,
        pb: 3,
        ml: { xs: 0, xl: `${miniSidenav ? SIDENAV_MINI_SPACE : SIDENAV_SPACE}px` },
        transition: "margin-left .25s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </Box>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
