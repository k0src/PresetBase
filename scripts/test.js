const generateTagColors = () => {
  const hslToHex = function (h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Color family definitions
  const colorFamilies = [
    { hueMin: 300, hueMax: 340 }, // Pink/Magenta
    { hueMin: 0, hueMax: 20 }, // Red
    { hueMin: 20, hueMax: 45 }, // Orange
    { hueMin: 45, hueMax: 70 }, // Yellow
    { hueMin: 120, hueMax: 160 }, // Green
    { hueMin: 180, hueMax: 200 }, // Cyan
    { hueMin: 200, hueMax: 260 }, // Blue
    { hueMin: 260, hueMax: 300 }, // Purple
  ];

  const family =
    colorFamilies[Math.floor(Math.random() * colorFamilies.length)];
  const hue =
    Math.floor(Math.random() * (family.hueMax - family.hueMin + 1)) +
    family.hueMin;

  // Generate colors
  const textColor = hslToHex(
    hue,
    85 + Math.floor(Math.random() * 15),
    75 + Math.floor(Math.random() * 15)
  );
  const borderColor = hslToHex(
    hue,
    50 + Math.floor(Math.random() * 20),
    25 + Math.floor(Math.random() * 10)
  );
  const backgroundColor = hslToHex(
    hue,
    35 + Math.floor(Math.random() * 15),
    12 + Math.floor(Math.random() * 8)
  );

  return {
    textColor,
    borderColor,
    backgroundColor,
  };
};

console.log(generateTagColors());
