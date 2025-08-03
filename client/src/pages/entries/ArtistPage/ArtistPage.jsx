import {
  getArtistById,
  getTotalSongs,
  getAlbums,
  getFavoriteSynth,
} from "../../../api/entries/artists";

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
import styles from "./ArtistPage.module.css";

export default function ArtistPage() {
  const { id } = useParams();

  const [artist, setArtist] = useState(null);
  const [totalSongs, setTotalSongs] = useState(0);
  const [albums, setAlbums] = useState([]);
  const [favoriteSynth, setFavoriteSynth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArtistData = async () => {
      try {
        setLoading(true);
        const [artistData, totalSongsData, albumsData, favoriteSynthData] =
          await Promise.all([
            getArtistById(id),
            getTotalSongs(id),
            getAlbums(id),
            getFavoriteSynth(id),
          ]);

        setArtist(artistData.data);
        setTotalSongs(totalSongsData.data);
        setAlbums(albumsData.data);
        setFavoriteSynth(favoriteSynthData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadArtistData();
    }
  }, [id]);

  if (loading) return <PageLoader />;

  if (error || !artist) {
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
        <title>{`${artist.name} - Details`}</title>
      </Helmet>

      <ContentContainer isAuth={true} userIsAdmin={true}>
        <section className={styles.entryContainer}>
          <div className={styles.entryColumns}>
            <div className={styles.entryLeft}>
              <EntryHeader
                imageUrl={artist.imageUrl}
                altText={artist.name}
                title={artist.name}
              />

              <EntryMoreInfo
                entryType="artist"
                totalSongs={totalSongs}
                data={artist}
                favoriteSynth={favoriteSynth}
              />

              {albums.length > 0 && (
                <MoreEntries
                  entryType="artist"
                  title={`Albums by ${artist.name}`}
                  entries={albums}
                  linkPrefix="album"
                />
              )}
            </div>

            <EntryList
              entryType="songs"
              title="Songs"
              entries={Object.values(artist.songs || {})}
              filterPlaceholder="Filter songs..."
            />
          </div>
        </section>
      </ContentContainer>
    </>
  );
}
