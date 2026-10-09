import test from "node:test";
import assert from "node:assert/strict";
import { indexingEnabled, pageMetadata } from "../lib/seo";
import { geographyJsonLd } from "../lib/geo/page";
import robots from "../app/robots";
import nextConfig from "../next.config";
import { GET as sitemapIndex } from "../app/sitemap.xml/route";
import { GET as sitemapShard } from "../app/sitemaps/[id]/route";

function withEnvironment(
  values: Record<string, string | undefined>,
  fn: () => Promise<void> | void,
) {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });
}

test("shared page metadata identifies OKELOM on social shares without a synthetic origin", async () => {
  await withEnvironment(
    {
      SITE_URL: undefined,
      INDEXING_ENABLED: undefined,
      RELEASE_STAGE: undefined,
    },
    () => {
      const metadata = pageMetadata("New York", "Census profile", "/zip/10001");
      assert.equal(metadata.openGraph?.siteName, "OKELOM");
      assert.equal(metadata.openGraph?.title, "New York | OKELOM");
      assert.equal(metadata.twitter?.title, "New York | OKELOM");
      assert.equal(metadata.alternates?.canonical, "/zip/10001");
      assert.equal(metadata.openGraph?.images, undefined);
    },
  );
});

test("pre-release and misconfigured origins fail closed across every indexing surface", async () => {
  for (const [stage, url, flag] of [
    [undefined, "https://okelom.com", "true"],
    ["preview", "https://okelom.com", "true"],
    ["staging", "https://okelom.com", "true"],
    ["production", "https://okelom-web.example.workers.dev", "true"],
    ["production", "https://www.okelom.com", "true"],
    ["production", "https://okelom.com.evil.example", "true"],
    ["production", "http://okelom.com", "true"],
    ["production", undefined, "true"],
    ["production", "https://okelom.com", undefined],
    ["production", "https://okelom.com", "TRUE"],
    ["production", "https://okelom.com", "false"],
    ["production", "not a url", "true"],
  ]) {
    await withEnvironment(
      { RELEASE_STAGE: stage, SITE_URL: url, INDEXING_ENABLED: flag },
      async () => {
        assert.equal(indexingEnabled(), false, `${stage}/${url}/${flag}`);
        assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" });
        assert.equal(robots().sitemap, undefined);
        assert.equal(
          geographyJsonLd([{ name: "United States", url: "/" }]),
          undefined,
        );
        assert.ok(!(await (await sitemapIndex()).text()).includes("<sitemap>"));
        assert.equal(
          (
            await sitemapShard(new Request("http://localhost"), {
              params: Promise.resolve({ id: "0.xml" }),
            })
          ).status,
          404,
        );
        const headers = await nextConfig.headers!();
        assert.ok(
          headers.some(
            (rule) =>
              rule.source === "/(.*)" &&
              rule.headers.some(
                (h) =>
                  h.key === "X-Robots-Tag" && h.value === "noindex, nofollow",
              ),
          ),
        );
        if (url !== "not a url") {
          assert.deepEqual(
            pageMetadata("Area", "Profile", "/zip/10001").robots,
            { index: false, follow: false },
          );
        }
      },
    );
  }
});

test("only explicit production opt-in on the final origin can expose indexable output", async () => {
  await withEnvironment(
    {
      RELEASE_STAGE: "production",
      SITE_URL: "https://okelom.com",
      INDEXING_ENABLED: "true",
    },
    async () => {
      assert.equal(indexingEnabled(), true);
      assert.deepEqual(pageMetadata("Area", "Profile", "/zip/10001").robots, {
        index: true,
        follow: true,
      });
      assert.deepEqual(
        pageMetadata("Search", "Search", "/search", false).robots,
        { index: false, follow: true },
      );
      assert.equal(robots().sitemap, "https://okelom.com/sitemap.xml");
      const data = JSON.parse(
        geographyJsonLd([{ name: "United States", url: "/" }])!,
      );
      assert.equal(data.itemListElement[0].item, "https://okelom.com/");
      assert.ok(
        !(await nextConfig.headers!()).some((rule) =>
          rule.headers.some((h) => h.key === "X-Robots-Tag"),
        ),
      );
    },
  );
});
