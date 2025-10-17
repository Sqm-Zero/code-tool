<template>
  <div class="base64-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">Base64 编码解码工具</h1>
        <p class="subtitle">支持文本、URL安全模式，实时转换</p>
      </div>

      <!-- 控制面板 -->
      <el-card class="control-panel">
        <template #header>
          <div class="card-header">
            <span>转换设置</span>
            <div class="mode-stats">
              <span class="current-mode">{{ mode === 'encode' ? '编码' : '解码' }}</span>
              <span class="url-safe">{{ useUrl ? 'URL安全' : '标准' }}</span>
            </div>
          </div>
        </template>
        
        <div class="controls">
          <div class="mode-controls">
      <el-radio-group v-model="mode">
        <el-radio-button label="encode">编码</el-radio-button>
        <el-radio-button label="decode">解码</el-radio-button>
      </el-radio-group>
          </div>
          <div class="option-controls">
      <el-switch v-model="useUrl" active-text="URL 安全" />
            <el-button type="primary" @click="run" icon="Refresh">
              转换
            </el-button>
            <el-button @click="clearAll" icon="Delete" plain>
              清空
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 输入输出区域 -->
      <div class="io-section">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>{{ mode === 'encode' ? '原始文本' : 'Base64 编码' }}</span>
              <div class="input-stats">
                <span class="char-count">{{ input.length }} 字符</span>
                <span class="byte-count">{{ getByteLength(input) }} 字节</span>
              </div>
            </div>
          </template>
          <el-input 
            v-model="input" 
            type="textarea" 
            :rows="12" 
            :placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入要解码的Base64字符串...'"
            class="input-textarea font-mono"
            @input="autoRun"
            clearable
          />
          <div class="input-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ mode === 'encode' ? '支持中文、英文、特殊字符等任意文本' : '请输入有效的Base64编码字符串' }}</span>
          </div>
        </el-card>

        <el-card class="output-card">
          <template #header>
            <div class="card-header">
              <span>{{ mode === 'encode' ? 'Base64 编码' : '解码文本' }}</span>
              <div class="output-actions">
                <el-button 
                  v-if="output" 
                  size="small" 
                  @click="copy(output)" 
                  :loading="copying"
                  type="primary" 
                  link
                  icon="CopyDocument"
                >
                  {{ copying ? '已复制' : '复制' }}
                </el-button>
              </div>
            </div>
          </template>
          <el-input 
            v-model="output" 
            type="textarea" 
            :rows="12" 
            :placeholder="mode === 'encode' ? '编码结果将显示在这里...' : '解码结果将显示在这里...'"
            class="output-textarea font-mono"
            readonly
          />
          <div v-if="error" class="error-message">
            <el-icon><Warning /></el-icon>
            <span>{{ error }}</span>
          </div>
        </el-card>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Warning, Refresh, Delete, CopyDocument } from '@element-plus/icons-vue'

const mode = ref<'encode'|'decode'>('encode')
const useUrl = ref(false)
const input = ref('')
const output = ref('')
const error = ref('')
const copying = ref(false)

const toUrlSafe = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'')
const fromUrlSafe = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length/4)*4, '=')

const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length
}

const run = () => {
  error.value = ''
  output.value = ''
  
  if (!input.value.trim()) {
    return
  }

  try {
    if (mode.value === 'encode') {
      const b64 = btoa(unescape(encodeURIComponent(input.value)))
      output.value = useUrl.value ? toUrlSafe(b64) : b64
    } else {
      const raw = useUrl.value ? fromUrlSafe(input.value) : input.value
      output.value = decodeURIComponent(escape(atob(raw)))
    }
  } catch (e: any) {
    error.value = `转换失败: ${e.message || e}`
    ElMessage.error(error.value)
  }
}

const copy = async (text: string) => {
  copying.value = true
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
    console.error('复制失败:', e)
  } finally {
    setTimeout(() => {
      copying.value = false
    }, 1500)
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

// 自动转换（防抖）
let debounceTimer: any = null
const autoRun = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    run()
  }, 300)
}

// 监听模式变化
watch([mode, useUrl], () => {
  if (input.value.trim()) {
    run()
  }
})
</script>

<style scoped>
.base64-tool {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.control-panel {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.mode-stats, .input-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.current-mode, .url-safe, .char-count, .byte-count {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.mode-controls {
  display: flex;
  align-items: center;
}

.option-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.io-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.input-card, .output-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.output-actions {
  display: flex;
  align-items: center;
}

.input-textarea, .output-textarea {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  line-height: 1.5;
}

.input-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

/* 响应式设计 */
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
  
  .mode-controls, .option-controls {
    justify-content: center;
  }
  
  .io-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .mode-stats, .input-stats {
    align-self: stretch;
    justify-content: space-between;
  }
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

/* 单选按钮样式优化 */
:deep(.el-radio-group) {
  display: flex;
}

:deep(.el-radio-button__inner) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
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