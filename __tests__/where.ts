import { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import PostgrestFilterBuilder from "./utils/filter-builder";
import { appendWhere } from "../src/where";

jest.mock("./utils/filter-builder"); // I don't know how to auto mock named exports...

const mockedFilterBuilder = jest.mocked(PostgrestFilterBuilder);

beforeEach(() => {
  mockedFilterBuilder.mockClear();
});

const filterBuilder = () => {
  return new PostgrestFilterBuilder<Record<string, unknown>>(
    new PostgrestQueryBuilder("http://fake.url")
  );
};

it("works", () => {
  appendWhere(filterBuilder(), {});

  const instance = mockedFilterBuilder.mock.instances[0];

  expect(instance.filter).toHaveBeenCalledWith("test", "eq", "value");
});
