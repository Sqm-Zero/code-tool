## comparison-tool

一个基于 Vite + Vue 3 + TypeScript 的前端小工具集合，内置代码对比、JSON 格式化、代码格式化等功能，开箱即用。

### 技术栈

- **构建**: Vite 4
- **框架**: Vue 3 + TypeScript
- **路由**: Vue Router 4（Hash 模式）
- **状态管理**: Pinia
- **UI**: Element Plus
- **样式**: SCSS、Tailwind CSS、PostCSS/Autoprefixer
- **图表/动效**: ECharts、GSAP、Swiper
- **其他**: Axios、vite-plugin-svg-icons

### 功能特性

- **首页**: 动效与卡片展示
- **工具集**:
  - 代码对比 `/tools/diff`
  - JSON 格式化 `/tools/json`
  - 代码格式化 `/tools/format`
- **用户与通用页面**: 登录、404、测试页

### 快速开始

1. 安装依赖

```bash
# 推荐使用 pnpm，也支持 npm/yarn
pnpm install
# 或
npm install
# 或
yarn
```

2. 启动开发环境

```bash
pnpm dev
# 或
npm run dev
# 或
yarn dev
```

3. 生产构建与本地预览

```bash
pnpm build && pnpm preview
# 或
npm run build && npm run preview
# 或
yarn build && yarn preview
```

### NPM Scripts

- **dev**: 本地开发，默认自动打开浏览器并监听 `0.0.0.0`
- **build**: 生产构建
- **preview**: 本地预览生产构建产物

### 路由一览

- `/` → `views/home/index.vue`
- `/tools/diff` → 代码对比
- `/tools/json` → JSON 格式化
- `/tools/format` → 代码格式化
- `/test` → 测试页
- `/login` → 登录页
- `/404` 与 `/:pathMatch(.*)*` → 404
