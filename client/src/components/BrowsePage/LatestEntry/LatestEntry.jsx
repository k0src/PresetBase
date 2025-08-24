import { memo, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from "./LatestEntry.module.css";

export default memo(function LatestEntry({ songData }) {
  const getDiffDays = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const normalizedNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const diffTime = normalizedNow - normalizedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }, []);

  const { mainArtist, otherArtists, synths, addedDaysAgo } = useMemo(() => {
    if (!songData)
      return { mainArtist: "", otherArtists: [], synths: [], addedDaysAgo: 0 };

    const main = songData.artists?.find((a) => a.role === "Main")?.name || "";
    const others =
      songData.artists?.filter((a) => a.role !== "Main").map((a) => a.name) ||
      [];
    const synths =
      [...new Set(songData.presets?.map((p) => p.synth.name))] || [];
    const diffDays = getDiffDays(songData.timestamp);

    let addedDaysAgo;
    if (diffDays === 0) {
      addedDaysAgo = "Today";
    } else if (diffDays === 1) {
      addedDaysAgo = "1 day ago";
    } else {
      addedDaysAgo = diffDays + " days ago";
    }

    return { mainArtist: main, otherArtists: others, synths, addedDaysAgo };
  }, [songData, getDiffDays]);

  if (!songData) {
    return <div className={styles.latestEntry}></div>;
  }

  return (
    <Link to={`/song/${songData.id}`} className={styles.latestEntry}>
      <div className={styles.latestEntryTop}>
        <div className={styles.imgContainer}>
          <span className={styles.addedDaysAgo}>{addedDaysAgo}</span>
          <img
            src={`/uploads/images/approved/${songData.imageUrl}`}
            alt={songData.title}
            className={styles.latestEntryImg}
          />
        </div>

        <div className={styles.latestEntryTopRight}>
          <span className={styles.latestEntryArtist}>{mainArtist}</span>
          <span className={styles.latestEntryTitle}>{songData.title}</span>
          <span className={styles.latestEntryAlbum}>
            {songData.album.title === "[SINGLE]"
              ? "Single"
              : songData.album.title}
          </span>
          {otherArtists.length > 0 && (
            <span className={styles.latestEntryOtherArtists}>
              {otherArtists.map((artist, i) => (
                <span key={`${artist}-${i}`}>
                  {i === otherArtists.length - 1 ? artist : artist + ", "}
                </span>
              ))}
            </span>
          )}
          <span className={styles.latestEntryYear}>{songData.year}</span>
        </div>
      </div>

      <hr className={styles.latestEntryHr} />

      <div className={styles.latestEntryBottom}>
        {synths.length > 0 &&
          synths.map((synth, index) => (
            <span key={`${synth}-${index}`} className={styles.latestEntrySynth}>
              {synth}
            </span>
          ))}
      </div>
    </Link>
  );
});
