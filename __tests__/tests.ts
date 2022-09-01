import { createClient } from "../src";
import { AnyObject } from "../src/type-helpers";

let searchParameters: URLSearchParams;
let body: AnyObject;

const client = createClient("http://fake.url", "key", {
  async fetch(url, options) {
    body = JSON.parse(options?.body?.toString() ?? "{}");
    searchParameters = new URL(url.toString()).searchParams;
    return {
      ok: true,
      headers: new Map(),
      text: () => Promise.resolve(""),
    } as unknown as Response;
  },
});

describe.skip("create", () => {
  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#create-a-single-record", () => {
    client.user.create({
      data: {
        email: "elsa@prisma.io",
        name: "Elsa Prisma",
      },
    });

    expect(body).toEqual({
      email: "elsa@prisma.io",
      name: "Elsa Prisma",
    });
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#create-multiple-records", () => {
    expect(async () => {
      return client.user.createMany({
        data: [
          { name: "Bob", email: "bob@prisma.io" },
          // cspell:disable-next-line
          { name: "Bobo", email: "bob@prisma.io" }, // disable
          // cspell:disable-next-line
          { name: "Yewande", email: "yewande@prisma.io" },
          { name: "Angelique", email: "angelique@prisma.io" },
        ],
        skipDuplicates: true,
      });
    }).rejects.toThrow();
  });
});

describe("read", () => {
  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#get-record-by-id-or-unique-identifier", async () => {
    await client.user.findUnique({
      where: {
        email: "elsa@prisma.io",
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["email", "eq.%22elsa@prisma.io%22"],
    ]);

    await client.user.findUnique({
      where: {
        id: 99,
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["id", "eq.99"],
    ]);
  });

  it.skip("https://www.prisma.io/docs/concepts/components/prisma-client/crud#get-record-by-compound-id-or-compound-unique-identifier", async () => {
    // TODO
    await client.timePeriod.findUnique({
      where: {
        year_quarter: {
          quarter: 4,
          year: 2020,
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["quarter", "eq.4"],
      ["year", "eq.2020"],
    ]);

    await client.timePeriod.findUnique({
      where: {
        timePeriodId: {
          quarter: 4,
          year: 2020,
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["quarter", "eq.4"],
      ["year", "eq.2020"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#get-all-records", () => {
    client.user.findMany();

    expect([...searchParameters.entries()]).toEqual([["select", "*"]]);
  });

  it.skip("https://www.prisma.io/docs/concepts/components/prisma-client/crud#get-the-first-record-that-matches-a-specific-criteria", () => {
    // TODO: some?
    client.user.findFirst({
      where: {
        posts: {
          some: {
            likes: {
              gt: 100,
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["posts.likes", "*"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#filter-by-a-single-field-value", () => {
    client.user.findMany({
      where: {
        email: {
          endsWith: "prisma.io",
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["email", "like.%22*prisma.io%22"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#filter-by-multiple-field-values", () => {
    client.user.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: "E",
            },
          },
          {
            AND: {
              profileViews: {
                gt: 0,
              },
              role: {
                equals: "ADMIN",
              },
            },
          },
        ],
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["or", "(name.like.E*,and(profileViews.gt.0,role.eq.ADMIN))"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#filter-by-related-record-field-values", () => {
    client.user.findMany({
      where: {
        email: {
          endsWith: "prisma.io",
        },
        posts: {
          some: {
            published: false,
          },
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["email", "like.%22*prisma.io%22"],
      ["posts", "cs.published"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#select-a-subset-of-fields", () => {
    client.user.findUnique({
      where: {
        email: "emma@prisma.io",
      },
      select: {
        email: true,
        name: true,
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "email,name"],
      ["email", "eq.%22emma@prisma.io%22"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#select-a-subset-of-related-record-fields", () => {
    client.user.findUnique({
      where: {
        email: "emma@prisma.io",
      },
      select: {
        email: true,
        posts: {
          select: {
            likes: true,
          },
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "email,posts(likes)"],
      ["email", "eq.%22emma@prisma.io%22"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/crud#include-related-records", () => {
    client.user.findMany({
      where: {
        role: "ADMIN",
      },
      include: {
        posts: true,
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*,posts(*)"],
      ["role", "eq.ADMIN"],
    ]);
  });
});

describe.skip("where", () => {
  it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#combining-operators", () => {
    client.user.findMany({
      where: {
        OR: [
          {
            email: {
              endsWith: "prisma.io",
            },
          },
          { email: { endsWith: "gmail.com" } },
        ],
        NOT: {
          email: {
            endsWith: "hotmail.com",
          },
        },
      },
      select: {
        email: true,
      },
    });

    expect([...searchParameters.entries()]).toEqual([
      ["select", "email"],
      ["or", "(email.like.%22*prisma.io%22,email.like.%22*gmail.com%22)"],
      ["email", "not.like.%22*hotmail.com%22"],
    ]);
  });

  it("https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting#filter-on-relations", () => {
    client.post.findMany({
      where: {
        author: {
          email: {
            contains: "prisma.io",
          },
        },
      },
    });

    expect([...searchParameters.entries()]).toEqual([
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

    expect([...searchParameters.entries()]).toEqual([
      ["select", "*"],
      ["email", "ilike.%22*prisma.io%22"],
      ["name", "eq.Archibald"],
    ]);
  });
});
