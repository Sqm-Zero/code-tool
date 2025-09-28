<template>
    <div class="timestamp-converter">
        <div class="container">
            <div class="header">
                <h1> 时间戳转换工具</h1>
                <p class="subtitle">支持秒/毫秒互转、多种格式解析、一键复制</p>
            </div>

            <el-card class="main-card">
                <!-- 控制区 -->
                <div class="control-bar">
                    <el-switch v-model="isMilli" active-text="毫秒级" inactive-text="秒级" class="switch" />
                    <el-button type="primary" @click="getNow" icon="Clock">获取当前时间</el-button>
                </div>

                <!-- 双向输入区 -->
                <div class="input-section">
                    <!-- 时间戳输入 -->
                    <div class="input-block">
                        <div class="label-row">
                            <label>时间戳</label>
                            <el-button v-if="timestampDisplay" size="small" @click="copyText(timestampDisplay)" link
                                type="primary">
                                复制
                            </el-button>
                        </div>
                        <el-input v-model="timestampInput" @input="handleTimestampInput"
                            placeholder="例如：1717200000000 或 1717200000" clearable>
                            <template #prefix>
                                <el-icon>
                                    <Timer />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>

                    <!-- 日期时间输入 -->
                    <div class="input-block">
                        <div class="label-row">
                            <label>日期时间</label>
                            <el-button v-if="dateInputStr" size="small" @click="copyText(dateInputStr)" link
                                type="primary">
                                复制
                            </el-button>
                        </div>
                        <el-input v-model="dateInputStr" @input="handleDateInput" placeholder="例如：2024-06-01 12:30:45"
                            clearable>
                            <template #prefix>
                                <el-icon>
                                    <Calendar />
                                </el-icon>
                            </template>
                        </el-input>
                        <div class="hint">支持格式：ISO、YYYY-MM-DD HH:mm:ss、YYYY/MM/DD 等</div>
                    </div>
                </div>

                <!-- 详细结果展示 -->
                <div v-if="result" class="result-section">
                    <h3>转换结果</h3>
                    <el-descriptions :column="1" size="small" border>
                        <el-descriptions-item label="本地时间">
                            {{ result.local }}
                        </el-descriptions-item>
                        <el-descriptions-item label="UTC 时间">
                            {{ result.utc }}
                        </el-descriptions-item>
                        <el-descriptions-item label="ISO 8601">
                            {{ result.iso }}
                        </el-descriptions-item>
                        <el-descriptions-item label="Unix 秒">
                            {{ result.unixSecond }}
                            <el-button size="small" @click="copyText(result.unixSecond)" link
                                type="primary">复制</el-button>
                        </el-descriptions-item>
                        <el-descriptions-item label="Unix 毫秒">
                            {{ result.unixMilli }}
                            <el-button size="small" @click="copyText(result.unixMilli)" link
                                type="primary">复制</el-button>
                        </el-descriptions-item>
                    </el-descriptions>
                </div>

                <!-- 历史记录 -->
                <div v-if="history.length > 0" class="history-section">
                    <h3>最近记录</h3>
                    <el-table :data="history" size="small" style="width: 100%" max-height="150">
                        <el-table-column prop="timestamp" label="时间戳" width="140" />
                        <el-table-column prop="local" label="本地时间" />
                        <el-table-column width="80">
                            <template #default="{ row }">
                                <el-button size="small" @click="useHistory(row)" type="text">使用</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Calendar, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

interface ConversionResult {
    local: string
    utc: string
    iso: string
    unixSecond: number
    unixMilli: number
}

interface HistoryItem extends ConversionResult {
    timestamp: number
}

const isMilli = ref(true)
const timestampInput = ref('')
const dateInputStr = ref('')
const result = ref<ConversionResult | null>(null)
const history = ref<HistoryItem[]>([])

const timestampDisplay = computed(() => timestampInput.value.trim())

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

// 添加到历史（去重、最多5条）
function addToHistory(item: HistoryItem) {
    const exists = history.value.find(h => h.unixMilli === item.unixMilli)
    if (!exists) {
        history.value.unshift(item)
        if (history.value.length > 5) history.value.pop()
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

    dateInputStr.value = d.toLocaleString()
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
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        unixSecond,
        unixMilli,
    }

    result.value = newResult
    addToHistory({ ...newResult, timestamp: unixMilli })
}

// 获取当前时间
function getNow() {
    const now = new Date()
    dateInputStr.value = now.toLocaleString()
    timestampInput.value = isMilli.value ? String(now.getTime()) : String(Math.floor(now.getTime() / 1000))
    updateResult(now)
}

// 使用历史记录
function useHistory(item: HistoryItem) {
    timestampInput.value = isMilli.value ? String(item.unixMilli) : String(item.unixSecond)
    dateInputStr.value = item.local
    result.value = item
}
</script>

<style scoped>
.timestamp-converter {
    background-color: #f8fafc;
    min-height: 100vh;
    padding: 24px 0;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
}

.header {
    text-align: center;
    margin-bottom: 24px;
}

.header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
}

.subtitle {
    color: #64748b;
    font-size: 14px;
}

.main-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.switch :deep(.el-switch__label) {
    font-size: 13px;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
}

.input-block .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.input-block label {
    font-weight: 500;
    color: #334155;
}

.hint {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}

.result-section h3,
.history-section h3 {
    margin: 24px 0 16px;
    color: #334155;
    font-size: 16px;
    font-weight: 600;
}

:deep(.el-descriptions__body) {
    background-color: #f1f5f9;
}

.history-section :deep(.el-table) {
    font-size: 13px;
}
</style>