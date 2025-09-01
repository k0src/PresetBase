import { useAsyncData } from "../../hooks/useAsyncData";
import { entryAPI } from "../../api/entry";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {  useMemo } from "react";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import DbError from "../../components/DbError/DbError";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import EntryHeader from "../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../components/Entries/EntryList/EntryList";
import EntryExternalLink from "../../components/Entries/EntryExternalLink/EntryExternalLink";
import styles from "./EntryPage.module.css";

export default function SongPage() {
  const { id } = useParams();

  const { data, loading, error } = useAsyncData(
    {
      song: () => entryAPI.getSong(id),
      moreSongs: () => entryAPI.getRelatedSongs(id, 5),
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

  if (error) {
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
    <ContentContainer>
      {loading ? (
        <ComponentLoader />
      ) : (
        <>
          <Helmet>
            <title>{`${song.title} - Details`}</title>
          </Helmet>

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

                <EntryExternalLink url={song.songUrl} />
              </div>

              <EntryList
                entryType="presets"
                title="Presets"
                entries={presetEntries}
                filterPlaceholder="Filter presets..."
              />
            </div>
          </section>
        </>
      )}
    </ContentContainer>
  );
}
