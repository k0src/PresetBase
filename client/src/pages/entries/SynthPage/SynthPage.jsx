import { useAsyncData } from "../../../hooks/useAsyncData";
import { getSynthById, getRelatedSynths } from "../../../api/entries/synths";

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

  const { data, loading, error } = useAsyncData(
    {
      synth: () => getSynthById(id),
      moreSynths: () => getRelatedSynths(id, 5),
    },
    [id],
    { cacheKey: `synth-${id}` }
  );

  const synth = data.synth?.data || null;
  const moreSynths = data.moreSynths?.data || null;

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
