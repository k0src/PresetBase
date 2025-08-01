import { Link } from "react-router-dom";
import styles from "./EntryMoreInfo.module.css";

import * as FaIcons from "react-icons/fa6";

function InfoSection({ icon, children, className = "" }) {
  const IconComponent = FaIcons[icon];
  return (
    <div className={`${styles.entryMoreInfoSection} ${className}`}>
      <div className={styles.entryIconWrapper}>
        {IconComponent && (
          <IconComponent className={styles.entryMoreInfoIcon} />
        )}
      </div>
      {children}
    </div>
  );
}

export default function EntryMoreInfo({
  entryType,
  data,
  otherArtists = [],
  totalSongs,
  favoriteSynth,
}) {
  const renderByType = () => {
    switch (entryType) {
      case "song":
        return (
          <>
            {otherArtists.length > 0 && (
              <InfoSection icon="FaUser">
                <div className={styles.entryAllArtists}>
                  <span className={styles.entryTextTertiary}>
                    {otherArtists.map((artist, index) => (
                      <span key={artist.id}>
                        <Link
                          to={`/artist/${artist.id}`}
                          className={styles.entryTextTertiary}
                        >
                          {artist.name}
                        </Link>
                        {index < otherArtists.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              </InfoSection>
            )}
            <InfoSection icon="FaRecordVinyl">
              {data.album?.title === "[SINGLE]" ? (
                <span className={styles.entryTextTertiary}>Single</span>
              ) : (
                <Link
                  to={`/album/${data.album?.id}`}
                  className={styles.entryTextTertiary}
                >
                  {data.album?.title}
                </Link>
              )}
            </InfoSection>
            <InfoSection icon="FaCalendar">
              <span className={styles.entryTextTertiary}>{data.year}</span>
            </InfoSection>
            <InfoSection icon="FaMasksTheater">
              <span className={styles.entryTextTertiary}>{data.genre}</span>
            </InfoSection>
          </>
        );

      case "artist":
        return (
          <>
            <InfoSection icon="FaEarthAmericas">
              <span className={styles.entryTextTertiary}>{data.country}</span>
            </InfoSection>
            <InfoSection icon="FaHashtag">
              <span className={styles.entryTextTertiary}>
                {totalSongs} songs
              </span>
            </InfoSection>
            {favoriteSynth && (
              <InfoSection icon="FaStar">
                <span className={styles.entryTextTertiary}>
                  Favorite synth:{" "}
                  <Link to={`/synth/${favoriteSynth.id}`}>
                    {favoriteSynth.name}
                  </Link>
                </span>
              </InfoSection>
            )}
          </>
        );

      case "album":
        return (
          <>
            <InfoSection icon="FaCalendar">
              <span className={styles.entryTextTertiary}>{data.year}</span>
            </InfoSection>
            <InfoSection icon="FaMasksTheater">
              <span className={styles.entryTextTertiary}>{data.genre}</span>
            </InfoSection>
          </>
        );

      case "synth":
        return (
          <>
            <InfoSection icon="FaGear">
              <span className={styles.entryTextTertiary}>{data.type}</span>
            </InfoSection>
            <InfoSection icon="FaCalendar">
              <span className={styles.entryTextTertiary}>{data.year}</span>
            </InfoSection>
          </>
        );

      default:
        return null;
    }
  };

  return <div className={styles.entryMoreInfoContainer}>{renderByType()}</div>;
}
