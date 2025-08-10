import { useState, useRef, useEffect } from "react";

export function useAudioPlayer(audioSources = [], basePath = "") {
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRefs = useRef({});

  // Create audio elements for sources
  useEffect(() => {
    audioSources.forEach((source) => {
      const audioUrl = basePath ? `${basePath}${source}` : source;
      if (source && !audioRefs.current[source]) {
        const audio = new Audio(audioUrl);
        audioRefs.current[source] = audio;
      }
    });
  }, [audioSources, basePath]);

  // Stop and cleanup all audio when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setPlayingAudio(null);
    };
  }, []);

  const handleAudioToggle = async (audioKey) => {
    // Stop all other audio
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audioElement = audioRefs.current[audioKey];

    if (playingAudio === audioKey) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      if (audioElement) {
        try {
          await audioElement.play();
          setPlayingAudio(audioKey);

          audioElement.onended = () => {
            setPlayingAudio(null);
          };
        } catch (error) {
          console.error("Audio play failed:", error);
        }
      }
    }
  };

  // Add new audio source
  const addAudioSource = (audioKey, audioUrl) => {
    if (!audioRefs.current[audioKey]) {
      const audio = new Audio(audioUrl);
      audioRefs.current[audioKey] = audio;
    }
  };

  // Remove audio source
  const removeAudioSource = (audioKey) => {
    const audio = audioRefs.current[audioKey];
    if (audio) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (playingAudio === audioKey) {
        setPlayingAudio(null);
      }
      delete audioRefs.current[audioKey];
    }
  };

  return {
    playingAudio,
    handleAudioToggle,
    addAudioSource,
    removeAudioSource,
  };
}
