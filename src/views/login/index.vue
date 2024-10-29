<template>
    <div class="login_container">
        <el-row :gutter="0">
            <el-col :span="12" :xs="0">站位的位置</el-col>
            <el-col :span="12" :xs="24">
                <el-form class="login_from" :model="loginFrom" :rules="rules" ref="loginForms">
                    <h1>Hello</h1>
                    <h2>欢迎来到库库林-沙琪马</h2>
                    <el-form-item prop="username">
                        <el-input :prefix-icon="User" v-model="loginFrom.username"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input :prefix-icon="Lock" type="password" :show-password="true"
                            v-model="loginFrom.password"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loading" class="login_btn" type="primary" @click="login">登录</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue';
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 引入获取当前时间的函数
import { getTime } from '@/utils/time';
import  request from '@/utils/request'
import { ElMessage } from 'element-plus';

// 获取el-from表单
let loginForms = ref();
// 获取路由器对象
let $router = useRouter()
// 获取路由对象
let $route = useRoute()
// 定义变量控制按钮加载效果
let loading = ref(false)
//收集账号与密码的数据
let loginFrom = reactive({
    username: 'admin',
    password: '111111'
})
// 自定义校验规则函数
const validatorUserName = (rule: any, value: string, callback: any) => {
    // rule: 即为校验规则对象
    // value: 即为表单元素文本内容
    // callback: 验证成功回调函数，验证失败回调函数
    if (value.length >= 2) {
        callback()
    } else {
        callback(new Error('账号长度至少五位'))
    }

}
const validatorPassword = (rule: any, value: string, callback: any) => {
    if (value.length >= 6) {
        callback()
    } else {
        callback(new Error('密码长度至少六位'))
    }
}

// 定义表单的验证规则
const rules = {
    // 规则对象属性：required:是否必填，message:提示信息，trigger:触发方式
    // trigger:触发方式，blur:失去焦点触发, change:改变触发
    username: [
        { trigger: 'change', validator: validatorUserName }
    ],
    password: [
        { trigger: 'change', validator: validatorPassword }
    ]
}
// 登录按钮回调
const login = async () => {
    
}

</script>

<style scoped lang="scss">
.login_container {
    width: 100%;
    height: 100vh;
    background-image: url('@/assets/images/background.png');
    background-size: cover;
}

.login_from {
    position: relative;
    width: 80%;
    top: 30vh;
    background-image: linear-gradient(#e66465, #9198e5);
    background-size: cover;
    padding: 20px;

    h1 {
        color: white;
        font-size: 40px;
    }

    h2 {
        color: white;
        font-size: 20px;
        margin: 20px 0;
    }

    .login_btn {
        width: 100%;
    }
}
</style>