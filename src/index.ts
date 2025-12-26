import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { doScreenshot } from "./lib/screenshot.js";
import { getBrowser } from "./lib/browser.js";
import { screenshotQueue } from "./lib/queue.js";
import path from "path";
import { HEIGHT, SAVE_DIR, WIDTH } from "./lib/config.js";
import { injectAntiFingerprint } from "./lib/anti-fingerprint.js";
import type { BrowserContext, Page } from "playwright";

const app = new Hono();

app.post("/screenshot", async (c) => {
  const { html, id, imageId, callbackUrl } = await c.req.json();

  if (!html || !id || !imageId || !callbackUrl) {
    return c.json(
      { error: "html, id, imageId, callbackUrl are required" },
      400
    );
  }

  screenshotQueue.enqueue(() =>
    doScreenshot({ html, id, imageId, callbackUrl })
  );

  return c.json({ id, status: "accepted", pending: screenshotQueue.pending });
});

const testUrl = "https://crimson.wgzhao.me/share/JO7aZ2jBOi";
app.get("/test", async (c) => {
  const imageId = `test-${Date.now()}`;
  const imagePath = path.join(SAVE_DIR, `${imageId}.png`);
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      locale: "en-US",
      timezoneId: "America/New_York",
      geolocation: { latitude: 40.7128, longitude: -74.006 },
      permissions: ["geolocation"],
    });
    page = await context.newPage();

    await injectAntiFingerprint(page);
    await page.goto(testUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: imagePath, type: "png" });

    return c.json({ status: "ok", path: imagePath, imageId });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(errorMessage);
    return c.json({ error: errorMessage }, 500);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
  }
});

serve({ fetch: app.fetch, port: 4000 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
  getBrowser();
});
