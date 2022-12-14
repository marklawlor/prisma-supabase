# Prisma-Supabase

Experimental alternative client for Supabase that uses your Prisma types and syntax.

```
import { createClient } from "prisma-supabase";

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

```

## Differences from Prisma client

In mapping Prisma to Supabase there are some minor differences

### createMany

createMany using `{ skipDuplicates: true }` is not supported

## Credits:

https://github.com/TheoBr for the original idea
