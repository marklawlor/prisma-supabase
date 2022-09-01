import { AnyObject, isObject } from "./type-helpers";

export function toSelectString({ select, include }: AnyObject) {
  if (include) {
    return getIncludeTokens(include);
  } else if (isObject(select)) {
    return getSelectTokens(select);
  } else {
    return "*";
  }
}

function getSelectTokens(object: AnyObject): string {
  const tokens = [];

  for (const [key, value] of Object.entries(object)) {
    if (value === true) {
      tokens.push(key);
    } else if (isObject(value) && isObject(value.select)) {
      tokens.push(`${key}(${getSelectTokens(value.select)})`);
    }
  }

  return tokens.join(",");
}

function getIncludeTokens(object: object, topLevel = true): string {
  const tokens = [];

  for (const [key, value] of Object.entries(object)) {
    if (value === true) {
      topLevel ? tokens.push(`${key}(*)`) : tokens.push(key);
    } else if (typeof value === "object") {
      tokens.push(`${key}(${toSelectString(value)})`);
    }
  }

  return tokens.join(",");
}
