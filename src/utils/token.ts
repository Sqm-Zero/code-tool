// 封装本地存储数据与读取数据方法
export const SET_TOKEN = (token: string) => {
    localStorage.setItem('authorize', token)
}
// 获取token
export const GET_TOKEN = () => {
    return localStorage.getItem('authorize') ?? ''
}
// 删除token
export const REMOVE_TOKEN = () => {
    localStorage.removeItem('authorize')
}
