import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import { createDelegate } from "./delegate";

export type SupabaseClientOptions = NonNullable<
  Parameters<typeof createClient>[2]
>;

export interface SupabasePrismaOptions extends SupabaseClientOptions {
  tableMap?: Partial<Record<keyof PrismaClient, string>>;
}

export interface PrismaSupabaseClient extends PrismaClient {
  supabase: SupabaseClient;
}

export function createPrismaSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  { tableMap = {}, ...options }: SupabasePrismaOptions = {}
): PrismaSupabaseClient {
  const supabase = new SupabaseClient(supabaseUrl, supabaseKey, options);

  const cache = new Map<string, ReturnType<typeof createDelegate>>();

  return new Proxy(
    {
      supabase,
      $on() {
        throw new Error("$on is not supported");
      },
      $connect() {
        console.warn("$connect is a noop for PrismaSupabaseClient");
        return Promise.resolve();
      },
      $disconnect() {
        console.warn("$disconnect is a noop for PrismaSupabaseClient");
        return Promise.resolve();
      },
      $use() {
        throw new Error("$use middleware is not supported");
      },
      $executeRawUnsafe() {
        throw new Error("Please use the Prisma Client for $executeRawUnsafe");
      },
      $queryRaw() {
        throw new Error("Please use the Prisma Client for $queryRaw");
      },
      $queryRawUnsafe() {
        throw new Error("Please use the Prisma Client for $queryRawUnsafe");
      },
      $transaction() {
        throw new Error(
          "$transaction is not supported. Please see https://github.com/supabase/postgrest-js/issues/219 for support progress "
        );
      },
    },
    {
      get(target, prop) {
        if (typeof prop !== "string" || prop in target) {
          return target[prop as keyof typeof target];
        }

        const cacheHit = cache.get(prop);

        if (cacheHit) {
          return cacheHit;
        }

        const tableName = tableMap[prop as keyof PrismaClient] ?? prop;

        const delegate = createDelegate(supabase, tableName);

        cache.set(prop, delegate);

        return delegate;
      },
    }
  ) as unknown as PrismaSupabaseClient;
}
