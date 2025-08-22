import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

import styles from "./SongCarousel.module.css";
import classNames from "classnames";

export default function SongCarousel({ songData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const autoSlideRef = useRef(null);

  const SONGS_PER_SLIDE = 3;
  const totalSlides = Math.ceil((songData?.length || 0) / SONGS_PER_SLIDE);

  const moveToSlide = useCallback((slideIndex) => {
    setIsMoving(true);
    setCurrentSlide(slideIndex);

    setTimeout(() => {
      setIsMoving(false);
    }, 500);
  }, []);

  const nextSlide = useCallback(() => {
    setIsMoving(true);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);

    setTimeout(() => {
      setIsMoving(false);
    }, 500);
  }, [totalSlides]);

  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      if (!userInteracted && totalSlides > 1) {
        nextSlide();
      }
    }, 5000);
  }, [userInteracted, totalSlides, nextSlide]);

  const handleDotClick = useCallback(
    (index) => {
      setUserInteracted(true);
      moveToSlide(index);
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    },
    [moveToSlide]
  );

  useEffect(() => {
    if (totalSlides > 1) {
      startAutoSlide();
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [startAutoSlide, totalSlides]);

  if (!songData || songData.length === 0) {
    return (
      <div className={styles.songCarousel}>
        <p className={styles.noSongs}>No songs available</p>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.songCarousel, {
        [styles.songCarouselMoving]: isMoving,
      })}
    >
      <div className={styles.carouselTrack}>
        {Array.from({ length: totalSlides }, (_, slideIndex) => (
          <div
            key={slideIndex}
            className={styles.carouselSlide}
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {songData
              .slice(
                slideIndex * SONGS_PER_SLIDE,
                (slideIndex + 1) * SONGS_PER_SLIDE
              )
              .map((song) => (
                <Link
                  key={song.id}
                  to={`/song/${song.id}`}
                  className={styles.songItem}
                >
                  <div className={styles.songImgContainer}>
                    <img
                      src={`/uploads/images/approved/${song.imageUrl}`}
                      alt={song.title}
                      className={styles.songImg}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.songItemRight}>
                    <span className={styles.songArtist}>
                      {song.artist.name}
                    </span>
                    <span className={styles.songTitle}>{song.title}</span>
                    <span className={styles.songAlbum}>
                      {song.album.title === "[SINGLE]"
                        ? "Single"
                        : song.album.title}
                    </span>
                    <span className={styles.songYear}>{song.year}</span>
                  </div>
                </Link>
              ))}
          </div>
        ))}
      </div>

      {totalSlides > 1 && (
        <div className={styles.carouselNav}>
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              className={classNames(styles.carouselNavDot, {
                [styles.carouselNavDotActive]: index === currentSlide,
              })}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
