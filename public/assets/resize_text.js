fitTextToWidth = function (el, maxFontSize = 50, minFontSize = 30) {
  let fontSize = maxFontSize;
  el.style.fontSize = fontSize + "px";

  while (el.scrollWidth > el.clientWidth && fontSize > minFontSize) {
    fontSize--;
    el.style.fontSize = fontSize + "px";
  }
};

const h1 = document.getElementById("heading");
fitTextToWidth(h1, h1.dataset.maxsize);
