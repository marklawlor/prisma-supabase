export function toSelectString({ select, include }: Record<string, unknown>) {
  if (include) {
    return getIncludeTokens(include);
  } else if (select) {
    return getSelectTokens(select);
  } else {
    return "*";
  }
}

function getSelectTokens(obj: object): string {
  const tokens = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === true) {
      tokens.push(key);
    } else if (typeof value === "object" && value?.select) {
      tokens.push(`${key}(${getSelectTokens(value.select)})`);
    }
  }

  return tokens.join(",");
}

function getIncludeTokens(obj: object, topLevel = true): string {
  const tokens = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === true) {
      topLevel ? tokens.push(`${key}(*)`) : tokens.push(key);
    } else if (typeof value === "object") {
      tokens.push(`${key}(${toSelectString(value)})`);
    }
  }

  return tokens.join(",");
}
