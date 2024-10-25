<template>
    <div class="box">
        <img src="../../assets/images/error_imags/21.gif" alt="">
        <button @click="goHome">回到主页</button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
let $router = useRouter();

//回到主页
const goHome = () => {
    $router.push('/')
}
</script>

<style scoped>
.box{
    width: 100vw;
    height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
        width: 400px;
        height: 400px;
    }
    button{
        width: 100px;
        height: 40px;
    }
}
</style>