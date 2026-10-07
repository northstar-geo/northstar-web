import test from "node:test";
import assert from "node:assert/strict";
import { configuredSiteOrigin, siteOrigin, pageMetadata } from "../lib/seo";
import robots from "../app/robots";
import { GET as index } from "../app/sitemap.xml/route";
import { GET as shard } from "../app/sitemaps/[id]/route";

test("production opt-in emits qualified sitemap shards and indexable metadata", async () => {
  const previousUrl = process.env.SITE_URL;
  const previousFlag = process.env.INDEXING_ENABLED;
  try {
    process.env.SITE_URL = "https://zipora.example";
    process.env.INDEXING_ENABLED = "true";
    assert.equal(
      pageMetadata("Title", "Description", "/zip/10001").robots &&
        (
          pageMetadata("Title", "Description", "/zip/10001").robots as {
            index: boolean;
          }
        ).index,
      true,
    );
    assert.equal(
      (
        pageMetadata("Title", "Description", "/search", false).robots as {
          index: boolean;
        }
      ).index,
      false,
    );
    assert.equal(robots().sitemap, "https://zipora.example/sitemap.xml");
    const xml = await index().text();
    const links = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    assert.ok(links.length > 1);
    const first = await shard(new Request("http://localhost"), {
      params: Promise.resolve({ id: "0.xml" }),
    });
    assert.equal(first.status, 200);
    assert.ok((await first.text()).includes("https://zipora.example/city/"));
    assert.equal(
      (
        await shard(new Request("http://localhost"), {
          params: Promise.resolve({ id: "999999.xml" }),
        })
      ).status,
      404,
    );
    process.env.INDEXING_ENABLED = "false";
    assert.equal(
      (
        await shard(new Request("http://localhost"), {
          params: Promise.resolve({ id: "0.xml" }),
        })
      ).status,
      404,
    );
    for (const invalid of [
      "https://example.com/path",
      "https://user:secret@example.com",
      "file:///tmp",
      "https://example.com?x=1",
    ]) {
      process.env.SITE_URL = invalid;
      assert.throws(siteOrigin);
    }
  } finally {
    if (previousUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previousUrl;
    if (previousFlag === undefined) delete process.env.INDEXING_ENABLED;
    else process.env.INDEXING_ENABLED = previousFlag;
  }
});

test("preview has no synthetic public origin and public indexing requires HTTPS", () => {
  const previousUrl = process.env.SITE_URL;
  const previousFlag = process.env.INDEXING_ENABLED;
  try {
    delete process.env.SITE_URL;
    process.env.INDEXING_ENABLED = "true";
    assert.equal(configuredSiteOrigin(), undefined);
    assert.equal(
      (pageMetadata("Title", "Description", "/zip/10001").robots as {
        index: boolean;
      }).index,
      false,
    );
    assert.equal(
      pageMetadata("Title", "Description", "/zip/10001").openGraph?.images,
      undefined,
    );
    process.env.SITE_URL = "http://zipora.example";
    assert.equal(configuredSiteOrigin(), "http://zipora.example");
    assert.throws(siteOrigin, /HTTPS/);
  } finally {
    if (previousUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previousUrl;
    if (previousFlag === undefined) delete process.env.INDEXING_ENABLED;
    else process.env.INDEXING_ENABLED = previousFlag;
  }
});
