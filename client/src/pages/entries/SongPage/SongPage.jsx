import { useAsyncData } from "../../../hooks/useAsyncData";
import { getSongById, getRelatedSongs } from "../../../api/entries/songs";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { memo, useMemo } from "react";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbError from "../../../components/DbError/DbError";
import PageLoader from "../../../components/PageLoader/PageLoader";
import EntryHeader from "../../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../../components/Entries/EntryList/EntryList";
import styles from "./SongPage.module.css";

import { FaArrowUpRightFromSquare } from "react-icons/fa6";

export default memo(function SongPage() {
  const { id } = useParams();

  const { data, loading, error } = useAsyncData(
    {
      song: () => getSongById(id),
      moreSongs: () => getRelatedSongs(id, 5),
    },
    [id],
    { cacheKey: `song-${id}` }
  );

  const song = data.song?.data || null;
  const moreSongs = data.moreSongs?.data || null;

  const { mainArtist, otherArtists, presetEntries } = useMemo(() => {
    if (!song) return { mainArtist: null, otherArtists: [], presetEntries: [] };

    const main = song.artists?.find((a) => a.role === "Main");
    const others = song.artists?.filter((a) => a.role !== "Main") || [];
    const presets = Object.values(song.presets || []);

    return {
      mainArtist: main,
      otherArtists: others,
      presetEntries: presets,
    };
  }, [song]);

  const moreEntriesSection = useMemo(() => {
    if (!moreSongs || moreSongs.length === 0 || !mainArtist) return null;

    return (
      <MoreEntries
        entryType="songs"
        title={`More songs by ${mainArtist.name}`}
        entries={moreSongs}
        linkPrefix="song"
      />
    );
  }, [moreSongs, mainArtist]);

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

              {moreEntriesSection}

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
              entryType="presets"
              title="Presets"
              entries={presetEntries}
              filterPlaceholder="Filter presets..."
            />
          </div>
        </section>
      </ContentContainer>
    </>
  );
});
