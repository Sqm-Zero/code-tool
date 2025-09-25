<template>
    <div class="card mb-4 flex flex-col min-w-full relative">
        <!-- 设置图标（右上角） -->
        <button @click="showSettings = !showSettings" class="absolute top-0 right-0 p-1 text-white/60 hover:text-white"
            aria-label="设置">
            ⚙️
        </button>

        <div class="mb-2 font-black text-2xl text-center">
            🍅番茄钟
        </div>

        <div class="flex flex-col justify-between items-center">
            <!-- 模式选择按钮 -->
            <div class="flex gap-2 mt-1">
                <button @click="setMode('work')" :class="currentMode === 'work' ? 'bg-red-600' : 'bg-gray-700'"
                    class="text-xs px-2 py-1 rounded text-white">
                    工作
                </button>
                <button @click="setMode('shortBreak')"
                    :class="currentMode === 'shortBreak' ? 'bg-green-600' : 'bg-gray-700'"
                    class="text-xs px-2 py-1 rounded text-white">
                    短休
                </button>
                <button @click="setMode('longBreak')"
                    :class="currentMode === 'longBreak' ? 'bg-blue-600' : 'bg-gray-700'"
                    class="text-xs px-2 py-1 rounded text-white">
                    长休
                </button>
            </div>

            <!-- 倒计时 -->
            <div @click="isRunning ? pause() : start()"
                class="text-2xl md:text-3xl text-white font-mono font-thin mt-1 cursor-pointer">
                {{ pomodoroTime }}
            </div>

            <!-- 控制按钮 -->
            <div class="mt-2 flex gap-2">
                <button @click="reset" class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white">
                    重置
                </button>
            </div>
        </div>

        <!-- 设置面板 -->
        <div v-if="showSettings" class="mt-4 p-3 bg-black/20 rounded-lg w-full">
            <div class="grid grid-cols-2 gap-2 text-sm">
                <label>专注 (分钟)</label>
                <input v-model.number="focusMinutes" type="number" min="1"
                    class="bg-white/10 text-white rounded px-2 py-1">

                <label>短休 (分钟)</label>
                <input v-model.number="shortBreakMinutes" type="number" min="1"
                    class="bg-white/10 text-white rounded px-2 py-1">

                <label>长休 (分钟)</label>
                <input v-model.number="longBreakMinutes" type="number" min="1"
                    class="bg-white/10 text-white rounded px-2 py-1">

                <label>长休间隔</label>
                <input v-model.number="longBreakInterval" type="number" min="1"
                    class="bg-white/10 text-white rounded px-2 py-1">
            </div>
            <div class="mt-2 text-xs text-white/60">
                每完成 {{ longBreakInterval }} 个番茄后进入长休息
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from 'vue'

// 配置（响应式）
const focusMinutes = ref(25)
const shortBreakMinutes = ref(5)
const longBreakMinutes = ref(15)
const longBreakInterval = ref(4)

// 状态
type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'
const currentMode = ref<PomodoroMode>('work')
const currentCycle = ref(0)
const timeLeft = ref(focusMinutes.value * 60)
const isRunning = ref(false)
const timerId = ref<number | null>(null)
const showSettings = ref(false)

// 倒计时显示
const pomodoroTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 自动流程：是否应该进入长休息？
const shouldLongBreak = computed(() => {
    return currentCycle.value > 0 && currentCycle.value % longBreakInterval.value === 0
})

// 监听配置变化，重置时间（但不重置运行状态）
watch([focusMinutes, shortBreakMinutes, longBreakMinutes], () => {
    if (!isRunning.value) {
        setTimeByMode(currentMode.value)
    }
})

// 根据模式设置倒计时时间
const setTimeByMode = (mode: PomodoroMode) => {
    switch (mode) {
        case 'work':
            timeLeft.value = focusMinutes.value * 60
            break
        case 'shortBreak':
            timeLeft.value = shortBreakMinutes.value * 60
            break
        case 'longBreak':
            timeLeft.value = longBreakMinutes.value * 60
            break
    }
}

// 设置模式（手动）
const setMode = (mode: PomodoroMode) => {
    pause()
    currentMode.value = mode
    setTimeByMode(mode)
}

// 开始
const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    timerId.value = window.setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--
        } else {
            clearInterval(timerId.value!)
            isRunning.value = false

            // 自动切换
            if (currentMode.value === 'work') {
                currentCycle.value++
                const nextMode = shouldLongBreak.value ? 'longBreak' : 'shortBreak'
                currentMode.value = nextMode
                setTimeByMode(nextMode)
            } else {
                // 休息结束 → 工作
                currentMode.value = 'work'
                setTimeByMode('work')
            }
        }
    }, 1000)
}

// 暂停
const pause = () => {
    if (!isRunning.value) return
    clearInterval(timerId.value!)
    isRunning.value = false
}

// 重置
const reset = () => {
    pause()
    currentMode.value = 'work'
    currentCycle.value = 0
    setTimeByMode('work')
}

onUnmounted(() => {
    if (timerId.value) clearInterval(timerId.value)
})
</script>
<style scoped lang="scss">
.card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>