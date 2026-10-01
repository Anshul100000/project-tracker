import keycloak from "auth/keycloak";

export default function currentUser() {
  const t = keycloak.tokenParsed || {};
  const name = t.name || [t.given_name, t.family_name].filter(Boolean).join(" ") || t.preferred_username || "User";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "U";

  return {
    name,
    firstName: t.given_name || name.split(" ")[0],
    email: t.email || t.preferred_username || "",
    initials,
  };
}
