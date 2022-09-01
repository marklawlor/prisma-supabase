import { Prisma } from "@prisma/client";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

type Object = Record<string | number | symbol, unknown>;

export function appendWhere(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  obj: unknown
): PostgrestFilterBuilder<Record<string, unknown>> {
  if (isWhere(obj)) {
    const url: URL = (query as any).url;

    for (const entry of Object.entries(obj.where)) {
      for (const param of topLevel(entry[0], entry[1])) {
        url.searchParams.append(param[0], param[1]);
      }
    }
  }

  return query;
}

type FilterParameters = Parameters<PostgrestFilterBuilder<unknown>["filter"]>;
type FilterOperator = FilterParameters[1];
const filterMap: Record<string, FilterOperator> = {
  equals: "eq",
  in: "in",
  notIn: "not.in",
  lt: "lt",
  lte: "lte",
  gt: "gt",
  gte: "gte",
  contains: "cs",
  startsWith: "like",
  endsWith: "like",
  some: "cs",
};
const conditionalKeys = Object.keys(filterMap);

function topLevel(
  key: string,
  argValue: unknown,
  options?: NestedOptions
): Array<[string, string]> {
  let value = argValue;

  switch (typeof value) {
    case "boolean":
    case "number":
    case "bigint":
    case "string":
      value = { eq: value };
  }

  if (typeof value === "object") {
    switch (key) {
      case "OR":
        return [["or", nested(value, options)]];
      case "AND":
        return isObject(value) ? [["and", nested(value, options)]] : [];
      case "NOT":
        if (!isObject(value)) {
          return [];
        }

        return Object.entries(value).flatMap((entry) => {
          return topLevel(entry[0], entry[1], { not: true });
        });

      default:
        if (value === null) {
          return [[key, "is.null"]];
        } else if (isConditionalObject(value)) {
          const { mode, ...rest } = value;

          return Object.entries(rest).map((entry) => {
            return [key, nested({ [entry[0]]: entry[1], mode }, options)];
          });
        } else {
          return Object.entries(value).flatMap((entry) => {
            return topLevel(`${key}.${entry[0]}`, entry[1]);
          });
        }
    }
  } else {
    throw new Error("Should not have reached here");
  }
}

interface NestedOptions {
  not?: boolean;
}

function nested(argValue: unknown, { not }: NestedOptions = {}): string {
  let value = argValue;
  const prefix = not ? "not." : "";

  switch (typeof value) {
    case "boolean":
    case "number":
    case "bigint":
    case "string":
      value = { eq: value };
      break;
    case "object":
      if (value === null) {
        value = { is: null };
      }
      break;
  }

  if (isConditionalObject(value)) {
    const { mode, ...rest } = value;

    return Object.entries(rest)
      .map((entry) => {
        let parsedValue;

        switch (entry[0]) {
          case "startsWith":
            parsedValue = escapeValue(`${entry[1]}*`);
            break;
          case "startsWith":
            parsedValue = escapeValue(`${entry[1]}*`);
            break;
          case "endsWith":
            parsedValue = escapeValue(`*${entry[1]}`);
            break;
          default:
            if (entry[1] === true) {
              parsedValue = escapeValue(entry[0]);
            } else {
              parsedValue = escapeValue(entry[1]);
            }
        }

        let operator: string = filterMap[entry[0]];
        let modePrefix = mode === "insensitive" ? "i" : "";

        switch (operator) {
          case "like":
            operator = `${modePrefix}${operator}`;
            break;
        }

        return `${prefix}${operator}.${parsedValue}`;
      })
      .join(",");
  } else if (Array.isArray(value)) {
    return `(${value.map((v) => nested(v))})`;
  } else if (typeof value === "object" && value) {
    return Object.entries(value)
      .map((entry) => {
        switch (entry[0]) {
          case "AND":
          case "OR":
          case "NOT":
            return "";
          default:
            return `${entry[0]}.${nested(entry[1], { not })}`;
        }
      })
      .join(",");
  } else {
    return "";
  }
}

function escapeValue(value: unknown): string {
  if (typeof value === "string" && value.includes(".")) {
    return `%22${value}%22`;
  } else if (isObject(value) && Object.values(value)[0] === true) {
    return escapeValue(Object.keys(value)[0]);
  }

  return (value as any).toString();
}

interface Conditional extends Object {
  [index: keyof typeof filterMap]: unknown;
  mode?: string;
}

function isWhere(
  obj: unknown
): obj is { where: Record<string, Prisma.Enumerable<unknown>> } {
  return Boolean(
    obj &&
      typeof obj === "object" &&
      typeof (obj as Record<string, unknown>).where === "object"
  );
}

function isObject(obj: unknown): obj is Object {
  return Boolean(typeof obj === "object" && obj);
}

function isConditionalObject(obj: unknown): obj is Conditional {
  if (!isObject(obj)) {
    return false;
  }

  const { mode, ...other } = obj;

  return conditionalKeys.includes(Object.keys(other)[0]);
}
