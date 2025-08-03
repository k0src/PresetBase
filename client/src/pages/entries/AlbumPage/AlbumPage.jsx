import { getAlbumById, getRelatedAlbums } from "../../../api/entries/albums";

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
import styles from "./AlbumPage.module.css";

export default function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [moreAlbums, setMoreAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAlbumData = async () => {
      try {
        setLoading(true);
        const [albumData, moreAlbumsData] = await Promise.all([
          getAlbumById(id),
          getRelatedAlbums(id, 5),
        ]);

        setAlbum(albumData.data);
        setMoreAlbums(moreAlbumsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAlbumData();
    }
  }, [id]);

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
