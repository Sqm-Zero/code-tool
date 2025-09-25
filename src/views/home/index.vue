<template>
  <div class="home-container flex max-h-full relative max-md:flex-col">
    <!-- 装饰性背景元素 -->
    <div class="z-[-1] min-h-screen absolute inset-0 overflow-hidden pointer-events-none">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
    </div>

    <!-- 左侧个人信息区 -->
    <div
      class="sidebar min-w-1/3 md:min-w-0 xl:basis-1/3 xl:h-screen xl:sticky xl:top-0 flex items-center flex-col relative">
      <div class="pt-20 relative z-10">
        <div
          class="profile-container flex flex-col max-lg:flex-row max-lg:items-start gap-6 max-md:items-center max-md:justify-center">
          <!-- 头像区域 -->
          <div class="avatar-wrapper relative group">
            <div class="avatar-glow"></div>
            <img class="avatar w-32 h-32 md:w-52 md:h-52 rounded-full relative z-10 border-4 border-white/20"
              src="https://files.catbox.moe/ej1gq0" alt="kkl-sqm">
            <!-- 状态指示器 -->
            <div class="status-indicator"></div>
          </div>

          <!-- 信息区域 -->
          <div class="info-section">
            <!-- 座右铭 -->
            <div class="motto-card mb-4">
              <span class="motto-icon">✨</span>
              <p class="motto-text">莫愁前路无知己，天下谁人不识君</p>
            </div>

            <!-- 用户名 -->
            <div class="name-section">
              <h1 class="username">库库林-沙琪马</h1>
              <div class="user-badges">
                <span class="badge badge-pro">PRO</span>
                <span class="badge badge-dev">开发者</span>
              </div>
            </div>

            <!-- 社交链接 -->
            <div class="social-links">
              <a href="https://github.com/Sqm-Zero" class="social-link github-link">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" class="social-link twitter-link">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" class="social-link email-link">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- 一言展示区 -->
        <div class="quote-section mt-12 max-md:hidden">
          <div class="quote-card">
            <span class="quote-mark quote-mark-left">"</span>
            <p class="quote-text">
              {{ obj.output }}
              <span class="typing-cursor">|</span>
            </p>
            <span class="quote-mark quote-mark-right">"</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧工具区 -->
    <div class="tools-section p-4 sm:p-8 md:p-12 lg:p-16 flex-1 min-w-0">
      <div class="grid grid-cols-2 gap-8">
        <!-- 时钟 -->
        <ElectronicClock />
        <!-- 番茄钟 -->
        <div>
          <Tomato />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-8 h-[24rem] max-w-6xl mx-auto">
        <ToolCard v-for="tool in tools" :key="tool.path" :tool="tool" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolCard from '@/components/ToolCard.vue';
import Tomato from '@/components/Tomato.vue';
import ElectronicClock from '@/components/ElectronicClock.vue';
import { onMounted, reactive, onUnmounted } from 'vue';
import EasyTyper from "easy-typer-js";

// 工具列表数据
const tools = [
  {
    path: '/tools/diff',
    icon: '📊',
    title: '代码对比',
    description: '快速对比两段代码的差异，支持字符级和词级对比',
    tags: ['diff', '对比']
  },
  {
    path: '/tools/json',
    icon: '🔧',
    title: 'JSON 格式化',
    description: '美化和压缩 JSON 数据，支持键名排序',
    tags: ['json', '格式化']
  },
  {
    path: '/tools/format',
    icon: '⚡',
    title: '代码格式化',
    description: '支持多种语言的代码格式化，让代码更规范',
    tags: ['格式化', '多语言']
  }
];

const obj = reactive({
  output: "喜欢就是让人变得束手无策",
  isEnd: false,
  speed: 300,
  singleBack: false,
  sleep: 0,
  type: "rollback",
  backSpeed: 100,
  sentencePause: false,
});

let myYiYan = "https://v1.hitokoto.cn/?c=a&encode=json"
let typerInstance: any = null;

const fetchData = () => {
  fetch(myYiYan)
    .then((res) => res.json())
    .then(({ hitokoto }) => {
      if (typerInstance) {
        typerInstance = null;
      }
      typerInstance = new EasyTyper(
        obj,
        hitokoto,
        () => {
          setTimeout(fetchData, 2000); // 添加延迟，让用户有时间阅读
        },
        () => { }
      );
    })
    .catch(err => {
      console.error('Failed to fetch:', err);
      setTimeout(fetchData, 5000); // 错误重试
    });
};

onMounted(() => {
  fetchData();
});

onUnmounted(() => {
  if (typerInstance) {
    typerInstance = null;
  }
});
</script>

<style scoped>
.home-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 100%;
  animation: gradientMove 10s linear infinite;
  position: relative;
  height: 100vh;
  /* 确保占据整个视口高度 */
  overflow: hidden;
  /* 隐藏主容器滚动条 */
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 左侧边栏 */
.sidebar {
  position: relative;
}

/* 装饰性气泡 */
.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  filter: blur(1px);
  animation: float 20s infinite ease-in-out;
}

.bubble-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.bubble-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 10s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(30px, -30px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/* 个人资料容器 */
.profile-container {
  padding: 0 2rem;
}

/* 头像区域 */
.avatar-wrapper {
  position: relative;
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(45deg, #f3ec78, #af4261, #f3ec78);
  background-size: 400% 400%;
  border-radius: 50%;
  opacity: 0.8;
  filter: blur(15px);
  animation: glowAnimation 6s ease infinite;
}

@keyframes glowAnimation {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.avatar {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.avatar-wrapper:hover .avatar {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

/* 在线状态指示器 */
.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 88px;
  width: 24px;
  height: 24px;
  background: #10b981;
  border: 3px solid white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* 信息区域 */
.info-section {
  flex: 1;
  max-width: 400px;
}

/* 座右铭卡片 */
.motto-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.motto-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.motto-icon {
  font-size: 1.2rem;
  animation: sparkle 2s infinite;
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.motto-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  line-height: 1.4;
  font-style: italic;
}

/* 用户名区域 */
.name-section {
  margin-bottom: 1.5rem;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 徽章 */
.user-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.badge-pro {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #7c3f00;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.badge-dev {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 212, 255, 0.3);
}

.badge:hover {
  transform: translateY(-2px) scale(1.05);
}

/* 社交链接 */
.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.github-link:hover {
  background: #24292e;
  border-color: #24292e;
}

.twitter-link:hover {
  background: #1da1f2;
  border-color: #1da1f2;
}

.email-link:hover {
  background: #ea4335;
  border-color: #ea4335;
}

/* 一言引用区 */
.quote-section {
  margin-top: 3rem;
  padding: 0 2rem;
}

.quote-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quote-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.quote-mark {
  position: absolute;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.2);
  font-family: Georgia, serif;
  line-height: 1;
}

.quote-mark-left {
  top: 0.5rem;
  left: 1rem;
}

.quote-mark-right {
  bottom: 0.5rem;
  right: 1rem;
}

.quote-text {
  position: absolute;
  font-size: 1rem;
  color: white;
  text-align: center;
  line-height: 1.6;
  font-weight: 400;
  padding: 0 1rem;
  max-width: 90%;
}

.typing-cursor {
  animation: blink 1s infinite;
  margin-left: 2px;
  font-weight: 300;
  opacity: 0.8;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* 工具区域 */
.tools-section {
  backdrop-filter: blur(10px);
  min-height: 100vh;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 2rem;
  justify-items: center;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .profile-container {
    padding: 0 1rem;
  }

  .username {
    font-size: 1.5rem;
  }

  .motto-text {
    font-size: 0.85rem;
  }

  .tools-section {
    padding: 2rem 1rem;
  }
}
</style>