import getFontSize from './getFontSize';

function getFontFamily() {
  return getComputedStyle(document.body).fontFamily;
}

export default function getTextWidth(string, { fontSize = getFontSize(), fontFamily = getFontFamily() } = {}) {
  let text = document.createElement("span");
  document.body.appendChild(text);

  text.style.font = fontFamily;
  text.style.fontSize = `${fontSize}px`;
  text.style.height = 'auto';
  text.style.width = 'auto';
  text.style.position = 'absolute';
  text.style.whiteSpace = 'no-wrap';
  text.textContent = string;

  let w = Math.ceil(text.clientWidth);
  text.remove();

  return w;
}
