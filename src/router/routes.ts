//对外暴露配置路由(常量路由)
export const constantRoute = [
    {
        path: '/',
        component: () => import('@/views/home/index.vue'),
        name: 'home',
        meta: {
            title: '首页'
        }
    },
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        name: 'login',
        meta: {
            title: '登录'
        }
    },
    {
        path: '/404',
        component: () => import('@/views/404/index.vue'),
        name: '404',
        meta: {
            title: '404'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        name: 'Any'
    }
]