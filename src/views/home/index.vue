<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">开发工具集合</h1>
        <p class="hero-subtitle">{{ obj.output }}<span class="easy-typed-cursor">|</span></p>
        <p class="text-white text-lg mt-4">作者：库库林-沙琪马</p>
      </div>
    </div>

    <div class="tools-section">
      <div class="tools-grid">
        <div class="card" @click="$router.push('/tools/diff')">
          <div class="card-inner shine-effect">
            <div class="card-face card-front">
              <div class="tool-icon diff-icon">📊</div>
              <h3 class="tool-title">代码对比</h3>
            </div>
            <div class="card-face card-back">
              <p class="tool-desc">快速对比两段代码的差异，支持字符级和词级对比</p>
              <div class="tool-tags">
                <span class="tag">diff</span>
                <span class="tag">对比</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card" @click="$router.push('/tools/json')">
          <div class="card-inner shine-effect">
            <div class="card-face card-front">
              <div class="tool-icon json-icon">🔧</div>
              <h3 class="tool-title">JSON 格式化</h3>
            </div>
            <div class="card-face card-back">
              <p class="tool-desc">美化和压缩 JSON 数据，支持键名排序</p>
              <div class="tool-tags">
                <span class="tag">json</span>
                <span class="tag">格式化</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card" @click="$router.push('/tools/format')">
          <div class="card-inner shine-effect">
            <div class="card-face card-front">
              <div class="tool-icon format-icon">⚡</div>
              <h3 class="tool-title">代码格式化</h3>
            </div>
            <div class="card-face card-back">
              <p class="tool-desc">支持多种语言的代码格式化，让代码更规范</p>
              <div class="tool-tags">
                <span class="tag">格式化</span>
                <span class="tag">多语言</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import EasyTyper from "easy-typer-js";


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

const fetchData = () => {
  fetch(myYiYan)
    .then((res) => {
      return res.json();
    })
    .then(({ hitokoto }) => {
      new EasyTyper(
        obj,
        hitokoto,
        () => {
          fetchData()
        },
        () => { }
      );
    });
};

onMounted(() => {
  fetchData();
});

</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 100%;
  animation: gradientMove 10s linear infinite;
  padding: 0;
  position: relative;
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

.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>') no-repeat center center;
  background-size: cover;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #f2aacb, #16a2c0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #ffffff, #adecff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cursor {
  animation: blink 1s infinite;
  margin-left: 2px;
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

.tools-section {
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  min-height: 50vh;
  position: relative;
  z-index: 1;
}

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 翻转卡片布局 */
.card {
  width: 270px;
  height: 300px;
  perspective: 1500px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
}

.card:hover .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, #ee6ef5, #57b9ff);
  background-size: 200% 200%;
  animation: cardGradientShift 10s linear infinite;
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
  color: white;
  transform: rotateY(180deg);
}

.card:hover .shine-effect::before {
  transform: translate(50%, 50%) rotate(45deg);
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 让卡片正面的背景渐变形成闭环：去程与回程在同一动画中完成，避免跳变 */
@keyframes cardGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* .tool-card:hover .tool-icon{
  transform: translateX(40%);
} */

.tool-card:hover::before {
  transform: scaleX(1);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.diff-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.json-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.format-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.tool-desc {
  color: #6b7280;
  line-height: 1.6;
  font-weight: bold;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tool-card:hover .tag {
  background: #e5e7eb;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .tools-section {
    padding: 2rem 1rem;
  }

  .tool-card {
    padding: 1.5rem;
  }
}
</style>

<style>
/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #6d2525;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5a1f1f;
}
</style>