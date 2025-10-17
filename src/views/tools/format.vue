<template>
  <div class="format-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">代码格式化工具</h1>
        <p class="subtitle">支持多种编程语言的代码格式化</p>
      </div>

      <!-- 控制面板 -->
      <el-card class="control-panel">
        <template #header>
          <div class="card-header">
            <span>格式化设置</span>
            <div class="format-stats">
              <span class="current-language">{{ languageMap[language] }}</span>
              <span class="code-size">{{ source.length }} 字符</span>
            </div>
          </div>
        </template>
        
        <div class="controls">
          <div class="language-select">
            <label class="control-label">编程语言</label>
            <el-select v-model="language" placeholder="选择语言" style="width: 200px">
              <el-option 
                v-for="(label, value) in languageMap" 
                :key="value"
                :label="label" 
                :value="value" 
              />
      </el-select>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="formatCode" icon="MagicStick" :disabled="!source.trim()">
              格式化
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
              <span>源代码</span>
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
            placeholder="粘贴代码..."
            class="code-textarea font-mono"
          />
          <div class="input-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>支持 {{ Object.values(languageMap).join('、') }} 等语言的代码格式化</span>
          </div>
        </el-card>

        <el-card class="output-card">
          <template #header>
            <div class="card-header">
              <span>格式化结果</span>
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
            class="code-textarea font-mono"
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Warning, MagicStick, Delete, CopyDocument } from '@element-plus/icons-vue'

const language = ref<'javascript'|'typescript'|'json'|'markdown'|'html'|'css'|'java'|'python'>('javascript')
const source = ref('')
const output = ref('')
const formatError = ref('')
const copying = ref<'input' | 'output' | null>(null)

const languageMap = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  markdown: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  java: 'Java',
  python: 'Python'
}

const formatCode = async () => {
  formatError.value = ''
  output.value = ''
  
  if (!source.value.trim()) {
    ElMessage.warning('请输入要格式化的代码')
    return
  }

  try {
    if (language.value === 'java' || language.value === 'python') {
      // 基本缩进清理
      output.value = basicIndentNormalize(source.value)
      ElMessage.success('格式化完成（基础模式）')
      return
    }

    // 这里可以集成 Prettier 或其他格式化工具
    // 目前使用基础格式化
    output.value = basicIndentNormalize(source.value)
    ElMessage.success('格式化完成')
  } catch (e: any) {
    formatError.value = e.message || '格式化失败'
    ElMessage.error(formatError.value)
  }
}

const basicIndentNormalize = (code: string): string => {
  // 简单的统一换行与去除尾随空白
  return code
    .replace(/\t/g, '  ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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
  formatError.value = ''
}
</script>

<style scoped>
.format-tool {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.format-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.current-language, .code-size {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

.language-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
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

.code-textarea {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  line-height: 1.5;
  font-size: 14px;
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
  
  .language-select {
    align-items: stretch;
  }
  
  .action-buttons {
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3d8bfe 0%, #00d4ff 100%);
}

/* 输入框样式优化 */
:deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  transition: border-color 0.2s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

/* 选择器样式优化 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  border-radius: 8px;
}
</style>