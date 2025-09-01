import { createContext, useContext, useCallback, useRef, useMemo } from "react";
import { generalAPI } from "../../../api/general";

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

  const fillInput = useCallback((input, value) => {
    if (input && value) {
      input.value = value;

      const inputEvent = new Event("input", { bubbles: true });
      const changeEvent = new Event("change", { bubbles: true });

      input.dispatchEvent(inputEvent);
      input.dispatchEvent(changeEvent);
    }
  }, []);

  const fillSelect = useCallback((select, value) => {
    if (select && value) {
      select.value = value;
      const event = new Event("change", { bubbles: true });
      select.dispatchEvent(event);
    }
  }, []);

  const fillImage = useCallback((section, imageData, dataKey) => {
    if (imageData) {
      const imageInput = section.querySelector(`input[data-key="${dataKey}"]`);
      if (imageInput) {
        const customEvent = new CustomEvent("autofillImage", {
          detail: { input: imageInput, imageUrl: imageData },
          bubbles: true,
        });
        window.dispatchEvent(customEvent);
      }
    }
  }, []);

  const fillSongData = useCallback(
    (section, data) => {
      fillInput(
        section.querySelector('input[data-key="songTitle"]'),
        data.songTitle
      );
      fillInput(section.querySelector('input[data-key="genre"]'), data.genre);
      fillInput(
        section.querySelector('input[data-key="songYear"]'),
        data.songYear
      );
      fillInput(
        section.querySelector('input[data-key="songUrl"]'),
        data.songUrl
      );
      fillImage(section, data.songImg, "songImg");
    },
    [fillInput, fillImage]
  );

  const fillArtistData = useCallback(
    (section, data) => {
      fillInput(
        section.querySelector('input[data-key="artistName"]'),
        data.artistName
      );
      fillInput(
        section.querySelector('input[data-key="artistCountry"]'),
        data.artistCountry
      );
      fillImage(section, data.artistImg, "artistImg");
    },
    [fillInput, fillImage]
  );

  const fillAlbumData = useCallback(
    (section, data) => {
      fillInput(
        section.querySelector('input[data-key="albumTitle"]'),
        data.albumTitle
      );
      fillInput(section.querySelector('input[data-key="genre"]'), data.genre);
      fillInput(
        section.querySelector('input[data-key="albumYear"]'),
        data.albumYear
      );
      fillImage(section, data.albumImg, "albumImg");
    },
    [fillInput, fillImage]
  );

  const fillSynthData = useCallback(
    (section, data) => {
      fillInput(
        section.querySelector('input[data-key="synthName"]'),
        data.synthName
      );
      fillInput(
        section.querySelector('input[data-key="synthManufacturer"]'),
        data.synthManufacturer
      );
      fillInput(
        section.querySelector('input[data-key="synthYear"]'),
        data.synthYear
      );
      fillSelect(
        section.querySelector('select[data-key="synthType"]'),
        data.synthType
      );
      fillImage(section, data.synthImg, "synthImg");
    },
    [fillInput, fillSelect, fillImage]
  );

  const fillPresetData = useCallback(
    (section, data) => {
      fillInput(
        section.querySelector('input[data-key="presetName"]'),
        data.presetName
      );
      fillInput(
        section.querySelector('input[data-key="presetPack"]'),
        data.presetPack
      );
      fillInput(
        section.querySelector('input[data-key="presetAuthor"]'),
        data.presetAuthor
      );
    },
    [fillInput]
  );

  const attemptAutofill = useCallback(
    async (query) => {
      if (!type || !query?.trim()) return false;

      try {
        const results = await generalAPI.getAutofillData(type, query);

        // Autofill only if we get exactly one result
        if (!results || results.length !== 1) return false;

        const data = results[0];

        if (!sectionRef.current) return false;

        const section = sectionRef.current;

        switch (type) {
          case "songTitle":
            fillSongData(section, data);
            break;
          case "artistName":
            fillArtistData(section, data);
            break;
          case "albumTitle":
            fillAlbumData(section, data);
            break;
          case "synthName":
            fillSynthData(section, data);
            break;
          case "presetName":
            fillPresetData(section, data);
            break;
          default:
            return false;
        }

        return true;
      } catch (error) {
        console.error("Autofill error:", error);
        return false;
      }
    },
    [
      type,
      fillSongData,
      fillArtistData,
      fillAlbumData,
      fillSynthData,
      fillPresetData,
    ]
  );

  const contextValue = useMemo(
    () => ({
      attemptAutofill,
      type,
    }),
    [attemptAutofill, type]
  );

  return (
    <FormSectionContext.Provider value={contextValue}>
      <div ref={sectionRef} className={className}>
        {children}
      </div>
    </FormSectionContext.Provider>
  );
}
