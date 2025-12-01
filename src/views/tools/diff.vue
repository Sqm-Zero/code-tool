<template>
  <div class="diff-tool">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header">
        <h1 class="title">文本对比工具</h1>
        <p class="subtitle">比较两个文本的差异，支持多种对比模式和视图</p>
      </div>

      <!-- 控制面板 -->
      <el-card class="control-panel">
        <div class="controls">
          <div class="control-group">
            <label class="control-label">对比模式</label>
            <el-radio-group v-model="diffMode" size="small">
              <el-radio-button label="lines">行级</el-radio-button>
              <el-radio-button label="words">词级</el-radio-button>
              <el-radio-button label="chars">字符级</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control-group">
            <label class="control-label">显示模式</label>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="split">并排视图</el-radio-button>
              <el-radio-button label="unified">统一视图</el-radio-button>
            </el-radio-group>
          </div>

          <div class="control-divider"></div>

          <div class="control-switches">
            <el-checkbox v-if="diffMode === 'lines'" v-model="showLineNumbers" size="small">显示行号</el-checkbox>
            <el-checkbox v-model="ignoreCase" size="small">忽略大小写</el-checkbox>
            <el-checkbox v-model="ignoreWhitespace" size="small">忽略空白</el-checkbox>
          </div>

          <div class="control-divider"></div>

          <div class="control-actions">
            <el-button type="primary" size="small" @click="buildRendered" :disabled="!left.trim() || !right.trim()">
              <el-icon><Refresh /></el-icon>
              重新对比
            </el-button>
            <el-button size="small" @click="swapTexts" :disabled="!left && !right">
              <el-icon><Sort /></el-icon>
              交换左右
            </el-button>
            <el-button size="small" @click="clearAll" :disabled="!left && !right">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>

          <div class="stats-badge">
            <el-tag v-if="changesCount > 0" type="danger" size="small">{{ changesCount }} 处差异</el-tag>
            <el-tag v-else-if="left && right" type="success" size="small">完全相同</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 输入区域：左右并排 -->
      <div class="input-section">
        <div class="input-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><DocumentCopy /></el-icon>
              <span>原文本</span>
              <el-tag size="small" type="info">{{ left.split('\n').length }} 行 / {{ left.length }} 字符</el-tag>
            </div>
            <div class="panel-actions">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".txt,.js,.jsx,.ts,.tsx,.vue,.css,.scss,.json,.md"
                :on-change="(file) => handleFileUpload(file, 'left')"
              >
                <el-button size="small" link>
                  <el-icon><FolderOpened /></el-icon>
                  导入文件
                </el-button>
              </el-upload>
              <el-button size="small" link @click="pasteFromClipboard('left')">
                <el-icon><DocumentCopy /></el-icon>
                粘贴
              </el-button>
              <el-button size="small" link @click="left = ''" :disabled="!left">
                <el-icon><Close /></el-icon>
                清空
              </el-button>
            </div>
          </div>
          <el-input
            v-model="left"
            type="textarea"
            placeholder="输入或粘贴原文本，支持拖拽文件..."
            class="input-textarea"
            @input="autoCompare"
            @drop.prevent="(e) => handleFileDrop(e, 'left')"
            @dragover.prevent
          />
        </div>

        <div class="swap-button">
          <el-button circle @click="swapTexts" :disabled="!left && !right">
            <el-icon><Sort /></el-icon>
          </el-button>
        </div>

        <div class="input-panel">
          <div class="panel-header">
            <div class="panel-title">
              <el-icon><Document /></el-icon>
              <span>新文本</span>
              <el-tag size="small" type="info">{{ right.split('\n').length }} 行 / {{ right.length }} 字符</el-tag>
            </div>
            <div class="panel-actions">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".txt,.js,.jsx,.ts,.tsx,.vue,.css,.scss,.json,.md"
                :on-change="(file) => handleFileUpload(file, 'right')"
              >
                <el-button size="small" link>
                  <el-icon><FolderOpened /></el-icon>
                  导入文件
                </el-button>
              </el-upload>
              <el-button size="small" link @click="pasteFromClipboard('right')">
                <el-icon><DocumentCopy /></el-icon>
                粘贴
              </el-button>
              <el-button size="small" link @click="right = ''" :disabled="!right">
                <el-icon><Close /></el-icon>
                清空
              </el-button>
            </div>
          </div>
          <el-input
            v-model="right"
            type="textarea"
            placeholder="输入或粘贴新文本，支持拖拽文件..."
            class="input-textarea"
            @input="autoCompare"
            @drop.prevent="(e) => handleFileDrop(e, 'right')"
            @dragover.prevent
          />
        </div>
      </div>

      <!-- 对比结果区域 -->
      <el-card class="results-section">
        <template #header>
          <div class="results-header">
            <div class="results-title">
              <el-icon><DataAnalysis /></el-icon>
              <span>对比结果</span>
            </div>
            <div class="results-actions">
              <el-button
                v-if="diffResult || splitDiffResult.left"
                size="small"
                @click="copyDiffResult"
                :loading="copying"
              >
                <el-icon><DocumentCopy /></el-icon>
                {{ copying ? '已复制' : '复制结果' }}
              </el-button>
              <el-button
                v-if="diffResult || splitDiffResult.left"
                size="small"
                @click="exportDiffResult"
              >
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>

        <div class="results-content">
          <!-- 空状态 -->
          <div v-if="!left && !right" class="empty-state">
            <el-icon><Document /></el-icon>
            <p>请在上方输入要对比的文本</p>
            <p class="empty-hint">支持直接粘贴、导入文件或拖拽文件到输入框</p>
          </div>

          <!-- 并排视图 -->
          <div v-else-if="viewMode === 'split'" class="split-view">
            <div class="split-panel">
              <div class="split-panel-header">原文本</div>
              <div class="split-panel-content" ref="leftPanelRef" @scroll="syncScroll('left')">
                <div v-html="splitDiffResult.left || getPlaceholder('原文本')"></div>
              </div>
            </div>
            <div class="split-divider"></div>
            <div class="split-panel">
              <div class="split-panel-header">新文本</div>
              <div class="split-panel-content" ref="rightPanelRef" @scroll="syncScroll('right')">
                <div v-html="splitDiffResult.right || getPlaceholder('新文本')"></div>
              </div>
            </div>
          </div>

          <!-- 统一视图 -->
          <div v-else class="unified-view">
            <div class="unified-content" v-html="diffResult || getPlaceholder()"></div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  DocumentCopy,
  Edit,
  Refresh,
  Sort,
  Delete,
  FolderOpened,
  Close,
  DataAnalysis,
  Download
} from '@element-plus/icons-vue'
import { diffLines, diffWords, diffChars, Change } from 'diff'
import type { UploadFile } from 'element-plus'

const left = ref('')
const right = ref('')
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)
const showLineNumbers = ref(true)
const showWhitespace = ref(false)  // 显示空白字符
const diffMode = ref<'lines' | 'words' | 'chars'>('lines')
const viewMode = ref<'split' | 'unified'>('split')
const copying = ref(false)

const diffResult = ref('')
const splitDiffResult = ref<{ left: string; right: string }>({ left: '', right: '' })

const leftPanelRef = ref<HTMLElement>()
const rightPanelRef = ref<HTMLElement>()
let isScrolling = false

// 计算差异数量
const changesCount = computed(() => {
  if (!left.value || !right.value) return 0

  const leftText = processText(left.value)
  const rightText = processText(right.value)

  const parts = getDiffParts(leftText, rightText)
  return parts.filter(part => part.added || part.removed).length
})

// 文本预处理
const processText = (text: string): string => {
  let processed = text
  if (ignoreCase.value) {
    processed = processed.toLowerCase()
  }
  if (ignoreWhitespace.value) {
    processed = processed.replace(/\s+/g, ' ').trim()
  }
  return processed
}

// 获取 diff 结果
const getDiffParts = (leftText: string, rightText: string): Change[] => {
  switch (diffMode.value) {
    case 'lines':
      return diffLines(leftText, rightText)
    case 'words':
      return diffWords(leftText, rightText)
    case 'chars':
      return diffChars(leftText, rightText)
    default:
      return diffLines(leftText, rightText)
  }
}

// HTML 转义
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')

// 转义并保留格式
const escapeWithFormat = (s: string) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/\n/g, '↵\n')  // 显示换行符
   .replace(/ /g, '·')     // 显示空格

// 构建对比结果
const buildRendered = () => {
  if (!left.value && !right.value) {
    diffResult.value = ''
    splitDiffResult.value = { left: '', right: '' }
    return
  }

  const leftText = processText(left.value)
  const rightText = processText(right.value)
  const parts = getDiffParts(leftText, rightText)

  if (viewMode.value === 'unified') {
    buildUnifiedView(parts)
  } else {
    buildSplitView(parts)
  }
}

// 构建统一视图
const buildUnifiedView = (parts: Change[]) => {
  if (diffMode.value === 'lines') {
    // 行级对比
    let html = '<div class="diff-lines">'
    let leftLine = 1
    let rightLine = 1

    parts.forEach((part) => {
      const lines = part.value.split('\n')
      if (part.value.endsWith('\n')) {
        lines.pop()
      }

      lines.forEach((line) => {
        if (part.added) {
          const lineNum = showLineNumbers.value ? `<span class="line-num added-num">+${rightLine}</span>` : ''
          html += `<div class="diff-line added-line">${lineNum}<span class="line-content added-content">+ ${escapeHtml(line)}</span></div>`
          rightLine++
        } else if (part.removed) {
          const lineNum = showLineNumbers.value ? `<span class="line-num removed-num">-${leftLine}</span>` : ''
          html += `<div class="diff-line removed-line">${lineNum}<span class="line-content removed-content">- ${escapeHtml(line)}</span></div>`
          leftLine++
        } else {
          const lineNum = showLineNumbers.value ? `<span class="line-num">${leftLine}</span>` : ''
          html += `<div class="diff-line">${lineNum}<span class="line-content">&nbsp; ${escapeHtml(line)}</span></div>`
          leftLine++
          rightLine++
        }
      })
    })

    html += '</div>'
    diffResult.value = html
  } else {
    // 词级和字符级对比 - 内联显示
    let html = '<div class="diff-inline">'

    parts.forEach((part) => {
      let value: string

      // 根据是否显示空白字符决定转义方式
      if (showWhitespace.value) {
        value = escapeWithFormat(part.value)
      } else {
        value = escapeHtml(part.value)
      }

      if (part.added) {
        html += `<span class="inline-added">${value}</span>`
      } else if (part.removed) {
        html += `<span class="inline-removed">${value}</span>`
      } else {
        html += `<span class="inline-unchanged">${value}</span>`
      }
    })

    html += '</div>'
    diffResult.value = html
  }
}

// 构建并排视图
const buildSplitView = (parts: Change[]) => {
  if (diffMode.value === 'lines') {
    // 行级对比 - 并排显示
    let leftHtml = '<div class="diff-lines">'
    let rightHtml = '<div class="diff-lines">'
    let leftLine = 1
    let rightLine = 1

    parts.forEach((part) => {
      const lines = part.value.split('\n')
      if (part.value.endsWith('\n')) {
        lines.pop()
      }

      lines.forEach((line) => {
        if (part.added) {
          const lineNum = showLineNumbers.value ? `<span class="line-num added-num">${rightLine}</span>` : ''
          rightHtml += `<div class="diff-line added-line">${lineNum}<span class="line-content added-content">${escapeHtml(line)}</span></div>`
          leftHtml += `<div class="diff-line empty-line"><span class="line-content empty-content">&nbsp;</span></div>`
          rightLine++
        } else if (part.removed) {
          const lineNum = showLineNumbers.value ? `<span class="line-num removed-num">${leftLine}</span>` : ''
          leftHtml += `<div class="diff-line removed-line">${lineNum}<span class="line-content removed-content">${escapeHtml(line)}</span></div>`
          rightHtml += `<div class="diff-line empty-line"><span class="line-content empty-content">&nbsp;</span></div>`
          leftLine++
        } else {
          const leftLineNum = showLineNumbers.value ? `<span class="line-num">${leftLine}</span>` : ''
          const rightLineNum = showLineNumbers.value ? `<span class="line-num">${rightLine}</span>` : ''
          leftHtml += `<div class="diff-line">${leftLineNum}<span class="line-content">${escapeHtml(line)}</span></div>`
          rightHtml += `<div class="diff-line">${rightLineNum}<span class="line-content">${escapeHtml(line)}</span></div>`
          leftLine++
          rightLine++
        }
      })
    })

    leftHtml += '</div>'
    rightHtml += '</div>'

    splitDiffResult.value = { left: leftHtml, right: rightHtml }
  } else {
    // 词级和字符级对比 - 左右分别显示删除和新增
    let leftHtml = '<div class="diff-inline">'
    let rightHtml = '<div class="diff-inline">'

    parts.forEach((part) => {
      let value: string

      // 根据是否显示空白字符决定转义方式
      if (showWhitespace.value) {
        value = escapeWithFormat(part.value)
      } else {
        value = escapeHtml(part.value)
      }

      if (part.added) {
        // 新增只在右侧显示
        rightHtml += `<span class="inline-added">${value}</span>`
      } else if (part.removed) {
        // 删除只在左侧显示
        leftHtml += `<span class="inline-removed">${value}</span>`
      } else {
        // 相同内容两侧都显示
        leftHtml += `<span class="inline-unchanged">${value}</span>`
        rightHtml += `<span class="inline-unchanged">${value}</span>`
      }
    })

    leftHtml += '</div>'
    rightHtml += '</div>'

    splitDiffResult.value = { left: leftHtml, right: rightHtml }
  }
}

// 同步滚动
const syncScroll = (source: 'left' | 'right') => {
  if (isScrolling) return
  isScrolling = true

  const sourceEl = source === 'left' ? leftPanelRef.value : rightPanelRef.value
  const targetEl = source === 'left' ? rightPanelRef.value : leftPanelRef.value

  if (sourceEl && targetEl) {
    targetEl.scrollTop = sourceEl.scrollTop
  }

  setTimeout(() => {
    isScrolling = false
  }, 50)
}

// 占位符
const getPlaceholder = (side?: string) => {
  if (!left.value && !right.value) {
    return '<div class="placeholder">请输入文本进行对比</div>'
  }
  if (!left.value) {
    return '<div class="placeholder">请输入原文本</div>'
  }
  if (!right.value) {
    return '<div class="placeholder">请输入新文本</div>'
  }
  return '<div class="placeholder">点击"重新对比"查看结果</div>'
}

// 复制对比结果
const copyDiffResult = async () => {
  copying.value = true
  try {
    let textResult = ''

    if (viewMode.value === 'unified') {
      // 从HTML中提取纯文本
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = diffResult.value
      textResult = tempDiv.textContent || ''
    } else {
      // 并排视图，复制两侧内容
      const tempDivLeft = document.createElement('div')
      const tempDivRight = document.createElement('div')
      tempDivLeft.innerHTML = splitDiffResult.value.left
      tempDivRight.innerHTML = splitDiffResult.value.right

      textResult = `=== 原文本 ===\n${tempDivLeft.textContent || ''}\n\n=== 新文本 ===\n${tempDivRight.textContent || ''}`
    }

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

// 导出对比结果
const exportDiffResult = () => {
  try {
    let content = ''

    if (viewMode.value === 'unified') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = diffResult.value
      content = tempDiv.textContent || ''
    } else {
      const tempDivLeft = document.createElement('div')
      const tempDivRight = document.createElement('div')
      tempDivLeft.innerHTML = splitDiffResult.value.left
      tempDivRight.innerHTML = splitDiffResult.value.right

      content = `=== 原文本 ===\n${tempDivLeft.textContent || ''}\n\n=== 新文本 ===\n${tempDivRight.textContent || ''}`
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff-result-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
    console.error('导出失败:', e)
  }
}

// 交换左右文本
const swapTexts = () => {
  const temp = left.value
  left.value = right.value
  right.value = temp

  if (left.value.trim() && right.value.trim()) {
    buildRendered()
  }
}

// 清空所有
const clearAll = () => {
  left.value = ''
  right.value = ''
  diffResult.value = ''
  splitDiffResult.value = { left: '', right: '' }
}

// 从剪贴板粘贴
const pasteFromClipboard = async (target: 'left' | 'right') => {
  try {
    const text = await navigator.clipboard.readText()
    if (target === 'left') {
      left.value = text
    } else {
      right.value = text
    }
    ElMessage.success('已粘贴文本')
    autoCompare()
  } catch (e) {
    ElMessage.error('粘贴失败，请使用 Ctrl+V')
  }
}

// 文件上传处理
const handleFileUpload = async (file: UploadFile, target: 'left' | 'right') => {
  try {
    const text = await file.raw?.text()
    if (text !== undefined) {
      if (target === 'left') {
        left.value = text
      } else {
        right.value = text
      }
      ElMessage.success(`已导入文件: ${file.name}`)
      autoCompare()
    }
  } catch (e) {
    ElMessage.error('文件读取失败')
    console.error('文件读取失败:', e)
  }
}

// 文件拖拽处理
const handleFileDrop = async (e: DragEvent, target: 'left' | 'right') => {
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  try {
    const text = await file.text()
    if (target === 'left') {
      left.value = text
    } else {
      right.value = text
    }
    ElMessage.success(`已导入文件: ${file.name}`)
    autoCompare()
  } catch (e) {
    ElMessage.error('文件读取失败')
    console.error('文件读取失败:', e)
  }
}

// 自动对比（防抖）
let debounceTimer: any = null
const autoCompare = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (left.value.trim() && right.value.trim()) {
      buildRendered()
    }
  }, 300)
}

// 监听选项变化
watch([ignoreCase, ignoreWhitespace, diffMode, viewMode, showLineNumbers], () => {
  if (left.value.trim() && right.value.trim()) {
    buildRendered()
  }
})
</script>

<style scoped lang="scss">
.diff-tool {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 0.95rem;
  opacity: 0.95;
  margin: 0;
}

/* 控制面板 */
.control-panel {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  :deep(.el-card__body) {
    padding: 1rem 1.5rem;
  }
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.control-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
}

.control-switches {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.stats-badge {
  display: flex;
  align-items: center;
}

/* 输入区域 */
.input-section {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: stretch;
  min-height: 400px;
}

.input-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;

  .el-icon {
    font-size: 1.1rem;
  }
}

.panel-actions {
  display: flex;
  gap: 0.25rem;
}

.input-textarea {
  flex: 1;

  :deep(.el-textarea__inner) {
    height: 100%;
    resize: none;
    border: none;
    border-radius: 0;
    padding: 1rem 1.25rem;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.6;

    &:focus {
      box-shadow: none;
    }
  }
}

.swap-button {
  display: flex;
  align-items: center;
  justify-content: center;

  .el-button {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #f8f9fa;
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }
  }
}

/* 结果区域 */
.results-section {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 500px;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.results-actions {
  display: flex;
  gap: 0.5rem;
}

.results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 3rem;

  .el-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  p {
    margin: 0.25rem 0;
    font-size: 1rem;
  }

  .empty-hint {
    font-size: 0.875rem;
    opacity: 0.7;
  }
}

/* 并排视图 */
.split-view {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  overflow: hidden;
}

.split-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.split-panel-header {
  padding: 0.75rem 1.25rem;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  font-size: 0.875rem;
  color: #666;
}

.split-panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 1rem 0;
  background: #fafbfc;
}

.split-divider {
  background: #e9ecef;
}

/* 统一视图 */
.unified-view {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.unified-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 1rem 0;
  background: #fafbfc;
}

/* Diff 显示样式 */
:deep(.diff-lines) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

:deep(.diff-line) {
  display: flex;
  padding: 0.125rem 1.25rem;
  min-height: 1.6em;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

:deep(.line-num) {
  display: inline-block;
  width: 3rem;
  text-align: right;
  margin-right: 1rem;
  color: #999;
  user-select: none;
  flex-shrink: 0;
  font-size: 0.8rem;
}

:deep(.line-content) {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

:deep(.added-line) {
  background: rgba(34, 197, 94, 0.1);

  .added-num {
    color: #16a34a;
    font-weight: 600;
  }

  .added-content {
    color: #15803d;
  }
}

:deep(.removed-line) {
  background: rgba(239, 68, 68, 0.1);

  .removed-num {
    color: #dc2626;
    font-weight: 600;
  }

  .removed-content {
    color: #991b1b;
    text-decoration: line-through;
  }
}

:deep(.empty-line) {
  background: rgba(148, 163, 184, 0.05);

  .empty-content {
    color: transparent;
  }
}

/* 内联显示样式（词级和字符级） */
:deep(.diff-inline) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  padding: 1.25rem;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.inline-added) {
  background: rgba(34, 197, 94, 0.25);
  color: #15803d;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  border-bottom: 2px solid #22c55e;
}

:deep(.inline-removed) {
  background: rgba(239, 68, 68, 0.25);
  color: #991b1b;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  text-decoration: line-through;
  border-bottom: 2px solid #ef4444;
}

:deep(.inline-unchanged) {
  color: #374151;
}

:deep(.placeholder) {
  padding: 3rem 1.25rem;
  text-align: center;
  color: #999;
  font-size: 0.95rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .input-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 1rem;
  }

  .swap-button {
    display: none;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    .control-actions {
      margin-left: 0;
      justify-content: center;
    }

    .stats-badge {
      justify-content: center;
    }
  }

  .control-divider {
    display: none;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .control-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;

    .control-label {
      font-size: 0.8rem;
    }

    :deep(.el-radio-group) {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .control-switches {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .control-actions {
    flex-wrap: wrap;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .panel-actions {
    justify-content: space-between;
  }

  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .results-actions {
    justify-content: center;
  }
}

/* 卡片样式优化 */
:deep(.el-card) {
  border: none;
}

:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.25rem;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }
}

/* 单选按钮组 */
:deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

/* 复选框 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

/* 标签 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

/* 滚动条美化 */
.split-panel-content,
.unified-content {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
}
</style>
