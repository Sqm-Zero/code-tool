<template>
    <div class="tool-card" @click="$router.push(tool.path)" :style="{ '--gradient': gradient }">
        <div class="content">
            <h2 class="card-number">{{ indexStr }}</h2>
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-desc">{{ tool.description }}</p>
            <div class="tool-tags">
                <span v-for="(tag, i) in tool.tags" :key="i" class="tag">{{ tag }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Tool {
    path: string;
    title: string;
    description: string;
    tags: string[];
}

const props = defineProps<{
    tool: Tool;
    index: number;
}>();

const indexStr = computed(() => String(props.index + 1).padStart(2, '0'));

const gradients = [
    'linear-gradient(315deg, #ff002b, #db3300)',
    'linear-gradient(315deg, #06f3bb, #bf01fe)',
    'linear-gradient(315deg, #ffffff, #03bcff)',
    'linear-gradient(315deg, #ff758c, #ff7eb3)',
    'linear-gradient(315deg, #667eea, #764ba2)',
    'linear-gradient(315deg, #f093fb, #f5576c)',
    'linear-gradient(315deg, #4facfe, #00f2fe)',
    'linear-gradient(315deg, #a8edea, #fed6e3)'
];

const gradient = computed(() => {
    return gradients[props.index % gradients.length];
});
</script>

<style scoped>
.tool-card {
    position: relative;
    height: 320px;
    aspect-ratio: 3/4;
    background: #060c21;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 2px solid #111;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tool-card::before {
    position: absolute;
    content: "";
    inset: -2px;
    transform: skew(2deg, 2deg);
    z-index: -1;
    background: var(--gradient);
}

.tool-card:hover {
    transform: translateY(-5px);
}

.content {
    position: relative;
    padding: 20px;
    transform: translateY(20px);
    text-align: center;
    width: 100%;
    transition: all 0.3s ease;
}

.card-number {
    position: absolute;
    top: -60px;
    right: 30px;
    font-size: 8em;
    color: #ffffff2a;
    transition: all 0.5s ease;
    line-height: 1;
    pointer-events: none;
    font-weight: 900;
}

.tool-card:hover .card-number {
    top: -140px;
}

.tool-title {
    color: #ffffff;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 15px;
    line-height: 1.3;
}

.tool-desc {
    color: #ffffff;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0 0 20px;
    max-width: 90%;
    margin: 0 auto 20px;
}

.tool-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 15px;
}

.tag {
    padding: 4px 12px;
    border: 1px solid #ffffff4d;
    color: #ffffff;
    font-size: 0.75rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.tag:hover {
    background: #ffffff;
    color: #000000;
    border-color: #ffffff;
}

@media (max-width: 768px) {
    .tool-card {
        height: 280px;
    }

    .card-number {
        font-size: 6em;
        top: -40px;
        right: 20px;
    }

    .tool-card:hover .card-number {
        top: -110px;
    }

    .tool-title {
        font-size: 1.2rem;
    }
}
</style>