<template>
    <div class="card" @click="$router.push(tool.path)">
        <div class="card-inner shine-effect">
            <div class="card-face card-front">
                <div class="tool-icon" :class="iconClass">{{ tool.icon }}</div>
                <h3 class="tool-title">{{ tool.title }}</h3>
            </div>
            <div class="card-face card-back">
                <p class="tool-desc">{{ tool.description }}</p>
                <div class="tool-tags">
                    <span v-for="(tag, index) in tool.tags" :key="index" class="tag">{{ tag }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Tool {
    path: string;
    icon: string;
    title: string;
    description: string;
    tags: string[];
}

const props = defineProps<{ tool: Tool }>();

const iconClass = computed(() => {
    if (props.tool.path.includes('diff')) return 'diff-icon';
    if (props.tool.path.includes('json')) return 'json-icon';
    if (props.tool.path.includes('format')) return 'format-icon';
    return props.tool.path + '-icon';
});
</script>

<style scoped>
.card {
    width: 270px;
    height: 300px;
    perspective: 1500px;
    cursor: pointer;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    border-radius: 15px;
}

.card:hover .card-inner {
    transform: rotateY(180deg);
}

.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    overflow: hidden;
}

.card-front {
    background: linear-gradient(135deg, #ee6ef5, #57b9ff);
    background-size: 200% 200%;
    animation: cardGradientShift 10s linear infinite;
    color: white;
}

.card-back {
    background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
    color: white;
    transform: rotateY(180deg);
}

@keyframes cardGradientShift {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.card:hover .card-inner::before {
    left: 100%;
}

.tool-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    /* animation: tumble_move 2s infinite ease-in-out; */
}

/* @keyframes tumble_move {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-10px) rotate(20deg);
    }
} */

.diff-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.json-icon {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.format-icon {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.tool-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin: 0;
}

.tool-desc {
    color: white;
    line-height: 1.6;
    font-weight: 500;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    text-align: center;
}

.tool-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.tag {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
}

.card:hover .tag {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

/* 响应式优化 */
@media (max-width: 640px) {
    .card {
        width: 100%;
        max-width: 320px;
    }
}
</style>