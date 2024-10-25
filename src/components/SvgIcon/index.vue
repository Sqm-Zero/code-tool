<template>
    <!-- svg:图标外层容器节点，内部需要与use标签结合使用 -->
    <svg :style="{ width, height }">
        <!-- xlink:href执行用哪一个图标，属性值务必#icon-图标名字 -->
        <!-- use标签fill属性值可以设置颜色 -->
        <use :xlink:href="prefix + name" :fill="color"></use>
    </svg>
</template>
 
<script setup lang="ts">
//接收父组件传递的参数
defineProps({
    // 图标前缀
    prefix: {
        type: String,
        default: '#icon-'
    },
    // 图标名称
    name: {
        type: String,
        default: ''
    },
    // 颜色
    color: {
        type: String,
        default: ''
    },
    // 宽度
    width: {
        type: String,
        default: '16px'
    },
    // 高度
    height: {
        type: String,
        default: '16px'
    }
})
</script>
 
<style scoped></style>