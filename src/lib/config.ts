import { mkdir } from "fs/promises";

export const SAVE_DIR = "./screenshots";
export const WIDTH = 1920;
export const HEIGHT = 1080;

await mkdir(SAVE_DIR, { recursive: true });

