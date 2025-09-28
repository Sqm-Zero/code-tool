import { ref, onMounted, onUnmounted, computed } from 'vue';

export function useInterval(callback: () => void, delay: number | null) {
    const intervalId = ref<number | null>(null);

    const start = () => {
        if (delay !== null && !intervalId.value) {
            intervalId.value = window.setInterval(callback, delay);
        }
    };

    const stop = () => {
        if (intervalId.value) {
            clearInterval(intervalId.value);
            intervalId.value = null;
        }
    };

    onMounted(() => {
        // 默认不立即启动，由外部显式调用 start()
    });

    onUnmounted(() => {
        stop();
    });

    return { start, stop, isRunning: computed(() => intervalId.value !== null) };
}