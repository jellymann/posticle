export function matchUrlTemplate(url, template) {
  let urlParts = url.split('/');
  let templateParts = template.split('/');

  if (urlParts.length !== templateParts.length) return false;

  let params = {};

  for (let i = 0; i < templateParts.length; i++) {
    let templatePart = templateParts[i];
    let urlPart = urlParts[i];
    if (templatePart.indexOf(':') === 0) {
      params[templatePart.substring(1)] = urlPart;
    } else {
      if (templatePart !== urlPart) return false;
    }
  }

  return params;
}

export function findMatchingRoute(url, routes) {
  for (let route in routes) {
    let params = matchUrlTemplate(url, route);
    if (params) {
      return [routes[route], params];
    }
  }
  return [null, {}];
}
