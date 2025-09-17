<template>
  <div class="p-4">
    <div class="mb-3 flex gap-2">
      <el-button type="primary" @click="formatJson">格式化</el-button>
      <el-button @click="minifyJson">压缩</el-button>
      <el-switch v-model="sortKeys" active-text="按键名排序" />
    </div>
    <el-input v-model="source" type="textarea" :rows="16" placeholder="粘贴 JSON 文本" />
    <div class="mt-3">
      <el-input v-model="output" type="textarea" :rows="16" placeholder="输出" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const source = ref('')
const output = ref('')
const sortKeys = ref(false)

const formatJson = () => {
  try {
    const obj = JSON.parse(source.value)
    const ordered = sortKeys.value ? sortObject(obj) : obj
    output.value = JSON.stringify(ordered, null, 2)
  } catch (e: any) {
    ElMessage.error(e.message || 'JSON 解析失败')
  }
}

const minifyJson = () => {
  try {
    const obj = JSON.parse(source.value)
    const ordered = sortKeys.value ? sortObject(obj) : obj
    output.value = JSON.stringify(ordered)
  } catch (e: any) {
    ElMessage.error(e.message || 'JSON 解析失败')
  }
}

function sortObject(input: any): any {
  if (Array.isArray(input)) return input.map(sortObject)
  if (input && typeof input === 'object') {
    const sorted: Record<string, any> = {}
    Object.keys(input).sort().forEach(k => { sorted[k] = sortObject(input[k]) })
    return sorted
  }
  return input
}
</script>

<style scoped>
</style>



