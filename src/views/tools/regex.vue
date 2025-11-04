<template>
    <div class="regex-tool">
        <div class="container">
            <!-- 页面标题 -->
            <div class="header">
                <h1 class="title">正则表达式测试工具</h1>
                <p class="subtitle">测试正则表达式，高亮显示匹配结果，支持多种标志位</p>
            </div>

            <!-- 主内容区域：左右分栏布局 -->
            <div class="main-content">
                <!-- 左侧：输入区域 -->
                <div class="left-panel">
                    <!-- 正则表达式控制面板 -->
                    <el-card class="control-panel">
                        <template #header>
                            <div class="card-header">
                                <span>正则表达式</span>
                                <div class="pattern-stats">
                                    <span class="pattern-length">{{ pattern.length }} 字符</span>
                                    <span class="flags-count">{{ activeFlagsCount }} 标志</span>
                                </div>
                            </div>
                        </template>
                        
                        <div class="pattern-input">
                            <el-input 
                                v-model="pattern" 
                                placeholder="输入正则表达式，例如：(foo|bar)+ 或 \d{3,5}" 
                                class="pattern-field"
                                @keyup.enter="run"
                                clearable
                            />
                            <div class="pattern-examples">
                                <span class="examples-label">常用示例：</span>
                                <div class="example-buttons">
                                    <el-button 
                                        v-for="example in patternExamples" 
                                        :key="example.name"
                                        size="small" 
                                        @click="useExample(example)"
                                        plain
                                    >
                                        {{ example.name }}
                                    </el-button>
                                </div>
                            </div>
                        </div>

                        <div class="flags-section">
                            <div class="flags-label">
                                <span>匹配标志：</span>
                            </div>
                            <div class="flags-group">
                                <el-checkbox v-model="flags.i" border size="small">
                                    <span class="flag-item">
                                        <code>i</code> 忽略大小写
                                    </span>
                                </el-checkbox>
                                <el-checkbox v-model="flags.m" border size="small">
                                    <span class="flag-item">
                                        <code>m</code> 多行模式
                                    </span>
                                </el-checkbox>
                                <el-checkbox v-model="flags.s" border size="small">
                                    <span class="flag-item">
                                        <code>s</code> 单行模式
                                    </span>
                                </el-checkbox>
                                <el-checkbox v-model="flags.g" border size="small">
                                    <span class="flag-item">
                                        <code>g</code> 全局匹配
                                    </span>
                                </el-checkbox>
                            </div>
                        </div>

                        <div class="action-buttons">
                            <el-button type="primary" @click="run" :loading="loading" icon="Search">
                                测试正则
                            </el-button>
                            <el-button @click="clearAll" icon="Delete" plain>
                                清空
                            </el-button>
                        </div>

                        <transition name="fade">
                            <div v-if="error" class="error-message">
                                <el-icon><Warning /></el-icon>
                                <span>正则表达式错误：{{ error }}</span>
                            </div>
                        </transition>
                    </el-card>

                    <!-- 测试文本区域 -->
                    <el-card class="input-section">
                        <template #header>
                            <div class="card-header">
                                <span>测试文本</span>
                                <div class="text-stats">
                                    <span class="text-length">{{ source.length }} 字符</span>
                                    <span class="line-count">{{ source.split('\n').length }} 行</span>
                                </div>
                            </div>
                        </template>
                        <el-input 
                            v-model="source" 
                            type="textarea" 
                            :rows="15"
                            placeholder="在此输入要测试的文本内容..."
                            class="test-textarea font-mono"
                        />
                    </el-card>
                </div>

                <!-- 右侧：结果区域 -->
                <div class="right-panel">
                    <el-card class="results-section">
                        <template #header>
                            <div class="card-header">
                                <span>匹配结果</span>
                                <div class="match-stats">
                                    <span class="match-count">{{ matches }} 处匹配</span>
                                    <span class="match-time">{{ matchTime }}ms</span>
                                </div>
                            </div>
                        </template>
                        
                        <div class="results-content">
                            <div v-if="!pattern && !source" class="empty-state">
                                <el-icon><Document /></el-icon>
                                <p>请输入正则表达式和测试文本来查看匹配结果</p>
                            </div>
                            <div v-else-if="!pattern" class="empty-state">
                                <el-icon><Edit /></el-icon>
                                <p>请输入正则表达式</p>
                            </div>
                            <div v-else-if="!source" class="empty-state">
                                <el-icon><Document /></el-icon>
                                <p>请输入测试文本</p>
                            </div>
                            <div v-else class="highlighted-text" v-html="highlighted"></div>
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
import { Warning, Document, Edit } from '@element-plus/icons-vue'

const pattern = ref('')
const flags = ref({ i: true, m: false, s: false, g: true })
const source = ref('')
const highlighted = ref('')
const error = ref('')
const matches = ref(0)
const matchTime = ref(0)
const loading = ref(false)

// 预设的正则表达式示例
const patternExamples = ref([
    { name: '邮箱', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', desc: '匹配邮箱地址' },
    { name: '手机号', pattern: '1[3-9]\\d{9}', desc: '匹配中国大陆手机号' },
    { name: '身份证', pattern: '\\d{17}[\\dXx]', desc: '匹配身份证号码' },
    { name: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?', desc: '匹配URL地址' },
    { name: 'IP地址', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b', desc: '匹配IP地址' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', desc: '匹配中文字符' },
    { name: '数字', pattern: '\\d+', desc: '匹配一个或多个数字' },
    { name: '单词', pattern: '\\b\\w+\\b', desc: '匹配单词' }
])

// 计算属性
const activeFlagsCount = computed(() => {
    return Object.values(flags.value).filter(Boolean).length
})

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// 高亮显示匹配结果，支持捕获组
const highlightMatches = (text: string, regex: RegExp, flags: string) => {
    let result = ''
    let lastIndex = 0
    
    if (flags.includes('g')) {
        // 全局匹配
        let match
        const globalRegex = new RegExp(regex.source, flags)
        
        while ((match = globalRegex.exec(text)) !== null) {
            // 添加匹配前的文本
            result += escapeHtml(text.slice(lastIndex, match.index))
            
            // 高亮整个匹配
            result += `<mark class="regex-match">${escapeHtml(match[0])}</mark>`
            
            lastIndex = match.index + match[0].length
            
            // 防止无限循环
            if (match[0].length === 0) {
                globalRegex.lastIndex++
                if (globalRegex.lastIndex > text.length) break
            }
        }
    } else {
        // 单次匹配
        const match = text.match(regex)
        if (match) {
            result += escapeHtml(text.slice(0, match.index))
            result += `<mark class="regex-match">${escapeHtml(match[0])}</mark>`
            result += escapeHtml(text.slice(match.index! + match[0].length))
            return result
        }
    }
    
    // 添加剩余的文本
    result += escapeHtml(text.slice(lastIndex))
    return result
}

const run = () => {
    loading.value = true
    error.value = ''
    highlighted.value = ''
    matches.value = 0
    matchTime.value = 0

    const startTime = performance.now()

    setTimeout(() => {
        try {
            const f = Object.entries(flags.value)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join('')

            if (!pattern.value.trim()) {
                highlighted.value = escapeHtml(source.value)
                matchTime.value = Math.round(performance.now() - startTime)
                loading.value = false
                return
            }

            const re = new RegExp(pattern.value, f)
            matches.value = 0 // 重置匹配计数

            // 使用新的高亮函数
            highlighted.value = highlightMatches(source.value, re, f)
            
            // 计算匹配数量
            if (f.includes('g')) {
                const globalRegex = new RegExp(pattern.value, f)
                let match
                while ((match = globalRegex.exec(source.value)) !== null) {
                    matches.value++
                    if (match[0].length === 0) {
                        globalRegex.lastIndex++
                        if (globalRegex.lastIndex > source.value.length) break
                    }
                }
            } else {
                const match = source.value.match(re)
                if (match) {
                    matches.value = 1
                }
            }
            matchTime.value = Math.round(performance.now() - startTime)
        } catch (e: any) {
            error.value = e.message || String(e)
            matchTime.value = Math.round(performance.now() - startTime)
            ElMessage.error('正则表达式语法错误')
        } finally {
            loading.value = false
        }
    }, 50)
}

const clearAll = () => {
    pattern.value = ''
    source.value = ''
    highlighted.value = ''
    error.value = ''
    matches.value = 0
    matchTime.value = 0
}

const useExample = (example: any) => {
    pattern.value = example.pattern
    ElMessage.success(`已应用示例：${example.desc}`)
    if (source.value.trim()) {
        run()
    }
}

// 监听输入变化，自动测试
let debounceTimer: any = null
watch([pattern, source, flags], () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        if (pattern.value.trim() && source.value.trim()) {
            run()
        }
    }, 300)
}, { deep: true })
</script>

<style scoped>
.regex-tool {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
    flex-shrink: 0;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex: 1;
    min-height: 0;
    align-items: stretch;
}

.left-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 0;
}

.right-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
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

.control-panel, .input-section, .results-section {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.input-section {
    flex: 1;
    min-height: 0;
}

.results-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.pattern-stats, .text-stats, .match-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #666;
}

.pattern-length, .flags-count, .text-length, .line-count, .match-count, .match-time {
    background: #f0f2f5;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.pattern-input {
    margin-bottom: 16px;
}

.pattern-examples {
    margin: 10px 0 0 0;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
}

.pattern-tips, .input-tips {
    display: none;
}

.pattern-field {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

.pattern-examples {
    margin: 12px 0;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.examples-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.example-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pattern-tips, .input-tips {
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

.flags-section {
    margin-bottom: 16px;
}

.flags-label {
    margin-bottom: 12px;
    font-weight: 500;
    color: #333;
}

.flags-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.flag-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.flag-item code {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #495057;
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-bottom: 16px;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 14px;
}

.test-textarea {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    line-height: 1.5;
    flex: 1;
    min-height: 0;
}

:deep(.test-textarea .el-textarea__inner) {
    height: 100%;
    resize: none;
}

.results-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

:deep(.results-section .el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: #666;
    text-align: center;
    min-height: 200px;
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

.highlighted-text {
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
    overflow-y: auto;
    min-height: 0;
}

.regex-match {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    color: #1e293b;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    display: inline-block;
    animation: highlightPulse 0.3s ease-in-out;
}

@keyframes highlightPulse {
    0% {
        transform: scale(1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(132, 250, 176, 0.3);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
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
    
    .regex-tool {
        padding: 16px 0;
    }
    
    .header {
        margin-bottom: 16px;
    }
    
    .title {
        font-size: 24px;
    }
    
    .subtitle {
        font-size: 12px;
    }
    
    .main-content {
        gap: 16px;
    }
    
    .flags-group {
        flex-direction: column;
        gap: 8px;
    }
    
    .action-buttons {
        justify-content: center;
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .pattern-stats, .text-stats, .match-stats {
        align-self: stretch;
        justify-content: space-between;
    }
    
    .pattern-examples {
        padding: 8px;
    }
    
    .example-buttons {
        gap: 6px;
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
    padding: 16px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

:deep(.control-panel .el-card__body) {
    padding: 16px;
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
:deep(.el-input__inner), :deep(.el-textarea__inner) {
    border-radius: 8px;
    border: 2px solid #e1e5e9;
    transition: border-color 0.2s ease;
}

:deep(.el-input__inner:focus), :deep(.el-textarea__inner:focus) {
    border-color: #4facfe;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

/* 复选框样式优化 */
:deep(.el-checkbox) {
    margin-right: 0;
}

:deep(.el-checkbox.is-checked .el-checkbox__inner) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-color: #4facfe;
}

/* 加载动画 */
:deep(.el-loading-mask) {
    border-radius: 12px;
}
</style>