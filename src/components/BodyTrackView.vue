<template>
  <div class="body-view">
    <!-- 体重记录 -->
    <div class="weight-section">
      <div class="section-header-row">
        <h3 class="section-title">体重追踪</h3>
        <t-button theme="primary" size="small" @click="showWeightInput = true">
          <template #icon><AddIcon /></template>
          记录体重
        </t-button>
      </div>
      <WeightChart :records="weightRecords" />
      <div class="weight-summary" v-if="weightRecords.length > 0">
        <div class="summary-item">
          <span class="summary-label">最新体重</span>
          <span class="summary-value">{{ latestWeight }} kg</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">起始体重</span>
          <span class="summary-value">{{ startWeight }} kg</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">变化</span>
          <span class="summary-value" :class="weightChangeClass">{{ weightChange > 0 ? '+' : '' }}{{ weightChange }} kg</span>
        </div>
      </div>
    </div>

    <!-- 身材照片 -->
    <div class="photo-section">
      <div class="section-header-row">
        <h3 class="section-title">身材照片</h3>
        <t-button theme="primary" size="small" @click="triggerUpload">
          <template #icon><AddIcon /></template>
          上传照片
        </t-button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
      <PhotoCompare :photos="photos" @delete="handleDeletePhoto" />
      <div class="upload-progress" v-if="uploading">
        <span>上传中...</span>
      </div>
    </div>

    <!-- 体重输入弹窗 -->
    <t-dialog
      v-model:visible="showWeightInput"
      header="记录体重"
      :confirm-btn="{ content: '保存', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      attach="body"
      @confirm="handleAddWeight"
    >
      <t-form label-align="top" :label-width="0">
        <t-form-item label="日期">
          <t-date-picker v-model="weightForm.date" clearable />
        </t-form-item>
        <t-form-item label="体重 (kg)">
          <t-input-number v-model="weightForm.weight" :min="20" :max="300" :decimal-places="1" theme="normal" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { AddIcon } from 'tdesign-icons-vue-next';
import WeightChart from './WeightChart.vue';
import PhotoCompare from './PhotoCompare.vue';
import {
  getWeightRecords,
  addWeightRecord,
  deleteWeightRecord,
  getBodyPhotos,
  addBodyPhoto,
  deleteBodyPhoto,
  uploadFile,
  getTempFileURL,
} from '../lib/cloudbase';

const weightRecords = ref([]);
const photos = ref([]);
const showWeightInput = ref(false);
const uploading = ref(false);
const fileInput = ref(null);

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const weightForm = ref({
  date: todayStr(),
  weight: 65,
});

const latestWeight = computed(() => {
  if (weightRecords.value.length === 0) return '--';
  return weightRecords.value[0]?.weight?.toFixed(1) || '--';
});

const startWeight = computed(() => {
  if (weightRecords.value.length === 0) return '--';
  const sorted = [...weightRecords.value].sort((a, b) => {
    const da = a.date instanceof Date ? a.date : new Date(a.date);
    const db = b.date instanceof Date ? b.date : new Date(b.date);
    return da - db;
  });
  return sorted[0]?.weight?.toFixed(1) || '--';
});

const weightChange = computed(() => {
  if (weightRecords.value.length < 2) return 0;
  const sorted = [...weightRecords.value].sort((a, b) => {
    const da = a.date instanceof Date ? a.date : new Date(a.date);
    const db = b.date instanceof Date ? b.date : new Date(b.date);
    return da - db;
  });
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  return (last - first).toFixed(1);
});

const weightChangeClass = computed(() => {
  const v = parseFloat(weightChange.value);
  if (v < 0) return 'change-down';
  if (v > 0) return 'change-up';
  return '';
});

const loadData = async () => {
  const [w, p] = await Promise.all([getWeightRecords(), getBodyPhotos()]);
  weightRecords.value = w;
  // Load temp URLs for photos
  const photosWithUrls = [];
  for (const photo of p) {
    if (photo.fileID) {
      const url = await getTempFileURL(photo.fileID);
      photosWithUrls.push({ ...photo, tempUrl: url });
    } else {
      photosWithUrls.push(photo);
    }
  }
  photos.value = photosWithUrls;
};

const handleAddWeight = async () => {
  await addWeightRecord({
    date: weightForm.value.date || todayStr(),
    weight: weightForm.value.weight,
  });
  showWeightInput.value = false;
  weightForm.value = { date: todayStr(), weight: 65 };
  await loadData();
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }
  uploading.value = true;
  try {
    const ext = file.name.split('.').pop();
    const cloudPath = `body-photos/${Date.now()}.${ext}`;
    const fileID = await uploadFile(file, cloudPath);
    if (fileID) {
      await addBodyPhoto({
        date: todayStr(),
        fileID,
        url: cloudPath,
        weight: weightRecords.value[0]?.weight || null,
      });
      await loadData();
    }
  } catch (err) {
    console.error('上传失败:', err);
    alert('上传失败，请重试');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const handleDeletePhoto = async (id) => {
  await deleteBodyPhoto(id);
  await loadData();
};

onMounted(loadData);

defineExpose({ loadData });
</script>

<style scoped>
.body-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weight-section,
.photo-section {
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
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.weight-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.summary-item {
  text-align: center;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
}

.summary-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.change-down {
  color: #10b981;
}

.change-up {
  color: #ef4444;
}

.upload-progress {
  text-align: center;
  padding: 12px;
  color: var(--brand-blue);
  font-size: 13px;
}

@media (max-width: 768px) {
  .weight-summary {
    grid-template-columns: 1fr;
  }
}
</style>
