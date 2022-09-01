import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { toSelectString } from "./select";
import { appendWhere } from "./where";

export function createDelegate(supabase: SupabaseClient, tableName: string) {
  return {
    async findUnique(args: Record<string, unknown>) {
      let query = supabase.from(tableName).select(toSelectString(args));
      query = appendWhere(query, args);
      return handleSupabaseResponse(await query.single());
    },
    async findMany(args: Record<string, unknown>) {
      let query = supabase.from(tableName).select(toSelectString(args));
      query = appendWhere(query, args);
      return handleSupabaseResponse(await query.then());
    },
  };
}

function handleSupabaseResponse({
  error,
  data,
  ...rest
}: PostgrestResponse<unknown> | PostgrestSingleResponse<unknown>) {
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}
