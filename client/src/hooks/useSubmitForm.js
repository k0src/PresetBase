import { useState } from "react";

export function useSubmitForm() {
  const [artists, setArtists] = useState([{ id: Date.now() }]);
  const [synths, setSynths] = useState([
    {
      id: Date.now(),
      presets: [{ id: Date.now() }],
    },
  ]);

  const addArtist = () => {
    setArtists((prev) => [...prev, { id: Date.now() }]);
  };

  const removeArtist = (index) => {
    if (artists.length > 1) {
      setArtists((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addSynth = () => {
    setSynths((prev) => [
      ...prev,
      {
        id: Date.now(),
        presets: [{ id: Date.now() }],
      },
    ]);
  };

  const removeSynth = (index) => {
    if (synths.length > 1) {
      setSynths((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addPreset = (synthId) => {
    setSynths((prev) =>
      prev.map((synth) =>
        synth.id === synthId
          ? {
              ...synth,
              presets: [
                ...synth.presets,
                { id: `preset-${synth.id}-${Date.now()}` },
              ],
            }
          : synth
      )
    );
  };

  const removePreset = (synthId, presetId) => {
    setSynths((prev) =>
      prev.map((synth) =>
        synth.id === synthId
          ? {
              ...synth,
              presets:
                synth.presets.length > 1
                  ? synth.presets.filter((preset) => preset.id !== presetId)
                  : synth.presets,
            }
          : synth
      )
    );
  };

  // Form data collection
  const collectFormData = (formElement) => {
    const formData = new FormData(formElement);
    return formData;
  };

  return {
    artists,
    synths,
    addArtist,
    removeArtist,
    addSynth,
    removeSynth,
    addPreset,
    removePreset,
    collectFormData,
    setArtists,
    setSynths,
  };
}
