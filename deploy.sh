#!/bin/bash

# 停止并删除旧容器
docker-compose down

# 重新构建镜像（不使用缓存）
docker-compose build --no-cache

# 启动容器
docker-compose up -d

echo "✅ 容器已启动"
echo "查看日志: docker-compose logs -f"

