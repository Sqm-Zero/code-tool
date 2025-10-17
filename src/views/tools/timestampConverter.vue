<template>
  <div class="timestamp-tool">
        <div class="container">
      <!-- 页面标题 -->
            <div class="header">
        <h1 class="title">时间戳转换工具</h1>
        <p class="subtitle">支持秒/毫秒互转、多种格式解析、时区转换、历史记录</p>
      </div>

      <!-- 控制面板 -->
      <el-card class="control-panel">
        <template #header>
          <div class="card-header">
            <span>转换设置</span>
            <div class="control-stats">
              <span class="timezone-info">{{ currentTimezone }}</span>
              <span class="format-info">{{ isMilli ? '毫秒级' : '秒级' }}</span>
            </div>
          </div>
        </template>
        
        <div class="controls">
          <div class="left-controls">
            <el-switch v-model="isMilli" active-text="毫秒级" inactive-text="秒级" />
            <el-select v-model="timezone" placeholder="选择时区" style="width: 200px">
              <el-option label="本地时区" value="local" />
              <el-option label="UTC" value="utc" />
              <el-option label="GMT+8 (北京时间)" value="GMT+8" />
              <el-option label="GMT-5 (纽约时间)" value="GMT-5" />
              <el-option label="GMT+0 (伦敦时间)" value="GMT+0" />
            </el-select>
          </div>
          <div class="right-controls">
            <el-button type="primary" @click="getNow" icon="Clock">
              获取当前时间
            </el-button>
            <el-button @click="clearAll" icon="Delete" plain>
              清空
            </el-button>
          </div>
                </div>
      </el-card>

      <!-- 输入区域 -->
                <div class="input-section">
        <el-card class="timestamp-input">
          <template #header>
            <div class="card-header">
              <span>时间戳输入</span>
              <div class="input-actions">
                <el-button 
                  v-if="timestampInput" 
                  size="small" 
                  @click="copyText(timestampInput)" 
                  type="primary" 
                  link
                  icon="CopyDocument"
                >
                                复制
                            </el-button>
                        </div>
            </div>
          </template>
          <el-input 
            v-model="timestampInput" 
            @input="handleTimestampInput"
            placeholder="例如：1717200000000 或 1717200000"
            clearable
            class="timestamp-field"
          >
                            <template #prefix>
              <el-icon><Timer /></el-icon>
                            </template>
                        </el-input>
          <div class="input-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>支持秒级和毫秒级时间戳，输入后会自动转换</span>
                    </div>
        </el-card>

        <el-card class="datetime-input">
          <template #header>
            <div class="card-header">
              <span>日期时间输入</span>
              <div class="input-actions">
                <el-button 
                  v-if="dateInputStr" 
                  size="small" 
                  @click="copyText(dateInputStr)" 
                  type="primary" 
                  link
                  icon="CopyDocument"
                >
                                复制
                            </el-button>
                        </div>
            </div>
          </template>
          <el-input 
            v-model="dateInputStr" 
            @input="handleDateInput" 
            placeholder="例如：2024-06-01 12:30:45"
            clearable
            class="datetime-field"
          >
                            <template #prefix>
              <el-icon><Calendar /></el-icon>
                            </template>
                        </el-input>
          <div class="input-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>支持多种日期格式：ISO、YYYY-MM-DD HH:mm:ss、YYYY/MM/DD 等</span>
          </div>
        </el-card>
      </div>

      <!-- 转换结果区域 -->
      <el-card v-if="result" class="results-section">
        <template #header>
          <div class="card-header">
            <span>转换结果</span>
            <div class="result-actions">
              <el-button 
                size="small" 
                @click="exportResults" 
                icon="Download"
                type="primary" 
                plain
              >
                导出结果
              </el-button>
                    </div>
                </div>
        </template>
        
        <div class="results-grid">
          <div class="result-card">
            <div class="result-header">
              <span class="result-label">本地时间</span>
              <el-button size="small" @click="copyText(result.local)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.local }}</div>
          </div>

          <div class="result-card">
            <div class="result-header">
              <span class="result-label">UTC 时间</span>
              <el-button size="small" @click="copyText(result.utc)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.utc }}</div>
          </div>

          <div class="result-card">
            <div class="result-header">
              <span class="result-label">ISO 8601</span>
              <el-button size="small" @click="copyText(result.iso)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.iso }}</div>
          </div>

          <div class="result-card">
            <div class="result-header">
              <span class="result-label">Unix 秒</span>
              <el-button size="small" @click="copyText(result.unixSecond)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.unixSecond }}</div>
          </div>

          <div class="result-card">
            <div class="result-header">
              <span class="result-label">Unix 毫秒</span>
              <el-button size="small" @click="copyText(result.unixMilli)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.unixMilli }}</div>
                </div>

          <div class="result-card">
            <div class="result-header">
              <span class="result-label">相对时间</span>
              <el-button size="small" @click="copyText(result.relative)" link type="primary">
                复制
              </el-button>
            </div>
            <div class="result-value">{{ result.relative }}</div>
          </div>
        </div>
      </el-card>

      <!-- 快捷操作区域 -->
      <el-card class="quick-actions">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
            <span class="quick-desc">常用时间戳转换</span>
          </div>
        </template>
        
        <div class="quick-buttons">
          <el-button 
            v-for="quick in quickActions" 
            :key="quick.label"
            @click="applyQuickAction(quick)"
            plain
            size="small"
          >
            {{ quick.label }}
          </el-button>
        </div>
      </el-card>

                <!-- 历史记录 -->
      <el-card v-if="history.length > 0" class="history-section">
        <template #header>
          <div class="card-header">
            <span>转换历史</span>
            <div class="history-actions">
              <el-button size="small" @click="clearHistory" icon="Delete" type="danger" plain>
                清空历史
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table :data="history" size="small" style="width: 100%" max-height="200">
                        <el-table-column prop="timestamp" label="时间戳" width="140" />
                        <el-table-column prop="local" label="本地时间" />
          <el-table-column prop="relative" label="相对时间" width="120" />
                        <el-table-column width="80">
                            <template #default="{ row }">
              <el-button size="small" @click="useHistory(row)" type="primary" link>
                使用
              </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Calendar, Timer, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

interface ConversionResult {
    local: string
    utc: string
    iso: string
    unixSecond: number
    unixMilli: number
  relative: string
}

interface HistoryItem extends ConversionResult {
    timestamp: number
  id: string
}

interface QuickAction {
  label: string
  timestamp: number
  description: string
}

const isMilli = ref(true)
const timezone = ref('local')
const timestampInput = ref('')
const dateInputStr = ref('')
const result = ref<ConversionResult | null>(null)
const history = ref<HistoryItem[]>([])

const currentTimezone = computed(() => {
  const tzMap: Record<string, string> = {
    local: '本地时区',
    utc: 'UTC',
    'GMT+8': 'GMT+8 (北京时间)',
    'GMT-5': 'GMT-5 (纽约时间)',
    'GMT+0': 'GMT+0 (伦敦时间)'
  }
  return tzMap[timezone.value] || '本地时区'
})

const quickActions: QuickAction[] = [
  { label: '现在', timestamp: Date.now(), description: '当前时间' },
  { label: '今天 00:00', timestamp: new Date().setHours(0, 0, 0, 0), description: '今天开始' },
  { label: '今天 12:00', timestamp: new Date().setHours(12, 0, 0, 0), description: '今天中午' },
  { label: '昨天', timestamp: Date.now() - 24 * 60 * 60 * 1000, description: '昨天此时' },
  { label: '一周前', timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, description: '一周前' },
  { label: '一月前', timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, description: '一月前' },
  { label: '一年前', timestamp: Date.now() - 365 * 24 * 60 * 60 * 1000, description: '一年前' }
]

// 解析任意日期字符串
function parseDate(input: string): Date | null {
    if (!input.trim()) return null

    // 尝试直接 Date 构造（支持 ISO、YYYY-MM-DD HH:mm:ss 等）
    const d = new Date(input)
    if (!isNaN(d.getTime())) return d

    // 尝试替换常见分隔符
    const normalized = input
        .replace(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6')
        .replace(/\//g, '-')
    const d2 = new Date(normalized)
    return isNaN(d2.getTime()) ? null : d2
}

// 获取相对时间描述
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)} 分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)} 天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)} 周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)} 月前`
  } else {
    return `${Math.floor(diff / year)} 年前`
  }
}

// 格式化时间字符串
function formatTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  return date.toLocaleString('zh-CN', options)
}

// 添加到历史（去重、最多10条）
function addToHistory(item: HistoryItem) {
    const exists = history.value.find(h => h.unixMilli === item.unixMilli)
    if (!exists) {
        history.value.unshift(item)
    if (history.value.length > 10) history.value.pop()
    // 保存到 localStorage
    localStorage.setItem('timestamp-history', JSON.stringify(history.value))
  }
}

// 从 localStorage 加载历史
function loadHistory() {
  try {
    const saved = localStorage.getItem('timestamp-history')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载历史记录失败:', e)
    }
}

// 复制文本
async function copyText(text: string | number) {
    try {
        await navigator.clipboard.writeText(String(text))
        ElMessage.success('已复制')
    } catch {
        ElMessage.error('复制失败')
    }
}

// 时间戳输入处理
function handleTimestampInput() {
    const val = timestampInput.value.trim()
    if (!val) {
        result.value = null
        dateInputStr.value = ''
        return
    }

    const num = Number(val)
    if (isNaN(num)) {
        ElMessage.warning('请输入有效数字')
        return
    }

    const ts = isMilli.value ? num : num * 1000
    const d = new Date(ts)
    if (isNaN(d.getTime())) {
        ElMessage.error('无效时间戳')
        return
    }

  dateInputStr.value = formatTime(d)
    updateResult(d)
}

// 日期字符串输入处理
function handleDateInput() {
    const d = parseDate(dateInputStr.value)
    if (!d) {
        if (dateInputStr.value.trim()) {
            ElMessage.warning('无法解析该日期格式')
        }
        result.value = null
        timestampInput.value = ''
        return
    }

    const ts = d.getTime()
    timestampInput.value = isMilli.value ? String(ts) : String(Math.floor(ts / 1000))
    updateResult(d)
}

// 更新结果并加入历史
function updateResult(date: Date) {
    const unixMilli = date.getTime()
    const unixSecond = Math.floor(unixMilli / 1000)

    const newResult: ConversionResult = {
    local: formatTime(date),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        unixSecond,
        unixMilli,
    relative: getRelativeTime(date),
    }

    result.value = newResult
  addToHistory({ 
    ...newResult, 
    timestamp: unixMilli,
    id: Date.now().toString()
  })
}

// 获取当前时间
function getNow() {
    const now = new Date()
  dateInputStr.value = formatTime(now)
    timestampInput.value = isMilli.value ? String(now.getTime()) : String(Math.floor(now.getTime() / 1000))
    updateResult(now)
}

// 使用历史记录
function useHistory(item: HistoryItem) {
    timestampInput.value = isMilli.value ? String(item.unixMilli) : String(item.unixSecond)
    dateInputStr.value = item.local
    result.value = item
}

// 应用快捷操作
function applyQuickAction(action: QuickAction) {
  const date = new Date(action.timestamp)
  dateInputStr.value = formatTime(date)
  timestampInput.value = isMilli.value ? String(action.timestamp) : String(Math.floor(action.timestamp / 1000))
  updateResult(date)
  ElMessage.success(`已应用：${action.description}`)
}

// 清空所有
function clearAll() {
  timestampInput.value = ''
  dateInputStr.value = ''
  result.value = null
}

// 清空历史
function clearHistory() {
  history.value = []
  localStorage.removeItem('timestamp-history')
  ElMessage.success('历史记录已清空')
}

// 导出结果
function exportResults() {
  if (!result.value) {
    ElMessage.warning('没有可导出的结果')
    return
  }

  const exportData = {
    timestamp: timestampInput.value,
    datetime: dateInputStr.value,
    results: result.value,
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timestamp-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('结果已导出')
}

// 监听设置变化
watch([isMilli, timezone], () => {
  if (timestampInput.value || dateInputStr.value) {
    if (timestampInput.value) {
      handleTimestampInput()
    } else if (dateInputStr.value) {
      handleDateInput()
    }
  }
})

// 初始化
loadHistory()
</script>

<style scoped>
.timestamp-tool {
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

.control-panel, .results-section, .quick-actions, .history-section {
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

.control-stats {
  display: flex;
  gap: 16px;
    font-size: 14px;
  color: #666;
}

.timezone-info, .format-info {
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

.left-controls, .right-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.input-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
    margin-bottom: 24px;
}

.timestamp-input, .datetime-input {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.input-actions {
  display: flex;
  align-items: center;
}

.timestamp-field, .datetime-field {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
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

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.result-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.result-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.quick-desc {
  font-size: 12px;
  color: #666;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-actions {
  display: flex;
  align-items: center;
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
  
  .left-controls, .right-controls {
    justify-content: center;
  }
  
  .input-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* 输入框样式优化 */
:deep(.el-input__inner) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  transition: border-color 0.2s ease;
}

:deep(.el-input__inner:focus) {
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

/* 选择器样式优化 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  border-radius: 8px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #666;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f2f5;
}
</style>