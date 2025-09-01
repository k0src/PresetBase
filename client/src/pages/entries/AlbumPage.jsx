import { useAsyncData } from "../../hooks/useAsyncData";
import { entryAPI } from "../../api/entry";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo } from "react";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import DbError from "../../components/DbError/DbError";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import EntryHeader from "../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../components/Entries/EntryList/EntryList";
import styles from "./EntryPage.module.css";

export default function AlbumPage() {
  const { id } = useParams();

  const { data, loading, error } = useAsyncData(
    {
      album: () => entryAPI.getAlbum(id),
      moreAlbums: () => entryAPI.getRelatedAlbums(id, 5),
    },
    [id],
    { cacheKey: `album-${id}` }
  );

  const album = data.album?.data || null;
  const moreAlbums = data.moreAlbums?.data || null;

  const songEntries = useMemo(() => {
    if (!album || !album.songs) return [];
    return Object.values(album.songs || []);
  });

  const moreEntriesSection = useMemo(() => {
    if (!moreAlbums || moreAlbums.length === 0 || !album?.artist) return null;

    return (
      <MoreEntries
        entryType="albums"
        title={`More albums by ${album?.artist.name}`}
        entries={moreAlbums}
        linkPrefix="album"
      />
    );
  }, [moreAlbums, album]);

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
            <title>{album.title} - Details</title>
          </Helmet>

          <section className={styles.entryContainer}>
            <div className={styles.entryColumns}>
              <div className={styles.entryLeft}>
                <EntryHeader
                  imageUrl={album.imageUrl}
                  title={album.title}
                  subtitle={album?.artist.name}
                  subtitleLink={`/artist/${album?.artist.id}`}
                  altText={album.title}
                />

                <EntryMoreInfo entryType="album" data={album} />

                {moreEntriesSection}
              </div>

              <EntryList
                entryType="songs"
                title="Songs"
                entries={songEntries}
                filterPlaceholder="Filter songs..."
              />
            </div>
          </section>
        </>
      )}
    </ContentContainer>
  );
}
