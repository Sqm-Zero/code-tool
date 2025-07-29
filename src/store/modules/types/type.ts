import type{ RouteRecordRaw } from 'vue-router'
import type { CategoryObject } from '@/api/product/attr/type'
// 定义小仓库state类型
export interface UserState {
    token: string | null,
    menuRoutes: RouteRecordRaw[],
    username: string,
    avatar: string,
    buttons: string[]
}

//定义分类仓库state对象的ts类型
export interface CategoryState {
    c1Id: number|string,
    c2Id: number|string,
    c3Id: number|string,
    c1Arr: CategoryObject[],
    c2Arr: CategoryObject[],
    c3Arr: CategoryObject[]
}