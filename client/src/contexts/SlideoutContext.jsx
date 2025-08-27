import { createContext, useContext, useReducer, useCallback } from "react";

const SlideoutContext = createContext();

const slideoutReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_SLIDEOUT":
      return {
        ...state,
        isOpen: true,
        entryType: action.payload.entryType,
        entryId: action.payload.entryId,
        loading: true,
        error: null,
        data: null,
        hasChanges: false,
      };
    case "SET_DATA":
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_HAS_CHANGES":
      return {
        ...state,
        hasChanges: action.payload,
      };
    case "CLOSE_SLIDEOUT":
      return {
        ...state,
        isOpen: false,
        entryType: null,
        entryId: null,
        data: null,
        loading: false,
        error: null,
        hasChanges: false,
      };
    case "RESET_CHANGES":
      return {
        ...state,
        hasChanges: false,
      };
    default:
      return state;
  }
};

const initialState = {
  isOpen: false,
  entryType: null,
  entryId: null,
  data: null,
  loading: false,
  error: null,
  hasChanges: false,
};

export function SlideoutProvider({ children }) {
  const [state, dispatch] = useReducer(slideoutReducer, initialState);

  const openSlideout = useCallback((entryType, entryId) => {
    dispatch({
      type: "OPEN_SLIDEOUT",
      payload: { entryType, entryId },
    });
  }, []);

  const closeSlideout = useCallback(() => {
    dispatch({ type: "CLOSE_SLIDEOUT" });
  }, []);

  const setData = useCallback((data) => {
    dispatch({ type: "SET_DATA", payload: data });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setHasChanges = useCallback((hasChanges) => {
    dispatch({ type: "SET_HAS_CHANGES", payload: hasChanges });
  }, []);

  const resetChanges = useCallback(() => {
    dispatch({ type: "RESET_CHANGES" });
  }, []);

  const refreshSlideoutData = useCallback(() => {
    if (state.isOpen && state.entryType && state.entryId) {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });
    }
  }, [state.isOpen, state.entryType, state.entryId]);

  const value = {
    ...state,
    openSlideout,
    closeSlideout,
    setData,
    setError,
    setLoading,
    setHasChanges,
    resetChanges,
    refreshSlideoutData,
  };

  return (
    <SlideoutContext.Provider value={value}>
      {children}
    </SlideoutContext.Provider>
  );
}

export function useSlideout() {
  const context = useContext(SlideoutContext);
  if (!context) {
    throw new Error("useSlideout must be used within a SlideoutProvider");
  }
  return context;
}
