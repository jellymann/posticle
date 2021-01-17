export default function dig(value, head = null, ...rest) {
  if (head === null) {
    return value;
  }
  if (value[head]) {
    return dig(value[head], ...rest);
  }
  return null;
}
