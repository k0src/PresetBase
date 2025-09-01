import { useAsyncData } from "../../hooks/useAsyncData";
import { entryAPI } from "../../api/entry";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { memo, useMemo } from "react";

import ContentContainer from "../../components/ContentContainer/ContentContainer";
import DbError from "../../components/DbError/DbError";
import ComponentLoader from "../../components/ComponentLoader/ComponentLoader";
import EntryHeader from "../../components/Entries/EntryHeader/EntryHeader";
import EntryMoreInfo from "../../components/Entries/EntryMoreInfo/EntryMoreInfo";
import MoreEntries from "../../components/Entries/MoreEntries/MoreEntries";
import EntryList from "../../components/Entries/EntryList/EntryList";
import styles from "./EntryPage.module.css";

export default memo(function SynthPage() {
  const { id } = useParams();

  const { data, loading, error } = useAsyncData(
    {
      synth: () => entryAPI.getSynth(id),
      moreSynths: () => entryAPI.getRelatedSynths(id, 5),
    },
    [id],
    { cacheKey: `synth-${id}` }
  );

  const synth = data.synth?.data || null;
  const moreSynths = data.moreSynths?.data || null;

  const presetEntries = useMemo(() => {
    if (!synth || !synth.presets) return [];
    return Object.values(synth.presets || []);
  });

  const moreEntriesSection = useMemo(() => {
    if (!moreSynths || moreSynths.length === 0 || !synth) return null;

    return (
      <MoreEntries
        entryType="synths"
        title={`More Synths by ${synth.manufacturer}`}
        entries={moreSynths}
        linkPrefix="synth"
      />
    );
  });

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
            <title>{`${synth.name} - Details`}</title>
          </Helmet>

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

                {moreEntriesSection}
              </div>

              <EntryList
                entryType="presets-synth"
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
});
