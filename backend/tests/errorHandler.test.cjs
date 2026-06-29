const assert = require("node:assert/strict");
const test = require("node:test");
const { z } = require("zod");
const { createMockResponse, loadFresh } = require("./testUtils.cjs");

test("errorHandler formats Zod errors as status 400", () => {
  const { moduleExports } = loadFresh("middleware/errorHandler.js");
  const schema = z.object({
    name: z.string().min(2),
  });
  const parseResult = schema.safeParse({ name: "" });
  const res = createMockResponse();

  moduleExports.errorHandler(parseResult.error, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.message, "Validation error");
  assert.deepEqual(res.body.error.errors[0], {
    path: "name",
    message: "Too small: expected string to have >=2 characters",
    code: "too_small",
  });
});

test("errorHandler keeps generic error behavior", () => {
  const { moduleExports } = loadFresh("middleware/errorHandler.js");
  const error = new Error("Custom failure");
  error.statusCode = 418;
  error.details = "Extra details";
  const res = createMockResponse();

  moduleExports.errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 418);
  assert.deepEqual(res.body, {
    error: {
      message: "Custom failure",
      details: "Extra details",
    },
  });
});
