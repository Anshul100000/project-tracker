import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import BasicLayout from "layouts/authentication/components/BasicLayout";

import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import keycloak from "../../../auth/keycloak";

function Basic() {
  const handleKeycloakLogin = () => {
    keycloak.login({
      redirectUri: window.location.origin,
    });
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography
            variant="h4"
            fontWeight="medium"
            color="white"
            mt={1}
          >
            Sign in
          </MDTypography>
        </MDBox>

        <MDBox
          pt={4}
          pb={3}
          px={3}
        >
          <MDBox>
            <MDTypography
              variant="body2"
              color="text"
              textAlign="center"
              mb={3}
            >
              Sign in using your Keycloak account
            </MDTypography>

            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={handleKeycloakLogin}
            >
              Sign in with Keycloak
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;