import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const expectedRobotsHeader =
  process.env.PLAYWRIGHT_RUNTIME === "worker"
    ? "noindex, nofollow, noarchive"
    : "noindex, nofollow";

const representativeRoutes = [
  "/",
  "/search?q=Austin+TX",
  "/zip/10001",
  "/state/ca",
  "/city/tx/austin-city",
  "/county/ny/new-york-county",
  "/compare?left=10001&right=90210",
  "/methodology",
  "/data-sources",
  "/about",
];

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 60; step++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

// Removing the skip destination, keyboard reachability, form action, or ZIP
// leading-zero preservation must break this real browser journey.
test("keyboard-only search and compare preserve leading-zero ZIP areas", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("00601");
  await page.keyboard.press("Enter");
  const result = page.getByRole("link", { name: /ZCTA 00601/ });
  await expect(result).toBeVisible();
  await tabTo(page, result);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("00601");
  await tabTo(page, page.getByRole("link", { name: "Compare this ZIP area" }));
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("First ZIP area")).toHaveValue("00601");
  await tabTo(page, page.getByLabel("Second ZIP area"));
  await page.keyboard.type("10001");
  await page.keyboard.press("Enter");
  const table = page.getByRole("region", { name: "ZIP area comparison table" });
  await expect(table).toBeVisible();
  await tabTo(page, table);
  await expect(table).toBeFocused();
  await expect(table.getByRole("columnheader")).toHaveText([
    "Measure",
    "00601 ↗",
    "10001 ↗",
  ]);
  expect(errors).toEqual([]);
});

test("missing geography and invalid compare recover without fabricated data", async ({
  page,
  request,
}) => {
  // Unmatched routes return HTTP 404. A data miss below loading.tsx streams
  // HTTP 200 by Next.js contract, so verify its actual not-found/noindex state.
  expect((await request.get("/not-a-real-route")).status()).toBe(404);
  const response = await page.goto("/zip/99999");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe(expectedRobotsHeader);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let's find another place.",
  );
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first(),
  ).toBeAttached();
  await expect(page.getByRole("table")).toHaveCount(0);
  await tabTo(page, page.getByRole("link", { name: "Search places" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("searchbox")).toBeVisible();
  await tabTo(page, page.getByRole("searchbox"));
  await page.keyboard.type("nonexistentxyz");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "No matching geography" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("00601");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.getByRole("link", { name: /ZCTA 00601/ })).toBeVisible();
  await page.goto("/compare?left=99999&right=00601");
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "One of these areas is not in our dataset.",
    }),
  ).toBeVisible();
  await page.getByLabel("First ZIP area").fill("10001");
  await page.getByLabel("First ZIP area").press("Enter");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader")).toHaveText([
    "Measure",
    "10001 ↗",
    "00601 ↗",
  ]);
});

test("small-screen and tablet dark layouts keep long content and controls usable", async ({
  page,
}, testInfo) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByLabel("Color theme").selectOption("dark");
    for (const route of [
      "/compare?left=00601&right=10001",
      "/county/ny/new-york-county",
      `/search?q=${"a".repeat(100)}`,
    ]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${route}`,
      ).toBe(true);
      const issues = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(issues.violations, `${width}px ${route}`).toEqual([]);
    }
    const searchbox = page.getByRole("searchbox");
    await expect(searchbox).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Explore" }),
    ).toBeInViewport();
    await searchbox.fill("00601");
    await searchbox.press("Enter");
    await expect(page.getByRole("link", { name: /ZCTA 00601/ })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`dark-search-${width}.png`),
      fullPage: true,
    });
  }
});

test("search distinguishes missing population from zero", async ({ page }) => {
  await page.goto("/search?q=5127252");
  const result = page.locator(".result").filter({ hasText: "Falls Run CDP" });
  await expect(result).toContainText("Population Not available");
  await expect(result).not.toContainText("Population 0");
});
test("OKELOM identity and saved legacy theme survive navigation and reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("okelom-theme"))
      localStorage.setItem("zipora-theme", "dark");
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "OKELOM home" })).toBeVisible();
  await expect(page).toHaveTitle(/OKELOM/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("okelom-theme"))).toBe(
    "dark",
  );
  await page.getByLabel("Color theme").selectOption("light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/about");
  await expect(page.locator("body")).not.toContainText(/zipora|northstar/i);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "OKELOM",
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    /OKELOM/,
  );
});
test("large related-geography lists can reach their second page", async ({
  page,
}) => {
  await page.goto("/zip/78582");
  const links = page
    .locator(".content-section")
    .filter({
      has: page.getByRole("heading", {
        name: "Related geography",
        exact: true,
      }),
    })
    .locator(".link-card");
  const firstPage = await links.allTextContents();
  await page
    .getByRole("navigation", { name: "Related geography pages" })
    .getByRole("link", { name: "Next" })
    .click();
  await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
  expect(await links.allTextContents()).not.toEqual(firstPage);
});
test("malformed compare input is not silently converted to a different ZIP", async ({
  page,
}) => {
  await page.goto("/compare?left=100019&right=90210");
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "One of these areas is not in our dataset.",
    }),
  ).toBeVisible();
});
test("home search, leading-zero ZIP, detail and compare work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every place",
  );
  await page.getByRole("searchbox").fill("00601");
  await page.getByRole("button", { name: "Explore" }).click();
  await page.getByRole("link", { name: /ZCTA 00601/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("00601");
  await expect(page.getByText("ZIP code ≠ Census area.")).toBeVisible();
  await page.getByRole("link", { name: "Compare this ZIP area" }).click();
  await page.getByLabel("Second ZIP area").fill("10001");
  await page.getByRole("button", { name: "Compare areas" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(errors).toEqual([]);
});
for (const route of representativeRoutes) {
  test(`page and accessibility: ${route}`, async ({ page }, testInfo) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-robots-tag"]).toBe(expectedRobotsHeader);
    await expect(page).toHaveTitle(/OKELOM/);
    await expect(page.locator("body")).not.toContainText(/zipora|northstar/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).href).toBe(
      new URL(route.split("?")[0], "http://localhost:43177").href,
    );
    await expect(
      page.locator('script[type="application/ld+json"]'),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    if (route === "/" || route === "/zip/10001") {
      await page.screenshot({
        path: testInfo.outputPath("page.png"),
        fullPage: true,
      });
      await page.screenshot({ path: testInfo.outputPath("viewport.png") });
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        return {
          responseStartMs: nav.responseStart,
          domContentLoadedMs: nav.domContentLoadedEventEnd,
          documentBytes: nav.decodedBodySize,
        };
      });
      await testInfo.attach("local-navigation", {
        body: JSON.stringify(timing),
        contentType: "application/json",
      });
    }
  });
}

// Broken shipped JS/CSS, hydration errors, or a broken advertised local link
// must fail this real navigation check; intentional cancellation stays visible.
test("representative navigation and linked destinations have no browser or asset errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const cancellations: Array<{ path: string; prefetch: boolean }> = [];
  const linkedDestinations = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  page.on("requestfailed", (request) => {
    const path = new URL(request.url()).pathname;
    const reason = request.failure()?.errorText;
    if (
      reason === "net::ERR_ABORTED" &&
      request.headers()["next-router-prefetch"] === "1"
    ) {
      cancellations.push({
        path,
        prefetch: request.headers()["next-router-prefetch"] === "1",
      });
    } else errors.push(`${reason} ${path}`);
  });
  for (const route of representativeRoutes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "404 · NOT IN THIS VIEW",
    );
    // Sample advertised main-content links as well as every primary/footer link.
    const hrefs = await page
      .locator("nav a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    hrefs.push(
      ...(await page
        .locator("main a[href]")
        .evaluateAll((links) =>
          links.slice(0, 5).map((link) => link.getAttribute("href")),
        )),
    );
    for (const href of hrefs.filter((href) => href?.startsWith("/")))
      linkedDestinations.add(href!);
  }
  for (const href of linkedDestinations) {
    await page.goto(href);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "404 · NOT IN THIS VIEW",
    );
  }
  await testInfo.attach("navigation-network-evidence", {
    body: JSON.stringify({
      linkedDestinations: [...linkedDestinations],
      cancellations,
      errors,
    }),
    contentType: "application/json",
  });
  expect(errors).toEqual([]);
});

test("locator zoom, keyboard-accessible tables and dark detail page", async ({
  page,
}, testInfo) => {
  await page.goto("/zip/10001");
  const point = page.locator(".map-panel circle").first();
  const pointLink = page.getByRole("link", {
    name: "View ZCTA 10199",
    exact: true,
  });
  await expect(pointLink.locator("text")).not.toBeVisible();
  await pointLink.focus();
  await expect(pointLink.locator("text")).toBeVisible();
  const before = await point.getAttribute("cx");
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(point).not.toHaveAttribute("cx", before!);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(point).toHaveAttribute("cx", before!);
  const tableRegion = page.getByRole("region", {
    name: "Same-period comparison table",
  });
  await tableRegion.focus();
  await expect(tableRegion).toBeFocused();
  await page.getByLabel("Color theme").selectOption("dark");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .locator(".map-panel")
    .screenshot({ path: testInfo.outputPath("locator-dark.png") });
});
test("empty results, 404, themes and preview indexing", async ({
  page,
  request,
}) => {
  await page.goto("/search?q=nonexistentxyz");
  await expect(
    page.getByRole("heading", { name: "No matching geography" }),
  ).toBeVisible();
  await page.goto("/zip/99999");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "another place",
  );
  await page.goto("/");
  await page.getByLabel("Color theme").selectOption("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByLabel("Color theme")).toHaveValue("dark");
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "<sitemap>",
  );
  for (const asset of [
    "/_geo/manifest.json",
    "/icon.svg",
    "/opengraph-image",
  ]) {
    const response = await request.get(asset);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toBe(expectedRobotsHeader);
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
