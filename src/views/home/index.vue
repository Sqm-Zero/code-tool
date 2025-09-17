<template>
  <div class="p-6">
    <h1 class="text-2xl mb-4">工具集合</h1>
    <div class="flex flex-wrap gap-3">
      <router-link to="/tools/diff"><el-button type="primary">代码对比</el-button></router-link>
      <router-link to="/tools/json"><el-button>JSON 格式化</el-button></router-link>
      <router-link to="/tools/format"><el-button>代码格式化</el-button></router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>