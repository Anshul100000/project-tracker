import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MaterialUIControllerProvider } from "context";
import App from "./App";
import keycloak from "./auth/keycloak";

const container = document.getElementById("app");
const root = createRoot(container);


keycloak
    .init({
        onLoad: "login-required",
        checkLoginIframe: false,
    })
    .then((authenticated) => {
        if (authenticated) {

            root.render(
                <BrowserRouter>
                    <MaterialUIControllerProvider>
                        <App />
                    </MaterialUIControllerProvider>
                </BrowserRouter>
            );
        }
    })
    .catch((error) => {
        console.error("Keycloak initialization failed:", error);
    });


    

// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";

// import App from "./App";

// // Material Dashboard Context Provider
// import {
//   MaterialUIControllerProvider,
// } from "context";

// const container = document.getElementById("app");

// const root = createRoot(container);

// root.render(
//   <BrowserRouter>
//     <MaterialUIControllerProvider>
//       <App />
//     </MaterialUIControllerProvider>
//   </BrowserRouter>
// );