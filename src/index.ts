import "dotenv/config";

import { createClient } from "./client";

const client = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLIC_ANON_KEY!,
  {
    tableMap: {
      user: "users",
    },
  }
);

void (async function () {
  const results = await client.user.findMany({
    select: {
      name: true,
      posts: {
        select: {
          id: true,
        },
      },
    },
  });

  console.log(JSON.stringify(results, null, 2));
})();
