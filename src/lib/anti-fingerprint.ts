import type { Page } from "playwright";

export const injectAntiFingerprint = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    // 假 userAgent
    Object.defineProperty(navigator, "userAgent", {
      get: () =>
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    });
    Object.defineProperty(navigator, "platform", { get: () => "Win32" });
    Object.defineProperty(navigator, "language", { get: () => "en-US" });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });

    // 假 WebGL
    const getParameterProxyHandler: ProxyHandler<
      typeof WebGLRenderingContext.prototype.getParameter
    > = {
      apply(target, thisArg: WebGLRenderingContext, args: [number]) {
        const param = args[0];
        if (param === 37445) return "Intel Inc.";
        if (param === 37446) return "Intel Iris OpenGL Engine";
        return Reflect.apply(target, thisArg, args);
      },
    };
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = new Proxy(
      originalGetParameter,
      getParameterProxyHandler
    );

    // 假 canvas fingerprint
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (
      type?: string,
      quality?: number
    ) {
      if (type === "image/png") {
        const ctx = this.getContext("2d");
        ctx?.fillRect(0, 0, 0, 0); // 轻微扰动
      }
      return originalToDataURL.call(this, type, quality);
    };

    // 假 screen
    Object.defineProperty(screen, "width", { get: () => 1920 });
    Object.defineProperty(screen, "height", { get: () => 1080 });
    Object.defineProperty(screen, "availWidth", { get: () => 1920 });
    Object.defineProperty(screen, "availHeight", { get: () => 1040 });
    Object.defineProperty(screen, "colorDepth", { get: () => 24 });
    Object.defineProperty(screen, "pixelDepth", { get: () => 24 });
  });
};

