<template>
    <div class="p-4 max-w-4xl mx-auto">
        <!-- 标题 -->
        <div class="mb-6 text-center">
            <h1 class="text-2xl font-bold text-gray-800">命名规范转换工具</h1>
            <p class="text-gray-500 mt-2">变量命名转换 + 智能 Git 分支命名建议</p>
        </div>

        <!-- 输入区域 -->
        <el-card class="mb-6 shadow-sm">
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">输入原始名称</label>
                    <el-input v-model="inputName" placeholder="例如：user login、user_name、UserLogin 或 用户登录" clearable
                        @input="debouncedConvert" />
                </div>
                <div class="flex items-end gap-2">
                    <el-button @click="applyToGitDesc" size="default">用于 Git 描述</el-button>
                    <el-button @click="clearAll" type="danger" plain>清空</el-button>
                </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
                支持中文、英文、空格、下划线、短横线、驼峰等混合输入，自动智能分词
            </div>
        </el-card>

        <!-- 命名结果 -->
        <el-card class="mb-6 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">变量命名转换</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="item in namingItems" :key="item.key" class="border rounded-lg p-3 bg-white">
                    <div class="flex justify-between items-start mb-1">
                        <div>
                            <div class="font-medium text-gray-800">{{ item.label }}</div>
                            <div class="text-xs text-gray-500">{{ item.desc }}</div>
                        </div>
                        <el-button v-if="item.value" size="small" type="primary" link @click.stop="copy(item.value)"
                            :loading="copying === item.key">
                            {{ copying === item.key ? '已复制' : '复制' }}
                        </el-button>
                    </div>
                    <div class="font-mono text-sm break-all bg-gray-50 p-2 rounded border min-h-[40px]">
                        {{ item.value || '—' }}
                    </div>
                </div>
            </div>
        </el-card>

        <!-- Git 分支命名（增强版） -->
        <el-card class="shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Git 分支命名（智能建议）</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">分支类型</label>
                    <el-select v-model="branchType" class="w-full">
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
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">分支描述</label>
                    <el-input v-model="branchDesc" placeholder="例如：user login 或 header overflow"
                        @input="updateBranchName" />
                </div>
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded border">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <label class="text-sm font-medium text-gray-700">推荐分支名</label>
                        <div class="font-mono text-sm mt-1">{{ branchName }}</div>
                    </div>
                    <el-button size="small" type="primary" @click="copy(branchName)" :loading="copying === 'branch'">
                        {{ copying === 'branch' ? '已复制' : '复制分支名' }}
                    </el-button>
                </div>
                <div class="mt-2 text-xs text-gray-600">
                    完整命令：
                    <code class="ml-1">git checkout -b {{ branchName }}</code>
                </div>
            </div>

            <div class="mt-3 text-xs text-gray-500">
                💡 提示：描述会自动转为小写 + 短横线格式（如 <code>user login</code> → <code>user-login</code>）
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
        setTimeout(() => {
            copying.value = null
        }, 1500)
    } catch (e) {
        copying.value = null
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
code {
    font-family: ui-monospace, monospace;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
}
</style>