// 统一管理用户相关的接口
import request from '@/utils/request'
import type { loginFormData, loginResponseData, userInfoResponseData } from './type'
// 项目用户相关的请求地址 
enum API {
    LOGIN_URL = '/api/auth/login',
    USERINFO_URL = '/api/index/info',
    LOGOUT_URL = '/api/auth/logout',
    REGISTER_URL = '/api/auth/register'
}

//登录接口
export const reqLogin = (data: loginFormData) => request.post(API.LOGIN_URL, data)
//获取用户信息
export const reqUserInfo = () => request.get<any, userInfoResponseData>(API.USERINFO_URL)
//退出登录
export const reqLogout = () => request.post<any, any>(API.LOGOUT_URL)
//注册接口
export const reqRegister = (data: any) => request.post(API.REGISTER_URL, data)
