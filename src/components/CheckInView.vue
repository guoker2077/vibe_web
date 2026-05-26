<template>
  <div class="checkin-view">
    <!-- 快捷打卡 -->
    <div class="quick-checkin-section">
      <h3 class="section-title">今日打卡</h3>
      <div class="quick-grid">
        <div
          class="quick-item"
          :class="{ checked: todayChecked.has('diet_ok') }"
          @click="toggleQuick('diet_ok', '饮食健康')"
        >
          <div class="quick-circle">
            <svg viewBox="0 0 24 24" fill="none" class="quick-icon">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="currentColor" stroke-width="2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="check-badge" v-if="todayChecked.has('diet_ok')">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
          </div>
          <span class="quick-label">饮食OK</span>
        </div>
        <div
          class="quick-item"
          :class="{ checked: todayChecked.has('exercise') }"
          @click="toggleQuick('exercise', '运动锻炼')"
        >
          <div class="quick-circle exercise">
            <svg viewBox="0 0 24 24" fill="none" class="quick-icon">
              <path d="M6 9V4M18 9V4M6 20v-5M18 20v-5M4 9h16v6H4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="check-badge" v-if="todayChecked.has('exercise')">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
          </div>
          <span class="quick-label">运动了</span>
        </div>
        <div
          class="quick-item"
          :class="{ checked: todayChecked.has('no_snack') }"
          @click="toggleQuick('no_snack', '没吃零食')"
        >
          <div class="quick-circle snack">
            <svg viewBox="0 0 24 24" fill="none" class="quick-icon">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="check-badge" v-if="todayChecked.has('no_snack')">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
          </div>
          <span class="quick-label">没吃零食</span>
        </div>
        <div
          class="quick-item"
          :class="{ checked: todayChecked.has('no_sweet') }"
          @click="toggleQuick('no_sweet', '没吃甜食')"
        >
          <div class="quick-circle sweet">
            <svg viewBox="0 0 24 24" fill="none" class="quick-icon">
              <path d="M12 2a5 5 0 015 5c0 2-1 3-2 4l-1 1v5a2 2 0 01-2 2h0a2 2 0 01-2-2v-5l-1-1C8 10 7 9 7 7a5 5 0 015-5z" stroke="currentColor" stroke-width="2"/>
              <path d="M10 22h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="check-badge" v-if="todayChecked.has('no_sweet')">
              <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
          </div>
          <span class="quick-label">没吃甜食</span>
        </div>
      </div>
    </div>

    <!-- 警示标记 -->
    <div class="warning-section">
      <h3 class="section-title">饮食标记</h3>
      <div class="warning-grid">
        <div
          class="warning-item"
          :class="{ active: todayChecked.has('had_snack') }"
          @click="toggleWarning('had_snack', '吃了零食')"
        >
          <span class="warning-emoji">🍪</span>
          <span class="warning-label">吃了零食</span>
        </div>
        <div
          class="warning-item"
          :class="{ active: todayChecked.has('had_sweet') }"
          @click="toggleWarning('had_sweet', '吃了甜食')"
        >
          <span class="warning-emoji">🍰</span>
          <span class="warning-label">吃了甜食</span>
        </div>
        <div
          class="warning-item"
          :class="{ active: todayChecked.has('big_meal') }"
          @click="toggleWarning('big_meal', '外出大餐')"
        >
          <span class="warning-emoji">🍲</span>
          <span class="warning-label">外出大餐</span>
        </div>
      </div>
    </div>

    <!-- 运动详情 -->
    <div class="exercise-section">
      <h3 class="section-title">运动记录</h3>
      <div class="exercise-input-row">
        <t-select v-model="exerciseType" :options="exerciseOptions" placeholder="运动类型" style="width: 140px" size="medium" />
        <t-input-number v-model="exerciseDuration" :min="1" :max="600" placeholder="时长(分钟)" size="medium" style="width: 140px" />
        <t-button theme="primary" size="medium" @click="addExercise" :disabled="!exerciseType">记录</t-button>
      </div>
      <div class="exercise-list" v-if="todayExercises.length > 0">
        <div class="exercise-item" v-for="ex in todayExercises" :key="ex._id">
          <div class="exercise-info">
            <span class="exercise-type">{{ ex.data?.type }}</span>
            <span class="exercise-duration">{{ ex.data?.duration }} 分钟</span>
          </div>
          <t-button variant="text" size="small" @click="removeRecord(ex._id)">
            <template #icon><CloseIcon /></template>
          </t-button>
        </div>
      </div>
    </div>

    <!-- 自定义打卡项 -->
    <div class="custom-section">
      <div class="section-header-row">
        <h3 class="section-title">自定义打卡</h3>
        <t-button variant="outline" size="small" @click="showAddCustom = true">
          <template #icon><AddIcon /></template>
          添加项目
        </t-button>
      </div>
      <div class="custom-grid" v-if="customItems.length > 0">
        <div
          class="custom-item"
          :class="{ checked: isCustomChecked(item._id) }"
          v-for="item in customItems"
          :key="item._id"
          @click="toggleCustom(item)"
        >
          <div class="custom-check">
            <svg viewBox="0 0 20 20" fill="none" v-if="isCustomChecked(item._id)">
              <circle cx="10" cy="10" r="9" fill="var(--brand-blue)"/>
              <path d="M6 10l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg viewBox="0 0 20 20" fill="none" v-else>
              <circle cx="10" cy="10" r="9" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
          <span class="custom-name">{{ item.name }}</span>
          <t-button variant="text" size="small" class="custom-delete" @click.stop="handleDeleteCustom(item._id)">
            <template #icon><DeleteIcon /></template>
          </t-button>
        </div>
      </div>
      <div class="empty-hint" v-else>暂无自定义打卡项，点击添加</div>
    </div>

    <!-- 本周统计 -->
    <div class="weekly-stats">
      <h3 class="section-title">本周统计</h3>
      <div class="week-grid">
        <div class="week-day" v-for="(d, i) in weekDays" :key="i">
          <span class="day-label">{{ d.label }}</span>
          <div class="day-dot" :class="{ active: d.checked }"></div>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-chip">
          <span class="chip-emoji">🍪</span>
          <span>零食 {{ weeklyStats.snack }}次</span>
        </div>
        <div class="stat-chip">
          <span class="chip-emoji">🍰</span>
          <span>甜食 {{ weeklyStats.sweet }}次</span>
        </div>
        <div class="stat-chip">
          <span class="chip-emoji">🍲</span>
          <span>大餐 {{ weeklyStats.bigMeal }}次</span>
        </div>
        <div class="stat-chip">
          <span class="chip-emoji">🏃</span>
          <span>运动 {{ weeklyStats.exercise }}次</span>
        </div>
      </div>
    </div>

    <!-- 添加自定义项弹窗 -->
    <t-dialog
      v-model:visible="showAddCustom"
      header="添加打卡项目"
      :confirm-btn="{ content: '添加', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleAddCustom"
    >
      <t-form label-align="top" :label-width="0">
        <t-form-item label="项目名称">
          <t-input v-model="newCustomName" placeholder="如：喝够2L水、早睡、冥想" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { AddIcon, CloseIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import {
  getCheckInRecords,
  addCheckIn,
  removeCheckIn,
  getCheckInRange,
  getCustomItems,
  addCustomItem,
  deleteCustomItem,
} from '../lib/cloudbase';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayRecords = ref([]);
const todayChecked = ref(new Set());
const todayExercises = ref([]);
const customItems = ref([]);
const showAddCustom = ref(false);
const newCustomName = ref('');
const exerciseType = ref('');
const exerciseDuration = ref(30);
const weeklyData = ref([]);

const exerciseOptions = [
  { label: '跑步', value: '跑步' },
  { label: '力量训练', value: '力量训练' },
  { label: '游泳', value: '游泳' },
  { label: '骑行', value: '骑行' },
  { label: '瑜伽', value: '瑜伽' },
  { label: '跳绳', value: '跳绳' },
  { label: '散步', value: '散步' },
  { label: '其他', value: '其他' },
];

const weekDays = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOfWeek + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const checked = weeklyData.value.some(r => {
      const rd = r.date;
      if (rd instanceof Date) {
        return rd.toISOString().slice(0, 10) === dateStr;
      }
      return String(rd).slice(0, 10) === dateStr;
    });
    days.push({ label: labels[i - 1], date: dateStr, checked });
  }
  return days;
});

const weeklyStats = computed(() => {
  let snack = 0, sweet = 0, bigMeal = 0, exercise = 0;
  weeklyData.value.forEach(r => {
    if (r.type === 'had_snack') snack++;
    if (r.type === 'had_sweet') sweet++;
    if (r.type === 'big_meal') bigMeal++;
    if (r.type === 'exercise') exercise++;
  });
  return { snack, sweet, bigMeal, exercise };
});

const isCustomChecked = (itemId) => {
  return todayRecords.value.some(r => r.type === 'custom' && r.data?.itemId === itemId);
};

const loadToday = async () => {
  const records = await getCheckInRecords(todayStr());
  todayRecords.value = records;
  const checked = new Set();
  const exercises = [];
  records.forEach(r => {
    if (['diet_ok', 'exercise', 'no_snack', 'no_sweet', 'had_snack', 'had_sweet', 'big_meal'].includes(r.type)) {
      checked.add(r.type);
    }
    if (r.type === 'exercise_detail') {
      exercises.push(r);
    }
  });
  todayChecked.value = checked;
  todayExercises.value = exercises;
};

const loadWeek = async () => {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(start.getDate() - dayOfWeek + 1);
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  const endDate = todayStr();
  weeklyData.value = await getCheckInRange(startDate, endDate);
};

const loadCustom = async () => {
  customItems.value = await getCustomItems();
};

const toggleQuick = async (type, label) => {
  if (todayChecked.value.has(type)) {
    const record = todayRecords.value.find(r => r.type === type);
    if (record) {
      await removeCheckIn(record._id);
    }
  } else {
    await addCheckIn({ type, date: todayStr(), data: { label } });
  }
  await loadToday();
  await loadWeek();
};

const toggleWarning = async (type, label) => {
  if (todayChecked.value.has(type)) {
    const record = todayRecords.value.find(r => r.type === type);
    if (record) {
      await removeCheckIn(record._id);
    }
  } else {
    await addCheckIn({ type, date: todayStr(), data: { label } });
  }
  await loadToday();
  await loadWeek();
};

const addExercise = async () => {
  if (!exerciseType.value) return;
  await addCheckIn({
    type: 'exercise_detail',
    date: todayStr(),
    data: { type: exerciseType.value, duration: exerciseDuration.value },
  });
  // Also mark exercise quick check
  if (!todayChecked.value.has('exercise')) {
    await addCheckIn({ type: 'exercise', date: todayStr(), data: { label: '运动锻炼' } });
  }
  exerciseType.value = '';
  exerciseDuration.value = 30;
  await loadToday();
  await loadWeek();
};

const removeRecord = async (id) => {
  await removeCheckIn(id);
  await loadToday();
  await loadWeek();
};

const toggleCustom = async (item) => {
  if (isCustomChecked(item._id)) {
    const record = todayRecords.value.find(r => r.type === 'custom' && r.data?.itemId === item._id);
    if (record) await removeCheckIn(record._id);
  } else {
    await addCheckIn({
      type: 'custom',
      date: todayStr(),
      data: { itemId: item._id, name: item.name },
    });
  }
  await loadToday();
  await loadWeek();
};

const handleAddCustom = async () => {
  if (!newCustomName.value.trim()) return;
  await addCustomItem({ name: newCustomName.value.trim() });
  newCustomName.value = '';
  showAddCustom.value = false;
  await loadCustom();
};

const handleDeleteCustom = async (id) => {
  await deleteCustomItem(id);
  await loadCustom();
};

onMounted(async () => {
  await Promise.all([loadToday(), loadWeek(), loadCustom()]);
});

defineExpose({ loadToday, loadWeek });
</script>

<style scoped>
.checkin-view {
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

/* 快捷打卡 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-item:hover {
  transform: translateY(-3px);
}

.quick-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.quick-icon {
  width: 28px;
  height: 28px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.quick-circle.exercise { }
.quick-circle.snack { }
.quick-circle.sweet { }

.quick-item.checked .quick-circle {
  background: var(--gradient-hero);
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(0, 82, 217, 0.3);
}

.quick-item.checked .quick-icon {
  color: white;
}

.check-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.check-badge svg {
  width: 12px;
  height: 12px;
}

.quick-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.quick-item.checked .quick-label {
  color: var(--brand-blue);
  font-weight: 600;
}

/* 警示标记 */
.warning-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.warning-item:hover {
  transform: translateY(-2px);
}

.warning-item.active {
  background: #fef2f2;
  border-color: #fecaca;
}

.warning-emoji {
  font-size: 24px;
}

.warning-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.warning-item.active .warning-label {
  color: #ef4444;
  font-weight: 600;
}

/* 运动 */
.exercise-input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.exercise-info {
  display: flex;
  gap: 12px;
}

.exercise-type {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.exercise-duration {
  font-size: 13px;
  color: var(--text-muted);
}

/* 自定义打卡 */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-header-row .section-title {
  margin-bottom: 0;
}

.custom-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-item:hover {
  background: rgba(0, 82, 217, 0.03);
}

.custom-item.checked {
  border-color: rgba(0, 82, 217, 0.2);
  background: var(--brand-blue-light);
}

.custom-check svg {
  width: 20px;
  height: 20px;
}

.custom-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.custom-delete {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-item:hover .custom-delete {
  opacity: 1;
}

/* 本周统计 */
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.day-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.day-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.day-dot.active {
  background: var(--gradient-hero);
  box-shadow: 0 2px 8px rgba(0, 82, 217, 0.3);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--glass-border);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.chip-emoji {
  font-size: 16px;
}

.empty-hint {
  text-align: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 13px;
}

@media (max-width: 768px) {
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .warning-grid {
    grid-template-columns: 1fr;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .exercise-input-row {
    flex-direction: column;
  }
  .exercise-input-row .t-select,
  .exercise-input-row .t-input-number {
    width: 100% !important;
  }
}
</style>
