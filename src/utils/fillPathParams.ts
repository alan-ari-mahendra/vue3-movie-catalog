export function fillPathParams(
  pathTemplate: string,
  params: Record<string, string>
) {
  return pathTemplate.replace(/:([a-zA-Z_]+)/g, (_, key) => {
    if (params[key] === undefined) {
      throw new Error(`Missing parameter: ${key}`);
    }
    return params[key];
  });
}
