import { useEffect } from "react";
import keycloak from "../../../auth/keycloak";

function Logout() {
  useEffect(() => {
    const logout = async () => {
      try {
        await keycloak.logout({
          redirectUri: `${window.location.origin}/authentication/sign-in`,
        });
      } catch (error) {
        console.error("Keycloak logout failed:", error);
      }
    };

    logout();
  }, []);

  return null;
}

export default Logout;