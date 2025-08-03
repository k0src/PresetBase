import { useState, useEffect } from "react";
import styles from "./GitHubRepoCard.module.css";

const langColors = {
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  TypeScript: "#3178c6",
  EJS: "#a91e50",
  JSX: "#61dafb",
};

const PeopleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    className={styles.icon}
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z" />
  </svg>
);

const IssueIcon = () => (
  <svg
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    fill="currentColor"
    className={styles.icon}
  >
    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
  </svg>
);

const StarIcon = () => (
  <svg
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    fill="currentColor"
    className={styles.icon}
  >
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z" />
  </svg>
);

const ForkIcon = () => (
  <svg
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    fill="currentColor"
    className={styles.icon}
  >
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    height="32"
    aria-hidden="true"
    viewBox="0 0 24 24"
    version="1.1"
    width="32"
    fill="currentColor"
    className={`${styles.icon} ${styles.githubLogo}`}
  >
    <path d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z" />
  </svg>
);

const GitHubRepoCard = ({ username, repo }) => {
  const [repoData, setRepoData] = useState(null);
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch repository data
        const repoResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo}`
        );
        if (!repoResponse.ok) {
          throw new Error(
            `Failed to fetch repository data: ${repoResponse.status}`
          );
        }
        const repoInfo = await repoResponse.json();

        // Fetch languages data
        const langResponse = await fetch(repoInfo.languages_url);
        if (!langResponse.ok) {
          throw new Error(
            `Failed to fetch languages data: ${langResponse.status}`
          );
        }
        const langData = await langResponse.json();

        setRepoData(repoInfo);
        setLanguages(langData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching GitHub data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [username, repo]);

  const renderLanguageBar = () => {
    if (!languages || Object.keys(languages).length === 0) return null;

    const total = Object.values(languages).reduce((a, b) => a + b, 0);

    return (
      <div className={styles.langs}>
        {Object.entries(languages).map(([lang, value]) => (
          <div
            key={lang}
            className={styles.langColor}
            style={{
              backgroundColor: langColors[lang] || "#ccc",
              flex: (value / total).toFixed(2),
            }}
            title={`${lang}: ${((value / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading repository data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading repository: {error}</div>
      </div>
    );
  }

  if (!repoData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.githubCard}>
        <div className={styles.header}>
          <div className={styles.title}>
            <a
              className={styles.repoOwner}
              href={repoData.owner.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repoData.owner.login}
            </a>
            /
            <a
              className={styles.repoName}
              href={repoData.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repoData.name}
            </a>
          </div>
          <img
            className={styles.repoAvatar}
            src={repoData.owner.avatar_url}
            alt={`${repoData.owner.login}'s avatar`}
          />
        </div>

        <p className={styles.description}>{repoData.description}</p>

        <div className={styles.statsContainer}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <PeopleIcon />
              <span>1</span>
            </div>
            <div className={styles.stat}>
              <IssueIcon />
              <span>{repoData.open_issues_count}</span>
            </div>
            <div className={styles.stat}>
              <StarIcon />
              <span>{repoData.stargazers_count}</span>
            </div>
            <div className={styles.stat}>
              <ForkIcon />
              <span>{repoData.forks_count}</span>
            </div>
          </div>
          <GitHubIcon />
        </div>

        {renderLanguageBar()}
      </div>
    </div>
  );
};

export default GitHubRepoCard;
