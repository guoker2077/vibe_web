<template>
  <div class="task-manager">
    <!-- 加载骨架屏 -->
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-bar">
        <div class="skeleton skeleton-btn"></div>
        <div class="skeleton skeleton-btn-sm"></div>
        <div class="skeleton skeleton-search"></div>
      </div>
      <div class="skeleton-card" v-for="i in 3" :key="i">
        <div class="skeleton skeleton-circle"></div>
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
            添加事务
          </t-button>
          <t-button variant="outline" @click="handleClearCompleted" :disabled="completedCount === 0" size="medium">
            清除已完成
          </t-button>
        </div>
        <div class="action-right">
          <div class="sync-indicator" :class="{ 'sync-active': syncActive }">
            <span class="sync-dot"></span>
            <span class="sync-text">{{ syncActive ? '同步中' : '已同步' }}</span>
          </div>
          <t-input
            v-model="searchKey"
            placeholder="搜索事务..."
            clearable
            style="width: 200px"
            size="medium"
          >
            <template #prefixIcon><SearchIcon /></template>
          </t-input>
          <t-select
            v-model="filterPriority"
            placeholder="优先级"
            clearable
            style="width: 110px"
            size="medium"
          >
            <t-option value="urgent" label="紧急" />
            <t-option value="high" label="高" />
            <t-option value="medium" label="中" />
            <t-option value="low" label="低" />
          </t-select>
        </div>
      </div>

      <!-- 分类快捷筛选 -->
      <div class="category-filter" v-if="categoryList.length > 0">
        <span class="filter-label">分类</span>
        <div class="filter-chips">
          <span
            class="chip"
            :class="{ active: !filterCategory }"
            @click="filterCategory = ''"
          >全部</span>
          <span
            v-for="cat in categoryList"
            :key="cat"
            class="chip"
            :class="{ active: filterCategory === cat }"
            @click="filterCategory = filterCategory === cat ? '' : cat"
          >{{ cat }}</span>
        </div>
      </div>

      <!-- 事务列表 -->
      <TransitionGroup name="list" tag="div" class="task-list" v-if="filteredTasks.length > 0">
        <div
          v-for="(task, index) in filteredTasks"
          :key="task._id"
          class="task-card"
          :class="{
            'task-completed': task.completed,
            [`priority-${task.priority}`]: !task.completed
          }"
          :style="{ '--delay': `${index * 0.05}s` }"
        >
          <div class="priority-bar" v-if="!task.completed"></div>
          <div class="task-left">
            <t-checkbox
              :checked="task.completed"
              @change="(val) => handleToggleComplete(task._id, val)"
            />
            <div class="task-info">
              <div class="task-title-row">
                <span class="task-title" :class="{ 'line-through': task.completed }">
                  {{ task.title }}
                </span>
                <t-tag
                  :theme="priorityThemeMap[task.priority]"
                  size="small"
                  variant="light"
                  class="priority-tag"
                >
                  {{ priorityLabelMap[task.priority] }}
                </t-tag>
                <t-tag
                  v-if="task.category"
                  theme="default"
                  size="small"
                  variant="light-outline"
                  class="category-tag"
                >
                  {{ task.category }}
                </t-tag>
              </div>
              <div class="task-meta">
                <span v-if="task.dueDate" class="meta-item">
                  <CalendarIcon size="14px" />
                  {{ task.dueDate }}
                </span>
                <span v-if="task.dueTime" class="meta-item">
                  <TimeIcon size="14px" />
                  {{ task.dueTime }}
                </span>
                <span v-if="task.createdAt" class="meta-item meta-created">
                  <span class="created-dot"></span>
                  {{ formatCreatedTime(task.createdAt) }}
                </span>
              </div>
              <p v-if="task.description" class="task-desc">{{ task.description }}</p>
            </div>
          </div>
          <div class="task-actions">
            <t-button variant="text" shape="circle" @click="editTask(task)" class="action-btn">
              <EditIcon />
            </t-button>
            <t-button variant="text" shape="circle" theme="danger" @click="handleDeleteTask(task._id)" class="action-btn">
              <DeleteIcon />
            </t-button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-illustration">
          <TaskIcon :size="72" class="empty-icon" />
          <div class="empty-circle c1"></div>
          <div class="empty-circle c2"></div>
        </div>
        <p class="empty-title">暂无事务</p>
        <p class="empty-desc">点击「添加事务」开始记录你的重要任务</p>
      </div>
    </template>

    <!-- 添加/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEditing ? '编辑事务' : '添加事务'"
      :confirm-btn="{ content: isEditing ? '保存' : '添加', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <t-form :data="formData" layout="vertical">
        <t-form-item label="事务标题">
          <t-input v-model="formData.title" placeholder="请输入事务标题" />
        </t-form-item>
        <t-form-item label="描述">
          <t-textarea v-model="formData.description" placeholder="请输入描述（可选）" :maxlength="200" />
        </t-form-item>
        <div class="form-row">
          <t-form-item label="优先级" class="form-col">
            <t-select v-model="formData.priority">
              <t-option value="urgent" label="紧急" />
              <t-option value="high" label="高" />
              <t-option value="medium" label="中" />
              <t-option value="low" label="低" />
            </t-select>
          </t-form-item>
          <t-form-item label="分类" class="form-col">
            <t-input v-model="formData.category" placeholder="如：工作、学习" />
          </t-form-item>
        </div>
        <div class="form-row">
          <t-form-item label="截止日期" class="form-col">
            <t-date-picker v-model="formData.dueDate" clearable style="width: 100%" />
          </t-form-item>
          <t-form-item label="截止时间" class="form-col">
            <t-time-picker v-model="formData.dueTime" clearable format="HH:mm" style="width: 100%" />
          </t-form-item>
        </div>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  AddIcon,
  SearchIcon,
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  TimeIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { TaskIcon } from './icons';
import {
  init as initCloudBase,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  clearCompletedTasks,
  watchTasks,
} from '../lib/cloudbase';

const emit = defineEmits(['update-stats']);

const tasks = ref([]);
const searchKey = ref('');
const filterPriority = ref('');
const filterCategory = ref('');
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const loading = ref(true);
const syncActive = ref(false);

let taskWatcher = null;

const priorityThemeMap = {
  urgent: 'danger',
  high: 'warning',
  medium: 'primary',
  low: 'default',
};

const priorityLabelMap = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
};

const formData = ref({
  title: '',
  description: '',
  priority: 'medium',
  category: '',
  dueDate: '',
  dueTime: '',
});

// 提取所有分类
const categoryList = computed(() => {
  const cats = new Set();
  tasks.value.forEach(t => {
    if (t.category && !t.completed) cats.add(t.category);
  });
  return [...cats].sort();
});

const filteredTasks = computed(() => {
  let list = [...tasks.value];
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(key) ||
        (t.description && t.description.toLowerCase().includes(key)) ||
        (t.category && t.category.toLowerCase().includes(key))
    );
  }
  if (filterPriority.value) {
    list = list.filter((t) => t.priority === filterPriority.value);
  }
  if (filterCategory.value) {
    list = list.filter((t) => t.category === filterCategory.value);
  }
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  return list;
});

const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);

// 格式化创建时间
const formatCreatedTime = (createdAt) => {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚创建';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d} 创建`;
};

const refreshStats = () => {
  emit('update-stats');
};

const loadTasksFromCloud = async () => {
  try {
    const data = await getTasks();
    tasks.value = data;
  } catch (e) {
    console.error('加载事务失败:', e);
  }
};

const showAddDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = {
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    dueTime: '',
  };
  dialogVisible.value = true;
};

const editTask = (task) => {
  isEditing.value = true;
  editingId.value = task._id;
  formData.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category || '',
    dueDate: task.dueDate || '',
    dueTime: task.dueTime || '',
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    MessagePlugin.warning('请输入事务标题');
    return;
  }

  syncActive.value = true;

  try {
    if (isEditing.value) {
      await updateTask(editingId.value, {
        title: formData.value.title.trim(),
        description: formData.value.description,
        priority: formData.value.priority,
        category: formData.value.category,
        dueDate: formData.value.dueDate,
        dueTime: formData.value.dueTime,
      });
      MessagePlugin.success('事务已更新');
    } else {
      await addTask({
        title: formData.value.title.trim(),
        description: formData.value.description,
        priority: formData.value.priority,
        category: formData.value.category,
        dueDate: formData.value.dueDate,
        dueTime: formData.value.dueTime,
      });
      MessagePlugin.success('事务已添加');
    }

    await loadTasksFromCloud();
    refreshStats();
  } catch (e) {
    MessagePlugin.error('操作失败，请重试');
  } finally {
    syncActive.value = false;
  }

  dialogVisible.value = false;
  resetForm();
};

const handleDeleteTask = async (id) => {
  syncActive.value = true;
  try {
    await deleteTask(id);
    await loadTasksFromCloud();
    refreshStats();
    MessagePlugin.success('事务已删除');
  } catch (e) {
    MessagePlugin.error('删除失败');
  } finally {
    syncActive.value = false;
  }
};

const handleToggleComplete = async (id, val) => {
  try {
    await toggleTaskComplete(id, val);
    await loadTasksFromCloud();
    refreshStats();
  } catch (e) {
    MessagePlugin.error('操作失败');
  }
};

const handleClearCompleted = async () => {
  syncActive.value = true;
  try {
    await clearCompletedTasks();
    await loadTasksFromCloud();
    refreshStats();
    MessagePlugin.success('已清除完成的事务');
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
    priority: 'medium',
    category: '',
    dueDate: '',
    dueTime: '',
  };
};

onMounted(async () => {
  try {
    await initCloudBase();
    await loadTasksFromCloud();
    refreshStats();

    taskWatcher = watchTasks(
      (snapshot) => {
        if (snapshot.docs) {
          tasks.value = snapshot.docs;
          refreshStats();
        } else if (snapshot.docChanges) {
          loadTasksFromCloud();
        }
      },
      (err) => {
        console.error('事务监听错误:', err);
      }
    );
  } catch (e) {
    console.error('初始化失败:', e);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (taskWatcher) {
    taskWatcher.close();
    taskWatcher = null;
  }
});
</script>

<style scoped>
.task-manager {
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
  flex-wrap: wrap;
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

.skeleton-search {
  width: 200px;
  height: 36px;
  margin-left: auto;
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

.skeleton-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line-lg {
  width: 60%;
  height: 16px;
}

.skeleton-line-sm {
  width: 35%;
  height: 12px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  color: var(--brand-blue);
  background: var(--brand-blue-light);
  border-color: rgba(0, 82, 217, 0.12);
}

.sync-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);
}

.sync-active .sync-dot {
  background: var(--brand-blue);
  box-shadow: 0 0 4px rgba(0, 82, 217, 0.4);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 分类筛选 */
.category-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.chip:hover {
  background: rgba(0, 82, 217, 0.06);
  color: var(--brand-blue);
  border-color: rgba(0, 82, 217, 0.15);
}

.chip.active {
  background: var(--gradient-hero);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 82, 217, 0.25);
}

/* 事务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 82, 217, 0.08);
  transform: translateX(2px);
}

.priority-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  transition: width 0.3s ease;
}

.task-card:hover .priority-bar {
  width: 4px;
}

.priority-urgent .priority-bar {
  background: linear-gradient(180deg, #ef4444, #f87171);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.priority-high .priority-bar {
  background: linear-gradient(180deg, #f59e0b, #fbbf24);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.priority-medium .priority-bar {
  background: linear-gradient(180deg, #0052d9, #3a7bd5);
  box-shadow: 0 0 8px rgba(0, 82, 217, 0.3);
}

.priority-low .priority-bar {
  background: linear-gradient(180deg, #94a3b8, #cbd5e1);
}

.task-completed {
  opacity: 0.55;
  background: rgba(255, 255, 255, 0.4);
}

.task-completed:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: none;
}

.task-left {
  display: flex;
  gap: 14px;
  flex: 1;
  min-width: 0;
  padding-left: 6px;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.line-through {
  text-decoration: line-through;
  color: var(--text-muted);
  font-weight: 400;
}

.priority-tag {
  border-radius: 6px;
}

.category-tag {
  border-radius: 6px;
}

.task-meta {
  display: flex;
  gap: 14px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-created {
  opacity: 0.7;
}

.created-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
}

.task-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.task-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.task-card:hover .task-actions {
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
  .task-manager {
    padding: 16px;
    border-radius: var(--radius-md);
  }
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .action-right {
    flex-direction: column;
  }
  .action-right .t-input,
  .action-right .t-select {
    width: 100% !important;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .task-actions {
    opacity: 1;
  }
  .task-card {
    padding: 14px 16px;
  }
}
</style>
