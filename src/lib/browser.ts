import { chromium, type Browser } from "playwright";

let browser: Browser;

export const getBrowser = async (): Promise<Browser> => {
  if (!browser) {
    browser = await chromium.launch();
  }
  return browser;
};

