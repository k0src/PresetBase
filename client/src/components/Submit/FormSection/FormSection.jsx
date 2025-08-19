import { createContext, useContext, useCallback, useRef } from "react";
import { getAutofillData } from "../../../api/api";

const FormSectionContext = createContext(null);

export const useFormSection = () => {
  const context = useContext(FormSectionContext);
  if (!context) {
    throw new Error("useFormSection must be used within a FormSection");
  }
  return context;
};

export default function FormSection({ children, type, className }) {
  const sectionRef = useRef(null);

  const attemptAutofill = useCallback(
    async (query) => {
      if (!type || !query?.trim()) return false;

      try {
        const results = await getAutofillData(type, query);

        // Only autofill if we get exactly one result

        // Fill text inputs

        // Trigger change event for React

        // Fill select inputs

        // Trigger change event for React

        // Handle image autofill by dispatching custom event

        // Dispatch custom event for image autofill

        return true;
      } catch (error) {
        console.error("Autofill error:", error);
        return false;
      }
    },
    [type]
  );

  const contextValue = {
    attemptAutofill,
    type,
  };

  return (
    <FormSectionContext.Provider value={contextValue}>
      <div ref={sectionRef} className={className}>
        {children}
      </div>
    </FormSectionContext.Provider>
  );
}
