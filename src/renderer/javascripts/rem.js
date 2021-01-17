import getFontSize from './getFontSize';

export function convertRemToPixels(rem) {
  return rem * getFontSize();
}
export 
function convertPixelsToRem(px) {
  return px / getFontSize();
}
