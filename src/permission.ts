//路由鉴权，项目当中路由能不能被权限的设置（某一个路由什么条件下可以访问，什么条件下不可以访问）
import router from '@/router'
import nprogress from 'nprogress'
//引入进度条的样式
import 'nprogress/nprogress.css'
//获取用户相关的仓库
import useUserStore from './store/modules/user'

//全局守卫：项目当中任意路由都会触发的钩子
//全局前置守卫
router.beforeEach(async (to, from, next) => {
    document.title = `${to.meta.title}`;
    // to:你将要访问那个路由
    // from:你从哪个路由来
    // next:放行函数，放行到哪一个路由
    nprogress.start();
    let userStore = useUserStore()
    if (userStore.token) {
        if (to.path == '/login') {
            next({ path: '/' });
        } else {
            // 登录成功后访问其他路由
            // 获取用户的名字
            let username = userStore.username
            // 有username放行
            if (username) {
                next();
            } else {
                //如果没有用户信息，在守卫这里发请求获取信息再放行
                try {
                    await userStore.userInfo();
                    //放行：
                    //万一：刷新的时候是异步路由，有可能获取到用户信息，异步路由还没加载完成，出现空白效果
                    next({...to});
                } catch (error) {
                    //token过期：获取不到用户信息了
                    //用户手动修改本地存储token
                    //退出登录->用户相关数据清空
                    userStore.userLogout();
                    next({ path: '/login', query: { redirect: to.path }})
                }
            }
        }
    } else {
        //用户未登录
        if (to.path == '/login') {
            next()
        } else {
            next({ path: '/login', query: { redirect: to.path } })
        }
    }
})
//全局后置守卫
router.afterEach((to, from) => {
    nprogress.done();
})

// 第一个问题：任意路由切换实现进度业务 --nprogress
/*
    安装：npm i nprogress
 */
// 第二个问题：路由鉴权（路由组件访问权限的设置）
/* 
    用户未登录：只能访问login
        利用用户仓库的token来判断用户是否登录
    登录成功：不能访问login【指向首页】，其余的路由可以访问
*/