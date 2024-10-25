import SvgIcon from './SvgIcon/index.vue'
 
const allGlobalComponent:any = {SvgIcon}
//对外暴露插件对象
export default {
  //插件对象中必须包含一个属性：install，值必须是一个函数
  install(app:any) {
    Object.keys(allGlobalComponent).forEach(key => {
        //注册为全局组件
        app.component(key, allGlobalComponent[key]);
    })
  }
}