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
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;

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

// Auth API
export const authAPI = {
  setTokens,
  clearTokens,
  setTokenRefreshHandler,

  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  async register(username, email, password) {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    return res.data;
  },

  async logout(refreshToken) {
    const res = await api.post("/auth/logout", { refreshToken });
    return res.data;
  },

  async getUserProfile() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async updateUserProfile(updates) {
    const res = await api.put("/auth/me", updates);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.put("/auth/password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  async deleteAccount(refreshToken) {
    const res = await api.delete("/auth/me", {
      data: { refreshToken },
    });
    return res.data;
  },

  async getUserPendingSubmissions() {
    const res = await api.get("/auth/me/pending-submissions");
    return res.data;
  },

  async getUserApprovedSubmissions() {
    const res = await api.get("/auth/me/approved-submissions");
    return res.data;
  },

  async deletePendingSubmission(submissionId) {
    const res = await api.delete(
      `/auth/me/pending-submissions/${submissionId}`
    );
    return res.data;
  },
};

export default api;
