<template>
  <div class="profile-view">
    <div class="profile-card" v-if="!hasProfile">
      <div class="card-header">
        <div class="header-icon-wrapper">
          <ProfileIcon class="header-icon" />
        </div>
        <div>
          <h3 class="card-title">创建个人档案</h3>
          <p class="card-desc">填写基础数据，开启自律之旅</p>
        </div>
      </div>
      <t-form :data="formData" label-align="top" :label-width="0">
        <div class="form-grid">
          <t-form-item label="姓名">
            <t-input v-model="formData.name" placeholder="你的名字" />
          </t-form-item>
          <t-form-item label="性别">
            <t-select v-model="formData.gender" :options="genderOptions" placeholder="选择性别" />
          </t-form-item>
          <t-form-item label="身高 (cm)">
            <t-input-number v-model="formData.height" :min="100" :max="250" :decimal-places="1" theme="normal" placeholder="请输入身高" />
          </t-form-item>
          <t-form-item label="体重 (kg)">
            <t-input-number v-model="formData.weight" :min="30" :max="300" :decimal-places="1" theme="normal" placeholder="请输入体重" />
          </t-form-item>
          <t-form-item label="年龄">
            <t-input-number v-model="formData.age" :min="10" :max="120" theme="normal" placeholder="请输入年龄" />
          </t-form-item>
          <t-form-item label="目标体重 (kg)">
            <t-input-number v-model="formData.targetWeight" :min="30" :max="300" :decimal-places="1" theme="normal" placeholder="请输入目标体重" />
          </t-form-item>
        </div>
        <t-button theme="primary" block size="large" @click="handleSave" :loading="saving">
          保存档案
        </t-button>
      </t-form>
    </div>

    <div class="profile-display" v-else>
      <!-- 档案概览 -->
      <div class="profile-overview">
        <div class="overview-left">
          <div class="avatar-circle">
            <span class="avatar-text">{{ profile.name?.charAt(0) || 'U' }}</span>
          </div>
          <div class="overview-info">
            <h3 class="overview-name">{{ profile.name }}</h3>
            <span class="overview-meta">{{ profile.gender === 'male' ? '男' : '女' }} · {{ profile.age }}岁</span>
          </div>
        </div>
        <t-button variant="outline" size="small" @click="editing = true">
          编辑
        </t-button>
      </div>

      <!-- 数据卡片 -->
      <div class="data-grid">
        <div class="data-item">
          <span class="data-label">身高</span>
          <span class="data-value">{{ profile.height }}<small>cm</small></span>
        </div>
        <div class="data-item">
          <span class="data-label">当前体重</span>
          <span class="data-value">{{ profile.weight }}<small>kg</small></span>
        </div>
        <div class="data-item">
          <span class="data-label">目标体重</span>
          <span class="data-value highlight">{{ profile.targetWeight }}<small>kg</small></span>
        </div>
        <div class="data-item">
          <span class="data-label">BMI</span>
          <span class="data-value" :class="bmiClass">{{ bmi }}<small>{{ bmiLabel }}</small></span>
        </div>
      </div>

      <!-- BMR 卡片 -->
      <div class="bmr-card">
        <div class="bmr-header">
          <div class="bmr-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" class="bmr-icon">
              <path d="M12 2C8 2 4 6 4 10c0 3 2 5 4 7v3h8v-3c2-2 4-4 4-7 0-4-4-8-8-8z" stroke="currentColor" stroke-width="2"/>
              <path d="M10 20h4M11 16v4M13 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <span class="bmr-title">基础代谢率 (BMR)</span>
            <span class="bmr-sub">Mifflin-St Jeor 公式</span>
          </div>
        </div>
        <div class="bmr-value-row">
          <div class="bmr-main">
            <span class="bmr-number">{{ bmr }}</span>
            <span class="bmr-unit">kcal/天</span>
          </div>
          <div class="bmr-bars">
            <div class="bmr-bar">
              <span class="bar-label">久坐</span>
              <span class="bar-value">{{ Math.round(bmr * 1.2) }}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 60%"></div></div>
            </div>
            <div class="bmr-bar">
              <span class="bar-label">轻度活动</span>
              <span class="bar-value">{{ Math.round(bmr * 1.375) }}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 70%"></div></div>
            </div>
            <div class="bmr-bar">
              <span class="bar-label">中度活动</span>
              <span class="bar-value">{{ Math.round(bmr * 1.55) }}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 82%"></div></div>
            </div>
            <div class="bmr-bar">
              <span class="bar-label">高强度</span>
              <span class="bar-value">{{ Math.round(bmr * 1.725) }}</span>
              <div class="bar-track"><div class="bar-fill" style="width: 95%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 目标差距 -->
      <div class="goal-card">
        <div class="goal-header">
          <span class="goal-title">目标进度</span>
          <span class="goal-current">{{ Math.abs(profile.weight - profile.targetWeight).toFixed(1) }} kg</span>
        </div>
        <div class="goal-bar-track">
          <div class="goal-bar-fill" :style="{ width: goalPercent + '%' }"></div>
        </div>
        <div class="goal-labels">
          <span>起始 {{ profile.weight }} kg</span>
          <span>目标 {{ profile.targetWeight }} kg</span>
        </div>
      </div>

      <!-- 提醒设置（精简版闹钟） -->
      <div class="alarm-section">
        <div class="section-header-row">
          <h4 class="section-title">
            <AlarmIcon class="section-icon" />
            提醒设置
          </h4>
          <t-button theme="primary" size="small" @click="showAddAlarm">
            <template #icon><AddIcon /></template>
            添加
          </t-button>
        </div>
        <div class="alarm-list" v-if="alarms.length > 0">
          <div class="alarm-item" v-for="alarm in alarms" :key="alarm._id">
            <div class="alarm-info">
              <span class="alarm-title">{{ alarm.title }}</span>
              <span class="alarm-time">{{ alarm.date }} {{ alarm.time }}</span>
            </div>
            <div class="alarm-actions">
              <t-switch size="small" :value="alarm.enabled" @change="(v) => toggleAlarm(alarm._id, v)" />
              <t-button variant="text" size="small" @click="handleDeleteAlarm(alarm._id)">
                <template #icon><DeleteIcon /></template>
              </t-button>
            </div>
          </div>
        </div>
        <div class="empty-hint" v-else>暂无提醒，点击添加</div>
      </div>

      <!-- 数据管理 -->
      <div class="data-management">
        <t-button variant="outline" block @click="handleExport">导出数据</t-button>
        <t-button variant="text" theme="danger" block @click="handleClearAll">清除所有数据</t-button>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <t-dialog
      v-model:visible="editing"
      header="编辑个人档案"
      :confirm-btn="{ content: '保存', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleSave"
      @close="editing = false"
    >
      <t-form :data="formData" label-align="top" :label-width="0">
        <div class="form-grid">
          <t-form-item label="姓名">
            <t-input v-model="formData.name" placeholder="你的名字" />
          </t-form-item>
          <t-form-item label="性别">
            <t-select v-model="formData.gender" :options="genderOptions" placeholder="选择性别" />
          </t-form-item>
          <t-form-item label="身高 (cm)">
            <t-input-number v-model="formData.height" :min="100" :max="250" :decimal-places="1" theme="normal" placeholder="请输入身高" />
          </t-form-item>
          <t-form-item label="体重 (kg)">
            <t-input-number v-model="formData.weight" :min="30" :max="300" :decimal-places="1" theme="normal" placeholder="请输入体重" />
          </t-form-item>
          <t-form-item label="年龄">
            <t-input-number v-model="formData.age" :min="10" :max="120" theme="normal" placeholder="请输入年龄" />
          </t-form-item>
          <t-form-item label="目标体重 (kg)">
            <t-input-number v-model="formData.targetWeight" :min="30" :max="300" :decimal-places="1" theme="normal" placeholder="请输入目标体重" />
          </t-form-item>
        </div>
      </t-form>
    </t-dialog>

    <!-- 添加提醒弹窗 -->
    <t-dialog
      v-model:visible="alarmDialogVisible"
      header="添加提醒"
      :confirm-btn="{ content: '添加', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleAddAlarm"
      @close="alarmDialogVisible = false"
    >
      <t-form label-align="top" :label-width="0">
        <t-form-item label="提醒标题">
          <t-input v-model="alarmForm.title" placeholder="如：喝水提醒" />
        </t-form-item>
        <t-form-item label="日期">
          <t-date-picker v-model="alarmForm.date" clearable />
        </t-form-item>
        <t-form-item label="时间">
          <t-time-picker v-model="alarmForm.time" format="HH:mm" clearable />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { AddIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { AlarmIcon, ProfileIcon } from './icons';
import {
  getProfile,
  saveProfile,
  getAlarms,
  addAlarm,
  toggleAlarmEnabled,
  deleteAlarm,
} from '../lib/cloudbase';

const profile = ref({});
const hasProfile = ref(false);
const editing = ref(false);
const saving = ref(false);
const alarms = ref([]);
const alarmDialogVisible = ref(false);

const formData = ref({
  name: '',
  gender: '',
  height: undefined,
  weight: undefined,
  age: undefined,
  targetWeight: undefined,
});

const alarmForm = ref({
  title: '',
  date: '',
  time: '',
});

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];

const bmr = computed(() => {
  const p = profile.value;
  if (!p.weight || !p.height || !p.age) return 0;
  if (p.gender === 'male') {
    return Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age + 5);
  }
  return Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age - 161);
});

const bmi = computed(() => {
  const p = profile.value;
  if (!p.weight || !p.height) return 0;
  return (p.weight / ((p.height / 100) ** 2)).toFixed(1);
});

const bmiLabel = computed(() => {
  const v = parseFloat(bmi.value);
  if (v < 18.5) return '偏瘦';
  if (v < 24) return '正常';
  if (v < 28) return '偏胖';
  return '肥胖';
});

const bmiClass = computed(() => {
  const v = parseFloat(bmi.value);
  if (v < 18.5) return 'bmi-thin';
  if (v < 24) return 'bmi-normal';
  if (v < 28) return 'bmi-overweight';
  return 'bmi-obese';
});

const goalPercent = computed(() => {
  const p = profile.value;
  if (!p.weight || !p.targetWeight || p.weight === p.targetWeight) return 100;
  const diff = Math.abs(p.weight - p.targetWeight);
  const total = Math.abs(p.weight - p.targetWeight);
  return Math.min(100, Math.max(0, ((1 - diff / total) * 100)));
});

const loadData = async () => {
  const p = await getProfile();
  if (p) {
    profile.value = p;
    hasProfile.value = true;
    formData.value = { ...p };
  }
  const a = await getAlarms();
  alarms.value = a;
};

const handleSave = async () => {
  saving.value = true;
  const result = await saveProfile(formData.value);
  if (result) {
    profile.value = { ...formData.value };
    hasProfile.value = true;
    editing.value = false;
    MessagePlugin.success('档案保存成功');
  } else {
    MessagePlugin.error('档案保存失败，请检查网络后重试');
  }
  saving.value = false;
};

const showAddAlarm = () => {
  alarmForm.value = { title: '', date: '', time: '' };
  alarmDialogVisible.value = true;
};

const handleAddAlarm = async () => {
  if (!alarmForm.value.title) return;
  await addAlarm(alarmForm.value);
  alarmDialogVisible.value = false;
  const a = await getAlarms();
  alarms.value = a;
};

const toggleAlarm = async (id, enabled) => {
  await toggleAlarmEnabled(id, enabled);
  const a = await getAlarms();
  alarms.value = a;
};

const handleDeleteAlarm = async (id) => {
  await deleteAlarm(id);
  const a = await getAlarms();
  alarms.value = a;
};

const handleExport = () => {
  const data = {
    profile: profile.value,
    alarms: alarms.value,
    exportDate: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleClearAll = () => {
  if (confirm('确定清除所有数据？此操作不可恢复！')) {
    localStorage.clear();
    location.reload();
  }
};

onMounted(loadData);

defineExpose({ profile, bmr, bmi, loadData });
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 28px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.header-icon {
  font-size: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* 档案展示 */
.profile-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}

.overview-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-hero);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 82, 217, 0.3);
}

.avatar-text {
  font-size: 24px;
  font-weight: 700;
}

.overview-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.overview-meta {
  font-size: 13px;
  color: var(--text-muted);
}

/* 数据网格 */
.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.data-item {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  padding: 16px;
  text-align: center;
}

.data-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 6px;
}

.data-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
}

.data-value small {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 2px;
}

.data-value.highlight {
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bmi-normal { color: #10b981; }
.bmi-thin { color: #f59e0b; }
.bmi-overweight { color: #f97316; }
.bmi-obese { color: #ef4444; }

/* BMR 卡片 */
.bmr-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 24px;
}

.bmr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.bmr-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
}

.bmr-icon {
  width: 22px;
  height: 22px;
}

.bmr-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.bmr-sub {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.bmr-value-row {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.bmr-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.bmr-number {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.bmr-unit {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.bmr-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bmr-bar {
  display: grid;
  grid-template-columns: 70px 50px 1fr;
  align-items: center;
  gap: 8px;
}

.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}

.bar-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--gradient-hero);
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* 目标卡片 */
.goal-card {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.goal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.goal-current {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.goal-bar-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.goal-bar-fill {
  height: 100%;
  background: var(--gradient-hero);
  border-radius: 4px;
  transition: width 0.8s ease;
}

.goal-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

/* 提醒区 */
.alarm-section {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 20px 24px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-icon {
  font-size: 18px;
  color: var(--brand-purple);
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.alarm-info {
  display: flex;
  flex-direction: column;
}

.alarm-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.alarm-time {
  font-size: 12px;
  color: var(--text-muted);
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-hint {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
}

/* 数据管理 */
.data-management {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .bmr-value-row {
    flex-direction: column;
  }
  .bmr-main {
    flex-direction: row;
    gap: 8px;
  }
}
</style>
