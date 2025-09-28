<template>
    <div class="clock-card">
        <div class="clock-header">
            <span class="clock-icon">🕒</span>
            <h3 class="clock-title">电子时钟</h3>
        </div>

        <div class="clock-display">
            <!-- 日期部分 -->
            <div class="date-section">
                <div class="date-text">{{ dateInfo.date }}</div>
                <div class="weekday-badge">{{ dateInfo.weekday }}</div>
            </div>
            <div class="time-section">
                <div class="time-group">
                    <span class="time-digit" :data-value="time.hours[0]">{{ time.hours[0] }}</span>
                    <span class="time-digit" :data-value="time.hours[1]">{{ time.hours[1] }}</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-group">
                    <span class="time-digit" :data-value="time.minutes[0]">{{ time.minutes[0] }}</span>
                    <span class="time-digit" :data-value="time.minutes[1]">{{ time.minutes[1] }}</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-group">
                    <span class="time-digit" :data-value="time.seconds[0]">{{ time.seconds[0] }}</span>
                    <span class="time-digit" :data-value="time.seconds[1]">{{ time.seconds[1] }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 时间状态
const now = ref(new Date());
let timer: number | null = null;

// 计算属性：日期信息
const dateInfo = computed(() => {
    const year = now.value.getFullYear();
    const month = String(now.value.getMonth() + 1).padStart(2, '0');
    const day = String(now.value.getDate()).padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[now.value.getDay()];

    return {
        date: `${year}-${month}-${day}`,
        weekday
    };
});

// 计算属性：时间信息（拆分为单个数字，便于动画）
const time = computed(() => {
    const hours = String(now.value.getHours()).padStart(2, '0');
    const minutes = String(now.value.getMinutes()).padStart(2, '0');
    const seconds = String(now.value.getSeconds()).padStart(2, '0');

    return {
        hours: hours.split(''),
        minutes: minutes.split(''),
        seconds: seconds.split('')
    };
});

// 计算属性：时区
const timezone = computed(() => {
    const offset = -now.value.getTimezoneOffset() / 60;
    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset}`;
});

// 更新时间
const updateTime = () => {
    now.value = new Date();
};

// 生命周期
onMounted(() => {
    updateTime();
    timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<style scoped>
.clock-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.clock-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    position: absolute;
}

.clock-icon {
    font-size: 1.5rem;
}

.clock-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: white;
    margin: 0;
}

/* 时钟显示区 */
.clock-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

/* 日期部分 */
.date-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.date-text {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.05em;
}

.weekday-badge {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
}

/* 时间部分 */
.time-section {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.time-group {
    display: flex;
    gap: 0.125rem;
}

.time-digit {
    display: inline-block;
    width: 2rem;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
    font-size: 2rem;
    font-weight: 300;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* 数字变化动画 */
.time-digit::before {
    content: attr(data-value);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.time-separator {
    font-size: 2rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.8);
    animation: blink 2s infinite;
}

@keyframes blink {

    0%,
    49% {
        opacity: 1;
    }

    50%,
    100% {
        opacity: 0.3;
    }
}

/* 时区信息 */
.timezone-info {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    font-family: monospace;
    margin-top: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .clock-card {
        padding: 1rem;
    }

    .time-digit {
        width: 1.5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        font-size: 1.5rem;
    }

    .time-separator {
        font-size: 1.5rem;
    }
}

/* 暗色模式优化 */
@media (prefers-color-scheme: dark) {
    .clock-card {
        background: rgba(255, 255, 255, 0.05);
    }
}
</style>