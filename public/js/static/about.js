const loadRepoCard = async function (username, repo) {
  const res = await fetch(`https://api.github.com/repos/${username}/${repo}`);
  const data = await res.json();

  document.querySelector(".repo-owner").textContent = data.owner.login;
  document.querySelector(".repo-owner").href = data.owner.html_url;
  document.querySelector(".repo-name").textContent = data.name;
  document.querySelector(".repo-name").href = data.html_url;
  document.querySelector(".repo-description").textContent = data.description;
  document.querySelector(".repo-avatar").src = data.owner.avatar_url;

  const stats = document.querySelectorAll(".stat-text");
  stats[0].textContent = "1";
  stats[1].textContent = data.open_issues_count;
  stats[2].textContent = data.stargazers_count;
  stats[3].textContent = data.forks_count;

  const langRes = await fetch(data.languages_url);
  const langData = await langRes.json();
  const total = Object.values(langData).reduce((a, b) => a + b, 0);
  const langBar = document.querySelector(".github-card--langs");
  langBar.innerHTML = "";
  for (const [lang, val] of Object.entries(langData)) {
    const div = document.createElement("div");
    div.className = "lang-color";
    div.style.backgroundColor = langColors[lang] || "#ccc";
    div.style.flex = (val / total).toFixed(2);
    langBar.appendChild(div);
  }
};

const langColors = {
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  TypeScript: "#3178c6",
  EJS: "#a91e50",
  JSX: "#61dafb",
};

loadRepoCard("k0src", "presetbase");
