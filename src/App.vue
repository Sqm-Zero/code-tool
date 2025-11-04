<template>
  <div>
    <!-- 全屏加载动画 -->
    <LoadingScreen :isLoading="isLoading" />
    
    <!-- <header class="nav">
      <div class="brand" @click="$router.push('/')">Tools</div>
      <nav class="links">
        <router-link to="/">首页</router-link>
        <router-link to="/tools/diff">代码对比</router-link>
        <router-link to="/tools/json">JSON 格式化</router-link>
        <router-link to="/tools/format">代码格式化</router-link>
      </nav>
    </header> -->
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoadingScreen from '@/components/LoadingScreen.vue';

const isLoading = ref(true);

onMounted(() => {
  // 等待所有资源加载完成
  if (document.readyState === 'complete') {
    handleLoadComplete();
  } else {
    window.addEventListener('load', handleLoadComplete);
  }
  
  // 最少显示1.5秒，确保动画效果完整展示
  setTimeout(() => {
    if (isLoading.value) {
      handleLoadComplete();
    }
  }, 1500);
});

const handleLoadComplete = () => {
  // 延迟隐藏，让过渡动画更流畅
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
};
</script>

<style scoped>
.nav {
  position: absolute;
  width: 100%;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(8px);
}

.brand {
  font-weight: 600;
  cursor: pointer;
}

.links {
  display: flex;
  gap: 14px;
}

.links a {
  color: #374151;
  text-decoration: none;
  padding: 4px 6px;
  border-radius: 4px;
}

.links a.router-link-active {
  background: #f3f4f6;
  color: #111827;
}
.content {
  min-height: calc(100vh - 60px);
}
</style>