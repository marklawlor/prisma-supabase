import { createClient } from "../src/client";

let searchParams: URLSearchParams;

const client = createClient("http://fake.url", "key", {
  async fetch(url) {
    searchParams = new URL(url.toString()).searchParams;
    return {
      ok: true,
      headers: new Map(),
      text: () => Promise.resolve(""),
    } as unknown as Response;
  },
});

it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#filtering", () => {
  client.user.findMany({
    where: {
      email: {
        endsWith: "prisma.io",
      },
      posts: {
        some: {
          published: true,
        },
      },
    },
  });

  expect([...searchParams.entries()]).toEqual([
    ["select", "*"],
    ["email", "like.%22*prisma.io%22"],
    ["posts", "cs.published"],
  ]);
});

it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#combining-operators", () => {
  client.user.findMany({
    where: {
      OR: [
        { email: { endsWith: "prisma.io" } },
        { email: { endsWith: "gmail.com" } },
      ],
      NOT: {
        email: {
          endsWith: "hotmail.com",
        },
      },
    },
  });

  expect([...searchParams.entries()]).toEqual([
    ["select", "*"],
    ["or", "(email.like.%22*prisma.io%22,email.like.%22*gmail.com%22)"],
    ["email", "not.like.%22*hotmail.com%22"],
  ]);
});

it.skip("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#combining-operators 1", () => {
  // TODO: Not sure how to do some
});

it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#combining-operators 2", () => {
  client.post.findMany({
    where: {
      author: {
        email: {
          contains: "prisma.io",
        },
      },
    },
  });

  expect([...searchParams.entries()]).toEqual([
    ["select", "*"],
    ["author.email", "cs.%22prisma.io%22"],
  ]);
});

it.skip("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#filter-on-scalar-lists--arrays", () => {
  // TODO: Not sure how to do has
});

it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#case-insensitive-filtering", () => {
  client.user.findMany({
    where: {
      email: {
        endsWith: "prisma.io",
        mode: "insensitive", // Default value: default
      },
      name: {
        equals: "Archibald", // Default mode
      },
    },
  });

  expect([...searchParams.entries()]).toEqual([
    ["select", "*"],
    ["email", "ilike.%22*prisma.io%22"],
    ["name", "eq.Archibald"],
  ]);
});
