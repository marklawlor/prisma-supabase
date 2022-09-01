/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma } from "@prisma/client";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { AnyObject, isObject } from "./type-helpers";

export function appendWhere(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  object: unknown
): PostgrestFilterBuilder<Record<string, unknown>> {
  if (isWhere(object)) {
    const url: URL = (query as any).url;

    for (const entry of Object.entries(object.where)) {
      for (const search of topLevel(entry[0], entry[1])) {
        url.searchParams.append(search[0], search[1]);
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
  keyA: string,
  valueA: unknown,
  options?: NestedOptions
): Array<[string, string]> {
  let value = valueA;

  switch (typeof value) {
    case "boolean":
    case "number":
    case "bigint":
    case "string":
      value = { eq: value };
  }

  if (typeof value === "object") {
    switch (keyA) {
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
          return [[keyA, "is.null"]];
        } else if (isConditionalObject(value)) {
          const { mode, ...rest } = value;

          return Object.entries(rest).map((entry) => {
            return [keyA, nested({ [entry[0]]: entry[1], mode }, options)];
          });
        } else {
          return Object.entries(value).flatMap((entry) => {
            return topLevel(`${keyA}.${entry[0]}`, entry[1]);
          });
        }
    }
  } else {
    throw new TypeError("Should not have reached here");
  }
}

interface NestedOptions {
  not?: boolean;
}

function nested(valueA: unknown, { not }: NestedOptions = {}): string {
  let value = valueA;
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
          case "endsWith":
            parsedValue = escapeValue(`*${entry[1]}`);
            break;
          default:
            parsedValue =
              entry[1] === true ? escapeValue(entry[0]) : escapeValue(entry[1]);
        }

        let operator: string = filterMap[entry[0]];
        const modePrefix = mode === "insensitive" ? "i" : "";

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

interface Conditional extends AnyObject {
  [index: keyof typeof filterMap]: unknown;
  mode?: string;
}

function isWhere(
  object: unknown
): object is { where: Record<string, Prisma.Enumerable<unknown>> } {
  return Boolean(
    object &&
      typeof object === "object" &&
      typeof (object as Record<string, unknown>).where === "object"
  );
}

function isConditionalObject(object: unknown): object is Conditional {
  if (!isObject(object)) {
    return false;
  }

  const { mode, ...other } = object;

  return conditionalKeys.includes(Object.keys(other)[0]);
}
