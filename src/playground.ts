/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "dotenv/config";

import { createClient } from "./index";

const client = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLIC_ANON_KEY!,
  {
    tableMap: {
      user: "users",
    },
  }
);

// client.supabase.from("test").select().or();

void (async function () {
  const results = await client.user.findMany({
    where: {
      name: {
        contains: "asdf",
        equals: "asdf",
      },
    },
    select: {
      name: true,
      posts: {
        select: {
          id: true,
        },
      },
    },
  });

  console.log(JSON.stringify(results, undefined, 2));
})();
