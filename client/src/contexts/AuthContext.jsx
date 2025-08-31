import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

import { authAPI } from "../api/api";

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        },
        error: null,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "UPDATE_TOKENS":
      return {
        ...state,
        tokens: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  loading: true,
  error: null,
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const handleTokenRefresh = useCallback((newTokens) => {
    if (newTokens) {
      localStorage.setItem("accessToken", newTokens.accessToken);
      localStorage.setItem("refreshToken", newTokens.refreshToken);

      dispatch({ type: "UPDATE_TOKENS", payload: newTokens });
    } else {
      console.warn("Token refresh failed, logging out");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      authAPI.clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          authAPI.setTokens(accessToken, refreshToken);
          authAPI.setTokenRefreshHandler(handleTokenRefresh);
          const response = await authAPI.getUserProfile();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.user,
              accessToken,
              refreshToken,
            },
          });
        } else {
          dispatch({ type: "LOGOUT" });
        }
      } catch (err) {
        if (err.status !== 401) {
          console.error("Auth check failed:", err);
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        authAPI.clearTokens();
        dispatch({ type: "LOGOUT" });
      }
    };

    checkAuth();
  }, [handleTokenRefresh]);

  const login = useCallback(
    async (email, password) => {
      dispatch({ type: "LOGIN_START" });

      try {
        const response = await authAPI.login(email, password);

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        authAPI.setTokens(response.accessToken, response.refreshToken);
        authAPI.setTokenRefreshHandler(handleTokenRefresh);

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response,
        });

        return { success: true };
      } catch (err) {
        console.error("Login failed:", err);
        const errorMessage =
          err.response?.data?.error?.message || "Login failed";
        dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
        return { success: false, message: errorMessage };
      }
    },
    [handleTokenRefresh]
  );

  const register = useCallback(
    async (username, email, password) => {
      dispatch({ type: "LOGIN_START" });

      try {
        const response = await authAPI.register(username, email, password);

        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        authAPI.setTokens(response.accessToken, response.refreshToken);
        authAPI.setTokenRefreshHandler(handleTokenRefresh);

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: response,
        });

        return { success: true };
      } catch (err) {
        const errorMessage =
          err.response?.data?.error?.message || "Registration failed";
        dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
        return { success: false, message: errorMessage };
      }
    },
    [handleTokenRefresh]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      authAPI.clearTokens();
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    try {
      const response = await authAPI.updateUserProfile(updates);
      dispatch({ type: "UPDATE_USER", payload: response.user });
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message || "Update failed";
      return { success: false, message: errorMessage };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message || "Password change failed";
      return { success: false, message: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUserProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
