<template>
    <div class="motto-card mb-4 flex flex-col min-w-full">
        <div class="mb-2 font-black text-2xl">
            🕒电子时钟
        </div>
        <div class="flex flex-col justify-between items-center">
            <!-- 年月日 星期 -->
            <div class="font-mono">
                {{ formatter }}
            </div>
            <div class="text-2xl md:text-3xl text-white font-mono font-thin mt-1">
                <!-- 时分秒 -->
                {{ currentTime }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatHHmmss, formatYYYYMMDDWithWeek } from '@/utils/date';
// 电子时钟
const formatter = ref(formatYYYYMMDDWithWeek());
const currentTime = ref<string>('');

onMounted(() => {
    // 初始化时钟
    currentTime.value = formatHHmmss()
    setInterval(() => {
        currentTime.value = formatHHmmss()
    }, 1000)
});
</script>

<style scoped></style>