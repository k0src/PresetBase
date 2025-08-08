import styles from "./AlertMessage.module.css";
import classNames from "classnames";

import { FaCircleCheck, FaTriangleExclamation, FaXmark } from "react-icons/fa6";

const alertConfig = {
  info: {
    icon: FaTriangleExclamation,
    className: styles.infoMessage,
  },
  success: {
    icon: FaCircleCheck,
    className: styles.successMessage,
  },
  error: {
    icon: FaXmark,
    className: styles.errorMessage,
  },
};

export default function AlertMessage({ type, children }) {
  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  return (
    <div className={classNames(styles.alertMessage, config.className)}>
      <IconComponent className={styles.alertIcon} />
      <span className={styles.alertText}>{children}</span>
    </div>
  );
}
