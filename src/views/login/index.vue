<template>
  <div class="login_container">
    <el-row :gutter="0">
      <el-col :span="12" :xs="0">站位的位置</el-col>
      <el-col :span="12" :xs="24">
        <el-form v-if="formTrue" class="login_from" :model="loginFrom" :rules="rules" ref="loginForms">
          <h1>Hello</h1>
          <h2>欢迎来到库库林-沙琪马</h2>
          <el-form-item prop="username">
            <el-input :prefix-icon="User" v-model="loginFrom.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input :prefix-icon="Lock" type="password" :show-password="true" v-model="loginFrom.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="login_btn" type="primary" @click="login">登录</el-button>
          </el-form-item>
          <el-form-item style="background-color: none;">
            <el-divider>
              <p>还没有账号？</p>
            </el-divider>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="login_btn" type="warning" @click="registerTrue">立刻注册</el-button>
          </el-form-item>
        </el-form>
        <el-form v-else label-width="auto" :model="registerForm" class="login_from">
          <el-form-item label="用户名" prop="username">
            <el-input placeholder="请填写用户名" :maxLength="20" v-model="registerForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input placeholder="请填写密码" :maxLength="20" v-model="registerForm.password"></el-input>
          </el-form-item>
          <el-form-item label="重复密码" prop="name">
            <el-input placeholder="请重新填写密码" :maxLength="20" v-model="registerForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="name">
            <el-input placeholder="请填写邮箱号" :maxLength="20" v-model="registerForm.email"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="name">
            <div style="display: flex;">
              <el-input placeholder="请填写验证码" :maxLength="20" v-model="registerForm.code"></el-input>
              <el-button style="margin-left: 20px;" type="primary" @click="getRegisterCode">获取验证码</el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="login_btn" type="primary" @click="registerUser">注册</el-button>
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
import { reqGetEmail } from '@/apis/email'
// 引入获取当前时间的函数
import { getTime } from '@/utils/time';
import request from '@/utils/request'
import { ElMessage, ElNotification } from 'element-plus';
import { reqLogin } from "@/apis/user";
import useUserStore from "@/store/modules/user.ts";
// 获取el-from表单
let loginForms = ref();
// 获取路由器对象
let $router = useRouter()
//用户仓库
const userStore = useUserStore()
// 定义变量控制按钮加载效果
let loading = ref(false)
//收集账号与密码的数据
let loginFrom = reactive({
  username: 'test',
  password: '123456'
})
//收集注册账号的数据
let registerForm = reactive({
  username: '',
  password: '',
  email: '',
  code: ''
})
//表单变化
let formTrue = ref(true)
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
//注册账号
const registerTrue = () => {
  formTrue.value = false
  // 清空表单数据
  Object.assign(registerForm, reactive({
    username: '',
    password: '',
    email: '',
    code: ''
  }))
}
//
const registerUser = async () => {
  await userStore.registerUser(registerForm)

  ElMessage.success('注册成功')

  formTrue.value = true
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
//获取验证码
const getRegisterCode = async() => {
  await reqGetEmail({
    email: registerForm.email,
    type: "register"
  })
  ElMessage.success('发送成功')
}
// 登录按钮回调
const login = async () => {
  // 保证全部表单验证通过再发送请求
  await loginForms.value.validate()

  // 开始加载
  loading.value = true

  await userStore.userLogin(loginFrom)

  await $router.push('/')

  // 提示
  ElNotification({
    type: 'success',
    message: '欢迎回来',
    title: `Hi，${getTime()}好`
  })


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