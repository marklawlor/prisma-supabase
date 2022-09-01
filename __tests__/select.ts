import { toSelectString } from "../src/select";

it("select", () => {
  expect(
    toSelectString({
      select: {
        test: true,
        test2: true,
        nested: {
          select: {
            nested1: true,
          },
        },
      },
    })
  ).toEqual(`test,test2,nested(nested1)`);
});

it("include", () => {
  expect(
    toSelectString({
      include: {
        wildcard: true,
        partial: {
          select: {
            test: true,
            test2: true,
            nested: {
              select: {
                nested1: true,
              },
            },
          },
        },
      },
    })
  ).toEqual(`wildcard(*),partial(test,test2,nested(nested1))`);
});
