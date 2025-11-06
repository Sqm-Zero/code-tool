<template>
  <div class="hash-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">哈希计算工具</h1>
        <p class="subtitle">支持 MD5、SHA-1、SHA-256、SHA-512、SM3 等多种哈希算法</p>
      </div>

      <!-- 主内容区域：左右分栏 -->
      <div class="main-content">
        <!-- 左侧：控制面板和输入区域 -->
        <div class="left-panel">
          <!-- 控制面板 -->
          <el-card class="control-panel">
            <div class="controls">
              <div class="left-controls">
                <el-button type="primary" @click="run" :loading="loading">
                  计算所有哈希
                </el-button>
                <el-button @click="clearAll" plain>清空</el-button>
              </div>
              <div class="right-controls">
                <el-switch v-model="upper" active-text="大写输出" />
                <el-switch v-model="autoCalculate" active-text="自动计算" />
              </div>
            </div>
          </el-card>

          <!-- 输入区域 -->
          <el-card class="input-section">
            <template #header>
              <div class="card-header">
                <span>输入文本</span>
                <div class="input-stats">
                  <span class="char-count">字符数: {{ input.length }}</span>
                  <span class="byte-count">字节数: {{ getByteLength(input) }}</span>
                </div>
              </div>
            </template>
            <el-input 
              v-model="input" 
              type="textarea" 
              :rows="20"
              placeholder="请输入要计算哈希的原始文本（支持任意字符、中文、特殊符号等）" 
              class="input-textarea font-mono"
              @input="autoRun"
              clearable
            />
            <div class="input-tips">
              <el-icon><InfoFilled /></el-icon>
              <span>支持中文、英文、数字、特殊符号等任意字符，输入后会自动计算哈希值</span>
            </div>
          </el-card>
        </div>

        <!-- 右侧：哈希结果区域 -->
        <div class="right-panel">
          <el-card class="results-section">
            <template #header>
              <div class="card-header">
                <span>哈希计算结果</span>
              </div>
            </template>
            <div class="results-grid">
              <div v-for="item in hashResults" :key="item.algo" class="hash-card">
                <div class="hash-header">
                  <div class="hash-info">
                    <span class="hash-name">{{ item.label }}</span>
                    <span class="hash-desc">{{ item.description }}</span>
                  </div>
                  <div class="hash-actions">
                    <el-button 
                      v-if="item.value" 
                      size="small" 
                      @click="copy(item.value)" 
                      :loading="copying === item.algo"
                      type="primary" 
                      link
                    >
                      {{ copying === item.algo ? '已复制' : '复制' }}
                    </el-button>
                  </div>
                </div>
                <div class="hash-content">
                  <el-input 
                    v-model="item.value" 
                    type="textarea" 
                    :rows="item.algo === 'sha512' ? 2 : 1" 
                    readonly
                    :placeholder="loading ? '计算中...' : '无输入内容'" 
                    class="hash-output font-mono"
                    :class="{ uppercase: upper && item.value }"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import CryptoJS from 'crypto-js'
// @ts-ignore
import { sm3 } from 'sm-crypto'

const input = ref('')
const upper = ref(false)
const autoCalculate = ref(true)
const loading = ref(false)
const copying = ref<string | null>(null)

const hashResults = reactive([
  { 
    algo: 'md5', 
    label: 'MD5', 
    description: '128位哈希，快速但安全性较低',
    value: '' 
  },
  { 
    algo: 'sha1', 
    label: 'SHA-1', 
    description: '160位哈希，已被认为不安全',
    value: '' 
  },
  { 
    algo: 'sha256', 
    label: 'SHA-256', 
    description: '256位哈希，广泛使用的安全算法',
    value: '' 
  },
  { 
    algo: 'sha512', 
    label: 'SHA-512', 
    description: '512位哈希，更高安全性',
    value: '' 
  },
  { 
    algo: 'sm3', 
    label: 'SM3（国密）', 
    description: '中国国家密码算法标准',
    value: '' 
  }
])

// 自动计算（防抖）
let debounceTimer: any = null
const autoRun = () => {
  if (!autoCalculate.value) return
  
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (input.value.trim()) {
      run()
    }
  }, 300)
}

const run = () => {
  if (!input.value.trim()) {
    hashResults.forEach(h => h.value = '')
    return
  }

  loading.value = true
  
  // 使用 setTimeout 来避免阻塞 UI
  setTimeout(() => {
    const text = input.value

    for (const item of hashResults) {
      try {
        let res = ''
        switch (item.algo) {
          case 'md5': 
            res = CryptoJS.MD5(text).toString()
            break
          case 'sha1': 
            res = CryptoJS.SHA1(text).toString()
            break
          case 'sha256': 
            res = CryptoJS.SHA256(text).toString()
            break
          case 'sha512': 
            res = CryptoJS.SHA512(text).toString()
            break
          case 'sm3': 
            res = sm3(text)
            break
        }
        item.value = upper.value ? res.toUpperCase() : res
      } catch (error) {
        console.error(`计算 ${item.label} 失败:`, error)
        item.value = '计算失败'
      }
    }

    loading.value = false
  }, 10)
}

const copy = async (text: string) => {
  const algo = hashResults.find(h => h.value === text)?.algo
  if (!algo) return

  copying.value = algo
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
    setTimeout(() => {
      copying.value = null
    }, 1500)
  } catch (e) {
    copying.value = null
    ElMessage.error('复制失败')
    console.error('复制失败:', e)
  }
}

const clearAll = () => {
  input.value = ''
  hashResults.forEach(h => h.value = '')
}

const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length
}

// 监听大小写切换
watch(upper, (newVal) => {
  if (newVal) {
    hashResults.forEach(item => {
      if (item.value && item.value !== '计算失败') {
        item.value = item.value.toUpperCase()
      }
    })
  } else {
    hashResults.forEach(item => {
      if (item.value && item.value !== '计算失败') {
        item.value = item.value.toLowerCase()
      }
    })
  }
})

// 监听输入变化
watch(input, (val) => {
  if (val === '') {
    hashResults.forEach(h => h.value = '')
  }
})
</script>

<style scoped>
.hash-tool {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 12px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* 主内容区域：左右分栏布局 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.control-panel {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.left-controls, .right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-section {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

:deep(.input-section .el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.input-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.char-count, .byte-count {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.input-textarea {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  line-height: 1.5;
  flex: 1;
  min-height: 0;
}

:deep(.input-textarea .el-textarea__inner) {
  height: 100%;
  resize: none;
  overflow-y: auto;
}

.input-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.results-section {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

:deep(.results-section .el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.hash-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hash-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.hash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.hash-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hash-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.hash-desc {
  font-size: 11px;
  color: #666;
}

.hash-content {
  padding: 12px 16px;
}

.hash-output {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
}

:deep(.hash-output .el-textarea__inner) {
  padding: 8px;
  font-size: 12px;
}

.uppercase {
  text-transform: uppercase;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .left-panel {
    max-height: 50vh;
    overflow-y: auto;
  }
  
  .right-panel {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-controls, .right-controls {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .input-stats {
    align-self: stretch;
    justify-content: space-between;
  }
}

/* 加载动画 */
:deep(.el-loading-mask) {
  border-radius: 12px;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* 输入框样式优化 */
:deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  transition: border-color 0.2s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 卡片样式优化 */
:deep(.el-card) {
  border: none;
  border-radius: 12px;
}

:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 开关样式优化 */
:deep(.el-switch__label) {
  font-weight: 500;
  color: #666;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}
</style>