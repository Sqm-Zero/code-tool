<template>
  <div class="p-4 max-w-4xl mx-auto">
    <!-- 控制栏 -->
    <div
      class="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <el-button type="primary" @click="run" :loading="loading">计算所有哈希</el-button>
      <el-switch v-model="upper" active-text="大写输出" />
    </div>

    <!-- 输入区域 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
      <el-input v-model="input" type="textarea" :rows="6" placeholder="请输入要计算哈希的原始文本（支持任意字符）" class="font-mono text-sm"
        @input="autoRun" />
      <div class="text-xs text-gray-500 mt-1">
        提示：输入后将自动计算哈希（若内容较长可手动点击“计算”）
      </div>
    </div>

    <!-- 结果区域 -->
    <div class="space-y-4">
      <div v-for="item in hashResults" :key="item.algo"
        class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
        <div class="flex justify-between items-center p-3 bg-white border-b border-gray-100">
          <span class="font-semibold text-gray-800">{{ item.label }}</span>
          <el-button v-if="item.value" size="small" @click="copy(item.value)" :loading="copying === item.algo"
            type="primary" link>
            {{ copying === item.algo ? '已复制' : '复制' }}
          </el-button>
        </div>
        <div class="p-3">
          <el-input v-model="item.value" type="textarea" :rows="item.algo === 'sha512' ? 3 : 2" readonly
            :placeholder="loading ? '计算中...' : '无输入内容'" class="font-mono text-sm"
            :class="{ uppercase: upper && item.value }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import CryptoJS from 'crypto-js'
// @ts-ignore
import { sm3 } from 'sm-crypto'

const input = ref('')
const upper = ref(false)
const loading = ref(false)
const copying = ref<string | null>(null)

const hashResults = reactive([
  { algo: 'md5', label: 'MD5', value: '' },
  { algo: 'sha1', label: 'SHA-1', value: '' },
  { algo: 'sha256', label: 'SHA-256', value: '' },
  { algo: 'sha512', label: 'SHA-512', value: '' },
  { algo: 'sm3', label: 'SM3（国密）', value: '' }
])

// 自动计算（防抖）
let debounceTimer: number | null = null
const autoRun = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (input.value.trim().length < 100) {
      run()
    }
  }, 500)
}

const run = () => {
  loading.value = true
  const text = input.value

  for (const item of hashResults) {
    let res = ''
    switch (item.algo) {
      case 'md5': res = CryptoJS.MD5(text).toString(); break
      case 'sha1': res = CryptoJS.SHA1(text).toString(); break
      case 'sha256': res = CryptoJS.SHA256(text).toString(); break
      case 'sha512': res = CryptoJS.SHA512(text).toString(); break
      case 'sm3': res = sm3(text); break
    }
    item.value = res
  }

  loading.value = false
}

const copy = async (text: string) => {
  const algo = hashResults.find(h => h.value === text)?.algo
  if (!algo) return

  copying.value = algo
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

// 初始计算（可选）
watch(input, (val) => {
  if (val === '') {
    hashResults.forEach(h => h.value = '')
  }
})
</script>

<style scoped>
.uppercase {
  text-transform: uppercase;
}
</style>