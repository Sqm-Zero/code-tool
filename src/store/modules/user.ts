// 创建用户相关的小仓库
import { defineStore } from 'pinia'
// 引入接口
import { reqLogin, reqUserInfo, reqLogout, reqRegister } from '@/apis/user'
import type { loginFormData, loginResponseData, userInfoResponseData } from '@/apis/user/type'
import type { UserState } from './types/type'
//引入深拷贝方法
//@ts-ignore
// import cloneDeep from 'lodash/cloneDeep'
// 引入工具类
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/utils/token'
import router from '@/router'

//用于过滤当前用户需要展示的异步路由
function filterAsyncRouter(asyncRoutes: any, routes: any) {
    return asyncRoutes.filter((item: any) => {
        if (routes.includes(item.name)) {
            if (item.children && item.children.length > 0) {
                item.children = filterAsyncRouter(item.children, routes)
            }
            return true;
        }
    })
}

// 创建用户小仓库
let useUserStore = defineStore('User', {
    // 存储数据
    state: (): UserState => {
        return {
            token: GET_TOKEN(), // 用户的唯一标识
            username: '', // 用户名称
            avatar: '', // 用户头像
            buttons: [], //存储当前用户是否包含某一个按钮
        }
    },
    // 异步|逻辑
    actions: {
        // 用户登录
        async userLogin(data: loginFormData) {
            // 登录请求
            let result: loginResponseData = await reqLogin(data);
            // 登录成功：200
            if (result.code == 200) {
                // 1.保存token
                this.token = result.data.token as string;
                this.username = result.data.username
                // 2.持久化存储token
                SET_TOKEN(result.data.token as string)
                // 3.返回登录成功的回调
                return 'ok';
            } else {
                // 登录失败：201
                return Promise.reject(new Error(result.message));
            }
        },
        // 获取用户信息的方法
        async userInfo() {
            // 获取用户信息
            let result: userInfoResponseData = await reqUserInfo();

            if (result.code == 200) {
                this.username = result.data.username
                return 'ok'
            } else {
                return Promise.reject(new Error('获取用户信息失败'))
            }

        },
        // 退出登录
        async userLogout() {
            let result: any = await reqLogout();
            console.log(result);
            if (result.code == 200) {
                this.token = ''
                this.username = ''
                this.avatar = ''
                // 清除token
                REMOVE_TOKEN();
                return 'ok'
            } else {
                return Promise.reject(new Error('退出登录失败'))
            }
        },
        // 注册用户
        async registerUser(data: any) {
            const result:any = await reqRegister(data)
            if(result.code == 200){
                return 'ok'
            }else{
                return Promise.reject(new Error(result.message))
            }
        }
    },
    // 计算属性
    getters: {

    }
})
// 对外暴露获取小仓库的方法
export default useUserStore;