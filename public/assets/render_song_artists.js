document.querySelectorAll(".result-all-artists").forEach((element) => {
  const song = JSON.parse(decodeURIComponent(element.dataset.allArtists));

  const allArtists = song.all_artists
    .sort((a, b) => {
      if (a.role === "Main" && b.role !== "Main") return -1;
      if (a.role !== "Main" && b.role === "Main") return 1;
      return 0;
    })
    .map((artist) => {
      return artist.artist_name;
    });

  element.innerHTML = allArtists.join(", ");
});
