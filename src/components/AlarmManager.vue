<template>
  <div class="alarm-manager">
    <!-- 加载骨架屏 -->
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-bar">
        <div class="skeleton skeleton-btn"></div>
        <div class="skeleton skeleton-btn-sm"></div>
      </div>
      <div class="skeleton-card" v-for="i in 3" :key="i">
        <div class="skeleton skeleton-time"></div>
        <div class="skeleton-lines">
          <div class="skeleton skeleton-line-lg"></div>
          <div class="skeleton skeleton-line-sm"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-left">
          <t-button theme="primary" @click="showAddDialog" size="medium">
            <template #icon><AddIcon /></template>
            添加提醒
          </t-button>
          <t-button variant="outline" @click="handleClearDisabled" :disabled="disabledCount === 0" size="medium">
            清除已关闭
          </t-button>
        </div>
        <div class="action-right">
          <div class="sync-indicator" :class="{ 'sync-active': syncActive }">
            <span class="sync-dot"></span>
            <span class="sync-text">{{ syncActive ? '同步中' : '已同步' }}</span>
          </div>
        </div>
      </div>

      <!-- 下一个提醒倒计时 -->
      <div class="next-alarm-banner" v-if="nextAlarm">
        <div class="next-alarm-left">
          <div class="next-alarm-icon-wrapper">
            <AlarmIcon class="next-alarm-icon" />
          </div>
          <div class="next-alarm-info">
            <span class="next-alarm-label">下一个提醒</span>
            <span class="next-alarm-title">{{ nextAlarm.title }}</span>
          </div>
        </div>
        <div class="next-alarm-right">
          <div class="countdown-block">
            <span class="countdown-time">{{ nextAlarmCountdown }}</span>
            <span class="countdown-at">{{ nextAlarm.date }} {{ nextAlarm.time }}</span>
          </div>
        </div>
      </div>

      <!-- 提醒列表 -->
      <TransitionGroup name="list" tag="div" class="alarm-list" v-if="filteredAlarms.length > 0">
        <div
          v-for="(alarm, index) in filteredAlarms"
          :key="alarm._id"
          class="alarm-card"
          :class="{ 'alarm-disabled': !alarm.enabled }"
          :style="{ '--delay': `${index * 0.05}s` }"
        >
          <div class="alarm-left">
            <div class="alarm-time-block" :class="{ 'time-off': !alarm.enabled }">
              <span class="alarm-time">{{ alarm.time }}</span>
              <span class="alarm-date">{{ alarm.date }}</span>
              <div class="time-glow" v-if="alarm.enabled"></div>
            </div>
            <div class="alarm-info">
              <div class="alarm-title-row">
                <span class="alarm-title">{{ alarm.title }}</span>
                <span class="status-dot" :class="alarm.enabled ? 'status-on' : 'status-off'"></span>
                <t-tag
                  v-if="alarm.repeat !== 'none'"
                  theme="warning"
                  size="small"
                  variant="light"
                  class="repeat-tag"
                >
                  {{ repeatLabelMap[alarm.repeat] }}
                </t-tag>
              </div>
              <p v-if="alarm.description" class="alarm-desc">{{ alarm.description }}</p>
            </div>
          </div>
          <div class="alarm-right">
            <t-switch
              :value="alarm.enabled"
              @change="(val) => handleToggleAlarm(alarm._id, val)"
              size="large"
            />
            <div class="alarm-actions">
              <t-button variant="text" shape="circle" @click="editAlarm(alarm)" class="action-btn">
                <EditIcon />
              </t-button>
              <t-button variant="text" shape="circle" theme="danger" @click="handleDeleteAlarm(alarm._id)" class="action-btn">
                <DeleteIcon />
              </t-button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-illustration">
          <AlarmIcon :size="72" class="empty-icon" />
          <div class="empty-circle c1"></div>
          <div class="empty-circle c2"></div>
        </div>
        <p class="empty-title">暂无提醒</p>
        <p class="empty-desc">点击「添加提醒」创建你的第一个闹钟提醒</p>
      </div>
    </template>

    <!-- 添加/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEditing ? '编辑提醒' : '添加提醒'"
      :confirm-btn="{ content: isEditing ? '保存' : '添加', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <t-form :data="formData" layout="vertical">
        <t-form-item label="提醒标题">
          <t-input v-model="formData.title" placeholder="请输入提醒标题" />
        </t-form-item>
        <t-form-item label="描述">
          <t-textarea v-model="formData.description" placeholder="请输入描述（可选）" :maxlength="200" />
        </t-form-item>
        <div class="form-row">
          <t-form-item label="日期" class="form-col">
            <t-date-picker v-model="formData.date" clearable style="width: 100%" />
          </t-form-item>
          <t-form-item label="时间" class="form-col">
            <t-time-picker v-model="formData.time" format="HH:mm" style="width: 100%" />
          </t-form-item>
        </div>
        <t-form-item label="重复">
          <t-select v-model="formData.repeat">
            <t-option value="none" label="不重复" />
            <t-option value="daily" label="每天" />
            <t-option value="weekly" label="每周" />
            <t-option value="monthly" label="每月" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AddIcon, EditIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { AlarmIcon } from './icons';
import {
  init as initCloudBase,
  getAlarms,
  addAlarm,
  updateAlarm,
  deleteAlarm,
  toggleAlarmEnabled,
  clearDisabledAlarms,
  watchAlarms,
} from '../lib/cloudbase';

const emit = defineEmits(['update-stats']);

const alarms = ref([]);
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const loading = ref(true);
const syncActive = ref(false);

let alarmWatcher = null;

const repeatLabelMap = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
};

const formData = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  repeat: 'none',
});

const filteredAlarms = computed(() => {
  const list = [...alarms.value];
  list.sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return (a.date + a.time).localeCompare(b.date + b.time);
  });
  return list;
});

const disabledCount = computed(() => alarms.value.filter((a) => !a.enabled).length);

// 下一个提醒
const nextAlarm = computed(() => {
  const now = new Date();
  const upcoming = alarms.value
    .filter(a => a.enabled)
    .map(a => {
      const dueDate = new Date(a.date + 'T' + (a.time || '00:00'));
      return { ...a, _dueDate: dueDate };
    })
    .filter(a => a._dueDate > now)
    .sort((a, b) => a._dueDate - b._dueDate);
  return upcoming.length > 0 ? upcoming[0] : null;
});

const nextAlarmCountdown = computed(() => {
  if (!nextAlarm.value) return '';
  const now = new Date();
  const diff = nextAlarm.value._dueDate - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return `${minutes}分钟后`;
  if (hours < 24) return `${hours}小时${minutes}分钟后`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return `${days}天${remainHours}小时后`;
});

const refreshStats = () => {
  emit('update-stats');
};

const loadAlarmsFromCloud = async () => {
  try {
    const data = await getAlarms();
    alarms.value = data;
  } catch (e) {
    console.error('加载提醒失败:', e);
  }
};

const showAddDialog = () => {
  isEditing.value = false;
  editingId.value = null;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  formData.value = {
    title: '',
    description: '',
    date: `${y}-${m}-${d}`,
    time: `${h}:${min}`,
    repeat: 'none',
  };
  dialogVisible.value = true;
};

const editAlarm = (alarm) => {
  isEditing.value = true;
  editingId.value = alarm._id;
  formData.value = {
    title: alarm.title,
    description: alarm.description || '',
    date: alarm.date || '',
    time: alarm.time || '',
    repeat: alarm.repeat || 'none',
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    MessagePlugin.warning('请输入提醒标题');
    return;
  }
  if (!formData.value.time) {
    MessagePlugin.warning('请选择提醒时间');
    return;
  }
  if (!formData.value.date) {
    MessagePlugin.warning('请选择提醒日期');
    return;
  }

  syncActive.value = true;

  try {
    if (isEditing.value) {
      await updateAlarm(editingId.value, {
        title: formData.value.title.trim(),
        description: formData.value.description,
        date: formData.value.date,
        time: formData.value.time,
        repeat: formData.value.repeat,
        triggered: false,
      });
      MessagePlugin.success('提醒已更新');
    } else {
      await addAlarm({
        title: formData.value.title.trim(),
        description: formData.value.description,
        date: formData.value.date,
        time: formData.value.time,
        repeat: formData.value.repeat,
      });
      MessagePlugin.success('提醒已添加');
    }

    await loadAlarmsFromCloud();
    refreshStats();
  } catch (e) {
    MessagePlugin.error('操作失败，请重试');
  } finally {
    syncActive.value = false;
  }

  dialogVisible.value = false;
  resetForm();
};

const handleDeleteAlarm = async (id) => {
  syncActive.value = true;
  try {
    await deleteAlarm(id);
    await loadAlarmsFromCloud();
    refreshStats();
    MessagePlugin.success('提醒已删除');
  } catch (e) {
    MessagePlugin.error('删除失败');
  } finally {
    syncActive.value = false;
  }
};

const handleToggleAlarm = async (id, val) => {
  try {
    await toggleAlarmEnabled(id, val);
    await loadAlarmsFromCloud();
    refreshStats();
  } catch (e) {
    MessagePlugin.error('操作失败');
  }
};

const handleClearDisabled = async () => {
  syncActive.value = true;
  try {
    await clearDisabledAlarms();
    await loadAlarmsFromCloud();
    refreshStats();
    MessagePlugin.success('已清除关闭的提醒');
  } catch (e) {
    MessagePlugin.error('清除失败');
  } finally {
    syncActive.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    repeat: 'none',
  };
};

onMounted(async () => {
  try {
    await initCloudBase();
    await loadAlarmsFromCloud();
    refreshStats();

    alarmWatcher = watchAlarms(
      (snapshot) => {
        if (snapshot.docs) {
          alarms.value = snapshot.docs;
          refreshStats();
        } else if (snapshot.docChanges) {
          loadAlarmsFromCloud();
        }
      },
      (err) => {
        console.error('提醒监听错误:', err);
      }
    );
  } catch (e) {
    console.error('初始化失败:', e);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (alarmWatcher) {
    alarmWatcher.close();
    alarmWatcher = null;
  }
});
</script>

<style scoped>
.alarm-manager {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}

/* 骨架屏 */
.skeleton-wrapper {
  padding: 8px;
}

.skeleton-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.skeleton {
  background: linear-gradient(90deg, #e8ecf1 25%, #f0f3f7 50%, #e8ecf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-btn {
  width: 100px;
  height: 36px;
}

.skeleton-btn-sm {
  width: 90px;
  height: 36px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
}

.skeleton-time {
  width: 80px;
  height: 56px;
  border-radius: 10px;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line-lg {
  width: 55%;
  height: 16px;
}

.skeleton-line-sm {
  width: 30%;
  height: 12px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}

.action-left {
  display: flex;
  gap: 8px;
}

.action-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sync-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.sync-indicator.sync-active {
  color: var(--brand-purple);
  background: var(--brand-purple-light);
  border-color: rgba(123, 97, 255, 0.12);
}

.sync-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);
}

.sync-active .sync-dot {
  background: var(--brand-purple);
  box-shadow: 0 0 4px rgba(123, 97, 255, 0.4);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 下一个提醒 */
.next-alarm-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, rgba(123, 97, 255, 0.08) 0%, rgba(0, 82, 217, 0.06) 100%);
  border: 1px solid rgba(123, 97, 255, 0.12);
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.next-alarm-banner::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(123, 97, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.next-alarm-left {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.next-alarm-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 3px 10px rgba(123, 97, 255, 0.3);
}

.next-alarm-icon {
  font-size: 20px;
}

.next-alarm-info {
  display: flex;
  flex-direction: column;
}

.next-alarm-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--brand-purple);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.next-alarm-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2px;
}

.next-alarm-right {
  position: relative;
  z-index: 1;
}

.countdown-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.countdown-time {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.countdown-at {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

/* 闹钟列表 */
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alarm-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.alarm-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(123, 97, 255, 0.08);
  transform: translateX(2px);
}

.alarm-disabled {
  opacity: 0.5;
}

.alarm-disabled:hover {
  opacity: 0.7;
  transform: none;
}

.alarm-left {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  min-width: 0;
}

.alarm-time-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  color: white;
  min-width: 88px;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(123, 97, 255, 0.25);
  transition: all 0.3s ease;
}

.alarm-time-block.time-off {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  box-shadow: none;
}

.time-glow {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-purple));
  opacity: 0;
  filter: blur(6px);
  z-index: -1;
  animation: glow-pulse 2s ease-in-out infinite;
}

.alarm-card:hover .alarm-time-block:not(.time-off) {
  transform: scale(1.03);
}

.alarm-time {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.alarm-date {
  font-size: 11px;
  opacity: 0.85;
  font-weight: 500;
  margin-top: 2px;
}

.alarm-info {
  flex: 1;
  min-width: 0;
}

.alarm-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alarm-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-on {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.status-off {
  background: #cbd5e1;
}

.repeat-tag {
  border-radius: 6px;
}

.alarm-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.alarm-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.alarm-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.alarm-card:hover .alarm-actions {
  opacity: 1;
}

.action-btn {
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 56px 0;
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.empty-icon {
  color: #c4cad4;
  position: relative;
  z-index: 1;
  animation: float 4s ease-in-out infinite;
}

.empty-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed #d4dae4;
}

.empty-circle.c1 {
  width: 100px;
  height: 100px;
  top: -14px;
  left: -14px;
  animation: spin-slow 20s linear infinite;
}

.empty-circle.c2 {
  width: 130px;
  height: 130px;
  top: -29px;
  left: -29px;
  animation: spin-slow 30s linear infinite reverse;
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-col {
  flex: 1;
}

@media (max-width: 768px) {
  .alarm-manager {
    padding: 16px;
    border-radius: var(--radius-md);
  }
  .alarm-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .alarm-right {
    width: 100%;
    justify-content: space-between;
  }
  .alarm-actions {
    opacity: 1;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
