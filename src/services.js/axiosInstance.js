import axios from "axios";
import keycloak from "../auth/keycloak";
import base_url from "Baseurl";

const axiosInstance = axios.create({
  baseURL: base_url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Keycloak token before every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (!keycloak.authenticated) {
        return config;
      }

      // Refresh access token if it expires within 10 seconds
      await keycloak.updateToken(10);
      

      // Always use the latest access token
      config.headers.Authorization = `Bearer ${keycloak.token}`;

      return config;
    } catch (error) {
      console.error("Keycloak token refresh failed:", error);

      // Refresh token is no longer valid
      await keycloak.logout();

      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Friendly messages for statuses pages don't explain themselves.
const STATUS_MESSAGES = {
  403: "You don't have permission to perform this action or view this data.",
  404: "The requested record was not found.",
  409: "This conflicts with existing data (for example a duplicate).",
};

// 401 = authentication problem: refresh the token and retry once, else go to login.
// 403 = authorization problem: never treated as an expired login.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    if (status === 401 && config && !config._retried) {
      try {
        await keycloak.updateToken(-1); // force refresh
        config._retried = true;
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        return axiosInstance(config);
      } catch {
        keycloak.login();
        return Promise.reject(error);
      }
    }

    // Give pages a readable message when the backend didn't send one.
    if (response && STATUS_MESSAGES[status]) {
      const data = response.data && typeof response.data === "object" ? response.data : {};
      if (!data.message) response.data = { ...data, message: STATUS_MESSAGES[status] };
    }
    error.isForbidden = status === 403;

    return Promise.reject(error);
  }
);

export default axiosInstance;