<template>
  <div class="json-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">JSON 格式化工具</h1>
        <p class="subtitle">JSON 格式化、压缩、验证、排序</p>
      </div>

      <!-- 控制面板 -->
      <el-card class="control-panel">
        <template #header>
          <div class="card-header">
            <span>操作设置</span>
            <div class="json-stats">
              <span class="json-valid" :class="{ valid: isValid, invalid: !isValid }">
                {{ isValid ? '✓ 有效' : '✗ 无效' }}
              </span>
              <span class="json-size">{{ getJsonSize() }} 字符</span>
            </div>
          </div>
        </template>
        
        <div class="controls">
          <div class="action-buttons">
            <el-button type="primary" @click="formatJson" icon="Document" :disabled="!source.trim()">
              格式化
            </el-button>
            <el-button @click="minifyJson" icon="Minus" :disabled="!source.trim()">
              压缩
            </el-button>
            <el-button @click="validateJson" icon="CircleCheck" :disabled="!source.trim()">
              验证
            </el-button>
            <el-button @click="clearAll" icon="Delete" plain>
              清空
            </el-button>
          </div>
          <div class="options">
      <el-switch v-model="sortKeys" active-text="按键名排序" />
            <el-switch v-model="autoValidate" active-text="自动验证" />
          </div>
        </div>

        <div v-if="validationError" class="error-message">
          <el-icon><Warning /></el-icon>
          <span>{{ validationError }}</span>
        </div>
      </el-card>

      <!-- 输入输出区域 -->
      <div class="io-section">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>输入 JSON</span>
              <div class="input-actions">
                <el-button 
                  v-if="source" 
                  size="small" 
                  @click="copy(source)" 
                  :loading="copying === 'input'"
                  type="primary" 
                  link
                  icon="CopyDocument"
                >
                  {{ copying === 'input' ? '已复制' : '复制' }}
                </el-button>
              </div>
            </div>
          </template>
          <el-input 
            v-model="source" 
            type="textarea" 
            :rows="20" 
            placeholder="粘贴 JSON 文本..."
            class="json-textarea font-mono"
            @input="handleInput"
          />
          <div class="input-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>支持标准 JSON 格式，输入后会自动验证</span>
          </div>
        </el-card>

        <el-card class="output-card">
          <template #header>
            <div class="card-header">
              <span>输出结果</span>
              <div class="output-actions">
                <el-button 
                  v-if="output" 
                  size="small" 
                  @click="copy(output)" 
                  :loading="copying === 'output'"
                  type="primary" 
                  link
                  icon="CopyDocument"
                >
                  {{ copying === 'output' ? '已复制' : '复制' }}
                </el-button>
              </div>
            </div>
          </template>
          <el-input 
            v-model="output" 
            type="textarea" 
            :rows="20" 
            placeholder="格式化结果将显示在这里..."
            class="json-textarea font-mono"
            readonly
          />
          <div v-if="formatError" class="error-message">
            <el-icon><Warning /></el-icon>
            <span>{{ formatError }}</span>
          </div>
        </el-card>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Warning, Document, Minus, CircleCheck, Delete, CopyDocument } from '@element-plus/icons-vue'

const source = ref('')
const output = ref('')
const sortKeys = ref(false)
const autoValidate = ref(true)
const validationError = ref('')
const formatError = ref('')
const copying = ref<'input' | 'output' | null>(null)

const isValid = computed(() => {
  if (!source.value.trim()) return true
  try {
    JSON.parse(source.value)
    return true
  } catch {
    return false
  }
})

const getJsonSize = () => {
  return source.value.length
}

const sortObject = (input: any): any => {
  if (Array.isArray(input)) return input.map(sortObject)
  if (input && typeof input === 'object') {
    const sorted: Record<string, any> = {}
    Object.keys(input).sort().forEach(k => { sorted[k] = sortObject(input[k]) })
    return sorted
  }
  return input
}

const formatJson = () => {
  formatError.value = ''
  try {
    const obj = JSON.parse(source.value)
    const ordered = sortKeys.value ? sortObject(obj) : obj
    output.value = JSON.stringify(ordered, null, 2)
    ElMessage.success('格式化完成')
  } catch (e: any) {
    formatError.value = e.message || 'JSON 解析失败'
    ElMessage.error(formatError.value)
  }
}

const minifyJson = () => {
  formatError.value = ''
  try {
    const obj = JSON.parse(source.value)
    const ordered = sortKeys.value ? sortObject(obj) : obj
    output.value = JSON.stringify(ordered)
    ElMessage.success('压缩完成')
  } catch (e: any) {
    formatError.value = e.message || 'JSON 解析失败'
    ElMessage.error(formatError.value)
  }
}

const validateJson = () => {
  validationError.value = ''
  try {
    JSON.parse(source.value)
    ElMessage.success('JSON 格式有效')
  } catch (e: any) {
    validationError.value = e.message || 'JSON 格式无效'
    ElMessage.error(validationError.value)
  }
}

const copy = async (text: string, type: 'input' | 'output') => {
  copying.value = type
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
    console.error('复制失败:', e)
  } finally {
    setTimeout(() => {
      copying.value = null
    }, 1500)
  }
}

const clearAll = () => {
  source.value = ''
  output.value = ''
  validationError.value = ''
  formatError.value = ''
}

const handleInput = () => {
  if (autoValidate.value) {
    validationError.value = ''
    try {
      JSON.parse(source.value)
    } catch (e: any) {
      if (source.value.trim()) {
        validationError.value = e.message || 'JSON 格式无效'
      }
    }
  }
}

// 监听排序选项变化
watch(sortKeys, () => {
  if (output.value) {
    formatJson()
  }
})
</script>

<style scoped>
.json-tool {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.json-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.json-valid, .json-size {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.json-valid.valid {
  background: #dcfce7;
  color: #166534;
}

.json-valid.invalid {
  background: #fef2f2;
  color: #dc2626;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.options {
  display: flex;
  gap: 16px;
  align-items: center;
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

.input-actions, .output-actions {
  display: flex;
  align-items: center;
}

.json-textarea {
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
  
  .action-buttons, .options {
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #e085e8 0%, #f04a5c 100%);
}

/* 输入框样式优化 */
:deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  transition: border-color 0.2s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #f093fb;
  box-shadow: 0 0 0 2px rgba(240, 147, 251, 0.1);
}

/* 开关样式优化 */
:deep(.el-switch__label) {
  font-weight: 500;
  color: #666;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: #f093fb;
}
</style>