import { useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// App shell
import Sidenav from "examples/Sidenav";

// Base themes + enterprise design layer
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import { withEnterprise } from "assets/theme/enterprise";

import routes from "routes";
import { useMaterialUIController } from "context";
import { canAccess, getUserRoles, homeRoute, navLabel } from "auth/roles";

export default function App() {
  const [controller] = useMaterialUIController();
  const { layout, darkMode, accent } = controller;
  const { pathname } = useLocation();

  const activeTheme = useMemo(
    () => withEnterprise(darkMode ? themeDark : theme, darkMode ? "dark" : "light", accent),
    [darkMode, accent]
  );

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const roles = useMemo(() => getUserRoles(), []);
  const home = homeRoute(routes, roles);
  // Only pages this role may open are shown; the rest redirect to the user's home page.
  const allowedRoutes = useMemo(
    () => routes.filter((r) => canAccess(r.key, roles)).map((r) => ({ ...r, name: navLabel(r, roles) })),
    [roles]
  );

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={canAccess(route.key, roles) ? route.component : <Navigate to={home} replace />}
            key={route.key}
          />
        );
      }

      return null;
    });

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {layout === "dashboard" && <Sidenav brandName="Performance Tracker" routes={allowedRoutes} />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to={home} />} />
      </Routes>
    </ThemeProvider>
  );
}
