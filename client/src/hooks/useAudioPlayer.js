import { useState, useRef, useEffect } from "react";

// Global state for audio player
let globalPlayingAudio = null;
let globalAudioRefs = {};
let globalStateListeners = new Set();

const setGlobalPlayingAudio = (audioKey) => {
  globalPlayingAudio = audioKey;
  globalStateListeners.forEach((listener) => listener(audioKey));
};

export function useAudioPlayer(audioSources = [], basePath = "") {
  const [playingAudio, setPlayingAudio] = useState(globalPlayingAudio);
  const audioRefs = useRef(globalAudioRefs);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (audioKey) => setPlayingAudio(audioKey);
    globalStateListeners.add(listener);
    return () => globalStateListeners.delete(listener);
  }, []);

  // Create audio elements for sources
  useEffect(() => {
    audioSources.forEach((source) => {
      const audioUrl = basePath ? `${basePath}${source}` : source;
      if (source && !globalAudioRefs[source]) {
        const audio = new Audio(audioUrl);
        globalAudioRefs[source] = audio;
      }
    });
  }, [audioSources, basePath]);

  // Stop and cleanup all audio when component unmounts
  useEffect(() => {
    return () => {
      Object.values(globalAudioRefs).forEach((audio) => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setGlobalPlayingAudio(null);
    };
  }, []);

  const handleAudioToggle = async (audioKey) => {
    // Stop all other audio
    Object.values(globalAudioRefs).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audioElement = globalAudioRefs[audioKey];

    if (globalPlayingAudio === audioKey) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setGlobalPlayingAudio(null);
    } else {
      if (audioElement) {
        try {
          await audioElement.play();
          setGlobalPlayingAudio(audioKey);

          audioElement.onended = () => {
            setGlobalPlayingAudio(null);
          };
        } catch (error) {
          console.error("Audio play failed:", error);
        }
      }
    }
  };

  // Add new audio source
  const addAudioSource = (audioKey, audioUrl) => {
    if (!globalAudioRefs[audioKey]) {
      const audio = new Audio(audioUrl);
      globalAudioRefs[audioKey] = audio;
    }
  };

  // Remove audio source
  const removeAudioSource = (audioKey) => {
    const audio = globalAudioRefs[audioKey];
    if (audio) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (globalPlayingAudio === audioKey) {
        setGlobalPlayingAudio(null);
      }
      delete globalAudioRefs[audioKey];
    }
  };

  return {
    playingAudio,
    handleAudioToggle,
    addAudioSource,
    removeAudioSource,
  };
}
