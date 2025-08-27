import { memo, useMemo, Fragment } from "react";

import styles from "./SlideoutInfoSection.module.css";

const SlideoutInfoSection = memo(function SlideoutInfoSection({
  data,
  config,
}) {
  const infoFields = useMemo(() => {
    if (!config?.fields || !data) return [];

    return config.fields.map((field) => {
      const value = data[field.key];
      return {
        ...field,
        value:
          field.key === "timestamp"
            ? new Date(value).toLocaleDateString()
            : value,
      };
    });
  }, [config, data]);

  return (
    <div className={styles.infoSection}>
      {infoFields.map((field, index) => (
        <Fragment key={field.key}>
          <div className={styles.infoEntry}>
            <span className={styles.infoText}>
              <strong>{field.label}:</strong>
            </span>
            <span className={styles.infoText}>{field.value}</span>
          </div>
          {index < infoFields.length - 1 && (
            <span className={styles.bullet}>&bull;</span>
          )}
        </Fragment>
      ))}
    </div>
  );
});

export default SlideoutInfoSection;
