<template>
  <div class="photo-compare">
    <div class="photo-grid" v-if="photos.length > 0">
      <div class="photo-card" v-for="photo in photos" :key="photo._id" @click="selectPhoto(photo)">
        <div class="photo-img-wrapper">
          <img :src="photo.tempUrl || photo.url" :alt="photo.date" class="photo-img" loading="lazy" />
          <div class="photo-overlay">
            <span class="photo-date">{{ formatDate(photo.date) }}</span>
            <t-button variant="text" size="small" class="photo-delete" @click.stop="$emit('delete', photo._id)">
              <template #icon><DeleteIcon /></template>
            </t-button>
          </div>
        </div>
        <div class="photo-select-indicator" v-if="selectedIds.has(photo._id)">
          <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="var(--brand-blue)"/><path d="M6 10l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
      </div>
    </div>
    <div class="empty-photos" v-else>
      <span>还没有身材照片，上传一张吧</span>
    </div>

    <!-- 对比视图 -->
    <div class="compare-view" v-if="compareMode && selectedPhotos.length === 2">
      <div class="compare-header">
        <h4>身材对比</h4>
        <t-button variant="text" size="small" @click="clearSelection">关闭对比</t-button>
      </div>
      <div class="compare-grid">
        <div class="compare-item" v-for="photo in selectedPhotos" :key="'cmp' + photo._id">
          <img :src="photo.tempUrl || photo.url" class="compare-img" />
          <span class="compare-date">{{ formatDate(photo.date) }}</span>
        </div>
      </div>
      <div class="compare-diff" v-if="weightDiff !== null">
        <span :class="{ 'diff-down': weightDiff < 0, 'diff-up': weightDiff > 0 }">
          {{ weightDiff > 0 ? '+' : '' }}{{ weightDiff.toFixed(1) }} kg
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DeleteIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
  photos: { type: Array, default: () => [] },
});

defineEmits(['delete']);

const selectedIds = ref(new Set());

const selectedPhotos = computed(() => {
  return props.photos.filter(p => selectedIds.value.has(p._id));
});

const compareMode = computed(() => selectedIds.value.size > 0);

const weightDiff = computed(() => {
  if (selectedPhotos.value.length !== 2) return null;
  const w1 = selectedPhotos.value[0].weight;
  const w2 = selectedPhotos.value[1].weight;
  if (w1 == null || w2 == null) return null;
  return w2 - w1;
});

const selectPhoto = (photo) => {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(photo._id)) {
    newSet.delete(photo._id);
  } else if (newSet.size < 2) {
    newSet.add(photo._id);
  } else {
    newSet.clear();
    newSet.add(photo._id);
  }
  selectedIds.value = newSet;
};

const clearSelection = () => {
  selectedIds.value = new Set();
};

const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.photo-card {
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: all 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.photo-img-wrapper {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.04);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-date {
  font-size: 11px;
  color: white;
  font-weight: 500;
}

.photo-delete {
  color: white !important;
}

.photo-select-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
}

.photo-select-indicator svg {
  width: 24px;
  height: 24px;
}

.empty-photos {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 13px;
}

/* 对比视图 */
.compare-view {
  margin-top: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  padding: 20px;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.compare-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.compare-item {
  text-align: center;
}

.compare-img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.02);
}

.compare-date {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.compare-diff {
  text-align: center;
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
}

.diff-down {
  color: #10b981;
}

.diff-up {
  color: #ef4444;
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
