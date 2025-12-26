import { chromium, type Browser } from "playwright";

let browserPromise: Promise<Browser> | null = null;

export const getBrowser = (): Promise<Browser> => {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
    });
  }
  return browserPromise;
};
