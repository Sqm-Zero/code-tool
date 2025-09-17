<template>
  <div class="p-4">
    <div class="mb-3">
      <el-button type="primary" @click="buildRendered">对比</el-button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <el-input v-model="left" type="textarea" :rows="16" placeholder="左侧（基准）" />
      <el-input v-model="right" type="textarea" :rows="16" placeholder="右侧（目标）" />
    </div>
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="editor readonly" v-html="leftRendered"></div>
      <div class="editor readonly" v-html="rightRendered"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { diffWordsWithSpace } from 'diff'

const left = ref('')
const right = ref('')
const leftRendered = ref('')
const rightRendered = ref('')

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const buildRendered = () => {
  const parts = diffWordsWithSpace(left.value, right.value)
  let leftHtml = ''
  let rightHtml = ''
  parts.forEach((part) => {
    if (part.added) {
      rightHtml += `<span class=\"token added\">${escape(part.value)}</span>`
    } else if (part.removed) {
      leftHtml += `<span class=\"token removed\">${escape(part.value)}</span>`
    } else {
      const safe = escape(part.value)
      leftHtml += `<span class=\"token equal\">${safe}</span>`
      rightHtml += `<span class=\"token equal\">${safe}</span>`
    }
  })
  leftRendered.value = wrapPre(leftHtml)
  rightRendered.value = wrapPre(rightHtml)
}

function wrapPre(inner: string) {
  return `<pre class=\"pre\">${inner}</pre>`
}
</script>

<style scoped>
.editor {
  min-height: 360px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  padding: 8px 10px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.editor.readonly { background: #fafafa; }
:deep(.pre) { margin: 0; white-space: pre-wrap; word-break: break-word; }
:deep(.token.added) { background: rgba(163, 230, 53, 0.25); color: #3f6212; }
:deep(.token.removed) { background: rgba(239, 68, 68, 0.18); color: #7f1d1d; text-decoration: line-through; }
:deep(.token.equal) { background: transparent; color: inherit; }
</style>


