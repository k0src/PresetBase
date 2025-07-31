import { useNavigate } from "react-router-dom";

import styles from "./SearchBoxMobile.module.css";

export default function SearchBoxMobile() {
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(
        `/search?query=${encodeURIComponent(value.trim().toLowerCase())}`
      );
    }
  };

  return (
    <input
      className={styles.mobileSearchInput}
      type="search"
      enterKeyHint="search"
      placeholder="Search..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch(e.target.value);
        }
      }}
    />
  );
}
