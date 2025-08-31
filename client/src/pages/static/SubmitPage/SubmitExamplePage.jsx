import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ContentContainer from "../../../components/ContentContainer/ContentContainer";
import FormInput from "../../../components/Submit/FormInput/FormInput";
import ImageInputStatic from "../../../components/Submit/ImageInput/ImageInputStatic";
import AudioInputStatic from "../../../components/Submit/AudioInput/AudioInputStatic";
import FormCheckbox from "../../../components/Submit/FormCheckbox/FormCheckbox";
import FormSection from "../../../components/Submit/FormSection/FormSection";
import FormSelector from "../../../components/Submit/FormSelector/FormSelector";
import pageStyles from "./SubmitPage.module.css";
import formStyles from "../../../components/Submit/SubmitForm/SubmitForm.module.css";

import { FaXmark } from "react-icons/fa6";

const styles = { ...pageStyles, ...formStyles };

export default function SubmitExamplePage() {
  return (
    <>
      <Helmet>
        <title>Example Submission</title>
      </Helmet>

      <ContentContainer>
        <section className={styles.submitHeader}>
          <h1 className={styles.headingPrimary}>Submit</h1>
        </section>

        <section className={styles.submitFormContainer}>
          <form onSubmit={(e) => e.preventDefault()}>
            <legend className={styles.legend}>Song Information</legend>
            <fieldset className={styles.fieldset}>
              <FormSection className={styles.formSection}>
                <FormInput required value="Shoota" label="Song Title" readOnly>
                  Provide the full title of the song. Do not include featured
                  artists or producers.
                </FormInput>

                <FormInput required value="Test" label="Trap" readOnly>
                  Specify the music genre (e.g., Trap, House, Hip Hop).
                </FormInput>

                <FormInput required value="2018" label="Release Year" readOnly>
                  Enter the year the song was released (e.g., 2018).
                </FormInput>

                <FormInput
                  required
                  value="https://www.youtube.com/watch?v=j3EwWAMWM6Q"
                  label="Song URL"
                  readOnly
                >
                  Paste the YouTube URL of the song. Use the official artist's
                  channel. Avoid music videos unless no official audio uploads
                  exist.
                </FormInput>

                <ImageInputStatic
                  label="Cover Image"
                  imageSrc="https://m.media-amazon.com/images/I/71orupBukTL.jpg"
                  fileName="die-lit.jpg"
                >
                  Upload the song's cover image. Leave blank to default to the
                  album cover. Minimum dimensions: 1000 x 1000 pixels.
                </ImageInputStatic>
              </FormSection>
            </fieldset>

            <legend className={styles.legend}>Artist Information</legend>
            <fieldset className={styles.fieldset}>
              <FormSection className={styles.formSection}>
                <FormInput
                  required
                  value="Playboi Carti"
                  label="Artist Name"
                  readOnly
                >
                  Enter the name of the artist.
                </FormInput>

                <FormInput required value="USA" label="Artist Country" readOnly>
                  Specify the artist's country of origin.
                </FormInput>

                <FormInput required value="Main" label="Artist Role" readOnly>
                  State the artist's role on the track. Use 'Main' for primary
                  artist. Enter only one role.
                </FormInput>

                <ImageInputStatic
                  label="Artist Image"
                  imageSrc="https://i.imgur.com/x3Vkir7.jpeg"
                  fileName="playboi-carti.jpg"
                  required
                >
                  Upload the artist's image. Minimum dimensions: 1000 x 1000
                  pixels.
                </ImageInputStatic>
              </FormSection>

              <FormSection className={styles.formSection}>
                <hr className={styles.hrSep} />
                <div className={styles.entryNewHeader}>
                  <span className={styles.entryNewText}>Additional Artist</span>
                  <FaXmark className={styles.entryDeleteBtn} />
                </div>

                <FormInput
                  required
                  value="Lil Uzi Vert"
                  label="Artist Name"
                  readOnly
                >
                  Enter the name of the artist.
                </FormInput>

                <FormInput required value="USA" label="Artist Country" readOnly>
                  Specify the artist's country of origin.
                </FormInput>

                <FormInput
                  required
                  value="Feature"
                  label="Artist Role"
                  readOnly
                >
                  State the artist's role on the track. Use 'Main' for primary
                  artist. Enter only one role.
                </FormInput>

                <ImageInputStatic
                  label="Artist Image"
                  imageSrc=" https://i.imgur.com/XIBu1KG.jpeg"
                  fileName="lil-uzi.jpg"
                  required
                >
                  Upload the artist's image. Minimum dimensions: 1000 x 1000
                  pixels.
                </ImageInputStatic>
              </FormSection>

              <FormSection className={styles.formSection}>
                <hr className={styles.hrSep} />
                <div className={styles.entryNewHeader}>
                  <span className={styles.entryNewText}>Additional Artist</span>
                  <FaXmark className={styles.entryDeleteBtn} />
                </div>

                <FormInput
                  required
                  value="Maaly Raw"
                  label="Artist Name"
                  readOnly
                >
                  Enter the name of the artist.
                </FormInput>

                <FormInput required value="USA" label="Artist Country" readOnly>
                  Specify the artist's country of origin.
                </FormInput>

                <FormInput
                  required
                  value="Producer"
                  label="Artist Role"
                  readOnly
                >
                  State the artist's role on the track. Use 'Main' for primary
                  artist. Enter only one role.
                </FormInput>

                <ImageInputStatic
                  label="Artist Image"
                  imageSrc="https://i.imgur.com/fiva8ek.jpeg"
                  fileName="maaly-raw.jpg"
                  required
                >
                  Upload the artist's image. Minimum dimensions: 1000 x 1000
                  pixels.
                </ImageInputStatic>
              </FormSection>

              <button type="button" className={styles.addBtn} disabled>
                + Add Another Artist
              </button>
            </fieldset>

            <legend className={styles.legend}>Album Information</legend>
            <fieldset className={styles.fieldset}>
              <FormSection className={styles.formSection}>
                <FormCheckbox readOnly>
                  Check this box if the song is a single (doesn't appear on any
                  albums besides possibly compilation albums).
                </FormCheckbox>

                <FormInput
                  required
                  value="Die Lit"
                  label="Album Title"
                  readOnly
                >
                  Provide the album's title.
                </FormInput>

                <FormInput required value="Trap" label="Genre" readOnly>
                  Indicate the album's genre.
                </FormInput>

                <FormInput required value="2018" label="Release Year" readOnly>
                  Enter the year the album was released.
                </FormInput>

                <ImageInputStatic
                  label="Album Cover"
                  imageSrc="https://m.media-amazon.com/images/I/71orupBukTL.jpg"
                  fileName="die-lit.jpg"
                  required
                >
                  Upload the album's cover image. Minimum dimensions: 1000 x
                  1000 pixels.
                </ImageInputStatic>
              </FormSection>
            </fieldset>

            <legend className={styles.legend}>Preset Information</legend>
            <fieldset className={styles.fieldset}>
              <div className={styles.synthSection}>
                <FormSection className={styles.formSection}>
                  <FormInput
                    required
                    value="ElectraX"
                    label="Synth Name"
                    readOnly
                  >
                    Name the synth used in the track.
                  </FormInput>

                  <FormInput
                    required
                    value="Tone2"
                    label="Manufacturer"
                    readOnly
                  >
                    Provide the manufacturer or developer (e.g., Spectrasonics)
                  </FormInput>

                  <FormInput
                    required
                    value="2010"
                    label="Release Year"
                    readOnly
                  >
                    Enter the synth's release year.
                  </FormInput>

                  <FormSelector
                    label="Synth Type"
                    disabled
                    required
                    selectOptions={[
                      { value: "VST", label: "VST" },
                      { value: "Hardware", label: "Hardware" },
                      { value: "Kontakt Bank", label: "Kontakt Bank" },
                      { value: "SoundFont", label: "SoundFont" },
                      { value: "Other", label: "Other" },
                    ]}
                  >
                    Select the synth format.
                  </FormSelector>

                  <ImageInputStatic
                    label="Synth Image"
                    imageSrc="https://i.imgur.com/nH0rFyS.jpeg"
                    fileName="electrax.jpg"
                    required
                  >
                    Upload an image of the synth. Minimum dimensions: 1000 x
                    1000 pixels.
                  </ImageInputStatic>
                </FormSection>

                <hr className={styles.hrSep} />

                <FormSection className={styles.formSection}>
                  <FormInput
                    required
                    value="Chosen Paths BN"
                    label="Preset Name"
                    readOnly
                  >
                    Enter the full name of the exact preset used (e.g., 2
                    Sparklepad BT, LD King of Buzz 2).
                  </FormInput>

                  <FormInput value="" label="Pack Name" readOnly>
                    Provide the name of the preset pack. Leave blank for
                    built-in presets.
                  </FormInput>

                  <FormInput value="" label="Preset Author" readOnly>
                    Identify who created the preset or preset pack. Leave blank
                    for manufacturer, for factory presets.
                  </FormInput>

                  <FormInput required value="Key" label="Usage Type" readOnly>
                    Describe how the preset was used (e.g., Lead, Pad,
                    Sequence).
                  </FormInput>

                  <AudioInputStatic
                    label="Preset Audio (Optional)"
                    fileName="shoota-electra.mp3"
                    audioSrc="pWvFtJmMBmm0nD3po-57d-shoota-electra.mp3"
                    id="electra-audio"
                  >
                    Upload a short <kbd>.mp3</kbd> audio clip (approximately 4
                    bars) demonstrating how the preset is used in the song. The
                    clip should feature the melody played{" "}
                    <strong>without any external effects</strong>.
                  </AudioInputStatic>
                </FormSection>

                <button type="button" className={styles.addBtn} disabled>
                  + Add Another Preset
                </button>
              </div>

              <div className={styles.synthSection}>
                <div className={styles.entryNewHeader}>
                  <span className={styles.entryNewText}>Additional Synth</span>
                  <FaXmark className={styles.entryDeleteBtn} />
                </div>

                <FormSection className={styles.formSection}>
                  <FormInput required value="Nexus" label="Synth Name" readOnly>
                    Name the synth used in the track.
                  </FormInput>

                  <FormInput
                    required
                    value="reFx"
                    label="Manufacturer"
                    readOnly
                  >
                    Provide the manufacturer or developer (e.g., Spectrasonics)
                  </FormInput>

                  <FormInput
                    required
                    value="2009"
                    label="Release Year"
                    readOnly
                  >
                    Enter the synth's release year.
                  </FormInput>

                  <FormSelector
                    label="Synth Type"
                    disabled
                    required
                    selectOptions={[
                      { value: "VST", label: "VST" },
                      { value: "Hardware", label: "Hardware" },
                      { value: "Kontakt Bank", label: "Kontakt Bank" },
                      { value: "SoundFont", label: "SoundFont" },
                      { value: "Other", label: "Other" },
                    ]}
                  >
                    Select the synth format.
                  </FormSelector>

                  <ImageInputStatic
                    label="Synth Image"
                    imageSrc="https://i.imgur.com/8aQgeA2.jpeg"
                    fileName="nexus.jpg"
                    required
                  >
                    Upload an image of the synth. Minimum dimensions: 1000 x
                    1000 pixels.
                  </ImageInputStatic>
                </FormSection>

                <hr className={styles.hrSep} />

                <FormSection className={styles.formSection}>
                  <FormInput
                    required
                    value="PL Pizza Cult"
                    label="Preset Name"
                    readOnly
                  >
                    Enter the full name of the exact preset used (e.g., 2
                    Sparklepad BT, LD King of Buzz 2).
                  </FormInput>

                  <FormInput value="" label="Pack Name" readOnly>
                    Provide the name of the preset pack. Leave blank for
                    built-in presets.
                  </FormInput>

                  <FormInput value="" label="Preset Author" readOnly>
                    Identify who created the preset or preset pack. Leave blank
                    for manufacturer, for factory presets.
                  </FormInput>

                  <FormInput required value="Pluck" label="Usage Type" readOnly>
                    Describe how the preset was used (e.g., Lead, Pad,
                    Sequence).
                  </FormInput>

                  <AudioInputStatic
                    label="Preset Audio (Optional)"
                    fileName="shoota-nexus-pizz.mp3"
                    audioSrc="OxL1JWIQx7DvcHGESn_W--shoota-nexus-pizz.mp3"
                    id="nexus-audio"
                  >
                    Upload a short <kbd>.mp3</kbd> audio clip (approximately 4
                    bars) demonstrating how the preset is used in the song. The
                    clip should feature the melody played{" "}
                    <strong>without any external effects</strong>.
                  </AudioInputStatic>
                </FormSection>

                <button type="button" className={styles.addBtn} disabled>
                  + Add Another Preset
                </button>
              </div>

              <div className={styles.synthSection}>
                <div className={styles.entryNewHeader}>
                  <span className={styles.entryNewText}>Additional Synth</span>
                  <FaXmark className={styles.entryDeleteBtn} />
                </div>

                <FormSection className={styles.formSection}>
                  <FormInput
                    required
                    value="Omnisphere"
                    label="Synth Name"
                    readOnly
                  >
                    Name the synth used in the track.
                  </FormInput>

                  <FormInput
                    required
                    value="Spectrasonics"
                    label="Manufacturer"
                    readOnly
                  >
                    Provide the manufacturer or developer (e.g., Spectrasonics)
                  </FormInput>

                  <FormInput
                    required
                    value="2008"
                    label="Release Year"
                    readOnly
                  >
                    Enter the synth's release year.
                  </FormInput>

                  <FormSelector
                    label="Synth Type"
                    disabled
                    required
                    selectOptions={[
                      { value: "VST", label: "VST" },
                      { value: "Hardware", label: "Hardware" },
                      { value: "Kontakt Bank", label: "Kontakt Bank" },
                      { value: "SoundFont", label: "SoundFont" },
                      { value: "Other", label: "Other" },
                    ]}
                  >
                    Select the synth format.
                  </FormSelector>

                  <ImageInputStatic
                    label="Synth Image"
                    imageSrc="https://i.imgur.com/rfOuT0L.jpeg"
                    fileName="omnisphere.jpg"
                    required
                  >
                    Upload an image of the synth. Minimum dimensions: 1000 x
                    1000 pixels.
                  </ImageInputStatic>
                </FormSection>

                <hr className={styles.hrSep} />

                <FormSection className={styles.formSection}>
                  <FormInput
                    required
                    value="House Piano Dark"
                    label="Preset Name"
                    readOnly
                  >
                    Enter the full name of the exact preset used (e.g., 2
                    Sparklepad BT, LD King of Buzz 2).
                  </FormInput>

                  <FormInput value="" label="Pack Name" readOnly>
                    Provide the name of the preset pack. Leave blank for
                    built-in presets.
                  </FormInput>

                  <FormInput value="" label="Preset Author" readOnly>
                    Identify who created the preset or preset pack. Leave blank
                    for manufacturer, for factory presets.
                  </FormInput>

                  <FormInput required value="Key" label="Usage Type" readOnly>
                    Describe how the preset was used (e.g., Lead, Pad,
                    Sequence).
                  </FormInput>

                  <AudioInputStatic
                    label="Preset Audio (Optional)"
                    fileName="shoota-omni-pn-dark.mp3"
                    audioSrc="bXvXuq7my8rYpZcavmoUf-shoota-omni-pn-dark.mp3"
                    id="omni-piano-audio"
                  >
                    Upload a short <kbd>.mp3</kbd> audio clip (approximately 4
                    bars) demonstrating how the preset is used in the song. The
                    clip should feature the melody played{" "}
                    <strong>without any external effects</strong>.
                  </AudioInputStatic>
                </FormSection>

                <FormSection className={styles.formSection}>
                  <hr className={styles.hrSep} />
                  <div className={styles.entryNewHeader}>
                    <span className={styles.entryNewText}>
                      Additional Preset
                    </span>
                    <FaXmark className={styles.entryDeleteBtn} />
                  </div>

                  <FormInput
                    required
                    value="Electric Asian Fireflies"
                    label="Preset Name"
                    readOnly
                  >
                    Enter the full name of the exact preset used (e.g., 2
                    Sparklepad BT, LD King of Buzz 2).
                  </FormInput>

                  <FormInput value="" label="Pack Name" readOnly>
                    Provide the name of the preset pack. Leave blank for
                    built-in presets.
                  </FormInput>

                  <FormInput value="" label="Preset Author" readOnly>
                    Identify who created the preset or preset pack. Leave blank
                    for manufacturer, for factory presets.
                  </FormInput>

                  <FormInput required value="Synth" label="Usage Type" readOnly>
                    Describe how the preset was used (e.g., Lead, Pad,
                    Sequence).
                  </FormInput>

                  <AudioInputStatic
                    label="Preset Audio (Optional)"
                    fileName="shoota-omni-asian.mp3"
                    audioSrc="KtIc9Sqg8DFcjLX97n6tM-shoota-omni-asian.mp3"
                    id="omni-asian-audio"
                  >
                    Upload a short <kbd>.mp3</kbd> audio clip (approximately 4
                    bars) demonstrating how the preset is used in the song. The
                    clip should feature the melody played{" "}
                    <strong>without any external effects</strong>.
                  </AudioInputStatic>
                </FormSection>

                <button type="button" className={styles.addBtn} disabled>
                  + Add Another Preset
                </button>
              </div>

              <hr className={styles.hrBtns} />

              <button type="button" className={styles.addBtn} disabled>
                + Add Another Synth
              </button>
            </fieldset>

            <div className={styles.submitFooter}>
              <div className={styles.btnContainer}>
                <button className={styles.submitBtn} disabled>
                  Submit Entry
                </button>
                <button className={styles.clearBtn} disabled>
                  Clear Form
                </button>
              </div>
              <Link to="/upload-tos" className={styles.submitTosText}>
                Please ensure you have read and understood the Upload Terms of
                Service before submitting.
              </Link>
            </div>
          </form>
        </section>
      </ContentContainer>
    </>
  );
}
