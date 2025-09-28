<template>
    <div class="pomodoro-card mb-4 flex flex-col min-w-full relative">
        <div class="absolute font-size: 1.25rem; top-0 left-0 p-2 text-white/70">
            🍅 番茄钟
        </div>

        <!-- 设置图标（右上角） -->
        <button @click="toggleSettings" class="absolute top-0 right-0 p-3 text-white/60 hover:text-white"
            aria-label="设置">
            <span class="text-xl">⚙️</span>
        </button>

        <div class="flex flex-col justify-between items-center relative">
            <!-- 模式选择按钮 -->
            <div class="flex gap-2 mt-1 mb-4">
                <button @click="setMode('work')" :class="currentMode === 'work' ? 'bg-red-600' : 'bg-gray-700'"
                    class="text-xs px-3 py-1.5 rounded text-white transition-colors duration-200">
                    工作 ({{ focusMinutes }} min)
                </button>
                <button @click="setMode('shortBreak')"
                    :class="currentMode === 'shortBreak' ? 'bg-green-600' : 'bg-gray-700'"
                    class="text-xs px-3 py-1.5 rounded text-white transition-colors duration-200">
                    短休 ({{ shortBreakMinutes }} min)
                </button>
                <button @click="setMode('longBreak')"
                    :class="currentMode === 'longBreak' ? 'bg-blue-600' : 'bg-gray-700'"
                    class="text-xs px-3 py-1.5 rounded text-white transition-colors duration-200">
                    长休 ({{ longBreakMinutes }} min)
                </button>
            </div>

            <div class="flex justify-center items-center">
                <!-- 倒计时 -->
                <div @click="toggleTimer"
                    class="text-5xl md:text-4xl text-white font-digital-clock font-thin mt-1 cursor-pointer select-none transition-transform duration-150 active:scale-95"
                    :class="{ 'opacity-80': !isRunning }">
                    {{ pomodoroTime }}
                </div>
            </div>
        </div>

        <!-- 设置面板 -->
        <div v-show="showSettings" class="settings-panel mt-4 p-4 bg-black/30 rounded-lg w-full text-white">
            <h4 class="font-bold text-lg mb-3">设置</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <label class="flex items-center">专注 (分钟)</label>
                <input v-model.number="focusMinutes" type="number" min="1" max="60"
                    class="bg-white/10 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">

                <label class="flex items-center">短休 (分钟)</label>
                <input v-model.number="shortBreakMinutes" type="number" min="1" max="30"
                    class="bg-white/10 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">

                <label class="flex items-center">长休 (分钟)</label>
                <input v-model.number="longBreakMinutes" type="number" min="1" max="60"
                    class="bg-white/10 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">

                <label class="flex items-center">长休间隔</label>
                <input v-model.number="longBreakInterval" type="number" min="1" max="10"
                    class="bg-white/10 text-white rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div class="mt-3 text-xs text-white/60">
                每完成 {{ longBreakInterval }} 个番茄后进入长休息
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useInterval } from '@/utils/useInterval';
import { computed, onMounted, ref, watchEffect } from 'vue';

// --- 配置项和状态 ---
const focusMinutes = ref(parseInt(localStorage.getItem('pomodoroFocus') || '25'));
const shortBreakMinutes = ref(parseInt(localStorage.getItem('pomodoroShortBreak') || '5'));
const longBreakMinutes = ref(parseInt(localStorage.getItem('pomodoroLongBreak') || '15'));
const longBreakInterval = ref(parseInt(localStorage.getItem('pomodoroLongBreakInterval') || '4'));

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'
const currentMode = ref<PomodoroMode>('work')
const currentCycle = ref(0) // 完成的工作番茄数
const timeLeft = ref(focusMinutes.value * 60) // 剩余时间（秒）
const initialTime = ref(focusMinutes.value * 60); // 记录当前模式的初始总时间

const showSettings = ref(false)

const setMode = (mode: PomodoroMode) => {
    pause(); // 切换模式时暂停计时器
    currentMode.value = mode;
    setTimeByMode(mode); // 根据新模式设置时间
};

// --- 音效和通知 ---
const dingAudio = new Audio('/ding.mp3'); 

const playDing = () => {
    dingAudio.play().catch(e => console.error("Error playing audio:", e));
};

const sendNotification = (title: string, body: string) => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
};

// --- 计时器逻辑 ---
const tick = () => {
    if (timeLeft.value > 0) {
        timeLeft.value--;
    } else {
        // 时间结束
        stop(); // 停止当前计时器
        playDing(); // 播放结束音效

        let notificationTitle = '';
        let notificationBody = '';

        if (currentMode.value === 'work') {
            currentCycle.value++;
            notificationTitle = '工作时间结束！';
            notificationBody = shouldLongBreak.value ? '该长休息了！' : '该短休息了！';
            const nextMode = shouldLongBreak.value ? 'longBreak' : 'shortBreak';
            setMode(nextMode); // 自动切换到下一个休息模式
        } else {
            notificationTitle = '休息时间结束！';
            notificationBody = '该继续工作了！';
            setMode('work'); // 休息结束，回到工作模式
        }
        sendNotification(notificationTitle, notificationBody);
        start(); // 自动开始下一个模式
    }
};

const { start: startTimer, stop: stopTimer, isRunning } = useInterval(tick, 1000);

const start = () => {
    if (!isRunning.value) {
        startTimer();
    }
};

const pause = () => {
    stopTimer();
};

const toggleTimer = () => {
    if (isRunning.value) {
        pause();
    } else {
        start();
    }
};

const reset = () => {
    pause();
    currentCycle.value = 0;
    setMode('work'); // 重置为工作模式，并更新时间
};

// --- 计算属性 ---
const pomodoroTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60);
    const seconds = timeLeft.value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const shouldLongBreak = computed(() => {
    return currentCycle.value > 0 && currentCycle.value % longBreakInterval.value === 0;
});

// 进度条样式
const progressBarStyle = computed(() => {
    const progress = (timeLeft.value / initialTime.value) * 100;
    let bgColor = 'bg-red-500'; // 默认工作模式
    if (currentMode.value === 'shortBreak') {
        bgColor = 'bg-green-500';
    } else if (currentMode.value === 'longBreak') {
        bgColor = 'bg-blue-500';
    }

    return {
        width: `${progress}%`,
        backgroundColor: currentMode.value === 'work' ? '#ef4444' : (currentMode.value === 'shortBreak' ? '#22c55e' : '#3b82f6'),
        // Tailwind 颜色直接用 hex 值
    };
});

// --- 生命周期和监听 ---
onMounted(() => {
    // 请求通知权限
    if ("Notification" in window) {
        Notification.requestPermission();
    }
    // 初始化时间
    setTimeByMode(currentMode.value);
});

// 根据模式设置倒计时时间
const setTimeByMode = (mode: PomodoroMode) => {
    currentMode.value = mode;
    pause(); // 切换模式时暂停计时
    let newTime = 0;
    switch (mode) {
        case 'work':
            newTime = focusMinutes.value * 60;
            break;
        case 'shortBreak':
            newTime = shortBreakMinutes.value * 60;
            break;
        case 'longBreak':
            newTime = longBreakMinutes.value * 60;
            break;
    }
    timeLeft.value = newTime;
    initialTime.value = newTime; // 更新初始时间
};

// 监听配置变化并保存到 localStorage，同时更新当前模式时间
watchEffect(() => {
    localStorage.setItem('pomodoroFocus', String(focusMinutes.value));
    localStorage.setItem('pomodoroShortBreak', String(shortBreakMinutes.value));
    localStorage.setItem('pomodoroLongBreak', String(longBreakMinutes.value));
    localStorage.setItem('pomodoroLongBreakInterval', String(longBreakInterval.value));

    // 如果设置面板显示，且当前模式对应的分钟数发生变化，则更新 timeLeft
    // 但只在计时器不运行时才更新，避免打断当前进行中的番茄
    if (!isRunning.value) {
        if (currentMode.value === 'work' && timeLeft.value !== focusMinutes.value * 60) {
            setTimeByMode('work');
        } else if (currentMode.value === 'shortBreak' && timeLeft.value !== shortBreakMinutes.value * 60) {
            setTimeByMode('shortBreak');
        } else if (currentMode.value === 'longBreak' && timeLeft.value !== longBreakMinutes.value * 60) {
            setTimeByMode('longBreak');
        }
    }
});

const toggleSettings = () => {
    showSettings.value = !showSettings.value;
};

</script>

<style scoped lang="scss">
.pomodoro-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.5rem 1rem;
    /* 增加内边距 */
    display: flex;
    flex-direction: column;
    /* 垂直布局 */
    align-items: center;
    gap: 0.5rem;
    color: white;
    /* 默认文字颜色 */
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
    /* 轻微发光 */
}

/* 引入数字字体，例如 Orbitron 或 Digital-7 */
/* @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap'); */
.font-digital-clock {
    font-family: 'Orbitron', monospace;
    /* 或者 'Digital-7', monospace; */
    font-weight: 400;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4);
}

.settings-panel {
    transition: all 0.3s ease-in-out;
}

input[type="number"] {
    -moz-appearance: textfield;
    /* Firefox */
    appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    /* Chrome, Safari, Edge */
    margin: 0;
}
</style>