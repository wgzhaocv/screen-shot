# 使用 Node.js 官方镜像作为基础
FROM node:20-slim

# 安装 Playwright 依赖
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 安装 Playwright 浏览器（只安装 Chromium）
RUN npx playwright install chromium

# 复制源代码
COPY tsconfig.json ./
COPY src ./src

# 构建 TypeScript
RUN pnpm build

# 创建截图保存目录
RUN mkdir -p /screenshots

# 设置环境变量
ENV NODE_ENV=production
ENV SCREENSHOT_DIR=/screenshots
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "dist/index.js"]

