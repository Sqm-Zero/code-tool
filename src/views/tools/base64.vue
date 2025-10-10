<template>
  <div class="p-4">
    <div class="mb-3 flex gap-2 items-center">
      <el-radio-group v-model="mode">
        <el-radio-button label="encode">编码</el-radio-button>
        <el-radio-button label="decode">解码</el-radio-button>
      </el-radio-group>
      <el-switch v-model="useUrl" active-text="URL 安全" />
      <el-button type="primary" @click="run">执行</el-button>
    </div>
    <el-input v-model="input" type="textarea" :rows="8" placeholder="输入" />
    <div class="mt-3">
      <el-input v-model="output" type="textarea" :rows="8" placeholder="输出" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'encode'|'decode'>('encode')
const useUrl = ref(false)
const input = ref('')
const output = ref('')

const toUrlSafe = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'')
const fromUrlSafe = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length/4)*4, '=')

const run = () => {
  try {
    if (mode.value === 'encode') {
      const b64 = btoa(unescape(encodeURIComponent(input.value)))
      output.value = useUrl.value ? toUrlSafe(b64) : b64
    } else {
      const raw = useUrl.value ? fromUrlSafe(input.value) : input.value
      output.value = decodeURIComponent(escape(atob(raw)))
    }
  } catch (e: any) {
    output.value = `错误: ${e.message || e}`
  }
}
</script>

<style scoped>
</style>


