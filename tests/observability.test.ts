import test from "node:test";
import assert from "node:assert/strict";
import { serverErrorEvent } from "../lib/observability";

test("server error events preserve route diagnostics without query, credentials, or error text", () => {
  const event = serverErrorEvent({
    error: new Error(
      "fetch https://alice:password@example.test/profile?token=secret failed",
    ),
    digest: "digest-42",
    method: "GET",
    routePath: "/zip/[zip]",
    routeType: "render",
  });

  assert.deepEqual(event, {
    event: "okelom.server_error",
    errorName: "Error",
    digest: "digest-42",
    method: "GET",
    routePath: "/zip/[zip]",
    routeType: "render",
  });
  assert.equal(JSON.stringify(event).includes("secret"), false);
  assert.equal(JSON.stringify(event).includes("password"), false);
  assert.equal(JSON.stringify(event).includes("profile"), false);
});

test("server error events use only stable diagnostics for non-Error values", () => {
  assert.deepEqual(
    serverErrorEvent({
      error: "user-provided search text",
      routePath: "/search",
      routeType: "render",
    }),
    {
      event: "okelom.server_error",
      errorName: "NonError",
      routePath: "/search",
      routeType: "render",
    },
  );
});
