import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { doScreenshot } from "./lib/screenshot.js";

// 初始化配置（创建目录等）
import "./lib/config.js";

const app = new Hono();

app.post("/screenshot", async (c) => {
  const { html, id, imageId, callbackUrl } = await c.req.json();

  if (!html || !id || !imageId || !callbackUrl) {
    return c.json(
      { error: "html, id, imageId, callbackUrl are required" },
      400
    );
  }

  doScreenshot({ html, id, imageId, callbackUrl });

  return c.json({ id, status: "accepted" });
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
