import { readFile, unlink } from "fs/promises";
import path from "path";
import type { BrowserContext, Page } from "playwright";
import { SAVE_DIR, WIDTH, HEIGHT } from "./config.js";
import { getBrowser } from "./browser.js";
import { injectAntiFingerprint } from "./anti-fingerprint.js";
import { getWaitTime } from "./wait-time.js";

export type ScreenshotParams = {
  html: string;
  id: string;
  imageId: string;
  callbackUrl: string;
};

export const doScreenshot = async ({
  html,
  id,
  imageId,
  callbackUrl,
}: ScreenshotParams): Promise<void> => {
  const imagePath = path.join(SAVE_DIR, `${imageId}.png`);
  let imageCreated = false;
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

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForLoadState("load");
    await page.waitForTimeout(getWaitTime(html));
    await page.screenshot({ path: imagePath, type: "png" });
    imageCreated = true;

    const file = await readFile(imagePath);
    await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        "X-Id": id,
        "X-Image-Id": imageId,
        "X-Status": "done",
      },
      body: file,
      duplex: "half",
    } as RequestInit);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Id": id,
        "X-Image-Id": imageId,
        "X-Status": "failed",
      },
      body: JSON.stringify({ error: errorMessage }),
    }).catch(() => {});
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (imageCreated) {
      await unlink(imagePath).catch(() => {});
    }
  }
};
