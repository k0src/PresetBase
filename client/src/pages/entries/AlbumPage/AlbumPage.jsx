import { useAsyncData } from "../../../hooks/useAsyncData";
import { getAlbumById, getRelatedAlbums } from "../../../api/entries/albums";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import DbError from "../../../components/DbError/DbError";
import PageLoader from "../../../components/PageLoader/PageLoader";
import EntryHeader from "../../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../../components/Entries/EntryList/EntryList";
import styles from "./AlbumPage.module.css";

export default function AlbumPage() {
  const { id } = useParams();

  const { data, loading, error } = useAsyncData(
    {
      album: () => getAlbumById(id),
      moreAlbums: () => getRelatedAlbums(id, 5),
    },
    [id],
    { cacheKey: `album-${id}` }
  );

  const album = data.album?.data || null;
  const moreAlbums = data.moreAlbums?.data || null;

  if (loading) return <PageLoader />;

  if (error || !album) {
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
        <title>{album.title} - Details</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
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

              {moreAlbums.length > 0 && (
                <MoreEntries
                  entryType="albums"
                  title={`More albums by ${album?.artist.name}`}
                  entries={moreAlbums}
                  linkPrefix="album"
                />
              )}
            </div>

            <EntryList
              entryType="songs"
              title="Songs"
              entries={Object.values(album.songs || {})}
              filterPlaceholder="Filter songs..."
            />
          </div>
        </section>
      </ContentContainer>
    </>
  );
}
