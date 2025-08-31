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

/* -------------------------------- Auth API -------------------------------- */
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
};

export async function getTotalEntries() {
  const res = await fetch("/api/total-entries");
  if (!res.ok) throw new Error("Failed to fetch total entries");
  return res.json();
}

export async function getNumberEntries() {
  const res = await fetch("/api/number-entries");
  if (!res.ok) throw new Error("Failed to fetch total number of entries");
  return res.json();
}

export async function searchDatabase(query) {
  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search database");
  return res.json();
}

export async function submitData(data) {
  const res = await fetch("/api/submit", {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Failed to submit data");
  return res.json();
}

export async function getAutofillSuggestions(type, query, limit = 5) {
  const res = await fetch(
    `/api/autofill/suggestions/${encodeURIComponent(
      type
    )}?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch autofill suggestions");
  return res.json();
}

export async function getAutofillData(type, query) {
  const res = await fetch(
    `/api/autofill/data/${encodeURIComponent(type)}?query=${encodeURIComponent(
      query
    )}`
  );
  if (!res.ok) throw new Error("Failed to fetch autofill data");
  return res.json();
}

export async function getLatestEntry() {
  const res = await fetch("/api/latest-entry");
  if (!res.ok) throw new Error("Failed to fetch latest entry");
  return res.json();
}

export async function getTopGenres(limit = null) {
  const res = await fetch(`/api/top-genres?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top genres");
  return res.json();
}

export async function getTopSynths(limit = null) {
  const res = await fetch(`/api/top-synths?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top synths");
  return res.json();
}

export async function getTopPresets(limit = null) {
  const res = await fetch(`/api/top-presets?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top presets");
  return res.json();
}

export default api;
