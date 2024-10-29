import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
// https://vitejs.dev/config/
export default defineConfig(({command,mode}) =>{
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })],
    resolve: {
      alias: {
        "@": path.resolve("./src") // 相对路径别名配置，使用 @ 代替 src
      }
    },
    //scss全局变量的配置
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `@import "@/styles/variable.scss";`
        }
      }
    },
    // 代理跨域
    server: {
      proxy: {
        // [env.VITE_APP_BASE_API]: {
        //   // 获取数据服务器地址设置
        //   target: env.VITE_SERVE,
        //   // 是否需要代理跨域          
        //   changeOrigin: true,
        //   // 路径重写
        //   rewrite: (path) => {
        //     return path.replace(/^\/api/, '');
        //   },
        // }
      }
    }
  }
}
)