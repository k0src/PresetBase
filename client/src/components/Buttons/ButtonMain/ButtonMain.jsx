import styles from "./ButtonMain.module.css";

export default function ButtonMain({ children, onClick, ...props }) {
  return (
    <button className={styles.buttonMain} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
