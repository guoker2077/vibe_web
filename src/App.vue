<template>
  <div class="app-container">
    <!-- 动态背景 -->
    <div class="ambient-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="mesh-layer"></div>
    </div>

    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-glass"></div>
      <div class="header-content">
        <div class="header-left">
          <div class="logo-wrapper">
            <div class="logo-icon-wrapper">
              <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffffff" />
                    <stop offset="100%" style="stop-color:#c8d6ff" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="17" stroke="url(#logoGrad)" stroke-width="2.5" fill="none" />
                <path d="M20 11V21L27 21" stroke="url(#logoGrad)" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="20" cy="20" r="2" fill="url(#logoGrad)" />
              </svg>
            </div>
            <div class="title-group">
              <h1 class="app-title">重要事务 & 提醒</h1>
              <span class="app-subtitle">云端同步 · 实时协作</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="cloud-badge">
            <CloudIcon class="cloud-icon" />
            <span>云端同步</span>
            <span class="badge-dot"></span>
          </div>
          <div class="current-time">
            <TimeIcon class="time-icon" />
            <span class="time-text">{{ currentTime }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="app-main">
      <div class="content-wrapper">
        <!-- 问候横幅 -->
        <div class="greeting-banner">
          <div class="greeting-left">
            <div class="greeting-icon">{{ greetingEmoji }}</div>
            <div class="greeting-text">
              <h2 class="greeting-title">Zyy{{ greetingText }}，新的一天</h2>
              <p class="greeting-sub">{{ greetingQuote }}</p>
            </div>
          </div>
          <div class="greeting-right">
            <div class="greeting-date-block">
              <span class="greeting-weekday">{{ weekdayText }}</span>
              <span class="greeting-day">{{ dayText }}</span>
              <span class="greeting-month">{{ monthText }}</span>
            </div>
          </div>
        </div>

        <!-- 统计卡片 + 进度环 -->
        <div class="dashboard-row">
          <div class="stats-row">
            <div class="stat-card stat-pending">
              <div class="stat-bg"></div>
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <TaskIcon class="stat-icon" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ pendingTasks }}</span>
                  <span class="stat-label">待办事务</span>
                </div>
              </div>
            </div>
            <div class="stat-card stat-completed">
              <div class="stat-bg"></div>
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <CheckCircleIcon class="stat-icon" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ completedTasks }}</span>
                  <span class="stat-label">已完成</span>
                </div>
              </div>
            </div>
            <div class="stat-card stat-alarms">
              <div class="stat-bg"></div>
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <AlarmIcon class="stat-icon" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ activeAlarms }}</span>
                  <span class="stat-label">活跃提醒</span>
                </div>
              </div>
            </div>
            <div class="stat-card stat-urgent">
              <div class="stat-bg"></div>
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <ErrorCircleIcon class="stat-icon" />
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ urgentTasks }}</span>
                  <span class="stat-label">紧急事务</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 进度环 & 优先级分布 -->
          <div class="insight-panel">
            <div class="progress-ring-card">
              <div class="ring-container">
                <svg class="progress-ring" viewBox="0 0 120 120">
                  <circle class="ring-bg" cx="60" cy="60" r="50" />
                  <circle
                    class="ring-fill"
                    cx="60" cy="60" r="50"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset"
                    :style="{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }"
                  />
                </svg>
                <div class="ring-text">
                  <span class="ring-percent">{{ completionPercent }}%</span>
                  <span class="ring-label">完成率</span>
                </div>
              </div>
            </div>
            <div class="priority-chart">
              <div class="chart-title">优先级分布</div>
              <div class="chart-bar">
                <div class="chart-segment seg-urgent" :style="{ width: urgentPercent + '%' }"></div>
                <div class="chart-segment seg-high" :style="{ width: highPercent + '%' }"></div>
                <div class="chart-segment seg-medium" :style="{ width: mediumPercent + '%' }"></div>
                <div class="chart-segment seg-low" :style="{ width: lowPercent + '%' }"></div>
              </div>
              <div class="chart-legend">
                <span class="legend-item"><i class="legend-dot dot-urgent"></i>紧急 {{ urgentTasks }}</span>
                <span class="legend-item"><i class="legend-dot dot-high"></i>高 {{ highTasks }}</span>
                <span class="legend-item"><i class="legend-dot dot-medium"></i>中 {{ mediumTasks }}</span>
                <span class="legend-item"><i class="legend-dot dot-low"></i>低 {{ lowTasks }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 即将到期 -->
        <div class="upcoming-section" v-if="upcomingTasks.length > 0">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon-wrapper urgent-pulse">
                <ErrorCircleIcon class="section-icon" />
              </div>
              <h3 class="section-title">即将到期</h3>
            </div>
            <span class="section-badge">{{ upcomingTasks.length }} 项</span>
          </div>
          <div class="upcoming-list">
            <div class="upcoming-card" v-for="task in upcomingTasks" :key="task._id">
              <div class="upcoming-priority-dot" :class="'dot-' + task.priority"></div>
              <div class="upcoming-info">
                <span class="upcoming-title">{{ task.title }}</span>
                <span class="upcoming-deadline" v-if="task.dueDate">
                  <CalendarIcon size="12px" /> {{ task.dueDate }}{{ task.dueTime ? ' ' + task.dueTime : '' }}
                </span>
              </div>
              <div class="upcoming-countdown" :class="{ 'countdown-urgent': isOverdue(task) }">
                {{ getCountdownText(task) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="tabs-container">
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'tasks' }"
            @click="activeTab = 'tasks'"
          >
            <TaskIcon class="tab-icon" />
            <span>事务管理</span>
            <span class="tab-count" v-if="pendingTasks > 0">{{ pendingTasks }}</span>
          </div>
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'alarms' }"
            @click="activeTab = 'alarms'"
          >
            <AlarmIcon class="tab-icon" />
            <span>闹钟提醒</span>
            <span class="tab-count alarm-count" v-if="activeAlarms > 0">{{ activeAlarms }}</span>
          </div>
          <div class="tab-indicator" :class="{ 'right': activeTab === 'alarms' }"></div>
        </div>

        <transition name="fade" mode="out-in">
          <TaskManager v-if="activeTab === 'tasks'" @update-stats="updateStats" />
          <AlarmManager v-else @update-stats="updateStats" />
        </transition>

        <!-- 底部信息栏 -->
        <footer class="app-footer">
          <div class="footer-left">
            <CloudIcon class="footer-icon" />
            <span>数据已云端加密存储</span>
          </div>
          <div class="footer-center">
            <span class="footer-tip">{{ footerTip }}</span>
          </div>
          <div class="footer-right">
            <span>Powered by CloudBase</span>
          </div>
        </footer>
      </div>
    </main>

    <!-- 闹钟提醒弹窗 -->
    <t-dialog
      v-model:visible="alarmDialogVisible"
      header="闹钟提醒"
      :confirm-btn="'知道了'"
      :cancel-btn="null"
      :close-on-overlay-click="false"
      attach="body"
      @confirm="dismissAlarm"
    >
      <div class="alarm-dialog-content">
        <div class="alarm-ring-wrapper">
          <AlarmIcon class="alarm-ring-icon" />
          <div class="ring-ripple r1"></div>
          <div class="ring-ripple r2"></div>
        </div>
        <p class="alarm-dialog-title">{{ triggeredAlarm?.title }}</p>
        <p class="alarm-dialog-desc">{{ triggeredAlarm?.description }}</p>
        <p class="alarm-dialog-time">{{ triggeredAlarm?.time }}</p>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  TimeIcon,
  CheckCircleIcon,
  ErrorCircleIcon,
  CalendarIcon,
} from 'tdesign-icons-vue-next';
import { TaskIcon, AlarmIcon, CloudIcon } from './components/icons';
import TaskManager from './components/TaskManager.vue';
import AlarmManager from './components/AlarmManager.vue';
import {
  init as initCloudBase,
  getTasks,
  getActiveAlarms,
  markAlarmTriggered,
} from './lib/cloudbase';

const activeTab = ref('tasks');
const currentTime = ref('');
const alarmDialogVisible = ref(false);
const triggeredAlarm = ref(null);

let timeInterval = null;
let alarmInterval = null;

const pendingTasks = ref(0);
const completedTasks = ref(0);
const activeAlarms = ref(0);
const urgentTasks = ref(0);
const highTasks = ref(0);
const mediumTasks = ref(0);
const lowTasks = ref(0);
const allTasks = ref([]);

// 问候语
const greetingText = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  if (h < 22) return '晚上好';
  return '夜深了';
});

const greetingEmoji = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return '🌙';
  if (h < 9) return '🌅';
  if (h < 12) return '☀️';
  if (h < 14) return '🌤️';
  if (h < 18) return '🌇';
  if (h < 22) return '🌆';
  return '🌙';
});

const quotes = [
  '专注当下，成就未来',
  '每完成一件事，就离目标更近一步',
  '高效行动，从整理事务开始',
  '把重要的事情放在前面',
  '今日事，今日毕',
  '一步一步，终将抵达',
  '规划好时间，就是掌控好人生',
  '行动是治愈焦虑的良药',
];

const greetingQuote = computed(() => {
  const idx = new Date().getDate() % quotes.length;
  return quotes[idx];
});

const weekdayText = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[new Date().getDay()];
});

const dayText = computed(() => new Date().getDate());

const monthText = computed(() => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return months[new Date().getMonth()];
});

// 进度环
const totalTasks = computed(() => pendingTasks.value + completedTasks.value);
const completionPercent = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});
const circumference = 2 * Math.PI * 50;
const progressOffset = computed(() => {
  const progress = completionPercent.value / 100;
  return circumference * (1 - progress);
});

// 优先级分布
const totalPending = computed(() => {
  if (pendingTasks.value === 0) return 1;
  return pendingTasks.value;
});
const urgentPercent = computed(() => (urgentTasks.value / totalPending.value) * 100);
const highPercent = computed(() => (highTasks.value / totalPending.value) * 100);
const mediumPercent = computed(() => (mediumTasks.value / totalPending.value) * 100);
const lowPercent = computed(() => (lowTasks.value / totalPending.value) * 100);

// 即将到期
const upcomingTasks = computed(() => {
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return allTasks.value
    .filter(t => !t.completed && t.dueDate)
    .map(t => {
      const dueDate = new Date(t.dueDate + (t.dueTime ? 'T' + t.dueTime : 'T23:59'));
      return { ...t, _dueDate: dueDate };
    })
    .filter(t => t._dueDate <= threeDaysLater)
    .sort((a, b) => a._dueDate - b._dueDate)
    .slice(0, 5);
});

const isOverdue = (task) => {
  return task._dueDate < new Date();
};

const getCountdownText = (task) => {
  const now = new Date();
  const diff = task._dueDate - now;
  if (diff < 0) return '已逾期';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return '即将到期';
  if (hours < 24) return `${hours}小时后`;
  const days = Math.floor(hours / 24);
  return `${days}天后`;
};

// 底部提示轮换
const footerTips = [
  '💡 点击事务左侧勾选框可快速完成',
  '⌨️ 使用搜索框快速定位事务',
  '🔔 开启提醒后到时会自动弹出通知',
  '☁️ 所有数据实时云端同步，多端共享',
  '📊 优先级分布帮你聚焦重要事务',
];

const footerTip = computed(() => {
  const idx = Math.floor(Date.now() / 10000) % footerTips.length;
  return footerTips[idx];
});

const updateTime = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${y}-${m}-${d} ${h}:${min}:${s}`;
};

const checkAlarms = async () => {
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  try {
    const alarms = await getActiveAlarms();
    for (const alarm of alarms) {
      if (
        alarm.enabled &&
        alarm.time === currentTimeStr &&
        alarm.date === currentDateStr &&
        !alarm.triggered
      ) {
        await markAlarmTriggered(alarm._id);
        triggeredAlarm.value = alarm;
        alarmDialogVisible.value = true;

        if (Notification.permission === 'granted') {
          new Notification('闹钟提醒', { body: alarm.title });
        }
      }
    }
  } catch (e) {
    console.error('检查闹钟失败:', e);
  }
};

const dismissAlarm = () => {
  alarmDialogVisible.value = false;
  triggeredAlarm.value = null;
};

const updateStats = async () => {
  try {
    const tasks = await getTasks();
    const alarms = await getActiveAlarms();
    allTasks.value = tasks;
    pendingTasks.value = tasks.filter((t) => !t.completed).length;
    completedTasks.value = tasks.filter((t) => t.completed).length;
    activeAlarms.value = alarms.length;
    urgentTasks.value = tasks.filter((t) => !t.completed && t.priority === 'urgent').length;
    highTasks.value = tasks.filter((t) => !t.completed && t.priority === 'high').length;
    mediumTasks.value = tasks.filter((t) => !t.completed && t.priority === 'medium').length;
    lowTasks.value = tasks.filter((t) => !t.completed && t.priority === 'low').length;
  } catch (e) {
    console.error('更新统计失败:', e);
  }
};

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  alarmInterval = setInterval(checkAlarms, 10000);

  try {
    await initCloudBase();
    await updateStats();
  } catch (e) {
    console.error('CloudBase 初始化失败:', e);
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

onUnmounted(() => {
  clearInterval(timeInterval);
  clearInterval(alarmInterval);
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #f0f2f8;
}

/* 动态背景 */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.12) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation: float-slow 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(123, 97, 255, 0.12) 0%, transparent 70%);
  bottom: 10%;
  right: -5%;
  animation: float-slow 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 40%;
  animation: float-slow 18s ease-in-out infinite 3s;
}

.mesh-layer {
  position: absolute;
  inset: 0;
  background:
    var(--gradient-mesh-1),
    var(--gradient-mesh-2),
    var(--gradient-mesh-3);
  animation: gradient-shift 15s ease infinite;
  background-size: 200% 200%;
}

/* 顶栏 */
.app-header {
  position: relative;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.header-glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 82, 217, 0.92) 0%, rgba(58, 111, 216, 0.9) 40%, rgba(94, 59, 255, 0.88) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-glass::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.header-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  z-index: 1;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

.app-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  font-weight: 500;
}

.header-right {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cloud-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
}

.cloud-badge:hover {
  background: rgba(255, 255, 255, 0.2);
}

.cloud-icon {
  font-size: 14px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-variant-numeric: tabular-nums;
}

.time-icon {
  font-size: 15px;
}

/* 主内容 */
.app-main {
  flex: 1;
  padding: 28px 32px 32px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.content-wrapper {
  max-width: 1120px;
  margin: 0 auto;
}

/* 问候横幅 */
.greeting-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.greeting-banner::before {
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

.greeting-banner::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: 30%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(123, 97, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.greeting-left {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}

.greeting-icon {
  font-size: 40px;
  line-height: 1;
  animation: float 4s ease-in-out infinite;
}

.greeting-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.greeting-sub {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
}

.greeting-right {
  position: relative;
  z-index: 1;
}

.greeting-date-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  border-radius: 14px;
  background: var(--gradient-hero);
  color: white;
  min-width: 80px;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.25);
}

.greeting-weekday {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.85;
  letter-spacing: 1px;
}

.greeting-day {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
}

.greeting-month {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.85;
}

/* Dashboard 行 */
.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  margin-bottom: 20px;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.stat-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all 0.4s ease;
}

.stat-card:hover .stat-bg {
  box-shadow: var(--shadow-lg);
}

.stat-pending .stat-bg {
  border-bottom: 3px solid var(--brand-blue);
}

.stat-completed .stat-bg {
  border-bottom: 3px solid #34d399;
}

.stat-alarms .stat-bg {
  border-bottom: 3px solid var(--brand-purple);
}

.stat-urgent .stat-bg {
  border-bottom: 3px solid #f87171;
}

.stat-content {
  position: relative;
  z-index: 1;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-pending .stat-icon-wrapper {
  background: linear-gradient(135deg, #0052d9, #3a7bd5);
  color: white;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.stat-completed .stat-icon-wrapper {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.stat-alarms .stat-icon-wrapper {
  background: linear-gradient(135deg, #7b61ff, #a78bfa);
  color: white;
  box-shadow: 0 4px 14px rgba(123, 97, 255, 0.3);
}

.stat-urgent .stat-icon-wrapper {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.08);
}

.stat-icon {
  font-size: 22px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  font-weight: 500;
}

/* 洞察面板 */
.insight-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.progress-ring-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px;
  display: flex;
  justify-content: center;
}

.ring-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(0, 82, 217, 0.08);
  stroke-width: 8;
}

.ring-fill {
  fill: none;
  stroke: url(#ringGradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke: var(--brand-blue);
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.ring-percent {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.ring-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 2px;
}

.priority-chart {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 18px 20px;
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.chart-bar {
  height: 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  overflow: hidden;
  margin-bottom: 12px;
}

.chart-segment {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

.seg-urgent { background: linear-gradient(90deg, #ef4444, #f87171); }
.seg-high { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.seg-medium { background: linear-gradient(90deg, #0052d9, #3a7bd5); }
.seg-low { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }

.chart-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.dot-urgent { background: #ef4444; }
.dot-high { background: #f59e0b; }
.dot-medium { background: #0052d9; }
.dot-low { background: #94a3b8; }

/* 即将到期 */
.upcoming-section {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.urgent-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-blue);
  background: var(--brand-blue-light);
  padding: 4px 12px;
  border-radius: 12px;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upcoming-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.upcoming-card:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateX(4px);
}

.upcoming-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.upcoming-priority-dot.dot-urgent { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.4); }
.upcoming-priority-dot.dot-high { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.4); }
.upcoming-priority-dot.dot-medium { background: #0052d9; }
.upcoming-priority-dot.dot-low { background: #94a3b8; }

.upcoming-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upcoming-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upcoming-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.upcoming-countdown {
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-blue);
  background: var(--brand-blue-light);
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.countdown-urgent {
  color: #ef4444;
  background: #fef2f2;
}

/* 自定义标签页 */
.tabs-container {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid var(--glass-border);
  position: relative;
  box-shadow: var(--shadow-sm);
  width: fit-content;
}

.custom-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  user-select: none;
}

.custom-tab:hover {
  color: var(--text-primary);
}

.custom-tab.active {
  color: white;
  font-weight: 600;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 8px;
  border-radius: 10px;
  line-height: 18px;
}

.custom-tab:not(.active) .tab-count {
  background: var(--brand-blue-light);
  color: var(--brand-blue);
}

.alarm-count {
  background: rgba(255, 255, 255, 0.2) !important;
}

.custom-tab:not(.active) .alarm-count {
  background: var(--brand-purple-light) !important;
  color: var(--brand-purple) !important;
}

.tab-indicator {
  position: absolute;
  top: 5px;
  left: 5px;
  height: calc(100% - 10px);
  width: calc(50% - 7px);
  background: var(--gradient-hero);
  border-radius: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 82, 217, 0.3);
}

.tab-indicator.right {
  left: calc(50% + 2px);
}

/* 闹钟弹窗 */
.alarm-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.alarm-ring-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.alarm-ring-icon {
  font-size: 64px;
  color: var(--brand-purple);
  position: relative;
  z-index: 1;
  animation: ring 0.4s ease-in-out infinite alternate;
}

@keyframes ring {
  0% { transform: rotate(-12deg); }
  100% { transform: rotate(12deg); }
}

.ring-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--brand-purple);
  animation: ripple 1.5s ease-out infinite;
  opacity: 0;
}

.r1 { animation-delay: 0s; }
.r2 { animation-delay: 0.5s; }

.alarm-dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.alarm-dialog-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.alarm-dialog-time {
  font-size: 18px;
  font-weight: 700;
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 底部 */
.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.footer-icon {
  font-size: 14px;
  color: var(--brand-blue);
}

.footer-center {
  font-size: 12px;
  color: var(--text-muted);
}

.footer-right {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 64px;
  }
  .app-title {
    font-size: 16px;
  }
  .app-subtitle {
    display: none;
  }
  .app-main {
    padding: 16px;
  }
  .greeting-banner {
    flex-direction: column;
    gap: 14px;
    padding: 20px;
  }
  .greeting-right {
    align-self: flex-end;
  }
  .dashboard-row {
    grid-template-columns: 1fr;
  }
  .insight-panel {
    flex-direction: row;
  }
  .progress-ring-card {
    flex: 0 0 auto;
  }
  .priority-chart {
    flex: 1;
    min-width: 0;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat-content {
    padding: 14px;
    gap: 10px;
  }
  .stat-value {
    font-size: 22px;
  }
  .stat-icon-wrapper {
    width: 38px;
    height: 38px;
  }
  .tabs-container {
    width: 100%;
  }
  .custom-tab {
    flex: 1;
    justify-content: center;
    padding: 10px 16px;
  }
  .tab-indicator {
    width: calc(50% - 7px);
  }
  .current-time {
    display: none;
  }
  .app-footer {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }
}
</style>
