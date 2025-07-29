<template>
  <div class="diagonal-layout">
    <div class="background-container">
      <div class="triangle light"></div>
      <div class="triangle dark"></div>
    </div>
    
    <div class="content-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useDark, useToggle} from "@vueuse/core";

//  深色切换
useDark({
  selector: 'html',
  attribute: 'class',
  valueLight: 'light',
  valueDark: 'dark'
})

useDark({
  onChanged(dark) {
    useToggle(dark)
  }
})
</script>

<style scoped>
.diagonal-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.background-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: -1;
  overflow: hidden;
}

.triangle {
  position: absolute;
  width: 100%;
  height: 100%;
}

.light {
  background-color: #f8f9fa;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.dark {
  background-color: #212529;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
}

.content-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* 深色模式适配 */
.dark .light {
  background-color: #1a1a1a;
}

.dark .dark {
  background-color: #0d0d0d;
}
</style>