import { getSynthById, getRelatedSynths } from "../../../api/entries/synths";

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
import styles from "./SynthPage.module.css";

export default function SynthPage() {
  const { id } = useParams();

  const [synth, setSynth] = useState(null);
  const [moreSynths, setMoreSynths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSynthData = async () => {
      try {
        setLoading(true);
        const [synthData, moreSynthsData] = await Promise.all([
          getSynthById(id),
          getRelatedSynths(id, 5),
        ]);

        setSynth(synthData.data);
        setMoreSynths(moreSynthsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSynthData();
    }
  }, [id]);

  if (loading) return <PageLoader />;

  if (error || !synth) {
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
    <ContentContainer isAuth={true} userIsAdmin={true}>
      <section className={styles.entryContainer}>
        <div className={styles.entryColumns}>
          <div className={styles.entryLeft}>
            <EntryHeader
              imageUrl={synth.imageUrl}
              title={synth.name}
              subtitle={synth.manufacturer}
              altText={synth.name}
            />

            <EntryMoreInfo entryType="synth" data={synth} />

            {moreSynths.length > 0 && (
              <MoreEntries
                entryType="synths"
                title={`More Synths by ${synth.manufacturer}`}
                entries={moreSynths}
                linkPrefix="synth"
              />
            )}
          </div>

          <EntryList
            entryType="presets-synth"
            title="Presets"
            entries={Object.values(synth.presets) || {}}
            filterPlaceholder="Filter presets..."
          />
        </div>
      </section>
    </ContentContainer>
  );
}
