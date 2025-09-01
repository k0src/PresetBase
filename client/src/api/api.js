// refactor with axios
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken = null;
let refreshToken = null;
let tokenRefreshHandler = null;

// Set tokens
const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;

  if (access) {
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Clear tokens
const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  delete api.defaults.headers.common["Authorization"];
};

// Set token refresh handler
const setTokenRefreshHandler = (handler) => {
  tokenRefreshHandler = handler;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        setTokens(newAccessToken, newRefreshToken);

        if (tokenRefreshHandler) {
          tokenRefreshHandler({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        if (tokenRefreshHandler) {
          tokenRefreshHandler(null);
        }

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      const { status, data } = error.response;

      const apiError = new Error(
        data?.error?.message || data?.message || `HTTP ${status} Error`
      );
      apiError.status = status;
      apiError.code = data?.error?.code || `HTTP_${status}`;
      apiError.details = data?.error?.details || data;
      apiError.response = error.response;

      return Promise.reject(apiError);
    } else if (error.request) {
      const networkError = new Error(
        "Network error - please check your connection"
      );
      networkError.code = "NETWORK_ERROR";
      networkError.isNetworkError = true;

      return Promise.reject(networkError);
    } else {
      return Promise.reject(error);
    }
  }
);

export const authAPI = {
  setTokens,
  clearTokens,
  setTokenRefreshHandler,

  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async register(username, email, password) {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  async logout(refreshToken) {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  },

  async getUserProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async updateUserProfile(updates) {
    const response = await api.put("/auth/me", updates);
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.put("/auth/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async deleteAccount(refreshToken) {
    const response = await api.delete("/auth/me", {
      data: { refreshToken },
    });
    return response.data;
  },

  async getUserPendingSubmissions() {
    const response = await api.get("/auth/me/pending-submissions");
    return response.data;
  },

  async getUserApprovedSubmissions() {
    const response = await api.get("/auth/me/approved-submissions");
    return response.data;
  },

  async deletePendingSubmission(submissionId) {
    const response = await api.delete(
      `/auth/me/pending-submissions/${submissionId}`
    );
    return response.data;
  },
};

export default api;
