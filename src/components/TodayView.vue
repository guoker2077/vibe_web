<template>
  <div class="today-view">
    <!-- 问候 + 连续天数 -->
    <div class="greeting-row">
      <div class="greeting-left">
        <div class="streak-badge">
          <span class="streak-number">{{ streakDays }}</span>
          <span class="streak-label">天</span>
        </div>
        <div class="greeting-text">
          <h2 class="greeting-title">{{ profile?.name || '你' }}，{{ greetingText }}</h2>
          <p class="greeting-sub">{{ streakText }}</p>
        </div>
      </div>
      <div class="bmr-mini" v-if="bmr > 0">
        <span class="bmr-label">BMR</span>
        <span class="bmr-value">{{ bmr }}</span>
        <span class="bmr-unit">kcal</span>
      </div>
    </div>

    <!-- 今日打卡状态 -->
    <div class="today-checkin-section">
      <h3 class="section-title">今日打卡</h3>
      <div class="checkin-circles">
        <div
          class="circle-item"
          v-for="item in checkItems"
          :key="item.key"
          :class="{ checked: item.checked }"
          @click="$emit('go-checkin')"
        >
          <div class="circle-ring" :style="{ '--progress': item.checked ? 1 : 0 }">
            <span class="circle-emoji">{{ item.emoji }}</span>
          </div>
          <span class="circle-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 本周概览 -->
    <div class="week-section">
      <h3 class="section-title">本周概览</h3>
      <div class="week-bar">
        <div
          class="week-cell"
          v-for="(d, i) in weekDays"
          :key="i"
          :class="{ active: d.checked, today: d.isToday }"
        >
          <span class="cell-label">{{ d.label }}</span>
          <div class="cell-dot"></div>
        </div>
      </div>
      <div class="week-summary">
        <span>已打卡 <strong>{{ checkedDaysThisWeek }}</strong>/7 天</span>
      </div>
    </div>

    <!-- 本周警示 -->
    <div class="alert-section" v-if="weeklyAlerts.length > 0">
      <h3 class="section-title">本周饮食提醒</h3>
      <div class="alert-list">
        <div class="alert-item" v-for="a in weeklyAlerts" :key="a.type">
          <span class="alert-emoji">{{ a.emoji }}</span>
          <span class="alert-text">{{ a.label }} {{ a.count }}次</span>
          <span class="alert-level" :class="a.level">{{ a.levelText }}</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <div class="action-card" @click="$emit('go-checkin')">
        <div class="action-icon-wrapper checkin-action">
          <CheckInIcon class="action-icon" />
        </div>
        <div class="action-info">
          <span class="action-title">去打卡</span>
          <span class="action-desc">记录今日饮食和运动</span>
        </div>
      </div>
      <div class="action-card" @click="$emit('go-body')">
        <div class="action-icon-wrapper body-action">
          <BodyIcon class="action-icon" />
        </div>
        <div class="action-info">
          <span class="action-title">记录身体</span>
          <span class="action-desc">体重和身材照片</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CheckInIcon, BodyIcon } from './icons';

const props = defineProps({
  profile: { type: Object, default: () => ({}) },
  todayChecked: { type: Set, default: () => new Set() },
  weeklyData: { type: Array, default: () => [] },
  streakDays: { type: Number, default: 0 },
  bmr: { type: Number, default: 0 },
});

defineEmits(['go-checkin', 'go-body']);

const greetingText = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，注意休息';
  if (h < 9) return '早上好，新的一天';
  if (h < 12) return '上午好，保持专注';
  if (h < 14) return '中午好，合理饮食';
  if (h < 18) return '下午好，继续加油';
  if (h < 22) return '晚上好，坚持打卡';
  return '夜深了，注意休息';
});

const streakText = computed(() => {
  if (props.streakDays === 0) return '今天开始你的自律之旅吧';
  if (props.streakDays === 1) return '好的开始！继续保持';
  if (props.streakDays < 7) return '坚持就是胜利，你已经很棒了';
  if (props.streakDays < 30) return '自律已成习惯，了不起！';
  return '你是最棒的，自律达人！';
});

const checkItems = computed(() => [
  { key: 'diet_ok', emoji: '🥗', label: '饮食OK', checked: props.todayChecked.has('diet_ok') },
  { key: 'exercise', emoji: '🏃', label: '运动了', checked: props.todayChecked.has('exercise') },
  { key: 'no_snack', emoji: '🚫', label: '没零食', checked: props.todayChecked.has('no_snack') },
  { key: 'no_sweet', emoji: '🚫', label: '没甜食', checked: props.todayChecked.has('no_sweet') },
]);

const weekDays = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOfWeek + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = i === dayOfWeek;
    const checked = props.weeklyData.some(r => {
      const rd = r.date;
      if (rd instanceof Date) return rd.toISOString().slice(0, 10) === dateStr;
      return String(rd).slice(0, 10) === dateStr;
    });
    days.push({ label: labels[i - 1], date: dateStr, isToday, checked });
  }
  return days;
});

const checkedDaysThisWeek = computed(() => weekDays.value.filter(d => d.checked).length);

const weeklyAlerts = computed(() => {
  let snack = 0, sweet = 0, bigMeal = 0;
  props.weeklyData.forEach(r => {
    if (r.type === 'had_snack') snack++;
    if (r.type === 'had_sweet') sweet++;
    if (r.type === 'big_meal') bigMeal++;
  });
  const alerts = [];
  if (snack > 0) alerts.push({ type: 'snack', emoji: '🍪', label: '零食', count: snack, level: snack > 3 ? 'bad' : 'warn', levelText: snack > 3 ? '偏多' : '注意' });
  if (sweet > 0) alerts.push({ type: 'sweet', emoji: '🍰', label: '甜食', count: sweet, level: sweet > 2 ? 'bad' : 'warn', levelText: sweet > 2 ? '偏多' : '注意' });
  if (bigMeal > 0) alerts.push({ type: 'bigMeal', emoji: '🍲', label: '大餐', count: bigMeal, level: bigMeal > 2 ? 'bad' : 'warn', levelText: bigMeal > 2 ? '偏多' : '注意' });
  return alerts;
});
</script>

<style scoped>
.today-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
}

/* 问候行 */
.greeting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.greeting-row::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.greeting-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.streak-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-hero);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.streak-number {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.streak-label {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.85;
}

.greeting-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.greeting-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.bmr-mini {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
}

.bmr-label {
  font-size: 11px;
  color: #f59e0b;
  font-weight: 600;
}

.bmr-value {
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
}

.bmr-unit {
  font-size: 11px;
  color: #f59e0b;
  opacity: 0.7;
}

/* 打卡圆形 */
.today-checkin-section {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.checkin-circles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.circle-item:hover {
  transform: translateY(-3px);
}

.circle-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.03);
  border: 3px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.circle-item.checked .circle-ring {
  background: var(--gradient-hero);
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(0, 82, 217, 0.3);
}

.circle-emoji {
  font-size: 24px;
}

.circle-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.circle-item.checked .circle-label {
  color: var(--brand-blue);
  font-weight: 600;
}

/* 本周 */
.week-section {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.week-bar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.week-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.cell-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.cell-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.week-cell.active .cell-dot {
  background: var(--gradient-hero);
  box-shadow: 0 2px 8px rgba(0, 82, 217, 0.3);
}

.week-cell.today .cell-dot {
  border: 2px solid var(--brand-blue);
}

.week-cell.today.active .cell-dot {
  border-color: transparent;
}

.week-summary {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.week-summary strong {
  color: var(--brand-blue);
}

/* 警示 */
.alert-section {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
}

.alert-emoji {
  font-size: 20px;
}

.alert-text {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.alert-level {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.alert-level.warn {
  background: #fef3c7;
  color: #d97706;
}

.alert-level.bad {
  background: #fef2f2;
  color: #ef4444;
}

/* 快捷入口 */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.action-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.checkin-action {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.body-action {
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.action-icon {
  font-size: 22px;
}

.action-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-desc {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .greeting-row {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  .checkin-circles {
    grid-template-columns: repeat(2, 1fr);
  }
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
