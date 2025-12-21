import { mkdir } from "fs/promises";

export const SAVE_DIR = process.env.SCREENSHOT_DIR || "./screenshots";
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const PORT = parseInt(process.env.PORT || "3000", 10);

await mkdir(SAVE_DIR, { recursive: true });
