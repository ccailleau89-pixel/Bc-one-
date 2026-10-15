import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const fileUrl = pathToFileURL(resolve("prototype.html")).href;
const viewports = [
  { name: "mobile", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  await mkdir("artifacts", { recursive: true });

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    try {
      await page.goto(fileUrl, { waitUntil: "load" });
      await page.locator("main h1").waitFor();
      await page.screenshot({ path: `artifacts/bc-one-${viewport.name}.png`, fullPage: true });

      assert.equal(await page.title(), "BC ONE — Prototype de l'application", "page title should be present");
      const navLinks = page.locator(".nav a");
      assert.equal(await navLinks.count(), 4, "all four navigation links should render");
      for (let index = 0; index < await navLinks.count(); index += 1) {
        const bounds = await navLinks.nth(index).boundingBox();
        assert.ok(bounds, `navigation link ${index + 1} should have a visible box`);
        assert.ok(
          bounds.x >= 0 && bounds.x + bounds.width <= viewport.width + 1,
          `navigation link ${index + 1} should fit within the viewport at ${viewport.name}: ${JSON.stringify(bounds)}`,
        );
      }

      const dimensions = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
      }));
      assert.ok(
        dimensions.documentWidth <= dimensions.viewportWidth + 1,
        `horizontal overflow at ${viewport.name}: ${JSON.stringify(dimensions)}`,
      );
      assert.deepEqual(pageErrors, [], `browser errors at ${viewport.name}`);

      for (const anchor of ["#accueil", "#portefeuille", "#avantages", "#projet"]) {
        assert.equal(await page.locator(anchor).count(), 1, `target ${anchor} should exist`);
      }

      console.log(
        `PASS ${viewport.name} ${viewport.width}x${viewport.height}: no horizontal overflow; navigation targets present.`,
      );
    } catch (error) {
      failures.push(error);
      console.error(`FAIL ${viewport.name} ${viewport.width}x${viewport.height}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.map(error => error.stack ?? String(error)).join("\n"));
  process.exitCode = 1;
}
