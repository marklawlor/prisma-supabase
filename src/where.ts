import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export function appendWhere(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  where: object = {}
): PostgrestFilterBuilder<Record<string, unknown>> {
  for (const [key, value] of Object.entries(where)) {
    switch (key) {
      case "AND":
        appendAnd(query, value);
        break;
      case "OR":
        appendOr(query, value);
        break;
      case "NOT":
        appendNot(query, value);
        break;
      default:
        appendOperator(query, key, value);
    }
  }
  query.filter("test", "eq", "value");
  return query;
}

function appendAnd(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  and: never[]
) {
  throw new Error("TODO");
}

function appendNot(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  not: never[]
) {
  throw new Error("TODO");
}

function appendOr(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  or: never[]
) {
  throw new Error("TODO");
}

type FilterOperator = Parameters<PostgrestFilterBuilder<unknown>["filter"]>[1];
const filterMap: Record<string, FilterOperator> = {
  equals: "eq",
  in: "in",
  notIn: "not.in",
  lt: "lt",
  lte: "lte",
  gt: "gt",
  gte: "gte",
  contains: "cs",
  startsWith: "eq",
  endsWith: "eq",
};

function appendOperator(
  query: PostgrestFilterBuilder<Record<string, unknown>>,
  column: string,
  operatorObj: object
) {
  for (const [key, value] of Object.entries(operatorObj)) {
    if (key === "not") {
      // Not is nested
      //
    } else if (key === "startsWith") {
      const operator = value.mode === "insensitive" ? "ilike" : "like";
      query.filter(column, operator, `${value}*`);
    } else if (key === "endsWith") {
      const operator = value.mode === "insensitive" ? "ilike" : "like";
      query.filter(column, operator, `*${value}`);
    } else if (key in filterMap) {
      query.filter(column, filterMap[key], value);
    }
  }
}
