import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

import { toSelectString } from "./select";
import { AnyObject } from "./type-helpers";
import { appendWhere } from "./where";

export function createDelegate(supabase: SupabaseClient, tableName: string) {
  return {
    async create({ data }: Record<string, AnyObject>) {
      const query = supabase.from(tableName).insert(data);
      return handleSupabaseResponse(await query.then());
    },
    async createMany({ data, skipDuplicates }: Record<string, AnyObject>) {
      if (skipDuplicates) {
        throw new Error("skipDuplicates is not supported with createMany");
      }

      const query = supabase.from(tableName).insert(data);
      return handleSupabaseResponse(await query.then());
    },
    async findUnique(args: AnyObject) {
      const query = supabase.from(tableName).select(toSelectString(args));
      appendWhere(query, args);
      return handleSupabaseResponse(await query.single());
    },
    async findMany(args: AnyObject = {}) {
      const query = supabase.from(tableName).select(toSelectString(args));
      appendWhere(query, args);
      return handleSupabaseResponse(await query.then());
    },
    async findFirst(args: AnyObject = {}) {
      const query = supabase.from(tableName).select(toSelectString(args));
      appendWhere(query, args);
      return handleSupabaseResponse(await query.single());
    },
  };
}

function handleSupabaseResponse({
  error,
  data,
}: PostgrestResponse<unknown> | PostgrestSingleResponse<unknown>) {
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}
