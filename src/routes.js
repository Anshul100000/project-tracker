import Icon from "@mui/material/Icon";

import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Profile from "layouts/profile";
import Kra from "layouts/KRA";
import Projects from "layouts/project";
import Departments from "layouts/department";
import Logout from "layouts/authentication/logout";
import Employee from "layouts/employee";
import KpaTasks from "layouts/kpaTasks";

// `section` groups items in the sidebar; `hidden` keeps a route out of the nav.
const routes = [
  {
    type: "collapse",
    section: "Overview",
    name: "Dashboard",
    key: "dashboard",
    hue: "indigo",
    icon: <Icon>space_dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    section: "Organization",
    name: "Employees",
    key: "employee",
    hue: "blue",
    icon: <Icon>badge</Icon>,
    route: "/employee",
    component: <Employee />,
  },
  {
    type: "collapse",
    section: "Organization",
    name: "Departments",
    key: "department",
    hue: "violet",
    icon: <Icon>apartment</Icon>,
    route: "/department",
    component: <Departments />,
  },
  {
    type: "collapse",
    section: "Organization",
    name: "Projects",
    key: "projects",
    hue: "teal",
    icon: <Icon>folder</Icon>,
    route: "/projects",
    component: <Projects />,
  },
   {
    type: "collapse",
    section: "Performance",
    name: "KRAs",
    key: "kra",
    hue: "rose",
    icon: <Icon>flag</Icon>,
    route: "/kra",
    component: <Kra />,
  },
  {
    type: "collapse",
    section: "Performance",
    name: "KPAs",
    key: "tables",
    hue: "amber",
    icon: <Icon>checklist</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    section: "Performance",
    name: "KPA Tasks",
    key: "kpa-tasks",
    hue: "emerald",
    icon: <Icon>task_alt</Icon>,
    route: "/kpa-tasks",
    component: <KpaTasks />,
  },
 
  {
    type: "collapse",
    section: "Account",
    name: "Profile",
    key: "profile",
    hue: "sky",
    icon: <Icon>account_circle</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign out",
    key: "logout",
    hue: "rose",
    icon: <Icon>logout</Icon>,
    route: "/logout",
    component: <Logout />,
    hidden: true,
  },
];

export default routes;
