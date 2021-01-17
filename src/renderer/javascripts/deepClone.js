export default function deepClone(value) {
  if (value === null) return value;
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return value;
    case 'function':
      return undefined;
  }
  if (value instanceof Date) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  let newObject = {};
  Object.keys(value).forEach(key => {
    if (value.hasOwnProperty(key)) {
      newObject[key] = deepClone(value[key]);
    }
  });
  return newObject;
}
