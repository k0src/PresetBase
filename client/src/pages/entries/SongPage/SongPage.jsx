import { getSongById, getRelatedSongs } from "../../../api/entries/songs";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbError from "../../../components/DbError/DbError";
import PageLoader from "../../../components/PageLoader/PageLoader";
import EntryHeader from "../../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../../components/Entries/EntryList/EntryList";
import styles from "./SongPage.module.css";

import { FaArrowUpRightFromSquare } from "react-icons/fa6";

export default function SongPage() {
  const { id } = useParams();

  const [song, setSong] = useState(null);
  const [moreSongs, setMoreSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSongData = async () => {
      try {
        setLoading(true);
        const [songData, moreSongsData] = await Promise.all([
          getSongById(id),
          getRelatedSongs(id, 5),
        ]);

        setSong(songData.data);
        setMoreSongs(moreSongsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSongData();
    }
  }, [id]);

  if (loading) return <PageLoader />;

  if (error || !song) {
    return (
      <>
        <Helmet>
          <title>Internal Server Error</title>
        </Helmet>
        <DbError errorMessage={error} />
      </>
    );
  }

  const mainArtist = song.artists?.find((a) => a.role === "Main");
  const otherArtists = song.artists?.filter((a) => a.role !== "Main") || [];

  return (
    <>
      <Helmet>
        <title>{`${song.title} - Details`}</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.entryContainer}>
          <div className={styles.entryColumns}>
            <div className={styles.entryLeft}>
              <EntryHeader
                imageUrl={song.imageUrl}
                title={song.title}
                subtitle={mainArtist?.name}
                subtitleLink={`/artist/${mainArtist?.id}`}
                altText={song.title}
              />

              <EntryMoreInfo
                entryType="song"
                data={song}
                otherArtists={otherArtists}
              />

              {moreSongs.length > 0 && (
                <MoreEntries
                  title={`More songs by ${mainArtist?.name}`}
                  entries={moreSongs}
                  entryType="songs"
                  linkPrefix="song"
                />
              )}

              <a
                href={song.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.entryOpenLink}
              >
                <span className={styles.entryOpenLinkText}>
                  Open song in new tab
                </span>
                <FaArrowUpRightFromSquare
                  className={styles.entryOpenLinkIcon}
                />
              </a>
            </div>

            <EntryList
              title="Presets"
              entries={Object.values(song.presets || {})}
              entryType="presets"
              filterPlaceholder="Filter presets"
            />
          </div>
        </section>
      </ContentContainer>
    </>
  );
}
