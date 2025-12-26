export const getWaitTime = (html: string): number => {
  const lowerHtml = html.toLowerCase();

  // 重度耗时：WebGPU、WebGL、3D 渲染
  if (/webgpu|webgl|three\.js|babylon/i.test(lowerHtml)) {
    return 3000;
  }

  // 中度耗时：图表库、Canvas 动画
  if (/echarts|chart\.js|d3\.js|highcharts|canvas|animation/i.test(lowerHtml)) {
    return 2000;
  }

  // 轻度耗时：常见前端框架懒加载
  if (/lazy|defer|async|setTimeout|requestAnimationFrame/i.test(lowerHtml)) {
    return 1000;
  }

  // 默认
  return 500;
};
