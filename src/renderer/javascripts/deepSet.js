export default function deepSet(value, setValue, head, ...rest) {
  if (rest.length === 0) {
    value[head] = setValue;
    return;
  }
  value[head] = value[head] || {};
  deepSet(value[head], setValue, ...rest);
}
