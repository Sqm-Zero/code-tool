<template>
    <div class="naming-tool">
        <div class="container">
            <!-- 页面标题 -->
            <div class="header">
                <h1 class="title">命名规范转换工具</h1>
                <p class="subtitle">变量命名转换 + 智能 Git 分支命名建议</p>
            </div>

            <!-- 输入区域 -->
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
                    <div class="input-main">
                        <el-input 
                            v-model="inputName" 
                            placeholder="例如：user login、user_name、UserLogin 或 用户登录" 
                            clearable
                            @input="debouncedConvert"
                            class="main-input"
                        />
                        <div class="input-tips">
                            <el-icon><InfoFilled /></el-icon>
                            <span>支持中文、英文、空格、下划线、短横线、驼峰等混合输入，自动智能分词</span>
                        </div>
                    </div>
                    <div class="input-actions">
                        <el-button @click="applyToGitDesc" icon="Branch" type="primary">
                            用于 Git 描述
                        </el-button>
                        <el-button @click="clearAll" icon="Delete" plain>
                            清空
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- 命名结果 -->
            <div class="results-section">
                <h2 class="section-title">变量命名转换</h2>
                <div class="results-grid">
                    <div v-for="item in namingItems" :key="item.key" class="naming-card">
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
                                icon="CopyDocument"
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

            <!-- Git 分支命名（增强版） -->
            <el-card class="git-section">
                <template #header>
                    <div class="card-header">
                        <span>Git 分支命名（智能建议）</span>
                        <div class="branch-stats">
                            <span class="branch-type">{{ branchType }}</span>
                            <span class="branch-length">{{ branchName.length }} 字符</span>
                        </div>
                    </div>
                </template>

                <div class="git-controls">
                    <div class="control-group">
                        <label class="control-label">分支类型</label>
                        <el-select v-model="branchType" class="w-full" placeholder="选择分支类型">
                            <el-option label="feature - 新功能" value="feature" />
                            <el-option label="fix - 修复 bug" value="fix" />
                            <el-option label="hotfix - 紧急修复" value="hotfix" />
                            <el-option label="refactor - 重构" value="refactor" />
                            <el-option label="test - 测试相关" value="test" />
                            <el-option label="docs - 文档更新" value="docs" />
                            <el-option label="chore - 构建/依赖等杂项" value="chore" />
                            <el-option label="i18n - 国际化" value="i18n" />
                        </el-select>
                    </div>
                    <div class="control-group">
                        <label class="control-label">分支描述</label>
                        <el-input 
                            v-model="branchDesc" 
                            placeholder="例如：user login 或 header overflow"
                            @input="updateBranchName"
                            clearable
                        />
                    </div>
                </div>

                <div class="branch-result">
                    <div class="result-header">
                        <div class="result-info">
                            <label class="result-label">推荐分支名</label>
                            <div class="branch-name font-mono">{{ branchName }}</div>
                        </div>
                        <el-button 
                            size="small" 
                            type="primary" 
                            @click="copy(branchName, 'branch')" 
                            :loading="copying === 'branch'"
                            icon="CopyDocument"
                        >
                            {{ copying === 'branch' ? '已复制' : '复制分支名' }}
                        </el-button>
                    </div>
                    <div class="git-command">
                        <span class="command-label">完整命令：</span>
                        <code class="command-text">git checkout -b {{ branchName }}</code>
                    </div>
                </div>

                <div class="git-tips">
                    <el-icon><InfoFilled /></el-icon>
                    <span>描述会自动转为小写 + 短横线格式（如 <code>user login</code> → <code>user-login</code>）</span>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const inputName = ref('')
const branchType = ref('feature')
const branchDesc = ref('')
const copying = ref<string | null>(null) // 记录哪个在复制

const results = ref({
    camelCase: '',
    snakeCase: '',
    pascalCase: '',
    kebabCase: '',
    screamingSnake: '',
    dotNotation: ''
})

const namingItems = computed(() => [
    { key: 'camel', label: '驼峰命名', desc: 'camelCase', value: results.value.camelCase },
    { key: 'snake', label: '下划线命名', desc: 'snake_case', value: results.value.snakeCase },
    { key: 'pascal', label: '帕斯卡命名', desc: 'PascalCase', value: results.value.pascalCase },
    { key: 'kebab', label: '短横线命名', desc: 'kebab-case', value: results.value.kebabCase },
    { key: 'screaming', label: '常量命名', desc: 'SCREAMING_SNAKE_CASE', value: results.value.screamingSnake },
    { key: 'dot', label: '点号路径', desc: 'dot.notation', value: results.value.dotNotation }
])

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
    results.value = {
        camelCase: words.length ? words[0].toLowerCase() + words.slice(1).map(capitalize).join('') : '',
        snakeCase: words.map(w => w.toLowerCase()).join('_'),
        pascalCase: words.map(capitalize).join(''),
        kebabCase: words.map(w => w.toLowerCase()).join('-'),
        screamingSnake: words.map(w => w.toUpperCase()).join('_'),
        dotNotation: words.map(w => w.toLowerCase()).join('.')
    }
}

let debounceTimer: any = null
const debouncedConvert = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(convertAll, 300)
}

// Git 分支
const kebabCaseDesc = computed(() => {
    const words = tokenize(branchDesc.value)
    return words.map(w => w.toLowerCase()).join('-')
})
const branchName = computed(() => {
    const desc = kebabCaseDesc.value
    return desc ? `${branchType.value}/${desc}` : branchType.value
})

const updateBranchName = () => { /* computed 自动更新 */ }

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

// 一键将变量输入用于 Git 描述
const applyToGitDesc = () => {
    if (!inputName.value.trim()) return
    // 尝试智能提取类型（如输入 "fix: login error"）
    const match = inputName.value.match(/^(feat|feature|fix|hotfix|refactor|test|docs|chore|i18n)[:：]\s*(.+)$/i)
    if (match) {
        const typeMap: Record<string, string> = {
            feat: 'feature',
            feature: 'feature',
            fix: 'fix',
            hotfix: 'hotfix',
            refactor: 'refactor',
            test: 'test',
            docs: 'docs',
            chore: 'chore',
            i18n: 'i18n'
        }
        branchType.value = typeMap[match[1].toLowerCase()] || 'feature'
        branchDesc.value = match[2]
    } else {
        // 否则直接用分词后的 kebab 描述
        const words = tokenize(inputName.value)
        branchDesc.value = words.join(' ')
    }
}

const clearAll = () => {
    inputName.value = ''
    branchDesc.value = ''
    results.value = {
        camelCase: '',
        snakeCase: '',
        pascalCase: '',
        kebabCase: '',
        screamingSnake: '',
        dotNotation: ''
    }
}

onMounted(() => convertAll())
</script>

<style scoped>
.naming-tool {
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

.input-section, .git-section {
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

.input-stats, .branch-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #666;
}

.word-count, .char-count, .branch-type, .branch-length {
    background: #f0f2f5;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.input-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.input-main {
    flex: 1;
}

.main-input {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

.input-tips, .git-tips {
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

.input-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.results-section {
    margin-bottom: 24px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.naming-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.naming-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.naming-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.naming-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.naming-name {
    font-weight: 600;
    font-size: 16px;
    color: #333;
}

.naming-desc {
    font-size: 12px;
    color: #666;
}

.naming-content {
    padding: 16px 20px;
}

.naming-output {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.4;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    min-height: 40px;
    word-break: break-all;
}

.git-controls {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 20px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.control-label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.branch-result {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.result-info {
    flex: 1;
}

.result-label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
    display: block;
    margin-bottom: 8px;
}

.branch-name {
    font-size: 16px;
    color: #667eea;
    font-weight: 600;
    word-break: break-all;
}

.git-command {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.command-label {
    color: #666;
}

.command-text {
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 4px;
    color: #333;
    font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .container {
        padding: 0 16px;
    }
    
    .title {
        font-size: 24px;
    }
    
    .input-area {
        flex-direction: column;
    }
    
    .input-actions {
        justify-content: center;
    }
    
    .results-grid {
        grid-template-columns: 1fr;
    }
    
    .git-controls {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .result-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
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