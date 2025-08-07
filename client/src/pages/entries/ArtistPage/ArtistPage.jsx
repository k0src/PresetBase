import { useAsyncData } from "../../../hooks/useAsyncData";
import {
  getArtistById,
  getTotalSongs,
  getAlbums,
  getFavoriteSynth,
} from "../../../api/entries/artists";

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

  const { data, loading, error } = useAsyncData(
    {
      artist: () => getArtistById(id),
      totalSongs: () => getTotalSongs(id, 5),
      albums: () => getAlbums(id, 5),
      favoriteSynth: () => getFavoriteSynth(id),
    },
    [id],
    { cacheKey: `artist-${id}` }
  );

  const artist = data.artist?.data || null;
  const totalSongs = data.totalSongs?.data || 0;
  const albums = data.albums?.data || [];
  const favoriteSynth = data.favoriteSynth?.data || null;

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
