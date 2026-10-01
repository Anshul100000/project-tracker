import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://192.168.0.120:8081",
    realm: "rkt",
    clientId: "performance-tracker-frontend",
});

export default keycloak;