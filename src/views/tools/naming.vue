<template>
    <div class="naming-tool">
        <div class="container">
            <!-- 页面标题 -->
            <div class="header">
                <h1 class="title">命名规范转换工具</h1>
                <p class="subtitle">支持多种命名规范的智能转换</p>
            </div>

            <!-- 主内容区域：左右布局 -->
            <div class="main-content">
                <!-- 左侧：输入区域 -->
                <div class="left-panel">
                    <el-card class="input-section">
                        <template #header>
                            <div class="card-header">
                                <span>输入原始名称</span>
                                <div class="input-stats">
                                    <span class="word-count">分词: {{ tokenize(inputName).length }} 个</span>
                                    <span class="char-count">字符: {{ inputName.length }}</span>
                                </div>
                            </div>
                        </template>
                        <div class="input-area">
                            <el-input 
                                v-model="inputName" 
                                type="textarea"
                                :rows="4"
                                placeholder="例如：user login、user_name、UserLogin 或 用户登录" 
                                clearable
                                @input="debouncedConvert"
                                class="main-input"
                            />
                            <div class="input-tips">
                                <el-icon><InfoFilled /></el-icon>
                                <span>支持中文、英文、空格、下划线、短横线、驼峰等混合输入，自动智能分词</span>
                            </div>
                            <div class="input-actions">
                                <el-button @click="clearAll" plain>
                                    清空
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 右侧：命名结果展示 -->
                <div class="right-panel">
                    <el-card class="results-section">
                        <template #header>
                            <div class="card-header">
                                <span>命名转换结果</span>
                            </div>
                        </template>
                        <div class="results-container">
                            <!-- 常用命名规范 -->
                            <div class="result-group">
                                <div class="group-title">常用命名规范</div>
                                <div class="results-grid">
                                    <div v-for="item in commonNamingItems" :key="item.key" class="naming-card">
                                        <div class="naming-header">
                                            <div class="naming-info">
                                                <div class="naming-name">{{ item.label }}</div>
                                                <div class="naming-desc">{{ item.desc }}</div>
                                            </div>
                                            <el-button 
                                                v-if="item.value" 
                                                size="small" 
                                                type="primary" 
                                                link 
                                                @click.stop="copy(item.value, item.key)"
                                                :loading="copying === item.key"
                                            >
                                                {{ copying === item.key ? '已复制' : '复制' }}
                                            </el-button>
                                        </div>
                                        <div class="naming-content">
                                            <div class="naming-output font-mono">
                                                {{ item.value || '—' }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 其他命名规范 -->
                            <div class="result-group">
                                <div class="group-title">其他命名规范</div>
                                <div class="results-grid">
                                    <div v-for="item in otherNamingItems" :key="item.key" class="naming-card">
                                        <div class="naming-header">
                                            <div class="naming-info">
                                                <div class="naming-name">{{ item.label }}</div>
                                                <div class="naming-desc">{{ item.desc }}</div>
                                            </div>
                                            <el-button 
                                                v-if="item.value" 
                                                size="small" 
                                                type="primary" 
                                                link 
                                                @click.stop="copy(item.value, item.key)"
                                                :loading="copying === item.key"
                                            >
                                                {{ copying === item.key ? '已复制' : '复制' }}
                                            </el-button>
                                        </div>
                                        <div class="naming-content">
                                            <div class="naming-output font-mono">
                                                {{ item.value || '—' }}
                                            </div>
                                        </div>
                                    </div>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const inputName = ref('')
const copying = ref<string | null>(null) // 记录哪个在复制

const results = ref({
    camelCase: '',
    snakeCase: '',
    pascalCase: '',
    kebabCase: '',
    screamingSnake: '',
    dotNotation: '',
    constantValue: '',
    flatCase: '',
    trainCase: '',
    cobolCase: ''
})

const namingItems = computed(() => [
    { key: 'camel', label: '驼峰命名', desc: 'camelCase', value: results.value.camelCase },
    { key: 'pascal', label: '帕斯卡命名', desc: 'PascalCase', value: results.value.pascalCase },
    { key: 'snake', label: '下划线命名', desc: 'snake_case', value: results.value.snakeCase },
    { key: 'kebab', label: '短横线命名', desc: 'kebab-case', value: results.value.kebabCase },
    { key: 'screaming', label: '常量命名', desc: 'SCREAMING_SNAKE_CASE', value: results.value.screamingSnake },
    { key: 'dot', label: '点号路径', desc: 'dot.notation', value: results.value.dotNotation },
    { key: 'constant', label: '常量值', desc: 'CONSTANT_VALUE', value: results.value.constantValue },
    { key: 'flat', label: '扁平命名', desc: 'flatcase', value: results.value.flatCase },
    { key: 'train', label: '火车命名', desc: 'Train-Case', value: results.value.trainCase },
    { key: 'cobol', label: 'COBOL 命名', desc: 'COBOL-CASE', value: results.value.cobolCase }
])

// 常用命名规范
const commonNamingItems = computed(() => {
    return namingItems.value.filter(item => 
        ['camel', 'pascal', 'snake', 'kebab', 'screaming'].includes(item.key)
    )
})

// 其他命名规范
const otherNamingItems = computed(() => {
    return namingItems.value.filter(item => 
        !['camel', 'pascal', 'snake', 'kebab', 'screaming'].includes(item.key)
    )
})

// ===== 转换逻辑 =====
const tokenize = (str: string): string[] => {
    if (!str.trim()) return []
    let s = str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_.\s]+/g, ' ')
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, '')
        .trim()
    return s ? s.split(/\s+/).filter(Boolean) : []
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

const convertAll = () => {
    const words = tokenize(inputName.value)
    if (!words.length) {
        results.value = {
            camelCase: '',
            snakeCase: '',
            pascalCase: '',
            kebabCase: '',
            screamingSnake: '',
            dotNotation: '',
            constantValue: '',
            flatCase: '',
            trainCase: '',
            cobolCase: ''
        }
        return
    }
    
    const lowerWords = words.map(w => w.toLowerCase())
    const upperWords = words.map(w => w.toUpperCase())
    const capitalizedWords = words.map(capitalize)
    
    results.value = {
        camelCase: words[0].toLowerCase() + words.slice(1).map(capitalize).join(''),
        pascalCase: capitalizedWords.join(''),
        snakeCase: lowerWords.join('_'),
        kebabCase: lowerWords.join('-'),
        screamingSnake: upperWords.join('_'),
        dotNotation: lowerWords.join('.'),
        constantValue: upperWords.join('_'),
        flatCase: lowerWords.join(''),
        trainCase: capitalizedWords.join('-'),
        cobolCase: upperWords.join('-')
    }
}

let debounceTimer: any = null
const debouncedConvert = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(convertAll, 300)
}


// 复制功能
const copy = async (text: string, key: string = 'temp') => {
    if (!text) return
    copying.value = key
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
    inputName.value = ''
    results.value = {
        camelCase: '',
        snakeCase: '',
        pascalCase: '',
        kebabCase: '',
        screamingSnake: '',
        dotNotation: '',
        constantValue: '',
        flatCase: '',
        trainCase: '',
        cobolCase: ''
    }
}

onMounted(() => convertAll())
</script>

<style scoped>
.naming-tool {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    min-height: 100vh;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
}

.container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 40px);
    box-sizing: border-box;
}

.header {
    text-align: center;
    margin-bottom: 8px;
    color: white;
    flex-shrink: 0;
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

/* 主内容区域：左右布局 */
.main-content {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 16px;
    align-items: start;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.left-panel, .right-panel {
    display: flex;
    flex-direction: column;
}

.input-section {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.results-section {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.results-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
}

.results-container::-webkit-scrollbar {
    width: 6px;
}

.results-container::-webkit-scrollbar-track {
    background: transparent;
}

.results-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.results-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.result-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.group-title {
    font-size: 14px;
    font-weight: 600;
    color: #666;
    padding-bottom: 6px;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 6px;
}

.input-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #666;
}

.word-count, .char-count {
    background: #f0f2f5;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.input-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.main-input {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

:deep(.main-input .el-textarea__inner) {
    resize: vertical;
}

.input-tips {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 12px;
    color: #666;
    flex-shrink: 0;
}

.input-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-shrink: 0;
}

:deep(.input-section .el-card__body) {
    display: flex;
    flex-direction: column;
    padding: 16px;
}

:deep(.results-section .el-card__body) {
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.naming-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.naming-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.naming-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.naming-name {
    font-weight: 600;
    font-size: 15px;
    color: #333;
}

.naming-desc {
    font-size: 12px;
    color: #666;
}

.naming-content {
    padding: 8px 10px;
}

.naming-output {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.5;
    background: #f8f9fa;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    min-height: 32px;
    word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .main-content {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .results-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .results-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 16px;
    }
    
    .title {
        font-size: 24px;
    }
    
    .input-actions {
        justify-content: center;
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
:deep(.el-input__inner) {
    border-radius: 8px;
    border: 2px solid #e1e5e9;
    transition: border-color 0.2s ease;
}

:deep(.el-input__inner:focus) {
    border-color: #f093fb;
    box-shadow: 0 0 0 2px rgba(240, 147, 251, 0.1);
}

/* 选择器样式优化 */
:deep(.el-select) {
    width: 100%;
}

:deep(.el-select .el-input__inner) {
    border-radius: 8px;
}

code {
    font-family: ui-monospace, monospace;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
}
</style>