<template>
  <!-- 密码锁登录界面 -->
  <LoginView v-if="!loggedIn" ref="loginRef" @login="handleLogin" />

  <div class="app-container" v-else>
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
              <h1 class="app-title">自律打卡中心</h1>
              <span class="app-subtitle">饮食健康 · 身材管理</span>
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
              <h2 class="greeting-title">{{ profile?.name || '你' }}{{ greetingText }}，新的一天</h2>
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

        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card stat-streak">
            <div class="stat-bg"></div>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <CheckInIcon class="stat-icon" />
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ streakDays }}</span>
                <span class="stat-label">连续打卡</span>
              </div>
            </div>
          </div>
          <div class="stat-card stat-exercise">
            <div class="stat-bg"></div>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <BodyIcon class="stat-icon" />
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ weeklyExercise }}</span>
                <span class="stat-label">本周运动</span>
              </div>
            </div>
          </div>
          <div class="stat-card stat-bmr">
            <div class="stat-bg"></div>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <AlarmIcon class="stat-icon" />
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ bmrValue }}</span>
                <span class="stat-label">BMR(kcal)</span>
              </div>
            </div>
          </div>
          <div class="stat-card stat-bmi">
            <div class="stat-bg"></div>
            <div class="stat-content">
              <div class="stat-icon-wrapper">
                <ProfileIcon class="stat-icon" />
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ bmiValue }}</span>
                <span class="stat-label">BMI</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="tabs-container">
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'today' }"
            @click="activeTab = 'today'"
          >
            <CheckInIcon class="tab-icon" />
            <span>今日</span>
          </div>
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'checkin' }"
            @click="activeTab = 'checkin'"
          >
            <CheckInIcon class="tab-icon" />
            <span>打卡</span>
          </div>
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'body' }"
            @click="activeTab = 'body'"
          >
            <BodyIcon class="tab-icon" />
            <span>身体</span>
          </div>
          <div
            class="custom-tab"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <ProfileIcon class="tab-icon" />
            <span>我的</span>
          </div>
          <div class="tab-indicator" :style="tabIndicatorStyle"></div>
        </div>

        <transition name="fade" mode="out-in">
          <TodayView
            v-if="activeTab === 'today'"
            :profile="profile"
            :today-checked="todayChecked"
            :weekly-data="weeklyData"
            :streak-days="streakDays"
            :bmr="bmrValue"
            @go-checkin="activeTab = 'checkin'"
            @go-body="activeTab = 'body'"
          />
          <CheckInView
            v-else-if="activeTab === 'checkin'"
            ref="checkinRef"
          />
          <BodyTrackView
            v-else-if="activeTab === 'body'"
            ref="bodyRef"
          />
          <ProfileView
            v-else
            ref="profileRef"
          />
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
        <p class="alarm-dialog-time">{{ triggeredAlarm?.time }}</p>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { TimeIcon } from 'tdesign-icons-vue-next';
import { AlarmIcon, CloudIcon, CheckInIcon, BodyIcon, ProfileIcon } from './components/icons';
import TodayView from './components/TodayView.vue';
import CheckInView from './components/CheckInView.vue';
import BodyTrackView from './components/BodyTrackView.vue';
import ProfileView from './components/ProfileView.vue';
import LoginView from './components/LoginView.vue';
import {
  init as initCloudBase,
  getProfile,
  getCheckInRecords,
  getCheckInRange,
  getActiveAlarms,
  markAlarmTriggered,
} from './lib/cloudbase';

const loggedIn = ref(false);
const loginRef = ref(null);
const activeTab = ref('today');
const currentTime = ref('');
const alarmDialogVisible = ref(false);
const triggeredAlarm = ref(null);
const profile = ref({});
const todayChecked = ref(new Set());
const weeklyData = ref([]);
const checkinRef = ref(null);
const bodyRef = ref(null);
const profileRef = ref(null);

let timeInterval = null;
let alarmInterval = null;

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
  '自律给我自由',
  '坚持就是胜利',
  '每一步都算数',
  '管住嘴，迈开腿',
  '今天也要好好吃饭',
  '健康的身体是一切的基础',
  '好习惯，好身材',
  '你比昨天更强了',
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

// BMR
const bmrValue = computed(() => {
  const p = profile.value;
  if (!p.weight || !p.height || !p.age) return '--';
  if (p.gender === 'male') {
    return Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age + 5);
  }
  return Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age - 161);
});

// BMI
const bmiValue = computed(() => {
  const p = profile.value;
  if (!p.weight || !p.height) return '--';
  return (p.weight / ((p.height / 100) ** 2)).toFixed(1);
});

// 连续打卡天数
const streakDays = computed(() => {
  if (weeklyData.value.length === 0) return 0;
  const dateSet = new Set();
  weeklyData.value.forEach(r => {
    const d = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
    dateSet.add(d);
  });
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
});

// 本周运动次数
const weeklyExercise = computed(() => {
  return weeklyData.value.filter(r => r.type === 'exercise').length;
});

// Tab indicator
const tabIndicatorStyle = computed(() => {
  const tabs = ['today', 'checkin', 'body', 'profile'];
  const idx = tabs.indexOf(activeTab.value);
  return {
    left: `calc(${idx * 25}% + 5px)`,
    width: `calc(25% - 10px)`,
  };
});

// 底部提示
const footerTips = [
  '💡 坚持打卡，养成自律习惯',
  '🏋️ 每天运动30分钟，身体更健康',
  '🥗 合理饮食是身材管理的基础',
  '📷 定期拍照记录，见证身材变化',
  '☁️ 所有数据实时云端同步',
];

const footerTip = computed(() => {
  const idx = Math.floor(Date.now() / 10000) % footerTips.length;
  return footerTips[idx];
});

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
      if (alarm.enabled && alarm.time === currentTimeStr && alarm.date === currentDateStr && !alarm.triggered) {
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

const loadTodayData = async () => {
  const records = await getCheckInRecords(todayStr());
  const checked = new Set();
  records.forEach(r => {
    if (['diet_ok', 'exercise', 'no_snack', 'no_sweet', 'had_snack', 'had_sweet', 'big_meal'].includes(r.type)) {
      checked.add(r.type);
    }
  });
  todayChecked.value = checked;
};

const loadWeekData = async () => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(start.getDate() - dayOfWeek + 1);
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  weeklyData.value = await getCheckInRange(startDate, todayStr());
};

const handleLogin = async () => {
  loggedIn.value = true;
  const p = await getProfile();
  if (p) profile.value = p;
  await Promise.all([loadTodayData(), loadWeekData()]);
};

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
  alarmInterval = setInterval(checkAlarms, 10000);

  try {
    const ready = await initCloudBase();
    if (ready) {
      loggedIn.value = true;
      const p = await getProfile();
      if (p) profile.value = p;
      await Promise.all([loadTodayData(), loadWeekData()]);
    }
    // 如果没登录，显示登录界面（loggedIn 保持 false）
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

// Tab切换时刷新数据
watch(activeTab, async (val) => {
  if (val === 'today') {
    await Promise.all([loadTodayData(), loadWeekData()]);
  }
  if (val === 'checkin' && checkinRef.value) {
    await checkinRef.value.loadToday?.();
    await checkinRef.value.loadWeek?.();
  }
  if (val === 'body' && bodyRef.value) {
    await bodyRef.value.loadData?.();
  }
  if (val === 'profile' && profileRef.value) {
    await profileRef.value.loadData?.();
    const p = await getProfile();
    if (p) profile.value = p;
  }
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

.header-left { z-index: 1; }

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

.logo-icon { width: 28px; height: 28px; }

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

.cloud-badge:hover { background: rgba(255, 255, 255, 0.2); }

.cloud-icon { font-size: 14px; }

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

.time-icon { font-size: 15px; }

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

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.stat-card:hover { transform: translateY(-4px); }

.stat-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all 0.4s ease;
}

.stat-card:hover .stat-bg { box-shadow: var(--shadow-lg); }

.stat-streak .stat-bg { border-bottom: 3px solid #10b981; }
.stat-exercise .stat-bg { border-bottom: 3px solid var(--brand-blue); }
.stat-bmr .stat-bg { border-bottom: 3px solid #f59e0b; }
.stat-bmi .stat-bg { border-bottom: 3px solid var(--brand-purple); }

.stat-content {
  position: relative;
  z-index: 1;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-streak .stat-icon-wrapper {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.stat-exercise .stat-icon-wrapper {
  background: linear-gradient(135deg, #0052d9, #3a7bd5);
  color: white;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.stat-bmr .stat-icon-wrapper {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
}

.stat-bmi .stat-icon-wrapper {
  background: linear-gradient(135deg, #7b61ff, #a78bfa);
  color: white;
  box-shadow: 0 4px 14px rgba(123, 97, 255, 0.3);
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

.stat-card:hover .stat-icon-wrapper { transform: scale(1.08); }

.stat-icon { font-size: 22px; }

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

/* 标签页 */
.tabs-container {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid var(--glass-border);
  position: relative;
  box-shadow: var(--shadow-sm);
}

.custom-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
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

.custom-tab:hover { color: var(--text-primary); }

.custom-tab.active {
  color: white;
  font-weight: 600;
}

.tab-icon { font-size: 16px; }

.tab-indicator {
  position: absolute;
  top: 5px;
  height: calc(100% - 10px);
  background: var(--gradient-hero);
  border-radius: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 82, 217, 0.3);
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
  .app-header { padding: 0 16px; height: 64px; }
  .app-title { font-size: 16px; }
  .app-subtitle { display: none; }
  .app-main { padding: 16px; }
  .greeting-banner {
    flex-direction: column;
    gap: 14px;
    padding: 20px;
  }
  .greeting-right { align-self: flex-end; }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat-content { padding: 14px; gap: 10px; }
  .stat-value { font-size: 22px; }
  .stat-icon-wrapper { width: 38px; height: 38px; }
  .custom-tab { padding: 10px 8px; font-size: 13px; }
  .current-time { display: none; }
  .app-footer {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }
}
</style>
