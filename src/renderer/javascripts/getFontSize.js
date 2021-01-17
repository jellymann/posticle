export default function getFontSize(element = document.documentElement) {
  return parseFloat(getComputedStyle(element).fontSize);
}
