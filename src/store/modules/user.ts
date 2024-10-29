//创建用户相关的小仓库
import { defineStore } from 'pinia'

//创建用户小仓库
let useUserStore = defineStore('User',{
    //存储数据的地方
    state:()=>{
        return {}
    },
    //异步|逻辑的地方
    actions:{

    },
    getters:{

    }
})

//对外暴露获取仓库的方法
export default useUserStore