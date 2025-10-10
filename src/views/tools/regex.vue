<template>
    <div class="p-4 max-w-4xl mx-auto">
        <!-- 控制面板 -->
        <div class="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                <el-input v-model="pattern" placeholder="输入正则表达式，例如：(foo|bar)+" class="flex-grow min-w-[240px]"
                    clearable @keyup.enter="run" />
                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-sm text-gray-600">标志：</span>
                    <el-checkbox v-model="flags.i" label="忽略大小写" border size="small" />
                    <el-checkbox v-model="flags.m" label="多行模式" border size="small" />
                    <el-checkbox v-model="flags.s" label="单行模式" border size="small" />
                    <el-checkbox v-model="flags.g" label="全局匹配" border size="small" />
                </div>
                <el-button type="primary" @click="run" :loading="loading">测试正则</el-button>
            </div>
            <transition name="fade">
                <div v-if="error" class="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                    正则表达式错误：{{ error }}
                </div>
            </transition>
        </div>

        <!-- 输入区域 -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">测试文本</label>
            <el-input v-model="source" type="textarea" :rows="10" placeholder="在此输入要测试的文本内容..."
                class="font-mono text-sm" />
        </div>

        <!-- 结果区域 -->
        <div>
            <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-gray-700">匹配结果</label>
                <span class="text-sm text-gray-500">{{ matches }} 处匹配</span>
            </div>
            <div class="p-3 bg-gray-50 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap break-words"
                v-html="highlighted"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const pattern = ref('')
const flags = ref({ i: true, m: false, s: false, g: true })
const source = ref('')
const highlighted = ref('')
const error = ref('')
const matches = ref(0)
const loading = ref(false)

const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>')

const run = () => {
    loading.value = true
    error.value = ''
    highlighted.value = ''
    matches.value = 0

    setTimeout(() => {
        try {
            const f = Object.entries(flags.value)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join('')

            if (!pattern.value.trim()) {
                highlighted.value = escapeHtml(source.value)
                loading.value = false
                return
            }

            const re = new RegExp(pattern.value, f)
            let out = ''

            if (f.includes('g')) {
                let last = 0
                for (const m of source.value.matchAll(re)) {
                    matches.value++
                    const idx = m.index ?? 0
                    out += escapeHtml(source.value.slice(last, idx))
                    out += `<mark class="regex-match">${escapeHtml(m[0])}</mark>`
                    last = idx + m[0].length
                }
                out += escapeHtml(source.value.slice(last))
            } else {
                const m = source.value.match(re)
                if (m) {
                    matches.value = 1
                    const idx = m.index ?? 0
                    out =
                        escapeHtml(source.value.slice(0, idx)) +
                        `<mark class="regex-match">${escapeHtml(m[0])}</mark>` +
                        escapeHtml(source.value.slice(idx + m[0].length))
                } else {
                    out = escapeHtml(source.value)
                }
            }

            highlighted.value = out
        } catch (e: any) {
            error.value = e.message || String(e)
        } finally {
            loading.value = false
        }
    }, 50)
}
</script>

<style scoped>
.regex-match {
    background-color: #dcfce7;
    /* 浅绿色背景 */
    color: #166534;
    /* 深绿色文字 */
    padding: 0 3px;
    border-radius: 3px;
    font-weight: 600;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>