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
        path: '/tools/diff',
        component: () => import('@/views/tools/diff.vue'),
        name: 'tools-diff',
        meta: {
            title: '代码对比'
        }
    },
    {
        path: '/tools/json',
        component: () => import('@/views/tools/json.vue'),
        name: 'tools-json',
        meta: {
            title: 'JSON格式化'
        }
    },
    {
        path: '/tools/format',
        component: () => import('@/views/tools/format.vue'),
        name: 'tools-format',
        meta: {
            title: '代码格式化'
        }
    },
    {
        path: '/test',
        component: () => import('@/views/test/index.vue'),
        name: 'test',
        meta: {
            title: '测试'
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