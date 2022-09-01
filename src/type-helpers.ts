export type AnyObject = Record<string | number | symbol, unknown>;

export function isObject(object: unknown): object is AnyObject {
  return Boolean(typeof object === "object" && object);
}
