const imgSrc = document.querySelector(".cover-image").src;
const bg = document.querySelector(".meta--section");
const songInfo = document.querySelector(".item-info");
const openVideoLink = document.querySelector(".open-video-link");

const getDominantColor = (url) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colorMap = {};

      for (let i = 0; i < data.length; i += 16) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (
          a < 128 ||
          (r < 20 && g < 20 && b < 20) ||
          (r > 235 && g > 235 && b > 235)
        )
          continue;

        const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${
          Math.round(b / 10) * 10
        }`;
        colorMap[key] = colorMap[key] || { count: 0, r, g, b };
        colorMap[key].count++;
      }

      const topColor = Object.values(colorMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((c) => ({
          ...c,
          vibrancy: rgbToHsv(c.r, c.g, c.b).s * rgbToHsv(c.r, c.g, c.b).v,
        }))
        .sort((a, b) => b.vibrancy - a.vibrancy)[0];

      const hex = `#${(
        (1 << 24) +
        (topColor.r << 16) +
        (topColor.g << 8) +
        topColor.b
      )
        .toString(16)
        .slice(1)}`;
      resolve(hex);
    };

    img.src = url;
  });

const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const v = max,
    d = max - min;
  const s = max === 0 ? 0 : d / max;
  const h =
    max === min
      ? 0
      : max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
      ? (b - r) / d + 2
      : (r - g) / d + 4;
  return { h: h / 6, s, v };
};

const isDark = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
};

getDominantColor(imgSrc).then((color) => {
  bg.style.backgroundColor = color;
  const action = isDark(color) ? "add" : "remove";
  songInfo.classList[action]("invert");
  if (openVideoLink) {
    openVideoLink.classList[action]("invert");
  }
});
