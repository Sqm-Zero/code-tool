<template>
    <div>
        我是主页
        <el-button type="success" @click="logout">退出登录</el-button>
    </div>
</template>

<script setup lang="ts">

import useUserStore from "@/store/modules/user.ts";
import {useRouter} from "vue-router";
import {ElNotification} from "element-plus";

const userStore = useUserStore()
let $router = useRouter()

const logout = async () => {
  await userStore.userLogout()

  $router.push("/login")
  ElNotification({
    type: 'success',
    message: '退出成功',
    title: '提示'
  })
}
</script>

<style scoped>

</style>