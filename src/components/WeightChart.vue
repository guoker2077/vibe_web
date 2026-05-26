<template>
  <div class="weight-chart">
    <div class="chart-header">
      <div class="chart-tabs">
        <span
          class="chart-tab"
          :class="{ active: range === 7 }"
          @click="range = 7"
        >7天</span>
        <span
          class="chart-tab"
          :class="{ active: range === 30 }"
          @click="range = 30"
        >30天</span>
        <span
          class="chart-tab"
          :class="{ active: range === 0 }"
          @click="range = 0"
        >全部</span>
      </div>
    </div>
    <div class="chart-area" v-if="chartData.length > 1">
      <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
        <!-- 网格线 -->
        <line
          v-for="i in 4"
          :key="'grid' + i"
          :x1="paddingLeft"
          :y1="paddingTop + (chartHeight - paddingTop - paddingBottom) * (i - 1) / 3"
          :x2="chartWidth - paddingRight"
          :y2="paddingTop + (chartHeight - paddingTop - paddingBottom) * (i - 1) / 3"
          stroke="rgba(0,0,0,0.05)"
          stroke-width="1"
        />
        <!-- Y轴标签 -->
        <text
          v-for="(label, i) in yLabels"
          :key="'yl' + i"
          :x="paddingLeft - 8"
          :y="paddingTop + (chartHeight - paddingTop - paddingBottom) * i / 3 + 4"
          text-anchor="end"
          font-size="10"
          fill="var(--text-muted)"
        >{{ label }}</text>
        <!-- 渐变区域 -->
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--brand-blue)" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="var(--brand-blue)" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="var(--brand-blue)"/>
            <stop offset="100%" stop-color="var(--brand-purple)"/>
          </linearGradient>
        </defs>
        <path :d="areaPath" fill="url(#areaGrad)" />
        <path :d="linePath" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <!-- 数据点 -->
        <circle
          v-for="(p, i) in points"
          :key="'pt' + i"
          :cx="p.x"
          :cy="p.y"
          r="4"
          fill="white"
          stroke="var(--brand-blue)"
          stroke-width="2"
          class="chart-dot"
        />
        <!-- X轴标签 -->
        <text
          v-for="(p, i) in points"
          :key="'xl' + i"
          :x="p.x"
          :y="chartHeight - 4"
          text-anchor="middle"
          font-size="10"
          fill="var(--text-muted)"
        >{{ p.label }}</text>
      </svg>
    </div>
    <div class="empty-chart" v-else>
      <span>至少需要2条体重记录才能生成曲线</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  records: { type: Array, default: () => [] },
});

const range = ref(7);
const chartWidth = 600;
const chartHeight = 240;
const paddingLeft = 40;
const paddingRight = 20;
const paddingTop = 20;
const paddingBottom = 30;

const chartData = computed(() => {
  let data = [...props.records].sort((a, b) => {
    const da = a.date instanceof Date ? a.date : new Date(a.date);
    const db = b.date instanceof Date ? b.date : new Date(b.date);
    return da - db;
  });
  if (range.value > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range.value);
    data = data.filter(r => {
      const d = r.date instanceof Date ? r.date : new Date(r.date);
      return d >= cutoff;
    });
  }
  return data;
});

const yLabels = computed(() => {
  if (chartData.value.length === 0) return [];
  const weights = chartData.value.map(r => r.weight);
  const min = Math.floor(Math.min(...weights) - 1);
  const max = Math.ceil(Math.max(...weights) + 1);
  const step = (max - min) / 3;
  return [max, max - step, max - 2 * step, min].map(v => v.toFixed(0));
});

const points = computed(() => {
  const data = chartData.value;
  if (data.length < 2) return [];
  const weights = data.map(r => r.weight);
  const min = Math.floor(Math.min(...weights) - 1);
  const max = Math.ceil(Math.max(...weights) + 1);
  const drawW = chartWidth - paddingLeft - paddingRight;
  const drawH = chartHeight - paddingTop - paddingBottom;

  return data.map((r, i) => {
    const d = r.date instanceof Date ? r.date : new Date(r.date);
    const x = paddingLeft + (i / (data.length - 1)) * drawW;
    const y = paddingTop + drawH - ((r.weight - min) / (max - min)) * drawH;
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    return { x, y, label };
  });
});

const linePath = computed(() => {
  if (points.value.length < 2) return '';
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
});

const areaPath = computed(() => {
  if (points.value.length < 2) return '';
  const drawH = chartHeight - paddingTop - paddingBottom;
  const last = points.value[points.value.length - 1];
  const first = points.value[0];
  return linePath.value + ` L${last.x},${paddingTop + drawH} L${first.x},${paddingTop + drawH} Z`;
});
</script>

<style scoped>
.weight-chart {
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.chart-tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 3px;
}

.chart-tab {
  padding: 4px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-tab.active {
  background: white;
  color: var(--brand-blue);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-dot:hover {
  r: 6;
}

.empty-chart {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
