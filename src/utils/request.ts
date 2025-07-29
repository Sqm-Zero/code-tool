//进行axios二次封装：使用请求与响应拦截器
import axios from 'axios'
import { ElMessage } from 'element-plus';
//第一步：利用axios对象的create方法，创建axios实例（其他的配置：请求超时，基础路径等）
const request = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API, //基础路径
    timeout: 5000 //请求超时时间
})
//第二步：请求与响应拦截器
request.interceptors.request.use((config) => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    //config配置对象，headers请求头，经常给服务器端携带公共参数
    let user = localStorage.getItem("authorize") as null
    config.headers['Authorization'] = `Bearer ${user}`;
    //返回配置对象
    return config
});
//第三步：响应拦截器
request.interceptors.response.use((response) => {
    //成功回调
    //简化数据
    return response.data;
}, (error) => {
    // 失败回调：处理HTTP网络错误
    if (!error.response) {
        ElMessage({
            type: 'error',
            message: '网络错误或请求未发送成功'
        });
        return Promise.reject(error);
    }

    let msg = ''; //存储网络错误信息
    let status = error.response.status //http状态码
    switch(status){
        case 400:
            msg = '请求参数错误'
            break
        case 401:
            msg = 'TOKEN过期'
            break
        case 403:
            msg = '访问被拒绝'
            break
        case 404:
            msg = '请求地址错误'
            break
        case 500:
            msg = '服务器故障'
            break
        default:
            msg = '网络错误'
    }
    //提示错误信息
    ElMessage({
        type: 'error',
        message: msg
    })
    return Promise.reject(error)
 })

//对外暴露
export default request;