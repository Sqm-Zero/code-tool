<template>
  <div class="diff-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">文本对比工具</h1>
        <p class="subtitle">比较两个文本的差异，高亮显示变化</p>
      </div>

      <!-- 主内容区域：左右分栏 -->
      <div class="main-content">
        <!-- 左侧：输入和控制 -->
        <div class="left-panel">
          <!-- 控制面板 -->
          <el-card class="control-panel">
            <template #header>
              <div class="card-header">
                <span>对比设置</span>
                <div class="diff-stats">
                  <span class="diff-mode">{{ getDiffModeLabel() }}</span>
                  <span class="changes-count">{{ changesCount }} 处变化</span>
                </div>
              </div>
            </template>
            
            <div class="controls">
              <div class="action-buttons">
                <el-button type="primary" @click="buildRendered" :disabled="!left.trim() || !right.trim()">
                  开始对比
                </el-button>
                <el-button @click="clearAll" plain>
                  清空
                </el-button>
              </div>
              <div class="options">
                <div class="mode-select">
                  <label class="control-label">对比模式</label>
                  <el-select v-model="diffMode" placeholder="选择对比模式" style="width: 120px">
                    <el-option label="行级" value="lines" />
                    <el-option label="词级" value="words" />
                    <el-option label="字符级" value="chars" />
                  </el-select>
                </div>
                <el-switch v-model="showWhitespace" active-text="显示空白字符" />
                <el-switch v-model="ignoreCase" active-text="忽略大小写" />
              </div>
            </div>
          </el-card>

          <!-- 输入区域 -->
          <div class="input-section">
            <el-card class="left-input">
              <template #header>
                <div class="card-header">
                  <span>左侧文本（基准）</span>
                  <div class="input-stats">
                    <span class="char-count">{{ left.length }} 字符</span>
                    <span class="line-count">{{ left.split('\n').length }} 行</span>
                  </div>
                </div>
              </template>
              <el-input 
                v-model="left" 
                type="textarea" 
                :rows="20"
                placeholder="输入基准文本..."
                class="input-textarea font-mono"
                @input="autoCompare"
              />
            </el-card>

            <el-card class="right-input">
              <template #header>
                <div class="card-header">
                  <span>右侧文本（目标）</span>
                  <div class="input-stats">
                    <span class="char-count">{{ right.length }} 字符</span>
                    <span class="line-count">{{ right.split('\n').length }} 行</span>
                  </div>
                </div>
              </template>
              <el-input 
                v-model="right" 
                type="textarea" 
                :rows="20"
                placeholder="输入对比文本..."
                class="input-textarea font-mono"
                @input="autoCompare"
              />
            </el-card>
          </div>
        </div>

        <!-- 右侧：结果展示 -->
        <div class="right-panel">
          <el-card class="results-section">
            <template #header>
              <div class="card-header">
                <span>对比结果</span>
                <div class="result-actions">
                  <el-button 
                    v-if="diffResult" 
                    size="small" 
                    @click="copyDiffResult" 
                    :loading="copying"
                    type="primary" 
                    link
                  >
                    {{ copying ? '已复制' : '复制结果' }}
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="results-content">
              <div v-if="!left && !right" class="empty-state">
                <el-icon><Document /></el-icon>
                <p>请输入要对比的文本</p>
              </div>
              <div v-else-if="!left" class="empty-state">
                <el-icon><Edit /></el-icon>
                <p>请输入左侧基准文本</p>
              </div>
              <div v-else-if="!right" class="empty-state">
                <el-icon><Edit /></el-icon>
                <p>请输入右侧对比文本</p>
              </div>
              <div v-else class="diff-result" v-html="diffResult"></div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Edit } from '@element-plus/icons-vue'
import { diffLines, diffWords, diffChars } from 'diff'

const left = ref('')
const right = ref('')
const showWhitespace = ref(false)
const ignoreCase = ref(false)
const diffMode = ref<'lines' | 'words' | 'chars'>('lines')
const copying = ref(false)

const diffResult = ref('')

const changesCount = computed(() => {
  if (!left.value || !right.value) return 0
  
  const leftText = ignoreCase.value ? left.value.toLowerCase() : left.value
  const rightText = ignoreCase.value ? right.value.toLowerCase() : right.value
  
  let parts
  switch (diffMode.value) {
    case 'lines':
      parts = diffLines(leftText, rightText)
      break
    case 'words':
      parts = diffWords(leftText, rightText)
      break
    case 'chars':
      parts = diffChars(leftText, rightText)
      break
    default:
      parts = diffLines(leftText, rightText)
  }
  
  return parts.filter(part => part.added || part.removed).length
})

const getDiffModeLabel = () => {
  const labels = {
    lines: '行级对比',
    words: '词级对比',
    chars: '字符级对比'
  }
  return labels[diffMode.value]
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const buildRendered = () => {
  if (!left.value || !right.value) {
    ElMessage.warning('请输入要对比的文本')
    return
  }

  const leftText = ignoreCase.value ? left.value.toLowerCase() : left.value
  const rightText = ignoreCase.value ? right.value.toLowerCase() : right.value
  
  let parts
  switch (diffMode.value) {
    case 'lines':
      parts = diffLines(leftText, rightText)
      break
    case 'words':
      parts = diffWords(leftText, rightText)
      break
    case 'chars':
      parts = diffChars(leftText, rightText)
      break
    default:
      parts = diffLines(leftText, rightText)
  }
  
  let resultHtml = ''
  
  // 创建统一的对比显示
  parts.forEach((part) => {
    if (part.added) {
      // 新增内容：绿色高亮
      resultHtml += `<span class="token added">+ ${escape(part.value)}</span>`
    } else if (part.removed) {
      // 删除内容：红色高亮
      resultHtml += `<span class="token removed">- ${escape(part.value)}</span>`
    } else {
      // 相同内容：正常显示
      resultHtml += `<span class="token equal">  ${escape(part.value)}</span>`
    }
  })
  
  diffResult.value = resultHtml
}

const copyDiffResult = async () => {
  copying.value = true
  try {
    // 复制格式化的对比结果
    const textResult = diffResult.value
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/^\+ /gm, '+ ') // 保留+符号
      .replace(/^- /gm, '- ') // 保留-符号
      .replace(/^  /gm, '  ') // 保留空格
    
    await navigator.clipboard.writeText(textResult)
    ElMessage.success('已复制对比结果')
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
  left.value = ''
  right.value = ''
  diffResult.value = ''
}

// 自动对比（防抖）
let debounceTimer: any = null
const autoCompare = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (left.value.trim() && right.value.trim()) {
      buildRendered()
    }
  }, 500)
}

// 监听选项变化
watch([showWhitespace, ignoreCase, diffMode], () => {
  if (left.value.trim() && right.value.trim()) {
    buildRendered()
  }
})
</script>

<style scoped>
.diff-tool {
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
  margin-bottom: 20px;
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
  gap: 20px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.control-panel {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.left-input, .right-input {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

:deep(.left-input .el-card__body),
:deep(.right-input .el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
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
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.diff-stats, .input-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.diff-mode, .changes-count, .char-count, .line-count {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.options {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.mode-select {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
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

.results-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #666;
  text-align: center;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.diff-result {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 对比结果高亮样式 */
:deep(.token.added) {
  background: rgba(34, 197, 94, 0.3);
  color: #166534;
  padding: 1px 2px;
  border-radius: 3px;
  font-weight: 600;
  border: 1px solid rgba(34, 197, 94, 0.5);
}

:deep(.token.removed) {
  background: rgba(239, 68, 68, 0.3);
  color: #7f1d1d;
  padding: 1px 2px;
  border-radius: 3px;
  text-decoration: line-through;
  font-weight: 600;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

:deep(.token.equal) {
  background: transparent;
  color: inherit;
}

:deep(.token.space) {
  background: rgba(156, 163, 175, 0.1);
  color: transparent;
  border: 1px dashed rgba(156, 163, 175, 0.3);
  border-radius: 2px;
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
  
  .action-buttons, .options {
    justify-content: center;
  }
  
  .input-section {
    gap: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .diff-stats, .input-stats {
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