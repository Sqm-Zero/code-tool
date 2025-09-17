<template>
  <div class="p-4">
    <div class="mb-3 flex flex-wrap gap-2 items-center">
      <el-select v-model="language" placeholder="选择语言" style="width: 180px">
        <el-option label="JavaScript" value="javascript" />
        <el-option label="TypeScript" value="typescript" />
        <el-option label="JSON" value="json" />
        <el-option label="Markdown" value="markdown" />
        <el-option label="HTML" value="html" />
        <el-option label="CSS" value="css" />
        <el-option label="Java (basic)" value="java" />
        <el-option label="Python (basic)" value="python" />
      </el-select>
      <el-button type="primary" @click="formatCode">格式化</el-button>
    </div>
    <el-input v-model="source" type="textarea" :rows="20" placeholder="粘贴代码" />
    <div class="mt-3">
      <el-input v-model="output" type="textarea" :rows="20" placeholder="输出" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import parserTypescript from 'prettier/plugins/typescript'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import parserMarkdown from 'prettier/plugins/markdown'

const language = ref<'javascript'|'typescript'|'json'|'markdown'|'html'|'css'|'java'|'python'>('javascript')
const source = ref('')
const output = ref('')

const formatCode = async () => {
  try {
    if (language.value === 'java' || language.value === 'python') {
      // 暂用基本缩进清理作为占位，后续可接入专用格式化器
      output.value = basicIndentNormalize(source.value)
      return
    }

    const parser = languageToParser(language.value)
    output.value = await prettier.format(source.value, {
      parser,
      plugins: [parserBabel, parserTypescript, parserHtml, parserPostcss, parserMarkdown],
      tabWidth: 2,
      useTabs: false,
      semi: false,
      singleQuote: true
    })
  } catch (e: any) {
    ElMessage.error(e.message || '格式化失败')
  }
}

function languageToParser(lang: string): prettier.BuiltInParserName | 'babel' {
  switch (lang) {
    case 'javascript': return 'babel'
    case 'typescript': return 'typescript'
    case 'json': return 'json'
    case 'markdown': return 'markdown'
    case 'html': return 'html'
    case 'css': return 'css'
    default: return 'babel'
  }
}

function basicIndentNormalize(code: string): string {
  // 简单的统一换行与去除尾随空白
  return code.replace(/\t/g, '  ').replace(/[ \t]+$/gm, '').replace(/\r\n?/g, '\n')
}
</script>

<style scoped>
</style>



