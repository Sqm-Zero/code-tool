<template>
  <div 
    class="loading-screen"
    :class="{ 
      'loading-fullscreen': props.isLoading || isAnimating,
      'loading-minimized': !props.isLoading && !isAnimating
    }"
    @mouseenter="showControls = true"
    @mouseleave="showControls = false"
  >
    <div class="loading-content">
      <img src="/loading.gif" alt="加载中..." class="loading-gif" />
    </div>
    <!-- 音乐控制面板（仅在最小化状态且hover时显示，放在小人右侧） -->
    <div 
      v-if="!props.isLoading && !isAnimating" 
      class="music-panel"
      :class="{ 'show': showControls }"
      @click.stop
    >
        <!-- 播放/暂停按钮 -->
        <div 
          class="music-control-btn"
          @click="toggleMusic"
          :title="isPlaying ? '点击暂停音乐' : '点击播放音乐'"
        >
          <el-icon class="music-icon" :class="{ 'playing': isPlaying }">
            <VideoPause v-if="isPlaying" />
            <VideoPlay v-else />
          </el-icon>
        </div>
        
        <!-- 音量控制 -->
        <div class="volume-control">
          <el-icon class="volume-icon">
            <component :is="volumeIcon" />
          </el-icon>
          <el-slider
            v-model="volume"
            :min="0"
            :max="100"
            :step="1"
            @change="onVolumeChange"
            class="volume-slider"
          />
        </div>
        
        <!-- 音乐选择 -->
        <div class="music-selector">
          <el-dropdown 
            @command="selectMusic" 
            trigger="click"
            :teleported="true"
            popper-class="music-dropdown-popper"
            placement="top"
            :popper-options="{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8]
                  }
                }
              ]
            }"
          >
            <div class="music-select-btn" :title="currentMusic?.displayName || '选择音乐'">
              <el-icon><Headset /></el-icon>
              <span class="music-name">{{ currentMusic?.displayName || '选择音乐' }}</span>
              <el-icon class="dropdown-icon"><ArrowUp /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="music in musicList"
                  :key="music.name"
                  :command="music"
                  :class="{ 'is-active': currentMusic?.name === music.name }"
                >
                  {{ music.displayName }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    <!-- 隐藏的音频元素 -->
    <audio 
      ref="audioRef" 
      loop 
      preload="auto"
      @loadeddata="onAudioLoaded"
      @ended="onAudioEnded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { VideoPlay, VideoPause, Headset, ArrowUp, Mute, Microphone } from '@element-plus/icons-vue';

interface MusicItem {
  name: string;
  file: string;
  displayName: string;
}

const props = withDefaults(defineProps<{
  isLoading?: boolean;
}>(), {
  isLoading: true
});

const isAnimating = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const audioLoaded = ref(false);
const showControls = ref(false);
const volume = ref(50); // 默认音量 50%
const currentMusic = ref<MusicItem | null>(null);
const musicList = ref<MusicItem[]>([]);

// 音量图标
const volumeIcon = computed(() => {
  if (volume.value === 0) return Mute;
  if (volume.value < 50) return Microphone;
  return Headset;
});

// 监听加载状态变化
watch(() => props.isLoading, (newVal) => {
  if (!newVal) {
    // 开始缩小动画
    isAnimating.value = true;
    // 动画完成后，保持在左下角
    setTimeout(() => {
      isAnimating.value = false;
    }, 800); // 动画时长
  } else {
    // 如果重新加载，重置状态
    isAnimating.value = false;
  }
});

// 加载音乐列表
const loadMusicList = async () => {
  try {
    // 添加时间戳防止缓存
    const response = await fetch(`/music/music-list.json?t=${Date.now()}`);
    if (response.ok) {
      const list = await response.json();
      musicList.value = list;
      // 默认选择第一首音乐
      if (list.length > 0 && !currentMusic.value) {
        selectMusic(list[0]);
      } else if (list.length === 0) {
        console.warn('音乐列表为空，请将音乐文件放入 public/music 文件夹');
      }
    } else {
      console.warn('音乐列表文件不存在，将自动生成');
      musicList.value = [];
    }
  } catch (error) {
    console.error('加载音乐列表失败:', error);
    musicList.value = [];
  }
};

// 选择音乐
const selectMusic = async (music: MusicItem) => {
  if (!audioRef.value) return;
  
  const wasPlaying = isPlaying.value;
  
  // 停止当前播放
  if (wasPlaying) {
    audioRef.value.pause();
  }
  
  // 切换音乐源
  currentMusic.value = music;
  audioRef.value.src = `/music/${music.file}`;
  audioRef.value.load();
  audioLoaded.value = false;
  
  // 等待加载完成后，如果之前正在播放，则继续播放
  audioRef.value.addEventListener('loadeddata', () => {
    audioLoaded.value = true;
    if (wasPlaying) {
      audioRef.value?.play().then(() => {
        isPlaying.value = true;
      }).catch(() => {
        isPlaying.value = false;
      });
    }
  }, { once: true });
};

// 音频加载完成
const onAudioLoaded = () => {
  audioLoaded.value = true;
};

// 音频播放结束
const onAudioEnded = () => {
  // 循环播放由 audio 元素的 loop 属性处理
};

// 音量变化
const onVolumeChange = (val: number) => {
  if (audioRef.value) {
    audioRef.value.volume = val / 100;
  }
};

// 切换音乐播放/暂停
const toggleMusic = async () => {
  if (!audioRef.value || !audioLoaded.value) return;
  
  try {
    if (isPlaying.value) {
      // 暂停
      audioRef.value.pause();
      isPlaying.value = false;
    } else {
      // 播放
      await audioRef.value.play();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('播放音乐失败:', error);
    // 浏览器可能阻止自动播放，需要用户交互
    isPlaying.value = false;
  }
};

onMounted(async () => {
  // 加载音乐列表
  await loadMusicList();
  
  // 设置初始音量
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100;
  }
});

onUnmounted(() => {
  // 组件卸载时停止播放
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value = null;
  }
});
</script>

<style scoped lang="scss">
.loading-screen {
  position: fixed;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  pointer-events: none;
}

/* 全屏加载状态 */
.loading-fullscreen {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 缩小到左下角状态 */
.loading-minimized {
  top: auto;
  bottom: 20px;
  width: 15rem;
  transform: scale(1);
  transition: all 0.8s cubic-bezier(0.2, 0, 0.1, 1);
  cursor: pointer;
  pointer-events: auto;
}

.loading-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100vw;
  max-height: 100vh;
}

.loading-gif {
  display: block;
  object-fit: contain;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-fullscreen .loading-gif {
  width: auto;
  height: auto;
  max-width: 100vw;
  max-height: 100vh;
}

.loading-minimized .loading-gif {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* 音乐控制面板 - 放在小人右侧 */
.music-panel {
  position: fixed;
  left: calc(15rem + 4px); /* 20px(左边距) + 15rem(小人宽度) + 4px(间距) */
  bottom: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100000;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  opacity: 0;
  transform: translateX(-10px);
  pointer-events: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &.show {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }
}

.music-control-btn {
  width: 36px;
  height: 36px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: center;

  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  .music-icon {
    font-size: 18px;
    color: #3b82f6;
    transition: transform 0.3s ease;

    &.playing {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;

  .volume-icon {
    font-size: 16px;
    color: #6b7280;
    flex-shrink: 0;
  }

  .volume-slider {
    flex: 1;
    
    :deep(.el-slider__runway) {
      height: 4px;
      background: #e5e7eb;
    }
    
    :deep(.el-slider__bar) {
      background: #3b82f6;
    }
    
    :deep(.el-slider__button) {
      width: 12px;
      height: 12px;
      border-color: #3b82f6;
    }
  }
}

.music-selector {
  .music-select-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: rgba(243, 244, 246, 0.8);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    color: #374151;

    &:hover {
      background: rgba(243, 244, 246, 1);
    }

    .music-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-icon {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

/* 下拉菜单样式，确保不被遮挡 */
:deep(.music-dropdown-popper) {
  z-index: 100001 !important;
  max-height: 300px;
  overflow-y: auto;
  
  .el-dropdown-menu {
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .el-dropdown-menu__item {
    padding: 8px 16px;
    font-size: 0.875rem;
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
    }
    
    &.is-active {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.15);
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}
</style>
